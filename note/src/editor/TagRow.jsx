import { useState } from 'react'
import { Tag, X, Plus } from 'lucide-react'
import { useNoteStore } from '../store/useNoteStore'
import { DEFAULT_TAG_SUGGESTIONS } from '../constants'

export default function TagRow({ note }) {
  const addTagsToNotes = useNoteStore((s) => s.addTagsToNotes)
  const removeTagFromNotes = useNoteStore((s) => s.removeTagFromNotes)
  const [draft, setDraft] = useState('')
  const [open, setOpen] = useState(false)
  const suggestions = DEFAULT_TAG_SUGGESTIONS.filter(
    (t) => !(note.tags || []).includes(t),
  )

  const commit = (raw) => {
    const t = raw.trim().replace(/^#/, '').toLowerCase()
    if (t) addTagsToNotes([note.id], [t])
  }

  const onSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit(draft)
      setDraft('')
      setOpen(false)
    } else if (e.key === ',') {
      e.preventDefault()
      commit(draft)
      setDraft('')
    }
  }

  return (
    <div className="relative flex flex-wrap items-center gap-1.5">
      {(note.tags || []).map((t) => (
        <span key={t} className="chip group bg-accent-soft pr-1 text-accent-strong">
          <Tag className="size-3" />
          {t}
          <button
            type="button"
            onClick={() => removeTagFromNotes([note.id], t)}
            className="rounded-sm p-0.5 opacity-40 transition-opacity hover:opacity-100"
            aria-label={`Remove tag ${t}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}

      {open ? (
        <div className="relative">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onSubmit}
            onBlur={() => {
              if (draft.trim()) commit(draft)
              setOpen(false)
            }}
            placeholder="type + Enter"
            className="w-32 rounded-md border border-accent/40 bg-surface px-2 py-0.5 font-mono text-[11px] text-ink shadow-float"
          />
          {suggestions.length > 0 && !draft.trim() && (
            <div className="absolute left-0 top-full z-10 mt-1 flex max-w-[240px] flex-wrap gap-1 rounded-lg border border-line bg-surface p-1.5 shadow-pop">
              {suggestions.slice(0, 8).map((t) => (
                <button
                  key={t}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    commit(t)
                  }}
                  className="chip bg-hover text-ink-secondary hover:bg-accent-soft hover:text-accent-strong"
                >
                  #{t}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="chip border border-dashed border-line text-ink-muted transition-colors hover:border-accent hover:text-accent-strong"
        >
          <Plus className="size-3" />
          tag
        </button>
      )}
    </div>
  )
}