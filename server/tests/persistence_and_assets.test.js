import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import {
  createSession,
  loadSession,
  saveSession,
  autosaveSession,
  listSessions,
  deleteSession
} from '../services/sessionManager.js';
import {
  computeAssetHash,
  deriveSeedFromHash,
  getAsset,
  storeAssetBuffer
} from '../services/assetRegistry.js';
import { generatePortrait } from '../services/imageAdapter.js';
import { generateSceneImage } from '../services/sceneImageAdapter.js';

describe('Phase 1: Persistence & Session Manager', () => {
  const testUid = `test_user_${Date.now()}`;
  let createdSessionId = null;

  test('createSession: creates session and persists to storage', async () => {
    const sessionData = {
      character: { name: 'Thorgar Ironfist', class: 'Fighter', level: 2, hp: 24, maxHp: 24 },
      companions: [{ name: 'Valen', class: 'Rogue', approval: 60 }],
      currentLocation: 'The Wayward Flagon Taproom',
      turnCount: 5,
      adventureLog: [{ id: '1', role: 'dm', content: 'You hear whispering in the cellar.' }]
    };

    const session = await createSession(testUid, sessionData);
    assert.ok(session.id, 'Session must have an ID');
    assert.strictEqual(session.userId, testUid);
    assert.strictEqual(session.character.name, 'Thorgar Ironfist');
    assert.strictEqual(session.turnCount, 5);

    createdSessionId = session.id;
  });

  test('loadSession: retrieves the exact saved state', async () => {
    assert.ok(createdSessionId, 'Created session ID must exist');
    const loaded = await loadSession(testUid, createdSessionId);

    assert.ok(loaded, 'Loaded session must not be null');
    assert.strictEqual(loaded.id, createdSessionId);
    assert.strictEqual(loaded.character.class, 'Fighter');
    assert.strictEqual(loaded.companions[0].name, 'Valen');
  });

  test('saveSession: updates session data atomically', async () => {
    const updated = await saveSession(testUid, createdSessionId, {
      character: { name: 'Thorgar Ironfist', class: 'Fighter', level: 3, hp: 18, maxHp: 32 },
      turnCount: 8,
      currentLocation: 'The Cellar Crypts'
    });

    assert.strictEqual(updated.turnCount, 8);
    assert.strictEqual(updated.character.level, 3);
    assert.strictEqual(updated.currentLocation, 'The Cellar Crypts');

    // Reload to verify persistence on disk/db
    const reloaded = await loadSession(testUid, createdSessionId);
    assert.strictEqual(reloaded.character.level, 3);
    assert.strictEqual(reloaded.currentLocation, 'The Cellar Crypts');
  });

  test('listSessions: lists active sessions for user in sorted order', async () => {
    const list = await listSessions(testUid);
    assert.ok(Array.isArray(list), 'List must be an array');
    assert.ok(list.length >= 1, 'Should have at least 1 session');

    const found = list.find(s => s.id === createdSessionId);
    assert.ok(found, 'Created session must be in the list');
    assert.strictEqual(found.characterName, 'Thorgar Ironfist');
    assert.strictEqual(found.characterClass, 'Fighter');
  });

  test('deleteSession: removes session document', async () => {
    const delResult = await deleteSession(testUid, createdSessionId);
    assert.strictEqual(delResult.success, true);

    const check = await loadSession(testUid, createdSessionId);
    assert.strictEqual(check, null, 'Deleted session must return null');
  });
});

describe('Phase 2: Permanent Asset Pipeline & Deterministic Caching', () => {
  test('computeAssetHash: generates identical SHA-256 hash for normalized prompts', () => {
    const prompt1 = 'A stern dwarf warrior with a golden beard';
    const prompt2 = '  A stern dwarf warrior   with a golden beard  ';
    const hash1 = computeAssetHash('portrait', prompt1, { characterClass: 'Warrior' });
    const hash2 = computeAssetHash('portrait', prompt2, { characterClass: 'Warrior' });

    assert.strictEqual(hash1, hash2, 'Normalized prompts must produce identical hashes');
    assert.strictEqual(hash1.length, 24, 'Hash must be 24 hex characters');
  });

  test('deriveSeedFromHash: generates deterministic positive integer seed', () => {
    const hash = 'a1b2c3d4e5f60718293a4b5c';
    const seed1 = deriveSeedFromHash(hash);
    const seed2 = deriveSeedFromHash(hash);

    assert.strictEqual(seed1, seed2, 'Same hash must yield same seed');
    assert.ok(seed1 >= 0 && seed1 < 1000000, 'Seed must be in range 0-999999');
  });

  test('storeAssetBuffer & getAsset: persists binary file and retrieves asset', async () => {
    const dummyBuffer = Buffer.from('FAKE_JPEG_IMAGE_BINARY_DATA_12345');
    const testAssetId = `test_asset_${Date.now()}`;

    const stored = await storeAssetBuffer(testAssetId, dummyBuffer, {
      type: 'portrait',
      prompt: 'Test prompt'
    });

    assert.strictEqual(stored.assetId, testAssetId);
    assert.strictEqual(stored.url, `/api/assets/${testAssetId}.jpg`);

    // Verify file exists on local disk
    const expectedFilePath = path.resolve('.data', 'assets', `${testAssetId}.jpg`);
    assert.ok(fs.existsSync(expectedFilePath), 'Asset file must exist on disk');

    // Retrieve via getAsset
    const retrieved = await getAsset(testAssetId);
    assert.ok(retrieved, 'Retrieved asset must exist');
    assert.strictEqual(retrieved.status, 'ready');
    assert.strictEqual(retrieved.url, `/api/assets/${testAssetId}.jpg`);

    // Clean up test file
    fs.unlinkSync(expectedFilePath);
  });

  test('generatePortrait: produces consistent output and caches idempotently', async () => {
    const result1 = await generatePortrait({
      characterClass: 'Paladin',
      description: 'Test holy warrior with gleaming silver armor'
    });

    assert.ok(result1.imageUrl, 'Portrait must return an imageUrl');
    assert.ok(result1.assetId, 'Portrait must return an assetId');

    // Second call with same description should return cached asset
    const result2 = await generatePortrait({
      characterClass: 'Paladin',
      description: 'Test holy warrior with gleaming silver armor'
    });

    assert.strictEqual(result2.imageUrl, result1.imageUrl, 'Image URL must be identical across calls');
    assert.strictEqual(result2.assetId, result1.assetId, 'AssetId must match');
  });

  test('generateSceneImage: produces consistent output and caches idempotently', async () => {
    const result1 = await generateSceneImage({
      sceneDescription: 'Grand dining hall with lit chandeliers',
      location: 'The Wayward Flagon',
      mood: 'warm'
    });

    assert.ok(result1.imageUrl || result1.isFallback, 'Scene must return an image or fallback');
    assert.ok(result1.assetId, 'Scene must return an assetId');

    // Second call should return cached asset
    const result2 = await generateSceneImage({
      sceneDescription: 'Grand dining hall with lit chandeliers',
      location: 'The Wayward Flagon',
      mood: 'warm'
    });

    assert.strictEqual(result2.assetId, result1.assetId, 'Scene assetId must match');
    assert.strictEqual(result2.imageUrl, result1.imageUrl, 'Scene image URL must match');
  });
});
