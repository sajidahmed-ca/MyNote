import { useState } from 'react'
import {
  Sparkles,
  ShieldCheck,
  KeyRound,
  Lock,
  Check,
  Zap,
  Cloud,
  Palette,
  LayoutDashboard,
  Folder,
  History,
} from 'lucide-react'
import { useLicenseStore, licenseErrorLabel } from '../store/useLicenseStore'

const FEATURES = [
  {
    icon: Palette,
    title: 'Custom themes',
    desc: 'Dark mode, light mode, and custom accent colors.',
  },
  {
    icon: LayoutDashboard,
    title: 'Analytics dashboard',
    desc: 'Understand your writing habits with rich insights.',
  },
  {
    icon: History,
    title: 'Trash & recovery',
    desc: 'Restore deleted notes any time. Permanent purge when you want it.',
  },
  {
    icon: Folder,
    title: 'Unlimited custom folders',
    desc: 'Create, rename, and organize folders your way.',
  },
  {
    icon: Cloud,
    title: 'Backup & restore',
    desc: 'Portable JSON backups with one-click import.',
  },
  {
    icon: Lock,
    title: 'Private by design',
    desc: 'Everything stays on your device with signed license keys.',
  },
]

export default function LicenseGate() {
  const activate = useLicenseStore((s) => s.activate)
  const busy = useLicenseStore((s) => s.busy)
  const error = useLicenseStore((s) => s.error)
  const [key, setKey] = useState('')

  const handleActivate = async (e) => {
    e.preventDefault()
    await activate(key.trim())
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10 text-ink">
      <div className="grid w-full max-w-4xl gap-10 lg:grid-cols-[1fr_1.1fr]">
        {/* left — pitch */}
        <div className="animate-fade-in">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-accent shadow-sm">
              <Sparkles className="size-5 text-white" />
            </div>
            <div>
              <p className="text-[16px] font-bold tracking-tight">MyNote</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent-strong">
                Pro
              </p>
            </div>
          </div>

          <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em]">
            The focused notes app,
            <br />
            <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
              on another level.
            </span>
          </h1>

          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-secondary">
            You&apos;re running the Pro edition. Activate it with your license
            key to unlock every feature — themes, analytics, trash recovery,
            custom folders, and portable backups.
          </p>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li
                key={f.title}
                className="flex items-start gap-2.5 rounded-xl border border-line bg-surface p-3"
              >
                <f.icon className="mt-0.5 size-4 shrink-0 text-accent" />
                <div>
                  <p className="text-[13px] font-semibold">{f.title}</p>
                  <p className="text-[11.5px] text-ink-muted">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* right — activation */}
        <div className="animate-pop-in">
          <div className="sticky top-6 rounded-2xl border border-line bg-surface p-6 shadow-card">
            <div className="mb-5 flex items-center gap-2 text-accent-strong">
              <ShieldCheck className="size-5" />
              <p className="text-[14px] font-semibold">Activate Pro</p>
            </div>

            <form onSubmit={handleActivate} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-ink-secondary">
                  License key
                </span>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="v1.xxxxxxxxxxxx….yyyyyyyy"
                    autoFocus
                    spellCheck={false}
                    className="h-11 w-full rounded-xl border border-line bg-canvas pl-10 pr-3 font-mono text-[12px] text-ink placeholder:text-ink-muted/50 transition-all focus:border-accent focus:bg-surface focus:shadow-[0_0_0_3px_var(--accent-glow)]"
                  />
                </div>
              </label>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-medium text-red-600">
                  <span>⚠</span>
                  {licenseErrorLabel(error)}
                </div>
              )}

              <button
                type="submit"
                disabled={busy || !key.trim()}
                className="btn-primary w-full gap-2 py-2.5"
              >
                {busy ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Verifying…
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    Activate Pro
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 flex items-center gap-1.5 rounded-lg bg-hover/70 px-3 py-2 text-[11.5px] text-ink-muted">
              <Zap className="size-3.5 shrink-0 text-accent" />
              Activation is verified on-device. Your notes never leave your
              machine.
            </div>

            <p className="mt-4 border-t border-line pt-4 font-mono text-[10.5px] text-ink-muted">
              No key yet? Run{' '}
              <code className="rounded bg-hover px-1 py-0.5 text-accent-strong">
                npm run license
              </code>{' '}
              in the project to generate one.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}