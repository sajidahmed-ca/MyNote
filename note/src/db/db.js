import Dexie from 'dexie'

const DB_NAME = 'mynote-v2'
const DB_VERSION = 1

class NoteDB extends Dexie {
  constructor() {
    super(DB_NAME)
    this.version(DB_VERSION).stores({
      notes: 'id, type, updatedAt, createdAt, folder, archived',
      meta: 'key',
    })
  }
}

export const db = new NoteDB()

export async function syncToDb(notes) {
  try {
    const rev = Date.now()
    await db.transaction('rw', db.notes, async () => {
      await db.notes.bulkPut(notes)
      await db.meta.put({ key: 'lastSync', value: rev, notesCount: notes.length })
    })
    return { ok: true, rev, count: notes.length }
  } catch (e) {
    console.error('[mynote] sync failed', e)
    return { ok: false, error: e.message }
  }
}

export async function loadFromDb() {
  const notes = await db.notes.toArray()
  return notes
}

export async function persistPrefs(key, value) {
  await db.meta.put({ key: `pref:${key}`, value })
}

export async function loadPrefs(key) {
  const row = await db.meta.get(`pref:${key}`)
  return row ? row.value : undefined
}