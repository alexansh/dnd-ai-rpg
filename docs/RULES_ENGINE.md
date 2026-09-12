# Deterministic Rules & Combat Engine Architecture

## 1. Existing Rules Implementation Analysis

### What Exists Today
- **`client/src/constants/dnd5eRules.js`**: Defines standard 5e races, classes, point-buy costs (8 to 15), standard array `[15, 14, 13, 12, 10, 8]`, racial bonuses, and equipment.
- **`client/src/services/deterministicRunner.js`**: Pure reducer applying numerical mutations (`hpDelta`, `goldDelta`, `addItems`, `removeItems`, `loyaltyDeltas`, `moralityDelta`, `setFlags`).
- **`server/services/deterministicEngine.js`**: Mirror pure validator on the backend proxy.
- **`client/src/components/DiceRollerModal.jsx`**: Renders 2D animated dice rolling with advantage/disadvantage, but computes outcomes entirely on the client using `Math.random()`.

### Flaws & Vulnerabilities in Existing Setup
1. **Client-Side Authoritative Rolls**: The client computes the random number and sends `total`, `isSuccess`, and `isCritSuccess` to the server in `/api/dm/narrate`. A modified client or replay script can send arbitrary rolls.
2. **Combat Execution Lack of Rigor**: In `EncounterBar.jsx`, clicking an action simply emits an action text string (e.g. `"Attack: Strike with weapon"`) to the narrative log. It does not calculate mathematical range, weapon damage dice (`1d8 + STR mod`), enemy AC comparisons, or hit point deduction on the monster entity.
3. **Scattered Rule Definitions**: Character calculations live partly in React components and partly in helper files rather than a unified rules library.

---

## 2. Target Server-Authoritative Rules Engine

```
                      PLAYER / AI ACTION REQUEST
                                  │
                                  ▼
                         RULES VALIDATOR
                     Is actor alive?
                     Does actor have action budget?
                     Is target in valid range?
                     Does actor own item/spell?
                                  │
                                  ▼
                        DICE GENERATION (Server)
                      crypto.randomInt(1, 21)
                      Applies Adv/Disadv + Modifiers
                                  │
                                  ▼
                       COMBAT / SKILL RESOLUTION
                 Attack Roll vs AC -> Hit or Miss
                 Damage = Roll(WeaponDice) + AbilityMod
                 Target HP = Max(0, Target HP - Damage)
                                  │
                                  ▼
                        EMIT STATE MUTATION
                 Update Firestore Session State
                                  │
                                  ▼
                 CLIENT EVENT: ANIMATE DICE TO (N)
             (Visual physics settles on authoritative result)
```

---

## 3. Server Dice API Contract

```typescript
interface DiceRollRequest {
  formula: string;              // e.g. "1d20+5", "2d20kh1+3", "2d6+2"
  reason: string;               // e.g. "Stealth Check vs Patrol"
  actorId: string;              // Character or Monster ID
  targetDC?: number;            // Optional DC for pass/fail determination
}

interface DiceRollResult {
  rollId: string;
  formula: string;
  dice: number[];               // Individual raw rolls, e.g. [17]
  discardedDice?: number[];     // In case of advantage/disadvantage
  modifier: number;
  total: number;
  isCritSuccess: boolean;       // Natural 20
  isCritFail: boolean;          // Natural 1
  isSuccess?: boolean;          // total >= targetDC
  timestamp: string;
}
```

---

## 4. Visual Physics Dice Protocol

1. **Client requests roll or server initiates check**:
   Client sends intent or acknowledges DM check prompt.
2. **Server generates authoritative outcome**:
   Server calculates `total = 18` (Die rolled `14`, mod `+4`).
3. **Client receives authoritative target**:
   The 3D canvas / physics engine throws the physical D20 with initial angular velocity and force calibrated to land on face `14`.
4. **Visual settlement matches numeric truth**:
   The die comes to rest showing `14`. The banner confirms `14 + 4 = 18 — SUCCESS`.
   Zero discrepancy between physics animation and server truth.
