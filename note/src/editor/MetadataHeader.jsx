import { BookOpen } from 'lucide-react'
import { useNoteStore } from '../store/useNoteStore'

export default function MetadataHeader({ note }) {
  const updateNote = useNoteStore((s) => s.updateNote)
  const set = (k, v) => updateNote(note.id, { [k]: v })
  const setMeta = (k, v) => updateNote(note.id, { meta: { ...note.meta, [k]: v } })

  const field =
    'w-full border-b border-transparent bg-transparent py-1 text-[14px] font-medium text-ink placeholder:text-ink-muted/50 transition-colors focus:border-accent'

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <div className="flex items-center gap-2 border-b border-line bg-hover/50 px-4 py-2">
        <span className="chip bg-sky-100 text-sky-700">
          <BookOpen className="size-3" />
          Book metadata
        </span>
        <span className="font-mono text-[10.5px] text-ink-muted">
          fixed header · drives the flashcard deck
        </span>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-1 px-4 py-3 sm:grid-cols-[1.6fr_1fr_110px]">
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
            Title
          </span>
          <input
            value={note.title || ''}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Book title"
            className={field}
          />
        </label>
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
            Author
          </span>
          <input
            value={note.meta?.author || ''}
            onChange={(e) => setMeta('author', e.target.value)}
            placeholder="Author"
            className={field}
          />
        </label>
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
            Page #
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={note.meta?.page || ''}
            onChange={(e) => setMeta('page', e.target.value)}
            placeholder="—"
            className={`${field} text-center font-mono`}
          />
        </label>
      </div>
    </div>
  )
}