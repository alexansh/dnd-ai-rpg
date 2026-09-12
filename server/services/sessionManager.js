import { getFirestore } from './firebaseAdmin.js';

/**
 * Validates and sanitizes a session payload before persistence
 */
export function sanitizeSessionPayload(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Session payload must be an object');
  }

  const sanitized = {
    version: data.version || 2,
    character: data.character || null,
    companions: Array.isArray(data.companions) ? data.companions : [],
    activeCampaign: data.activeCampaign || null,
    activeWorldNode: data.activeWorldNode || null,
    activeQuest: data.activeQuest || null,
    currentLocation: data.currentLocation || 'The Wayward Flagon Tavern',
    currentSceneKey: data.currentSceneKey || 'tavern',
    adventureLog: Array.isArray(data.adventureLog) ? data.adventureLog.slice(-50) : [], // keep last 50 entries
    storySummary: typeof data.storySummary === 'string' ? data.storySummary : '',
    turnCount: typeof data.turnCount === 'number' ? data.turnCount : 0,
    worldState: data.worldState || { questStage: 1, totalStages: 4, flags: {} },
    completedQuests: Array.isArray(data.completedQuests) ? data.completedQuests : [],
    codexEntries: Array.isArray(data.codexEntries) ? data.codexEntries : [],
    currentScreen: data.currentScreen || 'adventure',
    activeMonsters: Array.isArray(data.activeMonsters) ? data.activeMonsters : [],
    turnOrder: Array.isArray(data.turnOrder) ? data.turnOrder : [],
    currentCombatTurn: typeof data.currentCombatTurn === 'number' ? data.currentCombatTurn : 0,
    combatPosition: data.combatPosition || 'Engaged (Melee)',
    updatedAt: new Date().toISOString()
  };

  return sanitized;
}

/**
 * Creates a new persistent game session
 */
export async function createSession(userId, sessionData = {}) {
  const db = getFirestore();
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
  const cleanData = sanitizeSessionPayload(sessionData);
  cleanData.id = sessionId;
  cleanData.userId = userId;
  cleanData.createdAt = new Date().toISOString();

  const sessionRef = db.collection(`users/${userId}/sessions`).doc(sessionId);
  await sessionRef.set(cleanData);

  return cleanData;
}

/**
 * Saves/updates an existing session
 */
export async function saveSession(userId, sessionId, sessionData) {
  if (!sessionId) throw new Error('Session ID is required');
  const db = getFirestore();
  const cleanData = sanitizeSessionPayload(sessionData);
  cleanData.id = sessionId;
  cleanData.userId = userId;

  const sessionRef = db.collection(`users/${userId}/sessions`).doc(sessionId);
  await sessionRef.set(cleanData, { merge: true });

  return cleanData;
}

/**
 * Lightweight autosave at major narrative milestones
 */
export async function autosaveSession(userId, sessionId, sessionData) {
  if (!sessionId) {
    return await createSession(userId, sessionData);
  }
  return await saveSession(userId, sessionId, {
    ...sessionData,
    lastAutosaveAt: new Date().toISOString()
  });
}

/**
 * Loads a single session document
 */
export async function loadSession(userId, sessionId) {
  if (!sessionId) throw new Error('Session ID is required');
  const db = getFirestore();
  const sessionRef = db.collection(`users/${userId}/sessions`).doc(sessionId);
  const doc = await sessionRef.get();

  if (!doc.exists) {
    return null;
  }

  return doc.data();
}

/**
 * Lists all active sessions for a user
 */
export async function listSessions(userId) {
  const db = getFirestore();
  const sessionsCol = db.collection(`users/${userId}/sessions`);
  const snapshot = await sessionsCol.get();

  if (snapshot.empty) {
    return [];
  }

  const sessions = [];
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    sessions.push({
      id: doc.id,
      characterName: data.character?.name || 'Unnamed Adventurer',
      characterClass: data.character?.class || 'Adventurer',
      level: data.character?.level || 1,
      campaignTitle: data.activeCampaign?.title || 'Unknown Realm',
      currentLocation: data.currentLocation || 'Unknown',
      turnCount: data.turnCount || 0,
      updatedAt: data.updatedAt || data.createdAt,
      currentScreen: data.currentScreen || 'adventure'
    });
  });

  // Sort descending by updatedAt
  return sessions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

/**
 * Deletes a session
 */
export async function deleteSession(userId, sessionId) {
  if (!sessionId) throw new Error('Session ID is required');
  const db = getFirestore();
  const sessionRef = db.collection(`users/${userId}/sessions`).doc(sessionId);
  await sessionRef.delete();
  return { success: true, sessionId };
}
