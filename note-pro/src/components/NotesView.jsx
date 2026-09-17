import { useRef, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Plus,
  SearchX,
  NotebookPen,
  CheckSquare,
  X,
  Brain,
  Pin,
} from 'lucide-react'
import {
  useNoteStore,
  selectFilteredNotes,
} from '../store/useNoteStore'
import { TYPE_META } from '../constants'
import { plainText, timeAgo } from '../utils/format'
import NoteCard from './NoteCard'
import EmptyState from './EmptyState'

function ListRow({ note, selectMode, selected, onToggleSelect, onOpen, onTogglePin, onShiftSelect, index }) {
  const meta = TYPE_META[note.type] || TYPE_META.standard
  const Icon = meta.icon
  const text = plainText(note.body || '')

  return (
    <div
      className={`group flex cursor-pointer items-center gap-3 border-b border-line/70 px-4 py-3 transition-colors last:border-b-0 hover:bg-hover/60 ${
        selected ? 'bg-accent-soft/50' : ''
      } ${selectMode ? 'cursor-default' : ''}`}
      onClick={(e) => {
        if (e.shiftKey) {
          onShiftSelect(index, e)
          return
        }
        if (selectMode) {
          onToggleSelect(note.id)
          return
        }
        onOpen(note.id)
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggleSelect(note.id)
        }}
        className={`flex size-5 shrink-0 items-center justify-center rounded border transition-all ${
          selected
            ? 'border-accent bg-accent text-white'
            : 'border-line bg-surface text-transparent group-hover:border-accent'
        } ${selectMode ? 'border-accent/50' : 'opacity-0 group-hover:opacity-100'}`}
      >
        <svg viewBox="0 0 12 12" className="size-3" fill="none">
          <path
            d="M2.5 6.2l2.2 2.2 4.8-4.8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${meta.glyph}`}>
        <Icon className="size-3.5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[13px] font-semibold text-ink">
            {note.title || 'Untitled note'}
          </p>
          {note.flashcards?.length > 0 && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-accent-strong">
              <Brain className="size-3" />
              {note.flashcards.length}
            </span>
          )}
        </div>
        <p className="truncate text-[12px] text-ink-secondary">{text}</p>
      </div>

      {note.type === 'book' && note.meta?.author && (
        <span className="hidden font-mono text-[11px] text-sky-700 lg:block">
          {note.meta.author}
        </span>
      )}

      {note.type === 'task' && note.tasks?.length > 0 && (
        <span className="hidden font-mono text-[10.5px] text-ink-muted md:block">
          {note.tasks.filter((t) => t.done).length}/{note.tasks.length} done
        </span>
      )}

      <span className="font-mono text-[10.5px] text-ink-muted">
        {timeAgo(note.updatedAt)}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onTogglePin(note.id)
        }}
        className={`flex size-6 items-center justify-center rounded-md transition-colors ${
          note.pinned
            ? 'text-accent'
            : 'text-ink-muted opacity-0 group-hover:opacity-100 hover:bg-surface hover:text-ink'
        }`}
        title={note.pinned ? 'Unpin' : 'Pin'}
      >
        <Pin className={`size-3.5 ${note.pinned ? 'fill-accent text-accent' : ''}`} />
      </button>
    </div>
  )
}

