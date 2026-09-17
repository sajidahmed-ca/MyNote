import { useRef, useState, useEffect } from 'react'
import {
  ChevronLeft,
  Pin,
  Folder,
  ChevronDown,
  Download,
  Trash2,
  Brain,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Code,
  Minus,
  Eraser,
  Sparkles,
} from 'lucide-react'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { useNoteStore } from '../store/useNoteStore'
import { TYPE_META } from '../constants'
import { downloadJson, timeAgo, stamp } from '../utils/format'
import MetadataHeader from './MetadataHeader'
import TaskListEditor from './TaskListEditor'
import FlashcardPanel from './FlashcardPanel'
import TagRow from './TagRow'

function ToolbarButton({ label, children, onMouseDown, active }) {
  return (
    <button
      type="button"
      onMouseDown={onMouseDown}
      title={label}
      className={`flex size-7 items-center justify-center rounded-md transition-colors ${
        active
          ? 'bg-accent-soft text-accent-strong'
          : 'text-ink-muted hover:bg-hover hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export default function NoteEditor() {
  const open = useNoteStore((s) => s.editorOpen)
  const editingNoteId = useNoteStore((s) => s.editingNoteId)
  const notes = useNoteStore((s) => s.notes)
  const closeEditor = useNoteStore((s) => s.closeEditor)
  const updateNote = useNoteStore((s) => s.updateNote)
  const togglePin = useNoteStore((s) => s.togglePin)
  const moveNotes = useNoteStore((s) => s.moveNotes)
  const deleteNotes = useNoteStore((s) => s.deleteNotes)
  const addFlashcard = useNoteStore((s) => s.addFlashcard)
  const folderLabel = useNoteStore((s) => s.folderLabel)
  const folderOptions = useNoteStore((s) => s.folderOptions)

  const note = notes.find((n) => n.id === editingNoteId)
  const meta = note ? TYPE_META[note.type] : TYPE_META.standard
  const MetaIcon = meta.icon

  const contentRef = useRef(null)
  const wrapperRef = useRef(null)
  const [selFlash, setSelFlash] = useState(null)
  const [toast, setToast] = useState('')
  const [showCards, setShowCards] = useState(false)
  const [activeCmds, setActiveCmds] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (open) setShowCards((note?.flashcards?.length ?? 0) > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingNoteId])

  useEffect(() => {
    if (open && contentRef.current) {
      contentRef.current.innerHTML = note?.body || ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingNoteId])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) closeEditor()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closeEditor])

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSelFlash(null)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  useEffect(() => {
    const refresh = () => {
      const sel = window.getSelection()
      if (
        !sel ||
        !sel.rangeCount ||
        !wrapperRef.current?.contains(sel.anchorNode)
      )
        return
      const next = {
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      }
      setActiveCmds((prev) => {
        const same = Object.keys(next).every((k) => prev[k] === next[k])
        return same ? prev : next
      })
    }
    document.addEventListener('selectionchange', refresh)
    return () => document.removeEventListener('selectionchange', refresh)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 1900)
    return () => clearTimeout(t)
  }, [toast])

  if (!open || !note) return null

  const exec = (cmd, value) => (e) => {
    e.preventDefault()
    document.execCommand(cmd, false, value)
  }

  const onBodyInput = () => {
    if (contentRef.current) {
      updateNote(note.id, { body: contentRef.current.innerHTML })
    }
  }

  const onEditorMouseUp = () => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      setSelFlash(null)
      return
    }
    const range = sel.getRangeAt(0)
    const wrapper = wrapperRef.current
    if (!wrapper || !wrapper.contains(range.commonAncestorContainer)) {
      setSelFlash(null)
      return
    }
    const text = sel.toString().trim()
    if (!text) return
    const rect = range.getBoundingClientRect()
    const wr = wrapper.getBoundingClientRect()
    const btnW = 208
    setSelFlash({
      top: rect.bottom - wr.top + 10,
      left: Math.max(8, Math.min(rect.left - wr.left, wr.width - btnW - 8)),
      text,
    })
  }

  const convertToFlashcard = () => {
    if (!selFlash) return
    addFlashcard(note.id, selFlash.text)
    const sel = window.getSelection()
    if (sel) sel.removeAllRanges()
    setSelFlash(null)
    setShowCards(true)
    setToast('Flashcard created')
  }

  const doExportOne = () =>
    downloadJson(
      `note-${note.title.slice(0, 24).replace(/[^\w-]+/g, '-').toLowerCase() || 'note'}-${Date.now()}.json`,
      note,
    )

  const doDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 2600)
      return
    }
    deleteNotes([note.id])
    closeEditor()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas animate-fade-in">
      {/* editor toolbar */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface px-3">
        <button
          type="button"
          onClick={closeEditor}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-hover hover:text-ink"
        >
          <ChevronLeft className="size-4" />
          Back
        </button>

        <div className="mx-1 h-6 w-px bg-line" aria-hidden />

        <span className={`chip ${meta.chip}`}>
          <MetaIcon className="size-3" />
          {meta.label}
        </span>

        {note.pinned && (
          <span className="chip bg-accent-soft text-accent-strong">
            <Pin className="size-3" /> pinned
          </span>
        )}

        <span className="hidden min-w-0 flex-1 truncate px-1 font-mono text-[11px] text-ink-muted md:block">
          {note.folder !== 'uncategorized' &&
            folderLabel(note.folder)}
          {note.folder !== 'uncategorized' ? ' / ' : ''}
          {note.title || 'Untitled note'}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowCards((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
              showCards
                ? 'border-accent/40 bg-accent-soft text-accent-strong'
                : 'border-line text-ink-secondary hover:bg-hover hover:text-ink'
            }`}
          >
            <Brain className="size-3.5" />
            {note.flashcards?.length || 0}
            <span className="hidden lg:inline">cards</span>
          </button>

          {/* move to folder */}
          <Menu as="div" className="relative">
            <MenuButton title="Move to folder" className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] font-medium text-ink-secondary transition-colors hover:bg-hover hover:text-ink">
              <Folder className="size-3.5" />
              <span className="hidden max-w-[90px] truncate sm:inline">
                {folderLabel(note.folder) || 'Folder'}
              </span>
              <ChevronDown className="size-3 text-ink-muted" />
            </MenuButton>
            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition duration-75 ease-out"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <MenuItems className="absolute right-0 z-40 mt-1.5 w-48 rounded-xl border border-line bg-surface p-1 shadow-pop">
                {folderOptions().map((f) => (
                  <MenuItem key={f.id}>
                    <button
                      type="button"
                      onClick={() => moveNotes([note.id], f.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
                        note.folder === f.id
                          ? 'bg-accent-soft font-medium text-accent-strong'
                          : 'text-ink-secondary hover:bg-hover hover:text-ink'
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${f.dot}`} />
                      {f.label}
                    </button>
                  </MenuItem>
                ))}
              </MenuItems>
            </Transition>
          </Menu>

          <button
            type="button"
            onClick={() => togglePin(note.id)}
            className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
              note.pinned
                ? 'bg-accent-soft text-accent-strong'
                : 'text-ink-muted hover:bg-hover hover:text-ink'
            }`}
            title={note.pinned ? 'Unpin' : 'Pin'}
          >
            <Pin className={`size-4 ${note.pinned ? 'fill-accent text-accent' : ''}`} />
          </button>

          <button
            type="button"
            onClick={doExportOne}
            className="icon-btn size-8"
            title="Export this note"
          >
            <Download className="size-4" />
          </button>

          <button
            type="button"
            onClick={doDelete}
            className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
              confirmDelete
                ? 'bg-red-500 text-white'
                : 'text-ink-muted hover:bg-red-50 hover:text-red-600'
            }`}
            title={confirmDelete ? 'Click again to confirm' : 'Delete note'}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* body */}
        <main className="nice-scroll min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-6 py-8">
            {note.type === 'book' && <MetadataHeader note={note} />}
            {note.type === 'task' && <TaskListEditor note={note} />}

            {note.type !== 'book' && (
              <input
                value={note.title || ''}
                onChange={(e) => updateNote(note.id, { title: e.target.value })}
                placeholder="Untitled note"
                className="w-full bg-transparent text-[28px] font-bold tracking-[-0.02em] text-ink placeholder:text-ink-muted/40"
              />
            )}

            {/* meta row */}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 pb-1">
              <span className="flex items-center gap-1 font-mono text-[10.5px] text-ink-muted">
                edited {timeAgo(note.updatedAt)}
              </span>
              <span className="text-ink-muted/30">·</span>
              <span className="flex items-center gap-1 font-mono text-[10.5px] text-ink-muted">
                created {stamp(note.createdAt)}
              </span>
              {note.type === 'journal' && (
                <>
                  <span className="text-ink-muted/30">·</span>
                  <span className="chip bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                    entry logged
                  </span>
                </>
              )}
              <span className="mx-1 h-4 w-px bg-line" aria-hidden />
              <TagRow note={note} />
            </div>

            {/* text canvas */}
            <div ref={wrapperRef} className="relative mt-5">
              <div className="mb-1 flex items-center gap-0.5 rounded-lg border border-line bg-surface px-1.5 py-1 shadow-sm">
                <ToolbarButton label="Bold" active={activeCmds.bold} onMouseDown={exec('bold')}>
                  <Bold className="size-4" />
                </ToolbarButton>
                <ToolbarButton label="Italic" active={activeCmds.italic} onMouseDown={exec('italic')}>
                  <Italic className="size-4" />
                </ToolbarButton>
                <ToolbarButton label="Underline" active={activeCmds.underline} onMouseDown={exec('underline')}>
                  <Underline className="size-4" />
                </ToolbarButton>
                <ToolbarButton label="Strikethrough" active={activeCmds.strikeThrough} onMouseDown={exec('strikeThrough')}>
                  <Strikethrough className="size-4" />
                </ToolbarButton>
                <span className="mx-1 h-5 w-px bg-line" aria-hidden />
                <ToolbarButton
                  label="Bullet list"
                  active={activeCmds.insertUnorderedList}
                  onMouseDown={exec('insertUnorderedList')}
                >
                  <List className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  label="Numbered list"
                  active={activeCmds.insertOrderedList}
                  onMouseDown={exec('insertOrderedList')}
                >
                  <ListOrdered className="size-4" />
                </ToolbarButton>
                <ToolbarButton label="Code block" onMouseDown={exec('formatBlock', 'PRE')}>
                  <Code className="size-4" />
                </ToolbarButton>
                <span className="mx-1 h-5 w-px bg-line" aria-hidden />
                <ToolbarButton label="Divider" onMouseDown={exec('insertHorizontalRule')}>
                  <Minus className="size-4" />
                </ToolbarButton>
                <ToolbarButton label="Clear formatting" onMouseDown={exec('removeFormat')}>
                  <Eraser className="size-4" />
                </ToolbarButton>
              </div>

              <div
                key={editingNoteId}
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                onInput={onBodyInput}
                onMouseUp={onEditorMouseUp}
                className="editor-content min-h-[46vh] cursor-text px-1 py-2 text-ink"
              />

              {selFlash && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={convertToFlashcard}
                  style={{ top: selFlash.top, left: selFlash.left }}
                  className="absolute z-30 flex animate-pop-in items-center gap-2 rounded-full border border-accent/30 bg-surface px-3 py-2 text-[12px] font-semibold text-accent-strong shadow-pop hover:bg-accent-soft"
                >
                  <Sparkles className="size-3.5 text-accent" />
                  Convert to Flashcard
                </button>
              )}
            </div>
          </div>
        </main>

        {showCards && (
          <FlashcardPanel note={note} onClose={() => setShowCards(false)} />
        )}
      </div>

      {/* toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex animate-pop-in items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-white shadow-fab">
          <Sparkles className="size-4 text-indigo-300" />
          {toast}
        </div>
      )}
    </div>
  )
}