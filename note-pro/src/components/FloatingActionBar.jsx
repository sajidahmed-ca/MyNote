import { useState } from 'react'
import {
  X,
  Tag,
  Folder,
  Download,
  Trash2,
  FolderOpen,
  Check,
} from 'lucide-react'
import { useNoteStore } from '../store/useNoteStore'
import { DEFAULT_TAG_SUGGESTIONS } from '../constants'
import { downloadJson } from '../utils/format'

export default function FloatingActionBar() {
  const selectedIds = useNoteStore((s) => s.selectedIds)
  const notes = useNoteStore((s) => s.notes)
  const deleteNotes = useNoteStore((s) => s.deleteNotes)
  const moveNotes = useNoteStore((s) => s.moveNotes)
  const addTagsToNotes = useNoteStore((s) => s.addTagsToNotes)
  const clearSelection = useNoteStore((s) => s.clearSelection)
  const exitSelectionMode = useNoteStore((s) => s.exitSelectionMode)
  const folderOptions = useNoteStore((s) => s.folderOptions)

  const [panel, setPanel] = useState(null) // 'move' | 'tag' | null
  const [tagDraft, setTagDraft] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const selectedNotes = notes.filter((n) => selectedIds.includes(n.id))
  const count = selectedIds.length

  if (count === 0) return null

  const commitTag = (raw) => {
    const t = raw.trim().replace(/^#/, '').toLowerCase()
    if (!t) return
    addTagsToNotes(selectedIds, [t])
    setTagDraft('')
    setPanel(null)
  }

  const doDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 2600)
      return
    }
    deleteNotes(selectedIds)
    setConfirmDelete(false)
    setPanel(null)
    exitSelectionMode()
  }

  const doExport = () => {
    downloadJson(
      `mynote-selection-${selectedIds.length}-${Date.now()}.json`,
      selectedNotes,
    )
  }

  const actionBtn =
    'flex items-center gap-1.5 rounded-full px-3 py-2 text-[12.5px] font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white'

  return (
    <>
      {panel && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onMouseDown={() => setPanel(null)}
        />
      )}

      <div className="fixed bottom-6 left-1/2 z-50 animate-slide-up">
        {/* popover panels */}
        {panel === 'move' && (
          <div className="absolute bottom-full left-0 mb-3 w-56 animate-pop-in rounded-xl border border-white/10 bg-[#0F172A] p-1.5 shadow-fab">
            <p className="px-2.5 pb-1 pt-1 font-mono text-[9.5px] uppercase tracking-widest text-slate-400">
              Move {count} {count === 1 ? 'note' : 'notes'} to
            </p>
            {folderOptions().map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  moveNotes(selectedIds, f.id)
                  setPanel(null)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                <span className={`size-1.5 rounded-full ${f.dot}`} />
                <span className="flex-1">{f.label}</span>
                <FolderOpen className="size-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        )}

        {panel === 'tag' && (
          <div className="absolute bottom-full left-0 mb-3 w-64 animate-pop-in rounded-xl border border-white/10 bg-[#0F172A] p-2 shadow-fab">
            <p className="px-1.5 pb-1.5 pt-0.5 font-mono text-[9.5px] uppercase tracking-widest text-slate-400">
              Tag {count} {count === 1 ? 'note' : 'notes'}
            </p>
            <input
              autoFocus
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && commitTag(tagDraft)}
              placeholder="type a tag + Enter"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-[12px] text-white placeholder:text-slate-500 focus:border-white/30"
            />
            <div className="mt-1.5 flex flex-wrap gap-1">
              {DEFAULT_TAG_SUGGESTIONS.slice(0, 12).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => commitTag(t)}
                  className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[10.5px] text-slate-300 transition-colors hover:bg-accent/70 hover:text-white"
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* bar itself */}
        <div className="flex items-center gap-0.5 rounded-full bg-[#0F172A] px-2 py-1.5 shadow-fab">
          <span className="ml-1.5 mr-1 flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-mono text-[11px] font-medium text-white">
            {count} selected
          </span>

          <span className="mx-1 h-5 w-px bg-white/10" aria-hidden />

          <button
            type="button"
            onClick={() => setPanel(panel === 'move' ? null : 'move')}
            className={`${actionBtn} ${panel === 'move' ? 'bg-white/10 text-white' : ''}`}
          >
            <Folder className="size-4" />
            <span className="hidden md:inline">Move</span>
          </button>

          <button
            type="button"
            onClick={() => setPanel(panel === 'tag' ? null : 'tag')}
            className={`${actionBtn} ${panel === 'tag' ? 'bg-white/10 text-white' : ''}`}
          >
            <Tag className="size-4" />
            <span className="hidden md:inline">Tag</span>
          </button>

          <button type="button" onClick={doExport} className={actionBtn}>
            <Download className="size-4" />
            <span className="hidden md:inline">Export</span>
          </button>

          <span className="mx-1 h-5 w-px bg-white/10" aria-hidden />

          <button
            type="button"
            onClick={doDelete}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[12.5px] font-medium transition-colors ${
              confirmDelete
                ? 'bg-red-500 text-white'
                : 'text-slate-200 hover:bg-red-500/90 hover:text-white'
            }`}
          >
            {confirmDelete ? (
              <>
                <Check className="size-4" />
                Confirm delete
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                <span className="hidden md:inline">Delete</span>
              </>
            )}
          </button>

          <span className="mx-1 h-5 w-px bg-white/10" aria-hidden />

          <button
            type="button"
            onClick={clearSelection}
            className="flex size-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            title="Clear selection"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </>
  )
}