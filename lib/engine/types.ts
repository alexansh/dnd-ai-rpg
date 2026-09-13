import { AbilityScoreKey, DamageType } from "../srd/types";

export type AdvantageMode = "adv" | "dis" | "normal";

export type EngineRequest =
  | {
      type: "ability_check";
      ability: AbilityScoreKey;
      skill?: string;
      dc: number;
      advantage?: AdvantageMode;
      reason: string;
      characterId?: string;
      abilityScore?: number;
      isProficient?: boolean;
      proficiencyBonus?: number;
    }
  | {
      type: "saving_throw";
      ability: AbilityScoreKey;
      dc: number;
      advantage?: AdvantageMode;
      reason: string;
      characterId?: string;
      abilityScore?: number;
      isProficient?: boolean;
      proficiencyBonus?: number;
    }
  | {
      type: "attack_roll";
      attackerId: string;
      targetId: string;
      weaponOrSpellId: string;
      attackBonus: number;
      targetAc: number;
      coverBonus?: number;
      advantage?: AdvantageMode;
    }
  | {
      type: "damage_roll";
      sourceId: string;
      targetId: string;
      formula: string;
      damageType: DamageType;
      isCrit?: boolean;
      resistances?: DamageType[];
      vulnerabilities?: DamageType[];
      immunities?: DamageType[];
    }
  | {
      type: "death_save";
      characterId: string;
      advantage?: AdvantageMode;
    }
  | {
      type: "concentration_check";
      characterId: string;
      damageTaken: number;
      conScore: number;
      isProficient?: boolean;
      proficiencyBonus?: number;
      advantage?: AdvantageMode;
    };

export interface EngineResult {
  request: EngineRequest;
  rolls: number[];
  total: number;
  success?: boolean;
  isCrit?: boolean;
  isFumble?: boolean;
  breakdown: string;
  detail: Record<string, unknown>;
  timestamp: string;
}
