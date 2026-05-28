import { openDB } from 'idb';

const DB_NAME = 'rplm-article-edits';
const STORE = 'articles';
const DB_VERSION = 1;

function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    },
  });
}

function key(source, articleId) {
  return `${source}__${articleId}`;
}

export async function saveEdit(source, articleId, content) {
  const db = await getDb();
  await db.put(STORE, { content, savedAt: Date.now() }, key(source, articleId));
}

export async function loadEdit(source, articleId) {
  const db = await getDb();
  const record = await db.get(STORE, key(source, articleId));
  return record?.content ?? null;
}

export async function loadAllEdits(source) {
  const db = await getDb();
  const allKeys = await db.getAllKeys(STORE);
  const prefix = `${source}__`;
  const result = {};
  await Promise.all(
    allKeys
      .filter((k) => k.startsWith(prefix))
      .map(async (k) => {
        const record = await db.get(STORE, k);
        const articleId = k.slice(prefix.length);
        result[articleId] = record?.content ?? null;
      })
  );
  return result;
}

export async function clearEdit(source, articleId) {
  const db = await getDb();
  await db.delete(STORE, key(source, articleId));
}

export async function clearAllEdits(source) {
  const db = await getDb();
  const allKeys = await db.getAllKeys(STORE);
  const prefix = `${source}__`;
  await Promise.all(
    allKeys
      .filter((k) => k.startsWith(prefix))
      .map((k) => db.delete(STORE, k))
  );
}

export async function exportEditsAsJson(source) {
  const edits = await loadAllEdits(source);
  const blob = new Blob([JSON.stringify({ source, edits }, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `edits_${source.replace(/\.pdf$/i, '')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importEditsFromJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const { source, edits } = JSON.parse(e.target.result);
        if (!source || !edits) throw new Error('Formato inválido');
        await Promise.all(
          Object.entries(edits).map(([articleId, content]) =>
            saveEdit(source, articleId, content)
          )
        );
        resolve({ source, count: Object.keys(edits).length });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Error leyendo archivo'));
    reader.readAsText(file);
  });
}
