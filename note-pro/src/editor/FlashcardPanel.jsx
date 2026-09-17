import { useState } from 'react'
import { Brain, X, Plus, Trash2, Lightbulb } from 'lucide-react'
import { useNoteStore } from '../store/useNoteStore'

export default function FlashcardPanel({ note, onClose }) {
  const updateFlashcard = useNoteStore((s) => s.updateFlashcard)
  const removeFlashcard = useNoteStore((s) => s.removeFlashcard)
  const addFlashcard = useNoteStore((s) => s.addFlashcard)
  const [draft, setDraft] = useState('')
  const cards = note.flashcards || []

  const add = () => {
    const t = draft.trim()
    if (!t) return
    addFlashcard(note.id, t)
    setDraft('')
  }

  return (
    <div className="flex w-[320px] shrink-0 flex-col border-l border-line bg-surface">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="chip bg-accent-soft text-accent-strong">
          <Brain className="size-3" />
          Flashcards
        </span>
        <span className="font-mono text-[10.5px] text-ink-muted">
          {cards.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="icon-btn ml-auto size-7"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="p-3">
        <div className="flex gap-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Add a card manually…"
            className="h-8 w-full rounded-lg border border-line bg-canvas px-2.5 font-mono text-[11.5px] text-ink placeholder:text-ink-muted/60 focus:border-accent"
          />
          <button
            type="button"
            onClick={add}
            className="icon-btn shrink-0 border border-line bg-surface"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="nice-scroll flex-1 space-y-2 overflow-y-auto px-3 pb-4">
        {cards.length === 0 && (
          <div className="rounded-xl border border-dashed border-line p-4 text-center">
            <Lightbulb className="mx-auto size-5 text-ink-muted/40" />
            <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
              Highlight a passage in the editor, then hit{' '}
              <span className="font-mono text-accent-strong">
                Convert to Flashcard
              </span>
              .
            </p>
          </div>
        )}
        {cards.map((fc, i) => (
          <div
            key={fc.id}
            className="group rounded-xl border border-line bg-canvas p-3 transition-colors hover:border-accent/50"
          >
            <div className="mb-1.5 flex items-center gap-2">
              <span
                className="flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-[9px] font-bold text-accent-strong"
                style={{ width: 18, height: 18 }}
              >
                {i + 1}
              </span>
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-ink-muted">
                front
              </span>
              <button
                type="button"
                onClick={() => removeFlashcard(note.id, fc.id)}
                className="ml-auto flex size-5 items-center justify-center rounded text-ink-muted opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                aria-label="Delete flashcard"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
            <p className="text-[12.5px] font-medium leading-snug text-ink">
              {fc.front}
            </p>
            <div className="mt-2 border-t border-line/70 pt-2">
              <textarea
                value={fc.back || ''}
                onChange={(e) =>
                  updateFlashcard(note.id, fc.id, { back: e.target.value })
                }
                placeholder="Answer / back (optional)…"
                rows={2}
                className="w-full resize-none bg-transparent text-[12px] leading-relaxed text-ink-secondary placeholder:text-ink-muted/50"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}