export default function NotesView({ typeFilter }) {
  const location = useLocation()
  const notes = useNoteStore((s) => s.notes)
  const folderLabel = useNoteStore((s) => s.folderLabel)
  const hydrated = useNoteStore((s) => s.hydrated)
  const viewMode = useNoteStore((s) => s.viewMode)
  const searchQuery = useNoteStore((s) => s.searchQuery)
  const sortBy = useNoteStore((s) => s.sortBy)
  const sortDir = useNoteStore((s) => s.sortDir)
  const selectionEnabled = useNoteStore((s) => s.selectionEnabled)
  const selectedIds = useNoteStore((s) => s.selectedIds)
  const toggleSelected = useNoteStore((s) => s.toggleSelected)
  const setSelected = useNoteStore((s) => s.setSelected)
  const exitSelectionMode = useNoteStore((s) => s.exitSelectionMode)
  const openEditor = useNoteStore((s) => s.openEditor)
  const togglePin = useNoteStore((s) => s.togglePin)
  const openTemplate = useNoteStore((s) => s.openTemplate)
  const setSearchQuery = useNoteStore((s) => s.setSearchQuery)
  const lastIndex = useRef(null)

  const { folder, tag, pinned } = useMemo(() => {
    const p = location.pathname
    if (p.startsWith('/folder/'))
      return { folder: decodeURIComponent(p.split('/')[2]) }
    if (p.startsWith('/tags/'))
      return { tag: decodeURIComponent(p.split('/')[2]) }
    if (p === '/pinned') return { pinned: true }
    return {}
  }, [location.pathname])

  const filtered = useMemo(() => {
    let list = selectFilteredNotes({
      ...useNoteStore.getState(),
      notes,
      searchQuery,
      sortBy,
      sortDir,
    })
    if (typeFilter) list = list.filter((n) => n.type === typeFilter)
    if (folder) list = list.filter((n) => n.folder === folder)
    if (tag) list = list.filter((n) => (n.tags || []).includes(tag))
    if (pinned) list = list.filter((n) => n.pinned)
    return list
  }, [notes, searchQuery, sortBy, sortDir, typeFilter, folder, tag, pinned])

  const hasAnyNotes = useMemo(
    () => notes.some((n) => !n.archived),
    [notes],
  )

  const heading = folder
    ? folderLabel(folder) || 'Folder'
    : tag
      ? `#${tag}`
      : pinned
        ? 'Pinned notes'
        : 'All notes'

  const handleShiftSelect = (index) => {
    const from = lastIndex.current ?? index
    const [lo, hi] = [Math.min(from, index), Math.max(from, index)]
    const range = filtered.slice(lo, hi + 1).map((n) => n.id)
    const rangeAllSelected = range.every((id) => selectedIds.includes(id))
    const next = rangeAllSelected
      ? selectedIds.filter((id) => !range.includes(id))
      : Array.from(new Set([...selectedIds, ...range]))
    setSelected(next)
    lastIndex.current = index
  }

  const handleSelect = (id) => {
    lastIndex.current = filtered.findIndex((n) => n.id === id)
    toggleSelected(id)
  }

  const selectAllVisible = () =>
    setSelected([
      ...new Set([...selectedIds, ...filtered.map((n) => n.id)]),
    ])

  const selectAllInView = filtered.length > 0 && filtered.every((n) => selectedIds.includes(n.id))

  const showSelectBar = selectionEnabled && filtered.length > 0

  const renderCards = () =>
    filtered.map((note, i) => (
      <NoteCard
        key={note.id}
        note={note}
        index={i}
        selectMode={selectionEnabled}
        selected={selectedIds.includes(note.id)}
        onToggleSelect={handleSelect}
        onOpen={openEditor}
        onTogglePin={togglePin}
        onShiftSelect={handleShiftSelect}
      />
    ))

  if (!hydrated) return null

  if (!hasAnyNotes) {
    return (
      <EmptyState
        icon={NotebookPen}
        title="Nothing here yet"
        desc="Your workspace is an empty canvas. Create your first note to get started."
        action={
          <button type="button" onClick={openTemplate} className="btn-primary">
            <Plus className="size-4" />
            New Note
          </button>
        }
      />
    )
  }

  return (
    <div className="animate-fade-in">
      {/* view header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em]">{heading}</h1>
          <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
            {filtered.length} {filtered.length === 1 ? 'note' : 'notes'}
            {searchQuery && (
              <>
                {' '}
                matching “
                <span className="text-ink">{searchQuery}</span>”
              </>
            )}
          </p>
        </div>

        {showSelectBar && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAllInView ? () => setSelected([]) : selectAllVisible}
              className="btn-secondary gap-1.5 py-1.5 text-[12px]"
            >
              <CheckSquare className="size-3.5" />
              {selectAllInView ? 'Clear all' : 'Select all visible'}
            </button>
            <button
              type="button"
              onClick={exitSelectionMode}
              className="icon-btn border border-line bg-surface px-2"
              title="Exit selection"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* grid or list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching notes"
          desc={
            searchQuery
              ? `Nothing matches "${searchQuery}". Try a different keyword or clear the search.`
              : 'This collection is empty for now.'
          }
          action={
            searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="btn-secondary"
              >
                Clear search
              </button>
            ) : null
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {renderCards()}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
          {filtered.map((note, i) => (
            <ListRow
              key={note.id}
              note={note}
              index={i}
              selectMode={selectionEnabled}
              selected={selectedIds.includes(note.id)}
              onToggleSelect={handleSelect}
              onOpen={openEditor}
              onTogglePin={togglePin}
              onShiftSelect={handleShiftSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}