import { create } from 'zustand'
import { loadFromDb, syncToDb, persistPrefs, loadPrefs } from '../db/db'
import { SEED_NOTES } from '../data/seed'
import { FOLDER_META } from '../constants'

const THEME_STORAGE_KEY = 'mynote-pro-theme'

function readStoredTheme() {
  try {
    return JSON.parse(localStorage.getItem(THEME_STORAGE_KEY)) || null
  } catch {
    return null
  }
}

export const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const now = () => Date.now()

const debounce = (fn, wait) => {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}

const sortNotes = (notes, sortBy, sortDir) => {
  const multi = sortDir === 'desc' ? -1 : 1
  const key =
    sortBy === 'title'
      ? (n) => n.title.toLowerCase()
      : (n) => n[sortBy ?? 'updatedAt'] ?? 0
  return [...notes].sort((a, b) => {
    const av = key(a)
    const bv = key(b)
    if (av < bv) return -1 * multi
    if (av > bv) return 1 * multi
    return 0
  })
}

let dbDirty = false
const debouncedSync = debounce((notes) => {
  syncToDb(notes)
  dbDirty = false
}, 700)

export const useNoteStore = create((set, get) => ({
  notes: [],
  hydrated: false,
  syncing: false,

  selectedIds: [],
  selectionEnabled: false,

  searchQuery: '',
  viewMode: 'grid',
  sortBy: 'updated',
  sortDir: 'desc',

  templateOpen: false,
  editorOpen: false,
  editingNoteId: null,

  theme: readStoredTheme() || { mode: 'light', accent: 'indigo' },
  customFolders: [],

  user: {
    name: 'Sajid Karim',
    email: 'sajid@example.com',
    avatar: null,
  },

  accessibility: {
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false,
    dyslexiaFont: false,
    compactMode: false,
    focusIndicators: true,
    animationsEnabled: true,
  },

  /** ---------- persistence ---------- */
  hydrate: async () => {
    if (get().hydrated) return
    let notes = []
    try {
      notes = await loadFromDb()
    } catch (e) {
      console.error('[mynote] load failed', e)
    }
    if (!notes.length) {
      notes = SEED_NOTES
      await syncToDb(notes)
    }
    const savedUser = await loadPrefs('user')
    const savedA11y = await loadPrefs('accessibility')
    const savedFolders = await loadPrefs('customFolders')
    set({
      notes,
      hydrated: true,
      ...(savedUser ? { user: { ...get().user, ...savedUser } } : {}),
      ...(savedA11y ? { accessibility: { ...get().accessibility, ...savedA11y } } : {}),
      ...(Array.isArray(savedFolders) ? { customFolders: savedFolders } : {}),
    })
  },

  folderLabel: (id) =>
    get().customFolders.find((f) => f.id === id)?.label || FOLDER_META[id]?.label,

  folderOptions: () => [
    ...Object.entries(FOLDER_META).map(([id, meta]) => ({
      id,
      label: meta.label,
      dot: meta.dot,
    })),
    ...get().customFolders.map((f) => ({ ...f, dot: 'bg-accent/60' })),
  ],

  persist: () => {
    const notes = get().notes
    dbDirty = true
    set({ syncing: true })
    debouncedSync(notes)
    setTimeout(() => set({ syncing: false }), 350)
  },

  persistNow: async () => {
    const notes = get().notes
    set({ syncing: true })
    try {
      await syncToDb(notes)
    } finally {
      set({ syncing: false })
    }
  },

  /** ---------- creation ---------- */
  createNote: (type) => {
    const note = {
      id: uid(),
      title: 'Untitled note',
      type,
      body: '',
      tags: [],
      folder: 'uncategorized',
      pinned: false,
      archived: false,
      createdAt: now(),
      updatedAt: now(),
      meta: type === 'book' ? { author: '', page: '', isbn: '' } : {},
      flashcards: [],
      tasks: type === 'task' ? [] : undefined,
    }
    set((s) => ({ notes: [note, ...s.notes] }))
    get().persist()
    get().openEditor(note.id)
    return note.id
  },

  updateNote: (id, patch) => {
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: now() } : n,
      ),
    }))
    get().persist()
  },

  deleteNotes: (ids) => {
    const idSet = new Set(ids)
    set((s) => ({
      notes: s.notes.map((n) =>
        idSet.has(n.id) ? { ...n, archived: true, updatedAt: now() } : n,
      ),
      selectedIds: s.selectedIds.filter((sel) => !idSet.has(sel)),
    }))
    return get().persistNow()
  },

  togglePin: (id) => {
    const note = get().notes.find((n) => n.id === id)
    if (note) get().updateNote(id, { pinned: !note.pinned })
  },

  moveNotes: (ids, folder) => {
    const idSet = new Set(ids)
    set((s) => ({
      notes: s.notes.map((n) =>
        idSet.has(n.id) ? { ...n, folder, updatedAt: now() } : n,
      ),
    }))
    get().persist()
  },

  addTagsToNotes: (ids, tags) => {
    const idSet = new Set(ids)
    set((s) => ({
      notes: s.notes.map((n) => {
        if (!idSet.has(n.id)) return n
        const merged = [...new Set([...(n.tags || []), ...tags])]
        return { ...n, tags: merged, updatedAt: now() }
      }),
    }))
    get().persist()
  },

  removeTagFromNotes: (ids, tag) => {
    const idSet = new Set(ids)
    set((s) => ({
      notes: s.notes.map((n) =>
        idSet.has(n.id) && n.tags
          ? { ...n, tags: n.tags.filter((t) => t !== tag), updatedAt: now() }
          : n,
      ),
    }))
    get().persist()
  },

  /** ---------- selection ---------- */
  enterSelectionMode: () => set({ selectionEnabled: true }),
  exitSelectionMode: () => set({ selectionEnabled: false, selectedIds: [] }),
  toggleSelected: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((sel) => sel !== id)
        : [...s.selectedIds, id],
    })),
  setSelected: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),
  selectAllVisible: (ids) =>
    set((s) => {
      const excludes = new Set(s.notes.filter((n) => !ids.includes(n.id)).map((n) => n.id))
      const merged = [...new Set([...s.selectedIds, ...ids])].filter((id) => !excludes.has(id))
      return { selectedIds: merged }
    }),

  /** ---------- ui state ---------- */
  openTemplate: () => set({ templateOpen: true }),
  closeTemplate: () => set({ templateOpen: false }),
  openEditor: (id) =>
    set({ editorOpen: true, editingNoteId: id }),
  closeEditor: () => set({ editorOpen: false, editingNoteId: null }),

  setSearchQuery: (q) => set({ searchQuery: q }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (sortBy) => set({ sortBy }),
  toggleSortDir: () =>
    set((s) => ({ sortDir: s.sortDir === 'desc' ? 'asc' : 'desc' })),

  /** ---------- user profile ---------- */
  updateUser: (patch) => {
    set((s) => ({ user: { ...s.user, ...patch } }))
    persistPrefs('user', get().user)
  },

  /** ---------- accessibility ---------- */
  updateAccessibility: (patch) => {
    set((s) => ({ accessibility: { ...s.accessibility, ...patch } }))
    persistPrefs('accessibility', get().accessibility)
  },

  /** ---------- pro: theme ---------- */
  setTheme: (patch) => {
    set((s) => ({ theme: { ...s.theme, ...patch } }))
    localStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify(get().theme),
    )
  },

  /** ---------- pro: trash ---------- */
  restoreNotes: (ids) => {
    const idSet = new Set(ids)
    set((s) => ({
      notes: s.notes.map((n) =>
        idSet.has(n.id) ? { ...n, archived: false, updatedAt: now() } : n,
      ),
    }))
    return get().persistNow()
  },

  purgeNotes: (ids) => {
    const idSet = new Set(ids)
    set((s) => ({
      notes: s.notes.filter((n) => !idSet.has(n.id)),
      selectedIds: s.selectedIds.filter((sel) => !idSet.has(sel)),
    }))
    return get().persistNow()
  },

  /** ---------- pro: custom folders ---------- */
  addCustomFolder: async (label) => {
    const clean = label.trim()
    if (!clean) return
    if (get().customFolders.some((f) => f.label.toLowerCase() === clean.toLowerCase())) {
      return
    }
    set((s) => ({
      customFolders: [
        ...s.customFolders,
        { id: `custom-${uid()}`, label: clean },
      ],
    }))
    await persistPrefs('customFolders', get().customFolders)
  },

  removeCustomFolder: async (id) => {
    set((s) => ({
      customFolders: s.customFolders.filter((f) => f.id !== id),
      notes: s.notes.map((n) =>
        n.folder === id ? { ...n, folder: 'uncategorized', updatedAt: now() } : n,
      ),
    }))
    await persistPrefs('customFolders', get().customFolders)
  },

  renameCustomFolder: async (id, label) => {
    const clean = label.trim()
    if (!clean) return
    set((s) => ({
      customFolders: s.customFolders.map((f) =>
        f.id === id ? { ...f, label: clean } : f,
      ),
    }))
    await persistPrefs('customFolders', get().customFolders)
  },

  /** ---------- pro: backup & restore ---------- */
  importBackup: async (notesToImport) => {
    if (!Array.isArray(notesToImport) || !notesToImport.length) return false
    const nowTs = now()
    const clean = notesToImport
      .filter((n) => n && typeof n === 'object' && n.title !== undefined)
      .map((n) => ({
        id: n.id || uid(),
        title: n.title || 'Untitled note',
        type: n.type || 'standard',
        folder: n.folder || 'uncategorized',
        tags: n.tags || [],
        pinned: Boolean(n.pinned),
        archived: Boolean(n.archived),
        body: n.body || '',
        meta: n.meta || {},
        flashcards: n.flashcards || [],
        tasks: n.tasks || undefined,
        createdAt: n.createdAt || nowTs,
        updatedAt: n.updatedAt || nowTs,
      }))
    const imported = new Set(clean.map((n) => n.id))
    set((s) => ({
      notes: [...clean, ...s.notes.filter((n) => !imported.has(n.id))],
    }))
    get().persist()
    return true
  },

  /** ---------- flashcards ---------- */
  addFlashcard: (noteId, front, back = '') => {
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              updatedAt: now(),
              flashcards: [
                ...(n.flashcards || []),
                { id: uid(), front, back, createdAt: now() },
              ],
            }
          : n,
      ),
    }))
    get().persist()
  },

  updateFlashcard: (noteId, fcId, patch) => {
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              updatedAt: now(),
              flashcards: (n.flashcards || []).map((fc) =>
                fc.id === fcId ? { ...fc, ...patch } : fc,
              ),
            }
          : n,
      ),
    }))
    get().persist()
  },

  removeFlashcard: (noteId, fcId) => {
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              updatedAt: now(),
              flashcards: (n.flashcards || []).filter((fc) => fc.id !== fcId),
            }
          : n,
      ),
    }))
    get().persist()
  },

  /** ---------- task lists ---------- */
  addTask: (noteId, text) => {
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              updatedAt: now(),
              tasks: [...(n.tasks || []), { id: uid(), text, done: false }],
            }
          : n,
      ),
    }))
    get().persist()
  },
  toggleTask: (noteId, taskId) => {
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              updatedAt: now(),
              tasks: (n.tasks || []).map((t) =>
                t.id === taskId ? { ...t, done: !t.done } : t,
              ),
            }
          : n,
      ),
    }))
    get().persist()
  },
  removeTask: (noteId, taskId) => {
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              updatedAt: now(),
              tasks: (n.tasks || []).filter((t) => t.id !== taskId),
            }
          : n,
      ),
    }))
    get().persist()
  },
}))

