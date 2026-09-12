import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getFirestore, getStorage, isFirebaseLive } from './firebaseAdmin.js';

const ASSETS_DIR = path.resolve(process.cwd(), '.data', 'assets');

function ensureAssetsDir() {
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }
}

/**
 * Computes a deterministic content-addressed hash from prompt and metadata
 */
export function computeAssetHash(type, prompt, params = {}) {
  const normalized = [
    type || 'portrait',
    (prompt || '').trim().toLowerCase().replace(/\s+/g, ' '),
    JSON.stringify(params)
  ].join('::');

  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 24);
}

/**
 * Derives a deterministic integer seed (0 - 999999) from an asset hash
 * Guarantees identical generation outputs across restarts
 */
export function deriveSeedFromHash(hash) {
  const sub = hash.slice(0, 8);
  const num = parseInt(sub, 16);
  return num % 1000000;
}

/**
 * Retrieves asset record from local disk or Firestore
 */
export async function getAsset(assetId) {
  ensureAssetsDir();
  const localFilePath = path.join(ASSETS_DIR, `${assetId}.jpg`);

  // Check local filesystem first
  if (fs.existsSync(localFilePath)) {
    return {
      assetId,
      status: 'ready',
      url: `/api/assets/${assetId}.jpg`,
      localPath: localFilePath,
      source: 'local_disk'
    };
  }

  // Check Firestore
  try {
    const db = getFirestore();
    const doc = await db.collection('assets').doc(assetId).get();
    if (doc.exists) {
      const data = doc.data();
      return {
        assetId,
        status: data.status || 'ready',
        url: data.url || `/api/assets/${assetId}.jpg`,
        source: 'firestore_record'
      };
    }
  } catch (err) {
    console.warn(`[AssetRegistry] Error looking up asset ${assetId}:`, err.message);
  }

  return null;
}

/**
 * Stores binary image buffer to local disk and Firebase Storage
 */
export async function storeAssetBuffer(assetId, buffer, { type = 'portrait', prompt = '', metadata = {} } = {}) {
  ensureAssetsDir();
  const localFilePath = path.join(ASSETS_DIR, `${assetId}.jpg`);

  // 1. Write binary buffer to local filesystem
  fs.writeFileSync(localFilePath, buffer);
  let publicUrl = `/api/assets/${assetId}.jpg`;

  // 2. If Firebase Storage is live, upload to bucket
  if (isFirebaseLive()) {
    try {
      const storage = getStorage();
      if (storage) {
        const bucket = storage.bucket();
        const file = bucket.file(`assets/${assetId}.jpg`);
        await file.save(buffer, {
          metadata: {
            contentType: 'image/jpeg',
            metadata: {
              assetId,
              type,
              prompt: prompt.slice(0, 500)
            }
          }
        });
        // Make public or get public URL if bucket is configured
        publicUrl = `https://storage.googleapis.com/${bucket.name}/assets/${assetId}.jpg`;
      }
    } catch (err) {
      console.warn(`[AssetRegistry] Firebase Storage upload failed, using local disk endpoint:`, err.message);
      publicUrl = `/api/assets/${assetId}.jpg`;
    }
  }

  // 3. Record in Firestore asset registry
  try {
    const db = getFirestore();
    await db.collection('assets').doc(assetId).set({
      id: assetId,
      type,
      prompt,
      metadata,
      url: publicUrl,
      localPath: localFilePath,
      status: 'ready',
      fileSize: buffer.length,
      createdAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.warn(`[AssetRegistry] Failed to record asset metadata in Firestore:`, e.message);
  }

  return {
    assetId,
    url: publicUrl,
    localPath: localFilePath,
    status: 'ready'
  };
}

/**
 * Downloads a remote image (e.g. from Pollinations) and stores it permanently
 */
export async function fetchAndStoreRemoteImage(assetId, remoteUrl, { type = 'portrait', prompt = '', metadata = {} } = {}) {
  try {
    const response = await fetch(remoteUrl, {
      headers: { 'User-Agent': 'WaywardFlagon-AssetPipeline/2.0' },
      signal: AbortSignal.timeout(7000)
    });

    if (!response.ok) {
      throw new Error(`Remote image fetch failed with HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return await storeAssetBuffer(assetId, buffer, { type, prompt, metadata });
  } catch (err) {
    console.warn(`[AssetRegistry] Failed to fetch and store remote image from ${remoteUrl}:`, err.message);
    throw err;
  }
}
