# Firebase Production Architecture & Security Blueprint

## 1. Authentication Layer

### Strategy: Seamless Guest-to-Account Journey
1. **Anonymous / Guest Play**: On initial load, if no user is signed in, the client initializes an anonymous session (`signInAnonymously(auth)`). The player can jump directly into character creation and campaign play without onboarding friction.
2. **Account Upgrades**: At any time (or upon completing Act I), the player can link their account to Email/Password or Google Auth (`linkWithCredential()`) to preserve their progress across devices.
3. **Server-Side Token Verification**: Every API call from client to Express backend sends the Firebase ID token in the `Authorization: Bearer <token>` header.
4. **Backend Auth Middleware**:
   ```javascript
   // middleware/auth.js
   import admin from 'firebase-admin';

   export async function verifyAuthToken(req, res, next) {
     const authHeader = req.headers.authorization;
     if (!authHeader?.startsWith('Bearer ')) {
       return res.status(401).json({ error: 'Unauthorized: Missing token' });
     }
     const token = authHeader.split('Bearer ')[1];
     try {
       const decoded = await admin.auth().verifyIdToken(token);
       req.user = decoded; // { uid, email, ... }
       next();
     } catch (err) {
       return res.status(403).json({ error: 'Forbidden: Invalid token' });
     }
   }
   ```

---

## 2. Cloud Firestore Security Rules

To ensure zero client tampering with other players' saves or game assets, Firestore rules enforce strict owner isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profile: only owner can read and write
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Nested campaigns, sessions, characters, and quests
      match /campaigns/{campaignId}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      // Assets metadata
      match /assets/{assetId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Public/Shared Campaign Templates (read-only for players)
    match /campaign_templates/{templateId} {
      allow read: if true;
      allow write: if false; // Server admin SDK only
    }
  }
}
```

---

## 3. Firebase Storage Hierarchy & Security Rules

### Storage Directory Structure
```
gs://<bucket-name>/
  ├── users/{uid}/
  │     ├── portraits/{characterId}_{hash}.jpg
  │     └── custom_scenes/{sceneId}_{hash}.jpg
  └── shared_assets/
        ├── archetypes/
        ├── scenery/
        └── companions/
```

### Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if true; // Public CDN read for rendered web game art
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    match /shared_assets/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

## 4. Local Emulator Suite Configuration

For rapid offline and test-driven development without cloud costs or internet dependencies:
- **`firebase.json`**:
  ```json
  {
    "emulators": {
      "auth": { "port": 9099 },
      "firestore": { "port": 8080 },
      "storage": { "port": 9199 },
      "ui": { "enabled": true, "port": 4000 }
    }
  }
  ```
