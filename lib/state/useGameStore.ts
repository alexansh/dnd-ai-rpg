import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AbilityScores, Condition, MonsterStatblock } from "../srd/types";
import { SRD_CLASSES } from "../srd/classes";
import { SRD_RACES } from "../srd/races";
import { SRD_ITEMS } from "../srd/items";
import { SRD_MONSTERS } from "../srd/monsters";
import { SRD_SPELLS } from "../srd/spells";
import { executeRoll, RollResult } from "../engine/dice";
import {
  calculateAbilityModifier,
  calculateProficiencyBonus,
  resolveSkillCheck,
  resolveAttackRoll,
  resolveDamage,
  resolveDeathSavingThrow,
  CheckOutcome,
  AttackOutcome,
  DamageOutcome,
  DeathSaveState,
} from "../engine/rules";
import {
  CombatState,
  Combatant,
  initializeCombat,
  advanceTurn,
  applyDamageToCombatant,
} from "../engine/combat";
import { calculateDistanceFt, isWithinRange, TacticalMapLayout } from "../engine/tactical";
import { COMPANION_PROFILES, CompanionProfile, decideCompanionCombatTurn } from "../ai/companion-agent";
import { SUNKEN_CRYPT_STAGES, generateTacticalMap, QuestStage } from "../campaigns/sunkenCrypt";

export interface LogEntry {
  id: string;
  role: "dm" | "player" | "system" | "companion";
  speaker?: string;
  text: string;
  timestamp: string;
  rollBreakdown?: string;
}

export interface PlayerCharacter {
  name: string;
  race: string;
  className: string;
  level: number;
  exp: number;
  abilities: AbilityScores;
  maxHp: number;
  currentHp: number;
  tempHp: number;
  armorClass: number;
  speed: number;
  initiativeModifier: number;
  spellSlotsLevel1: number;
  maxSpellSlotsLevel1: number;
  inventory: string[]; // item IDs
  equippedWeapon: string;
  equippedArmor: string;
  equippedShield?: string;
  inspiration: boolean;
  deathSaves: DeathSaveState;
  portrait: string;
  conditions: Condition[];
}

export interface GameState {
  player: PlayerCharacter;
  companions: Record<string, CompanionProfile>;
  currentAct: number;
  currentLocation: string;
  currentObjective: string;
  ambiance: "dungeon_creepy" | "tavern_warm" | "battle_tense" | "crypt_solemn";
  logs: LogEntry[];
  pendingCheck: {
    skill: string;
    ability: "str" | "dex" | "con" | "int" | "wis" | "cha";
    dc: number;
    reason: string;
  } | null;
  suggestedActions: string[];
  pointsOfInterest: {
    id: string;
    name: string;
    description: string;
    interactAction: string;
  }[];

  // Combat State
  isCombatActive: boolean;
  combat: CombatState | null;
  tacticalMap: TacticalMapLayout | null;
  selectedCombatantId: string | null;

  // UI Modals
  isCharacterSheetOpen: boolean;
  isBestiaryOpen: boolean;
  isCreationOpen: boolean;
  isSpellbookOpen: boolean;
  activeBestiaryMonsterKey: string | null;
  activeDiceRoll: RollResult | null;
  isDiceRolling: boolean;

  // Actions
  setPlayer: (player: Partial<PlayerCharacter>) => void;
  openCharacterSheet: (open: boolean) => void;
  openBestiary: (open: boolean, monsterKey?: string) => void;
  openCreation: (open: boolean) => void;
  openSpellbook: (open: boolean) => void;
  submitPlayerAction: (actionText: string) => Promise<void>;
  performSkillCheck: (skill: string, dc: number, ability: "str" | "dex" | "con" | "int" | "wis" | "cha") => Promise<void>;
  startCombatEncounter: (stage: number) => void;
  executePlayerCombatAttack: (targetId: string) => void;
  executePlayerCastSpell: (spellId: string, targetId?: string) => void;
  movePlayerCombatant: (dest: { x: number; y: number }) => void;
  moveCombatant: (combatantId: string, dest: { x: number; y: number }) => void;
  endCurrentCombatTurn: () => void;
  runCompanionTurn: () => void;
  advanceQuestAct: (nextAct: number) => void;
  restShort: () => void;
  restLong: () => void;
  resetGame: () => void;
}

