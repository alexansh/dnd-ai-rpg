import { ItemDefinition } from "../srd/types";
import { SRD_ITEMS } from "../srd/items";
import { LootEvent } from "../ai/schemas";

export type ItemRarity = "common" | "uncommon" | "rare" | "very rare" | "legendary";

export interface InventorySlot {
  itemId: string;
  qty: number;
  customName?: string;
}

export const EXTENDED_SRD_ITEMS: Record<string, ItemDefinition> = {
  ...SRD_ITEMS,
  greatsword: {
    id: "greatsword",
    name: "Greatsword",
    category: "weapon",
    rarity: "common",
    cost: "50 gp",
    weightLbs: 6,
    damageDice: "2d6",
    damageType: "slashing",
    weaponRange: "melee",
    properties: ["Heavy", "Two-Handed"],
    description: "A massive two-handed steel sword capable of cleaving armor.",
  },
  greataxe: {
    id: "greataxe",
    name: "Greataxe",
    category: "weapon",
    rarity: "common",
    cost: "30 gp",
    weightLbs: 7,
    damageDice: "1d12",
    damageType: "slashing",
    weaponRange: "melee",
    properties: ["Heavy", "Two-Handed"],
    description: "A broad-bladed battleaxe built for crushing blows.",
  },
  light_crossbow: {
    id: "light_crossbow",
    name: "Light Crossbow",
    category: "weapon",
    rarity: "common",
    cost: "25 gp",
    weightLbs: 5,
    damageDice: "1d8",
    damageType: "piercing",
    weaponRange: "ranged",
    properties: ["Ammunition (80/320)", "Loading", "Two-Handed"],
    description: "A steel crossbow with an efficient winch mechanism.",
  },
  plate_armor: {
    id: "plate_armor",
    name: "Full Plate Armor",
    category: "armor",
    rarity: "common",
    cost: "1500 gp",
    weightLbs: 65,
    baseArmorClass: 18,
    stealthDisadvantage: true,
    description: "Interlocking shaped steel plates covering the entire body over padded arming doublet.",
  },
  scale_mail: {
    id: "scale_mail",
    name: "Scale Mail",
    category: "armor",
    rarity: "common",
    cost: "50 gp",
    weightLbs: 45,
    baseArmorClass: 14,
    stealthDisadvantage: true,
    description: "Overlapping bronze and iron scales mounted on leather coat.",
  },
  studded_leather: {
    id: "studded_leather",
    name: "Studded Leather",
    category: "armor",
    rarity: "common",
    cost: "45 gp",
    weightLbs: 13,
    baseArmorClass: 12,
    description: "Tough boiled leather reinforced with close-set steel rivets.",
  },
  potion_of_greater_healing: {
    id: "potion_of_greater_healing",
    name: "Potion of Greater Healing",
    category: "potion",
    rarity: "uncommon",
    cost: "150 gp",
    weightLbs: 0.5,
    healingDice: "4d4+4",
    description: "A deep crimson elixir with pulsing gold flecks. Drinking it restores 4d4 + 4 HP.",
  },
  potion_of_invisibility: {
    id: "potion_of_invisibility",
    name: "Potion of Invisibility",
    category: "potion",
    rarity: "very rare",
    cost: "500 gp",
    weightLbs: 0.5,
    description: "The container appears entirely empty, but feels full. Grants invisibility for 1 hour.",
  },
  torch: {
    id: "torch",
    name: "Torch",
    category: "gear",
    rarity: "common",
    cost: "1 cp",
    weightLbs: 1,
    description: "A pitch-soaked wooden club that burns brightly for 1 hour, shedding bright light in a 20-foot radius.",
  },
  rope_50ft: {
    id: "rope_50ft",
    name: "Hempen Rope (50 ft)",
    category: "gear",
    rarity: "common",
    cost: "1 gp",
    weightLbs: 10,
    description: "50 feet of braided hemp rope with 2 HP and DC 17 burst check.",
  },
  sun_blade: {
    id: "sun_blade",
    name: "Sun Blade",
    category: "weapon",
    rarity: "rare",
    cost: "2000 gp",
    weightLbs: 3,
    damageDice: "1d8",
    damageType: "radiant",
    weaponRange: "melee",
    properties: ["Finesse", "Versatile (1d10)"],
    description: "A gilded hilt that summons a radiant blade of pure sunlight (+2 bonus to attack and damage, deals radiant damage).",
  },
  ring_of_protection: {
    id: "ring_of_protection",
    name: "Ring of Protection",
    category: "gear",
    rarity: "rare",
    cost: "3500 gp",
    weightLbs: 0.1,
    armorClassBonus: 1,
    description: "A polished electrum band that grants +1 to AC and all saving throws.",
  },
};

export function getItemDefinition(itemId: string): ItemDefinition | undefined {
  return EXTENDED_SRD_ITEMS[itemId] || SRD_ITEMS[itemId];
}

/**
 * Calculates total carry weight in lbs for a list of items or item IDs.
 */
