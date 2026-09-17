import { useMemo, useState } from 'react'
import {
  Brain,
  Layers,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  RotateCcw,
} from 'lucide-react'
import { useNoteStore } from '../store/useNoteStore'
import EmptyState from './EmptyState'

export default function FlashcardsView() {
  const notes = useNoteStore((s) => s.notes)
  const hydrated = useNoteStore((s) => s.hydrated)
  const openEditor = useNoteStore((s) => s.openEditor)
  const [studying, setStudying] = useState(false)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const decks = useMemo(() => {
    const out = []
    for (const n of notes) {
      if (n.archived) continue
      const cards = n.flashcards || []
      if (cards.length) out.push({ note: n, cards })
    }
    return out
  }, [notes])

  const flat = useMemo(() => decks.flatMap((d) => d.cards), [decks])

  if (!hydrated) return null

  if (flat.length === 0) {
    return (
      <EmptyState
        icon={Brain}
        title="No flashcards yet"
        desc="Open any note, highlight a passage, and hit “Convert to Flashcard” — cards land here as a study deck."
        action={
          <button type="button" onClick={() => openEditor(null)} className="btn-secondary">
            <BookOpen className="size-4" />
            Browse notes
          </button>
        }
      />
    )
  }

  if (studying) {
    const card = flat[index]
    const deckNote = decks.find((d) => d.cards.some((c) => c.id === card.id))?.note
    const next = () => {
      setFlipped(false)
      setIndex((i) => (i + 1) % flat.length)
    }
    const prev = () => {
      setFlipped(false)
      setIndex((i) => (i - 1 + flat.length) % flat.length)
    }

    return (
      <div className="mx-auto flex max-w-2xl animate-fade-in flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold tracking-[-0.02em]">Study mode</h1>
            <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
              {index + 1} / {flat.length} · click the card to flip
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setStudying(false)
              setFlipped(false)
              setIndex(0)
            }}
            className="btn-secondary gap-1.5 py-1.5 text-[12px]"
          >
            <RotateCcw className="size-3.5" />
            Exit deck
          </button>
        </div>

        <div style={{ perspective: '1400px' }}>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="relative block h-72 w-full cursor-pointer text-left"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div
              className={`absolute inset-0 rounded-2xl border border-line bg-surface p-7 shadow-card transition-transform duration-500`}
              style={{ backfaceVisibility: 'hidden', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              <div className="flex items-center gap-2">
                <span className="chip bg-accent-soft text-accent-strong">
                  <Brain className="size-3" />
                  front
                </span>
                {deckNote && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditor(deckNote.id)
                    }}
                    className="chip bg-hover text-ink-muted transition-colors hover:bg-sky-100 hover:text-sky-700"
                  >
                    <BookOpen className="size-3" />
                    {deckNote.title}
                  </button>
                )}
              </div>
              <p className="mt-6 text-center text-[20px] font-semibold leading-relaxed tracking-tight text-ink">
                {card.front}
              </p>
            </div>
            <div
              className="absolute inset-0 rounded-2xl border border-accent/40 bg-accent-soft/40 p-7 shadow-card"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="flex items-center gap-2">
                <span className="chip bg-emerald-100 text-emerald-700">
                  <Layers className="size-3" />
                  back
                </span>
              </div>
              <p className="mt-6 text-center text-[16px] leading-relaxed text-ink-secondary">
                {card.back || (
                  <span className="text-ink-muted/60 italic">
                    No answer written — edit the card in its note to add one.
                  </span>
                )}
              </p>
            </div>
          </button>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={prev}
            className="flex size-10 items-center justify-center rounded-xl border border-line bg-surface text-ink-secondary transition-colors hover:border-accent hover:text-accent-strong"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex items-center gap-1">
            {flat.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setFlipped(false)
                  setIndex(i)
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? 'w-6 bg-accent'
                    : 'w-1.5 bg-line hover:bg-ink-muted'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            className="flex size-10 items-center justify-center rounded-xl border border-line bg-surface text-ink-secondary transition-colors hover:border-accent hover:text-accent-strong"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em]">Flashcards</h1>
          <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
            {flat.length} cards across {decks.length} notes · built from highlights
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStudying(true)}
          className="btn-primary"
        >
          <Layers className="size-4" />
          Study deck
        </button>
      </div>

      <div className="space-y-3">
        {decks.map(({ note, cards }) => (
          <button
            key={note.id}
            type="button"
            onClick={() => openEditor(note.id)}
            className="group w-full rounded-xl border border-line bg-surface p-4 text-left transition-all hover:border-accent hover:shadow-card"
          >
            <div className="flex items-center gap-2">
              <span className="chip bg-accent-soft text-accent-strong">
                <Brain className="size-3" />
                {cards.length}
              </span>
              <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-ink">
                {note.title}
              </p>
              <span className="rounded-full bg-sky-100 px-2 py-0.5 font-mono text-[10px] font-medium text-sky-700">
                {note.type === 'book' ? (note.meta?.author || 'external') : note.type}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-ink-muted">
              {cards[0].front}
              {cards.length > 1 ? ` · ${cards[1].front}` : ''}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}