const DEFAULT_PLAYER: PlayerCharacter = {
  name: "Kaelen Ashborne",
  race: "Human",
  className: "Fighter",
  level: 1,
  exp: 0,
  abilities: { str: 16, dex: 14, con: 15, int: 10, wis: 12, cha: 8 },
  maxHp: 12,
  currentHp: 12,
  tempHp: 0,
  armorClass: 18, // Chain mail (16) + Shield (+2)
  speed: 30,
  initiativeModifier: 2,
  spellSlotsLevel1: 0,
  maxSpellSlotsLevel1: 0,
  inventory: ["longsword", "chain_mail", "shield", "potion_of_healing"],
  equippedWeapon: "longsword",
  equippedArmor: "chain_mail",
  equippedShield: "shield",
  inspiration: true,
  deathSaves: { successes: 0, failures: 0, isStabilized: false, isDead: false, history: [] },
  portrait: "/assets/images/archetypes/warrior.jpg",
  conditions: [],
};

const initialStage = SUNKEN_CRYPT_STAGES[1];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      player: DEFAULT_PLAYER,
      companions: COMPANION_PROFILES,
      currentAct: 1,
      currentLocation: initialStage.locationName,
      currentObjective: initialStage.objective,
      ambiance: initialStage.ambiance,
      logs: [
        {
          id: "log_init",
          role: "dm",
          speaker: "Dungeon Master",
          text: initialStage.description,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
      pendingCheck: {
        skill: "Investigation",
        ability: "int",
        dc: 12,
        reason: "Examine the heavy ironwood door for runes or traps.",
      },
      suggestedActions: initialStage.initialSuggestedActions,
      pointsOfInterest: initialStage.pointsOfInterest,

      isCombatActive: false,
      combat: null,
      tacticalMap: null,
      selectedCombatantId: null,

      isCharacterSheetOpen: false,
      isBestiaryOpen: false,
      isCreationOpen: false,
      isSpellbookOpen: false,
      activeBestiaryMonsterKey: null,
      activeDiceRoll: null,
      isDiceRolling: false,

      setPlayer: (updates) =>
        set((state) => ({ player: { ...state.player, ...updates } })),

      openCharacterSheet: (open) => set({ isCharacterSheetOpen: open }),
      openBestiary: (open, monsterKey) =>
        set({ isBestiaryOpen: open, activeBestiaryMonsterKey: monsterKey ?? "skeleton" }),
      openCreation: (open) => set({ isCreationOpen: open }),
      openSpellbook: (open) => set({ isSpellbookOpen: open }),

      submitPlayerAction: async (actionText) => {
        const { currentAct, currentLocation, currentObjective, player } = get();
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        // Add player utterance to log
        const playerLog: LogEntry = {
          id: `log_${Date.now()}`,
          role: "player",
          speaker: player.name,
          text: actionText,
          timestamp: time,
        };

        set((state) => ({
          logs: [...state.logs, playerLog],
          suggestedActions: ["Contemplating your move...", "Searching for threats..."],
        }));

        // Call backend DM route
        try {
          const res = await fetch("/api/ai/dm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              playerAction: actionText,
              currentLocation,
              questStep: currentObjective,
              partySummary: `${player.name} (${player.className}), Sister Beatrice (Cleric), Vaelin (Rogue), Garrick (Fighter)`,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const dmLog: LogEntry = {
              id: `log_dm_${Date.now()}`,
              role: "dm",
              speaker: "Dungeon Master",
              text: data.narrative,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };

            set((state) => ({
              logs: [...state.logs, dmLog],
              pendingCheck: data.checkRequest ?? null,
              suggestedActions: data.suggestedActions ?? state.suggestedActions,
              pointsOfInterest: data.pointsOfInterest?.length ? data.pointsOfInterest : state.pointsOfInterest,
              ambiance: data.ambiance ?? state.ambiance,
            }));

            if (data.combatTrigger) {
              get().startCombatEncounter(currentAct >= 3 ? currentAct : 3);
            }
            return;
          }
        } catch (e) {
          console.error("DM fetch error:", e);
        }

        // Fallback response if offline or error
        const fallbackLog: LogEntry = {
          id: `log_fallback_${Date.now()}`,
          role: "dm",
          speaker: "Dungeon Master",
          text: `You execute: "${actionText}". The stone echoes softly with your movements as your party stands watchful.`,
          timestamp: time,
        };
        set((state) => ({
          logs: [...state.logs, fallbackLog],
          suggestedActions: [
            "Press forward deeper into the crypt",
            "Consult with your companions",
            "Prepare weapons and spells",
          ],
        }));
      },

      performSkillCheck: async (skill, dc, ability) => {
        const { player } = get();
        const score = player.abilities[ability];
        const profBonus = calculateProficiencyBonus(player.level);
        const isProf = skill.toLowerCase() === "athletics" || skill.toLowerCase() === "investigation";

        set({ isDiceRolling: true });

        const outcome = resolveSkillCheck({
          abilityScore: score,
          isProficient: isProf,
          proficiencyBonus: profBonus,
          dc,
          skillName: skill,
        });

        setTimeout(() => {
          const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const outcomeLog: LogEntry = {
            id: `check_${Date.now()}`,
            role: "system",
            speaker: "Rules Engine",
            text: `${player.name} rolled for ${skill}: ${outcome.breakdown}`,
            timestamp: time,
            rollBreakdown: outcome.breakdown,
          };

          const dmNarrative = outcome.isSuccess
            ? `With careful precision, you decipher the riddle of the mechanism! A heavy stone counterweight thuds within the wall, and the ancient seals grind open.`
            : `The lock mechanism resists your efforts with a harsh metallic screech. The disturbance echoes down the corridor, rousing restless spirits from their tombs!`;

          const dmLog: LogEntry = {
            id: `dm_${Date.now()}`,
            role: "dm",
            speaker: "Dungeon Master",
            text: dmNarrative,
            timestamp: time,
          };

          set((state) => ({
            logs: [...state.logs, outcomeLog, dmLog],
            activeDiceRoll: outcome.rollResult,
            isDiceRolling: false,
            pendingCheck: null,
          }));

          // If failed in Act 1 or progressed in Act 2, advance act or trigger combat
          if (outcome.isSuccess && get().currentAct === 1) {
            get().advanceQuestAct(2);
          } else if (!outcome.isSuccess && get().currentAct === 1) {
            get().advanceQuestAct(3);
          }
        }, 900);
      },

      startCombatEncounter: (stage) => {
        const { player } = get();
        const map = generateTacticalMap(stage);

        const combatants: Omit<Combatant, "initiative" | "actionUsed" | "bonusActionUsed" | "reactionUsed" | "movementUsedFt">[] = [
          {
            id: "player",
            name: player.name,
            isPlayer: true,
            isCompanion: false,
            isEnemy: false,
            armorClass: player.armorClass,
            currentHp: player.currentHp,
            maxHp: player.maxHp,
            tempHp: player.tempHp,
            speed: player.speed,
            initiativeModifier: player.initiativeModifier,
            conditions: [...player.conditions],
            gridPosition: map.playerSpawns[0],
            portrait: player.portrait,
            weaponAttackBonus: calculateAbilityModifier(player.abilities.str) + calculateProficiencyBonus(player.level),
            weaponDamageDice: "1d8+3",
            weaponDamageType: "slashing",
            spellSlotsLevel1: player.spellSlotsLevel1,
            maxSpellSlotsLevel1: player.maxSpellSlotsLevel1,
          },
          ...map.companionSpawns.map((s) => {
            const comp = COMPANION_PROFILES[s.id];
            return {
              id: s.id,
              name: comp.name,
              isPlayer: false,
              isCompanion: true,
              isEnemy: false,
              armorClass: s.id === "garrick" ? 18 : s.id === "beatrice" ? 16 : 14,
              currentHp: s.id === "garrick" ? 14 : s.id === "beatrice" ? 11 : 9,
              maxHp: s.id === "garrick" ? 14 : s.id === "beatrice" ? 11 : 9,
              tempHp: 0,
              speed: 30,
              initiativeModifier: s.id === "vaelin" ? 3 : 1,
              conditions: [] as Condition[],
              gridPosition: { x: s.x, y: s.y },
              portrait: comp.portrait,
              weaponAttackBonus: 5,
              weaponDamageDice: s.id === "garrick" ? "1d8+3" : s.id === "beatrice" ? "1d8+2" : "1d6+3",
              weaponDamageType: s.id === "beatrice" ? "radiant" : s.id === "vaelin" ? "piercing" : "slashing",
              spellSlotsLevel1: s.id === "beatrice" ? 2 : 0,
              maxSpellSlotsLevel1: s.id === "beatrice" ? 2 : 0,
            };
          }),
          ...map.enemySpawns.map((e) => {
            const stat = SRD_MONSTERS[e.monsterKey] ?? SRD_MONSTERS.skeleton;
            const primaryAction = stat.actions[0];
            return {
              id: e.id,
              name: e.name,
              isPlayer: false,
              isCompanion: false,
              isEnemy: true,
              armorClass: stat.armorClass,
              currentHp: stat.hitPoints,
              maxHp: stat.hitPoints,
              tempHp: 0,
              speed: stat.speed,
              initiativeModifier: calculateAbilityModifier(stat.abilities.dex),
              conditions: [] as Condition[],
              gridPosition: { x: e.x, y: e.y },
              portrait: stat.portrait ?? "/assets/images/enemies/skeleton.jpg",
              weaponAttackBonus: primaryAction?.toHit ?? 4,
              weaponDamageDice: primaryAction?.damageDice ?? "1d6+2",
              weaponDamageType: primaryAction?.damageType ?? "piercing",
            };
          }),
        ];

        const combatState = initializeCombat(combatants);
        set({
          isCombatActive: true,
          combat: combatState,
          tacticalMap: map,
          selectedCombatantId: combatState.combatants[0]?.id,
          ambiance: "battle_tense",
        });

        // If the first combatant is a companion or enemy, run their turn
        const first = combatState.combatants[0];
        if (first && !first.isPlayer) {
          get().runCompanionTurn();
        }
      },

      executePlayerCombatAttack: (targetId) => {
        const { combat, player } = get();
        if (!combat || !combat.isActive) return;

        const activeCombatant = combat.combatants[combat.activeTurnIndex];
        if (!activeCombatant || !activeCombatant.isPlayer || activeCombatant.actionUsed) return;

        const target = combat.combatants.find((c) => c.id === targetId);
        if (!target) return;

        // Roll attack
        set({ isDiceRolling: true });
        const attackOutcome = resolveAttackRoll({
          attackBonus: activeCombatant.weaponAttackBonus,
          targetAC: target.armorClass,
          attackerName: activeCombatant.name,
          targetName: target.name,
        });

        setTimeout(() => {
          let damageOutcome: DamageOutcome | null = null;
          let updatedCombatants = [...combat.combatants];

          if (attackOutcome.isHit) {
            damageOutcome = resolveDamage({
              damageDice: activeCombatant.weaponDamageDice,
              damageType: activeCombatant.weaponDamageType,
              isCritical: attackOutcome.isCritical,
            });

            // Apply damage to target
            const res = applyDamageToCombatant(target, damageOutcome.effectiveDamage);
            updatedCombatants = updatedCombatants.map((c) => (c.id === target.id ? res.combatant : c));
          }

          // Mark action used
          updatedCombatants = updatedCombatants.map((c) =>
            c.id === activeCombatant.id ? { ...c, actionUsed: true } : c
          );

          const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const logMsg = attackOutcome.isHit
            ? `⚔️ ${attackOutcome.breakdown} ➔ ${damageOutcome?.breakdown}`
            : `🛡️ ${attackOutcome.breakdown}`;

          set((state) => ({
            combat: {
              ...combat,
              combatants: updatedCombatants,
              log: [...combat.log, logMsg],
            },
            logs: [
              ...state.logs,
              {
                id: `atk_${Date.now()}`,
                role: "system",
                speaker: "Combat Engine",
                text: logMsg,
                timestamp: time,
                rollBreakdown: attackOutcome.attackRoll.explanation,
              },
            ],
            activeDiceRoll: attackOutcome.attackRoll,
            isDiceRolling: false,
          }));

          // Check if all enemies defeated
          const remainingEnemies = updatedCombatants.filter((c) => c.isEnemy && c.currentHp > 0);
          if (remainingEnemies.length === 0) {
            set((state) => ({
              isCombatActive: false,
              ambiance: "crypt_solemn",
              logs: [
                ...state.logs,
                {
                  id: `victory_${Date.now()}`,
                  role: "system",
                  speaker: "Victory",
                  text: "🎉 All enemies have fallen! The crypt descends into heavy silence once more.",
                  timestamp: time,
                },
              ],
            }));
            if (get().currentAct === 3) {
              get().advanceQuestAct(4);
            }
          }
        }, 800);
      },

      executePlayerCastSpell: (spellId, targetId) => {
        const { combat, player } = get();
        const spell = SRD_SPELLS[spellId];
        if (!spell || !combat) return;

        const activeCombatant = combat.combatants[combat.activeTurnIndex];
        if (!activeCombatant || !activeCombatant.isPlayer || activeCombatant.actionUsed) return;

        const target = combat.combatants.find((c) => c.id === targetId) ?? activeCombatant;

        set({ isDiceRolling: true });
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        setTimeout(() => {
          let updatedCombatants = [...combat.combatants];
          let spellLog = `${player.name} casts ${spell.name}!`;

          if (spell.healingDice) {
            const healRoll = executeRoll(spell.healingDice, "Healing");
            const newHp = Math.min(target.maxHp, target.currentHp + healRoll.total);
            updatedCombatants = updatedCombatants.map((c) =>
              c.id === target.id ? { ...c, currentHp: newHp } : c
            );
            spellLog += ` Healed ${target.name} for ${healRoll.total} HP! (${healRoll.explanation})`;
          } else if (spell.damageDice && spell.damageType) {
            const dmgOutcome = resolveDamage({
              damageDice: spell.damageDice,
              damageType: spell.damageType,
            });
            const res = applyDamageToCombatant(target, dmgOutcome.effectiveDamage);
            updatedCombatants = updatedCombatants.map((c) => (c.id === target.id ? res.combatant : c));
            spellLog += ` Dealt ${dmgOutcome.effectiveDamage} ${spell.damageType} damage to ${target.name}!`;
          }

          // Mark action used
          updatedCombatants = updatedCombatants.map((c) =>
            c.id === activeCombatant.id ? { ...c, actionUsed: true } : c
          );

          set((state) => ({
            combat: {
              ...combat,
              combatants: updatedCombatants,
              log: [...combat.log, spellLog],
            },
            logs: [
              ...state.logs,
              {
                id: `spell_${Date.now()}`,
                role: "system",
                speaker: "Spellcasting",
                text: spellLog,
                timestamp: time,
              },
            ],
            isDiceRolling: false,
          }));
        }, 800);
      },

      moveCombatant: (combatantId: string, dest: { x: number; y: number }) => {
        const { combat } = get();
        if (!combat) return;

        const combatant = combat.combatants.find((c) => c.id === combatantId);
        if (!combatant) return;

        const distance = calculateDistanceFt(combatant.gridPosition, dest);
        const maxMove = combatant.speed - combatant.movementUsedFt;
        if (distance > maxMove) return;

        const updated = combat.combatants.map((c) =>
          c.id === combatantId
            ? { ...c, gridPosition: dest, movementUsedFt: c.movementUsedFt + distance }
            : c
        );

        set({
          combat: {
            ...combat,
            combatants: updated,
            log: [...combat.log, `${combatant.name} moved to (${dest.x}, ${dest.y}) [${distance} ft].`],
          },
        });
      },

      movePlayerCombatant: (dest: { x: number; y: number }) => {
        const { combat } = get();
        if (!combat) return;
        const playerCombatant = combat.combatants.find((c) => c.isPlayer);
        if (playerCombatant) {
          get().moveCombatant(playerCombatant.id, dest);
        }
      },

      endCurrentCombatTurn: () => {
        const { combat } = get();
        if (!combat || !combat.isActive) return;

        const advanced = advanceTurn(combat);
        set({ combat: advanced });

        const nextCombatant = advanced.combatants[advanced.activeTurnIndex];
        if (nextCombatant && !nextCombatant.isPlayer) {
          get().runCompanionTurn();
        }
      },

      runCompanionTurn: () => {
        const { combat } = get();
        if (!combat || !combat.isActive) return;

        const active = combat.combatants[combat.activeTurnIndex];
        if (!active || active.isPlayer) return;

        setTimeout(() => {
          const decision = decideCompanionCombatTurn(active, combat.combatants);
          const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          let updatedCombatants = [...combat.combatants];
          let logMsg = decision.narrativeCallout;

          if (decision.actionType === "attack" && decision.targetId) {
            const target = combat.combatants.find((c) => c.id === decision.targetId);
            if (target) {
              const atk = resolveAttackRoll({
                attackBonus: active.weaponAttackBonus,
                targetAC: target.armorClass,
                attackerName: active.name,
                targetName: target.name,
              });

              if (atk.isHit) {
                const dmg = resolveDamage({
                  damageDice: active.weaponDamageDice,
                  damageType: active.weaponDamageType,
                  isCritical: atk.isCritical,
                });
                const res = applyDamageToCombatant(target, dmg.effectiveDamage);
                updatedCombatants = updatedCombatants.map((c) => (c.id === target.id ? res.combatant : c));
                logMsg += ` Hit! Dealt ${dmg.effectiveDamage} damage!`;
              } else {
                logMsg += ` Missed! (${atk.breakdown})`;
              }
            }
          } else if (decision.actionType === "cast_spell" && decision.spellId && decision.targetId) {
            const target = combat.combatants.find((c) => c.id === decision.targetId);
            if (target && decision.spellId === "cure_wounds") {
              const heal = executeRoll("1d8+3", "Cure Wounds");
              const newHp = Math.min(target.maxHp, target.currentHp + heal.total);
              updatedCombatants = updatedCombatants.map((c) =>
                c.id === target.id ? { ...c, currentHp: newHp } : c
              );
              logMsg += ` Restored ${heal.total} HP to ${target.name}!`;
            } else if (target && decision.spellId === "sacred_flame") {
              const dmg = resolveDamage({ damageDice: "1d8", damageType: "radiant" });
              const res = applyDamageToCombatant(target, dmg.effectiveDamage);
              updatedCombatants = updatedCombatants.map((c) => (c.id === target.id ? res.combatant : c));
              logMsg += ` Dealt ${dmg.effectiveDamage} radiant damage to ${target.name}!`;
            }
          }

          set((state) => ({
            combat: {
              ...combat,
              combatants: updatedCombatants,
              log: [...combat.log, logMsg],
            },
            logs: [
              ...state.logs,
              {
                id: `comp_turn_${Date.now()}`,
                role: active.isCompanion ? "companion" : "dm",
                speaker: active.name,
                text: logMsg,
                timestamp: time,
              },
            ],
          }));

          // Automatically advance turn after companion
          get().endCurrentCombatTurn();
        }, 1200);
      },

      advanceQuestAct: (nextAct) => {
        const stage = SUNKEN_CRYPT_STAGES[nextAct];
        if (!stage) return;

        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const actTransitionLog: LogEntry = {
          id: `act_${nextAct}_${Date.now()}`,
          role: "dm",
          speaker: "Dungeon Master",
          text: `✦ Act ${nextAct}: ${stage.name} ✦\n${stage.description}`,
          timestamp: time,
        };

        set((state) => ({
          currentAct: nextAct,
          currentLocation: stage.locationName,
          currentObjective: stage.objective,
          ambiance: stage.ambiance,
          suggestedActions: stage.initialSuggestedActions,
          pointsOfInterest: stage.pointsOfInterest,
          logs: [...state.logs, actTransitionLog],
        }));

        if (nextAct >= 3) {
          get().startCombatEncounter(nextAct);
        }
      },

      restShort: () => {
        const { player } = get();
        const hitDieRoll = executeRoll("1d10+2", "Short Rest Healing");
        const newHp = Math.min(player.maxHp, player.currentHp + hitDieRoll.total);
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        set((state) => ({
          player: { ...state.player, currentHp: newHp },
          logs: [
            ...state.logs,
            {
              id: `rest_${Date.now()}`,
              role: "system",
              speaker: "Short Rest",
              text: `Your party takes a 1-hour respite, tending wounds and checking gear. Healed ${hitDieRoll.total} HP!`,
              timestamp: time,
              rollBreakdown: hitDieRoll.explanation,
            },
          ],
        }));
      },

      restLong: () => {
        const { player } = get();
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        set((state) => ({
          player: {
            ...state.player,
            currentHp: state.player.maxHp,
            tempHp: 0,
            spellSlotsLevel1: state.player.maxSpellSlotsLevel1,
            deathSaves: { successes: 0, failures: 0, isStabilized: false, isDead: false, history: [] },
          },
          logs: [
            ...state.logs,
            {
              id: `longrest_${Date.now()}`,
              role: "system",
              speaker: "Long Rest",
              text: "Your party sets watch and rests for 8 hours. HP and spell slots fully restored!",
              timestamp: time,
            },
          ],
        }));
      },

      resetGame: () => {
        set({
          player: DEFAULT_PLAYER,
          currentAct: 1,
          currentLocation: initialStage.locationName,
          currentObjective: initialStage.objective,
          ambiance: initialStage.ambiance,
          logs: [
            {
              id: "log_reset",
              role: "dm",
              speaker: "Dungeon Master",
              text: initialStage.description,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ],
          isCombatActive: false,
          combat: null,
          tacticalMap: null,
        });
      },
    }),
    {
      name: "wayward_flagon_5e_save",
      partialize: (state) => ({
        player: state.player,
        currentAct: state.currentAct,
        currentLocation: state.currentLocation,
        currentObjective: state.currentObjective,
        logs: state.logs,
      }),
    }
  )
);