/** flush any pending debounced write before the tab goes away */
const flushPending = () => {
  if (dbDirty) syncToDb(useNoteStore.getState().notes)
}
window.addEventListener('pagehide', flushPending)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushPending()
})

/** ---------- derived selectors ---------- */
export const selectFilteredNotes = (s) => {
  const q = s.searchQuery.trim().toLowerCase()
  let notes = s.notes.filter((n) => !n.archived)
  if (q) {
    notes = notes.filter(
      (n) =>
        (n.title || '').toLowerCase().includes(q) ||
        plainText(n.body).toLowerCase().includes(q) ||
        (n.tags || []).some((t) => t.toLowerCase().includes(q)) ||
        (n.meta?.author || '').toLowerCase().includes(q),
    )
  }
  return sortNotes(notes, s.sortBy, s.sortDir)
}

export const selectVisibleIds = (s) => {
  const q = s.searchQuery.trim().toLowerCase()
  return s.notes
    .filter((n) => !n.archived)
    .filter(
      (n) =>
        !q ||
        (n.title || '').toLowerCase().includes(q) ||
        plainText(n.body).toLowerCase().includes(q) ||
        (n.tags || []).some((t) => t.toLowerCase().includes(q)) ||
        (n.meta?.author || '').toLowerCase().includes(q),
    )
    .map((n) => n.id)
}

const plainText = (html = '') =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()

export const noteBodyText = (note) => (note ? plainText(note.body || '') : '')

export const allTags = (notes) => {
  const map = new Map()
  for (const n of notes)
    for (const t of n.tags || []) map.set(t, (map.get(t) || 0) + 1)
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }))
}