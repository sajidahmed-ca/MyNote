import {
  Trash2,
  RotateCcw,
  Trash,
  ArchiveRestore,
  SearchX,
} from 'lucide-react'
import { useNoteStore } from '../store/useNoteStore'
import { TYPE_META } from '../constants'
import { plainText, timeAgo } from '../utils/format'

export default function TrashView() {
  const notes = useNoteStore((s) => s.notes)
  const restoreNotes = useNoteStore((s) => s.restoreNotes)
  const purgeNotes = useNoteStore((s) => s.purgeNotes)

  const trashed = notes.filter((n) => n.archived)

  const restore = (id) => restoreNotes([id])
  const purge = async (id) => {
    if (window.confirm('Delete this note permanently? This cannot be undone.')) {
      await purgeNotes([id])
    }
  }
  const purgeAll = async () => {
    if (!trashed.length) return
    if (
      window.confirm(
        `Permanently delete ${trashed.length} ${trashed.length === 1 ? 'note' : 'notes'} from trash?`,
      )
    ) {
      await purgeNotes(trashed.map((n) => n.id))
    }
  }
  const restoreAll = () => restoreNotes(trashed.map((n) => n.id))

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-[22px] font-bold tracking-[-0.02em]">
            <Trash2 className="size-5 text-accent" />
            Trash
          </h1>
          <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
            {trashed.length} {trashed.length === 1 ? 'note' : 'notes'} — deleted
            notes can be restored or permanently removed.
          </p>
        </div>
        {trashed.length > 0 && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={restoreAll}
              className="btn-secondary gap-1.5 py-1.5 text-[12px]"
            >
              <ArchiveRestore className="size-3.5" />
              Restore all
            </button>
            <button
              type="button"
              onClick={purgeAll}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              <Trash className="size-3.5" />
              Empty trash
            </button>
          </div>
        )}
      </div>

      {trashed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface/60 py-16 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-hover text-ink-muted">
            <SearchX className="size-5" />
          </div>
          <p className="mt-3 text-[14px] font-semibold text-ink">Trash is empty</p>
          <p className="mt-0.5 text-[12px] text-ink-muted">
            Deleted notes appear here before they&apos;re gone for good.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {trashed.map((note) => {
            const meta = TYPE_META[note.type] || TYPE_META.standard
            const Icon = meta.icon
            return (
              <div
                key={note.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:border-accent/40"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${meta.glyph}`}
                >
                  <Icon className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink">
                    {note.title || 'Untitled note'}
                  </p>
                  <p className="truncate text-[12px] text-ink-secondary">
                    {plainText(note.body || '') || 'No content'}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[10.5px] text-ink-muted">
                  {timeAgo(note.updatedAt)}
                </span>
                <button
                  type="button"
                  onClick={() => restore(note.id)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] font-medium text-ink-secondary transition-colors hover:bg-hover hover:text-ink"
                >
                  <RotateCcw className="size-3.5" />
                  Restore
                </button>
                <button
                  type="button"
                  onClick={() => purge(note.id)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Delete permanently"
                >
                  <Trash className="size-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}