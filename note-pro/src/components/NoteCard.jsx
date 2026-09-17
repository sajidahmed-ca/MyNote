import { Pin, PinOff, Brain, CheckCircle2, Circle } from 'lucide-react'
import { TYPE_META } from '../constants'
import { useNoteStore } from '../store/useNoteStore'
import { plainText, timeAgo } from '../utils/format'

export default function NoteCard({
  note,
  index,
  selectMode,
  selected,
  onToggleSelect,
  onOpen,
  onTogglePin,
  onShiftSelect,
}) {
  const meta = TYPE_META[note.type] || TYPE_META.standard
  const Icon = meta.icon
  const folderLabel = useNoteStore((s) => s.folderLabel)
  const text = plainText(note.body || '')
  const done = note.tasks?.filter((t) => t.done).length || 0
  const total = note.tasks?.length || 0
  const tags = (note.tags || []).slice(0, 2)

  const handleClick = (e) => {
    if (e.shiftKey) {
      e.preventDefault()
      onShiftSelect(index, e)
      return
    }
    if (selectMode) {
      e.preventDefault()
      onToggleSelect(note.id)
      return
    }
    onOpen(note.id)
  }

  return (
    <article
      onClick={handleClick}
      onDoubleClick={() => !selectMode && onOpen(note.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleClick(e)
      }}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-surface transition-all duration-150 ${
        selected
          ? 'border-accent shadow-card'
          : 'border-line hover:border-accent hover:shadow-card'
      } ${selectMode && selected ? 'ring-2 ring-accent/30' : ''}`}
    >
      {/* accent bar for book notes */}
      {note.type === 'book' && (
        <div className="h-0.5 w-full bg-sky-400/70" aria-hidden />
      )}

      <div className="flex flex-1 flex-col p-3.5">
        {/* top row */}
        <div className="mb-2 flex items-center gap-2">
          {/* select checkbox */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelect(note.id)
            }}
            className={`flex size-5 shrink-0 items-center justify-center rounded border transition-all ${
              selected
                ? 'border-accent bg-accent text-white'
                : 'border-line bg-surface text-transparent group-hover:border-accent group-hover:bg-white'
            } ${selectMode ? 'border-accent/50' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
            aria-label="Select note"
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

          <span
            className={`flex size-5 items-center justify-center rounded-md ${meta.glyph}`}
          >
            <Icon className="size-3" />
          </span>

          <span className="ml-auto flex items-center gap-1.5">
            {note.flashcards?.length > 0 && (
              <span className="chip bg-accent-soft text-accent-strong">
                <Brain className="size-3" />
                {note.flashcards.length}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onTogglePin(note.id)
              }}
              className={`flex size-6 items-center justify-center rounded-md transition-colors ${
                note.pinned
                  ? 'text-accent'
                  : 'text-ink-muted opacity-0 group-hover:opacity-100 hover:bg-hover hover:text-ink'
              }`}
              title={note.pinned ? 'Unpin' : 'Pin'}
            >
              {note.pinned ? (
                <Pin className="size-3.5 fill-accent text-accent" />
              ) : (
                <PinOff className="size-3.5" />
              )}
            </button>
          </span>
        </div>

        {/* title */}
        <h3 className="mb-1 line-clamp-1 text-[15px] font-semibold tracking-tight text-ink">
          {note.title || 'Untitled note'}
        </h3>

        {/* book metadata line */}
        {note.type === 'book' && (
          <p className="mb-1.5 flex items-center gap-1 font-mono text-[11px] text-sky-700 dark:text-sky-300">
            {note.meta?.author && (
              <>
                <span className="max-w-[170px] truncate">{note.meta.author}</span>
                <span className="text-sky-300">·</span>
              </>
            )}
            {note.meta?.page ? `p. ${note.meta.page}` : '—'}
          </p>
        )}

        {/* body excerpt */}
        <p className="line-clamp-3 text-[13px] leading-[1.55] text-ink-secondary">
          {text || <span className="text-ink-muted/70">No content yet — click to start writing.</span>}
        </p>

        {/* task progress */}
        {note.type === 'task' && total > 0 && (
          <div className="mt-2.5">
            <div className="mb-1 flex items-center justify-between font-mono text-[10.5px] text-ink-muted">
              <span>
                {done}/{total} done
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {total > 0 ? Math.round((done / total) * 100) : 0}%
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-hover">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-all"
                style={{ width: `${total ? (done / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* footer */}
      <div className="flex items-center gap-1.5 border-t border-line px-3.5 py-2">
        <span className="flex items-center gap-1 font-mono text-[10.5px] text-ink-muted">
          {note.type === 'task' &&
            total > 0 &&
            (done === total ? (
              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Circle className="size-3 text-ink-muted" />
            ))}
          {timeAgo(note.updatedAt)}
        </span>
        <span className="text-ink-muted/30">·</span>
        <span className="font-mono text-[10.5px] text-ink-muted">
          {folderLabel(note.folder) || 'Uncategorized'}
        </span>
        {tags.length > 0 && (
          <span className="ml-auto flex items-center gap-1">
            {tags.map((tag) => (
              <span key={tag} className="chip bg-hover text-ink-muted">
                #{tag}
              </span>
            ))}
          </span>
        )}
      </div>
    </article>
  )
}