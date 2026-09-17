import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { X, CornerDownRight } from 'lucide-react'
import { useNoteStore } from '../store/useNoteStore'
import { TEMPLATES, TYPE_META } from '../constants'

export default function TemplateLauncher() {
  const open = useNoteStore((s) => s.templateOpen)
  const closeTemplate = useNoteStore((s) => s.closeTemplate)
  const createNote = useNoteStore((s) => s.createNote)

  const pick = (type) => {
    createNote(type)
    closeTemplate()
  }

  return (
    <Dialog
      open={open}
      onClose={closeTemplate}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-ink/25 backdrop-blur-[2px]" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-xl animate-pop-in rounded-2xl border border-line bg-surface shadow-pop">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <div>
              <DialogTitle className="text-[17px] font-bold tracking-tight">
                New note
              </DialogTitle>
              <p className="font-mono text-[11px] text-ink-muted">
                choose a template — one click to start
              </p>
            </div>
            <button
              type="button"
              onClick={closeTemplate}
              className="icon-btn"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5 p-5 sm:grid-cols-2">
            {TEMPLATES.map(({ type, title, desc, shortcut }) => {
              const meta = TYPE_META[type]
              const Icon = meta.icon
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => pick(type)}
                  className="group flex items-start gap-3 rounded-xl border border-line p-3.5 text-left transition-all hover:border-accent hover:bg-hover/50 hover:shadow-card"
                >
                  <span
                    className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors ${meta.glyph} group-hover:shadow-sm`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
                      {title}
                      <kbd className="rounded border border-line bg-surface px-1 font-mono text-[10px] text-ink-muted">
                        {shortcut}
                      </kbd>
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-muted">
                      {desc}
                    </span>
                  </span>
                  <CornerDownRight className="size-3.5 shrink-0 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between border-t border-line px-6 py-3">
            <p className="font-mono text-[10.5px] text-ink-muted">
              Saved locally — no account needed
            </p>
            <button
              type="button"
              onClick={closeTemplate}
              className="text-[12.5px] font-medium text-accent hover:text-accent-hover"
            >
              Cancel
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}