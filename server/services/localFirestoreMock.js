import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), '.data', 'firestore');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

class MockDocumentReference {
  constructor(collectionPath, docId) {
    this.collectionPath = collectionPath;
    this.id = docId;
    this.filePath = path.join(DATA_DIR, ...collectionPath.split('/'), `${docId}.json`);
  }

  async get() {
    if (!fs.existsSync(this.filePath)) {
      return {
        exists: false,
        id: this.id,
        data: () => null
      };
    }
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      const data = JSON.parse(content);
      return {
        exists: true,
        id: this.id,
        data: () => data
      };
    } catch (e) {
      return {
        exists: false,
        id: this.id,
        data: () => null
      };
    }
  }

  async set(data, options = {}) {
    ensureDir(path.dirname(this.filePath));
    let finalData = { ...data, updatedAt: new Date().toISOString() };
    if (options.merge && fs.existsSync(this.filePath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
        finalData = { ...existing, ...finalData };
      } catch (e) {}
    } else {
      finalData.createdAt = finalData.createdAt || new Date().toISOString();
    }
    fs.writeFileSync(this.filePath, JSON.stringify(finalData, null, 2), 'utf-8');
    return { writeTime: new Date().toISOString() };
  }

  async update(data) {
    return this.set(data, { merge: true });
  }

  async delete() {
    if (fs.existsSync(this.filePath)) {
      fs.unlinkSync(this.filePath);
    }
    return { writeTime: new Date().toISOString() };
  }
}

class MockCollectionReference {
  constructor(collectionPath) {
    this.collectionPath = collectionPath;
    this.dirPath = path.join(DATA_DIR, ...collectionPath.split('/'));
    this._filters = [];
    this._limit = null;
    this._orderBy = null;
  }

  doc(docId) {
    const id = docId || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    return new MockDocumentReference(this.collectionPath, id);
  }

  where(field, op, value) {
    const clone = new MockCollectionReference(this.collectionPath);
    clone._filters = [...this._filters, { field, op, value }];
    clone._limit = this._limit;
    clone._orderBy = this._orderBy;
    return clone;
  }

  orderBy(field, direction = 'asc') {
    const clone = new MockCollectionReference(this.collectionPath);
    clone._filters = [...this._filters];
    clone._limit = this._limit;
    clone._orderBy = { field, direction };
    return clone;
  }

  limit(count) {
    const clone = new MockCollectionReference(this.collectionPath);
    clone._filters = [...this._filters];
    clone._limit = count;
    clone._orderBy = this._orderBy;
    return clone;
  }

  async get() {
    if (!fs.existsSync(this.dirPath)) {
      return { empty: true, size: 0, docs: [] };
    }

    const files = fs.readdirSync(this.dirPath).filter(f => f.endsWith('.json'));
    let docs = [];

    for (const file of files) {
      const docId = path.basename(file, '.json');
      const filePath = path.join(this.dirPath, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        // Apply filters
        let matches = true;
        for (const f of this._filters) {
          if (f.op === '==' && data[f.field] !== f.value) matches = false;
          if (f.op === '!=' && data[f.field] === f.value) matches = false;
          if (f.op === '>' && !(data[f.field] > f.value)) matches = false;
          if (f.op === '<' && !(data[f.field] < f.value)) matches = false;
        }

        if (matches) {
          docs.push({
            id: docId,
            exists: true,
            data: () => data
          });
        }
      } catch (e) {}
    }

    if (this._orderBy) {
      docs.sort((a, b) => {
        const valA = a.data()[this._orderBy.field];
        const valB = b.data()[this._orderBy.field];
        if (this._orderBy.direction === 'desc') {
          return valA > valB ? -1 : 1;
        }
        return valA > valB ? 1 : -1;
      });
    }

    if (this._limit) {
      docs = docs.slice(0, this._limit);
    }

    return {
      empty: docs.length === 0,
      size: docs.length,
      docs
    };
  }

  async add(data) {
    const newDoc = this.doc();
    await newDoc.set(data);
    return newDoc;
  }
}

class MockFirestore {
  collection(path) {
    return new MockCollectionReference(path);
  }

  async runTransaction(updateFunction) {
    // Basic atomic wrapper for mock mode
    return await updateFunction({
      get: async (docRef) => docRef.get(),
      set: async (docRef, data) => docRef.set(data),
      update: async (docRef, data) => docRef.update(data),
      delete: async (docRef) => docRef.delete()
    });
  }
}

export const localFirestore = new MockFirestore();
