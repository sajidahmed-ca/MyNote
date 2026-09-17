import { useMemo } from 'react'
import { BookOpen, Brain, Plus, ChevronRight } from 'lucide-react'
import { useNoteStore } from '../store/useNoteStore'
import { plainText, timeAgo } from '../utils/format'
import EmptyState from './EmptyState'

export default function BookNotesView() {
  const hydrated = useNoteStore((s) => s.hydrated)
  const openEditor = useNoteStore((s) => s.openEditor)
  const openTemplate = useNoteStore((s) => s.openTemplate)

  const notes = useNoteStore((s) => s.notes)
  const books = useMemo(
    () => notes.filter((n) => !n.archived && n.type === 'book'),
    [notes],
  )

  if (!hydrated) return null

  if (books.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No book notes yet"
        desc="Create a book note to track title, author, page — and build a flashcard deck from your highlights."
        action={
          <button
            type="button"
            onClick={() => {
              openTemplate()
            }}
            className="btn-primary"
          >
            <Plus className="size-4" />
            New book note
          </button>
        }
      />
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h1 className="text-[22px] font-bold tracking-[-0.02em]">Book notes</h1>
        <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
          {books.length} {books.length === 1 ? 'book' : 'books'} with notes and
          highlights
        </p>
      </div>

      <div className="space-y-3">
        {books.map((note) => {
          const text = plainText(note.body || '')
          const cards = note.flashcards?.length || 0
          return (
            <button
              key={note.id}
              type="button"
              onClick={() => openEditor(note.id)}
              className="group w-full overflow-hidden rounded-xl border border-line bg-surface text-left transition-all hover:border-accent hover:shadow-card"
            >
              <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500" />
              <div className="p-4">
                {/* fixed metadata header */}
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line/70 pb-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-sky-700 dark:text-sky-300">
                      Book
                    </p>
                    <h3 className="mt-0.5 truncate text-[16px] font-semibold tracking-tight text-ink">
                      {note.title}
                    </h3>
                  </div>
                  <dl className="flex items-center gap-4 font-mono text-[11.5px] text-ink-secondary">
                    <div>
                      <dt className="text-[9.5px] uppercase tracking-wider text-ink-muted">
                        Author
                      </dt>
                      <dd className="mt-0.5 max-w-[180px] truncate">
                        {note.meta?.author || '—'}
                      </dd>
                    </div>
                    <div className="text-center">
                      <dt className="text-[9.5px] uppercase tracking-wider text-ink-muted">
                        Page
                      </dt>
                      <dd className="mt-0.5">
                        {note.meta?.page ? `p. ${note.meta.page}` : '—'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-3 flex items-start gap-3">
                  <p className="min-w-0 flex-1 line-clamp-2 text-[13px] leading-relaxed text-ink-secondary">
                    {text || (
                      <span className="text-ink-muted/70">
                        No highlights yet — open and write under the metadata
                        header.
                      </span>
                    )}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="chip bg-accent-soft text-accent-strong">
                    <Brain className="size-3" />
                    {cards} {cards === 1 ? 'flashcard' : 'flashcards'}
                  </span>
                  <span className="chip bg-hover text-ink-muted">
                    updated {timeAgo(note.updatedAt)}
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-[12px] font-medium text-ink-muted transition-colors group-hover:text-accent-strong">
                    Open
                    <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}