import { useState } from 'react'
import { Check, Circle, X, ClipboardCheck } from 'lucide-react'
import { useNoteStore } from '../store/useNoteStore'

export default function TaskListEditor({ note }) {
  const addTask = useNoteStore((s) => s.addTask)
  const toggleTask = useNoteStore((s) => s.toggleTask)
  const removeTask = useNoteStore((s) => s.removeTask)
  const [draft, setDraft] = useState('')
  const tasks = note.tasks || []

  const add = () => {
    const t = draft.trim()
    if (!t) return
    addTask(note.id, t)
    setDraft('')
  }

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <div className="flex items-center gap-2 border-b border-line bg-hover/50 px-4 py-2">
        <span className="chip bg-emerald-100 text-emerald-700">
          <ClipboardCheck className="size-3" />
          Checklist
        </span>
        <span className="font-mono text-[10.5px] text-ink-muted">
          {tasks.filter((t) => t.done).length}/{tasks.length} done
        </span>
      </div>
      <div className="px-1.5 py-1.5">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-hover/60"
          >
            <button
              type="button"
              onClick={() => toggleTask(note.id, task.id)}
              className={`flex shrink-0 items-center justify-center rounded border transition-all ${
                task.done
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-line text-transparent hover:border-emerald-400'
              }`}
              style={{ width: 18, height: 18 }}
            >
              <Check className="size-3" />
            </button>
            <span
              className={`flex-1 text-[13.5px] ${
                task.done
                  ? 'text-ink-muted line-through decoration-ink-muted/40'
                  : 'text-ink'
              }`}
            >
              {task.text}
            </span>
            <button
              type="button"
              onClick={() => removeTask(note.id, task.id)}
              className="flex size-6 items-center justify-center rounded-md text-ink-muted opacity-0 transition-opacity hover:bg-surface hover:text-red-500 group-hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2 px-2.5 py-1.5">
          <Circle className="size-[18px] shrink-0 text-ink-muted/40" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') add()
            }}
            placeholder="Add a task and press Enter…"
            className="w-full bg-transparent text-[13.5px] text-ink placeholder:text-ink-muted/50"
          />
        </div>
      </div>
    </div>
  )
}