export function calculateInventoryWeight(
  inventory: (string | InventorySlot)[]
): number {
  let totalWeight = 0;

  for (const item of inventory) {
    const itemId = typeof item === "string" ? item : item.itemId;
    const qty = typeof item === "string" ? 1 : item.qty;
    const def = getItemDefinition(itemId);
    if (def) {
      totalWeight += (def.weightLbs ?? 1) * qty;
    } else {
      totalWeight += 1 * qty; // fallback weight
    }
  }

  return Math.round(totalWeight * 10) / 10;
}

/**
 * Standard 5e Encumbrance:
 * Carrying Capacity = STR * 15 lbs
 * Encumbered Threshold = STR * 5 lbs
 * Heavily Encumbered = STR * 10 lbs
 */
export function calculateCarryCapacity(strengthScore: number) {
  const maxCapacityLbs = Math.max(1, strengthScore) * 15;
  const encumberedThresholdLbs = Math.max(1, strengthScore) * 5;
  const heavilyEncumberedThresholdLbs = Math.max(1, strengthScore) * 10;

  return {
    maxLbs: maxCapacityLbs,
    encumberedLbs: encumberedThresholdLbs,
    heavilyEncumberedLbs: heavilyEncumberedThresholdLbs,
    checkStatus: (currentWeightLbs: number) => ({
      currentWeightLbs,
      isEncumbered: currentWeightLbs > encumberedThresholdLbs,
      isHeavilyEncumbered: currentWeightLbs > heavilyEncumberedThresholdLbs,
      isOverCapacity: currentWeightLbs > maxCapacityLbs,
      capacityPercent: Math.min(100, Math.round((currentWeightLbs / maxCapacityLbs) * 100)),
    }),
  };
}

/**
 * Rarity styling helper for Tailwind UI borders and text
 */
export function getRarityStyles(rarity?: string) {
  switch (rarity) {
    case "uncommon":
      return {
        badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
        border: "border-emerald-500/50",
        glow: "shadow-emerald-500/20",
        text: "text-emerald-400",
      };
    case "rare":
      return {
        badge: "bg-sky-500/20 text-sky-400 border-sky-500/40",
        border: "border-sky-500/50",
        glow: "shadow-sky-500/20",
        text: "text-sky-400",
      };
    case "very rare":
      return {
        badge: "bg-purple-500/20 text-purple-400 border-purple-500/40",
        border: "border-purple-500/50",
        glow: "shadow-purple-500/20",
        text: "text-purple-400",
      };
    case "legendary":
      return {
        badge: "bg-amber-500/20 text-amber-300 border-amber-500/50",
        border: "border-amber-400/80",
        glow: "shadow-amber-500/30",
        text: "text-amber-300",
      };
    default:
      return {
        badge: "bg-stone-500/20 text-stone-400 border-stone-500/30",
        border: "border-stone-600/40",
        glow: "shadow-stone-500/10",
        text: "text-stone-300",
      };
  }
}

/**
 * Pure function to apply a LootEvent to inventory and gold.
 */
export function processLootEvent(
  currentInventory: string[],
  currentGold: number,
  event: LootEvent
): {
  newInventory: string[];
  newGold: number;
  logText: string;
} {
  const newInventory = [...currentInventory];
  let newGold = currentGold;
  let logText = "";

  switch (event.type) {
    case "grant_item": {
      const id = event.itemId || event.itemName?.toLowerCase().replace(/\s+/g, "_") || "unknown_item";
      const count = event.qty ?? 1;
      for (let i = 0; i < count; i++) {
        newInventory.push(id);
      }
      const itemDef = getItemDefinition(id);
      const name = itemDef?.name || event.itemName || id;
      logText = `Acquired ${count > 1 ? `${count}x ` : ""}${name} (${event.reason || "Loot"}).`;
      break;
    }
    case "remove_item": {
      const id = event.itemId || event.itemName?.toLowerCase().replace(/\s+/g, "_");
      if (id) {
        const count = event.qty ?? 1;
        let removed = 0;
        for (let i = newInventory.length - 1; i >= 0 && removed < count; i--) {
          if (newInventory[i] === id) {
            newInventory.splice(i, 1);
            removed++;
          }
        }
        const itemDef = getItemDefinition(id);
        const name = itemDef?.name || event.itemName || id;
        logText = `Removed ${removed}x ${name} (${event.reason || "Discarded / Used"}).`;
      }
      break;
    }
    case "grant_gold": {
      const added = Math.max(0, event.gp ?? 0);
      newGold += added;
      logText = `Received ${added} gold pieces (${event.reason || "Reward"}). New balance: ${newGold} gp.`;
      break;
    }
    case "spend_gold": {
      const spent = Math.max(0, event.gp ?? 0);
      newGold = Math.max(0, newGold - spent);
      logText = `Spent ${spent} gold pieces (${event.reason || "Purchase"}). Remaining: ${newGold} gp.`;
      break;
    }
  }

  return { newInventory, newGold, logText };
}
