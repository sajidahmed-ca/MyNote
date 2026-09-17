import { useState, useEffect } from 'react'
import {
  Sparkles,
  Palette,
  LayoutDashboard,
  Trash2,
  Folder,
  Cloud,
  Lock,
  ArrowRight,
  Zap,
  Crown,
  Check,
  Server,
} from 'lucide-react'

const PRO_URL = 'http://127.0.0.1:5174'

const PRO_FEATURES = [
  {
    icon: Palette,
    title: 'Custom themes',
    desc: 'Dark mode, light mode, and 6 custom accent colors.',
  },
  {
    icon: LayoutDashboard,
    title: 'Analytics dashboard',
    desc: 'Notes by type, folder, tag usage, creation heatmaps, and task stats.',
  },
  {
    icon: Trash2,
    title: 'Trash & recovery',
    desc: 'Deleted notes can be restored anytime — permanent purge on your terms.',
  },
  {
    icon: Folder,
    title: 'Unlimited custom folders',
    desc: 'Create, rename, and delete folders beyond the built-in set.',
  },
  {
    icon: Cloud,
    title: 'Portable backup & restore',
    desc: 'One-click export and import to move notes between free and Pro.',
  },
  {
    icon: Lock,
    title: 'Offline license keys',
    desc: 'Activated with a signed key. No server, no account, no tracking.',
  },
]

const FREE_ROWS = [
  { feature: 'Notes & folders', free: '✓', pro: '✓' },
  { feature: 'Tags', free: '✓', pro: '✓' },
  { feature: 'Flashcards', free: '✓', pro: '✓' },
  { feature: 'Task lists', free: '✓', pro: '✓' },
  { feature: 'Journal', free: '✓', pro: '✓' },
  { feature: 'Profile & settings', free: '✓', pro: '✓' },
  { feature: 'Dark / light themes', free: '—', pro: '✓' },
  { feature: 'Accent color picker', free: '—', pro: '✓' },
  { feature: 'Analytics dashboard', free: '—', pro: '✓' },
  { feature: 'Trash & restore', free: '—', pro: '✓' },
  { feature: 'Custom folders', free: '—', pro: '✓' },
  { feature: 'Portable backup import', free: '—', pro: '✓' },
]

export default function UpgradePro() {
  const [proOnline, setProOnline] = useState(null)

  useEffect(() => {
    let active = true
    const check = async () => {
      try {
        await fetch(PRO_URL, { method: 'HEAD', mode: 'no-cors' })
        if (active) setProOnline(true)
      } catch {
        if (active) setProOnline(false)
      }
    }
    check()
    const id = setInterval(check, 4000)
    return () => { active = false; clearInterval(id) }
  }, [])

  const openPro = () => {
    try {
      window.open(PRO_URL, '_blank', 'noopener')
    } catch {
      window.location.href = PRO_URL
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-16 animate-fade-in">
      {/* hero */}
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-hover text-white shadow-lg">
            <Crown className="size-7" />
          </div>
        </div>
        <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em]">
          Upgrade to{' '}
          <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
            MyNote Pro
          </span>
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-[14px] leading-relaxed text-ink-secondary">
          All the focused, local-first writing tools you love — plus dark mode,
          analytics, trash recovery, custom folders, and portable backups.
        </p>
        <button
          type="button"
          onClick={openPro}
          disabled={proOnline === false}
          className="btn-primary mt-6 gap-2 px-6 py-3 text-[14px]"
        >
          Open MyNote Pro
          <ArrowRight className="size-4" />
        </button>
        {proOnline === false && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-[12px] text-amber-800">
            <div className="flex items-center gap-2 font-semibold">
              <Server className="size-3.5" />
              Pro server is not running
            </div>
            <p className="mt-1 text-amber-700">
              Open a second terminal, run{' '}
              <code className="rounded bg-amber-100 px-1 py-0.5 font-mono font-semibold">
                cd note-pro && npm run dev
              </code>
              , then{' '}
              <button type="button" onClick={() => window.location.reload()} className="font-semibold underline">
                reload
              </button>
              .
            </p>
          </div>
        )}
        {proOnline === true && (
          <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-emerald-600">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Pro server online — opens in a new tab on{' '}
            <span className="text-ink-secondary">127.0.0.1:5174</span>
          </p>
        )}
        {proOnline === null && (
          <p className="mt-2 font-mono text-[11px] text-ink-muted">
            Checking if the Pro server is reachable…
          </p>
        )}
      </div>

      {/* features grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRO_FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent/40"
          >
            <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <f.icon className="size-4" />
            </div>
            <p className="text-[13px] font-semibold">{f.title}</p>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* comparison table */}
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex items-center gap-2 border-b border-line px-5 py-3">
          <Zap className="size-4 text-accent" />
          <p className="text-[13px] font-semibold">Feature comparison</p>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-line bg-hover/60 text-left text-[12px] font-medium text-ink-muted">
              <th className="px-5 py-2.5">Feature</th>
              <th className="w-20 px-5 py-2.5 text-center">Free</th>
              <th className="w-20 px-5 py-2.5 text-center">Pro</th>
            </tr>
          </thead>
          <tbody>
            {FREE_ROWS.map((r, i) => (
              <tr
                key={r.feature}
                className={`border-b border-line/60 last:border-b-0 ${
                  i % 2 ? 'bg-hover/30' : ''
                }`}
              >
                <td className="px-5 py-2 text-ink-secondary">{r.feature}</td>
                <td className="px-5 py-2 text-center">
                  <span
                    className={
                      r.free === '✓'
                        ? 'font-semibold text-emerald-600'
                        : 'text-ink-muted/60'
                    }
                  >
                    {r.free}
                  </span>
                </td>
                <td className="px-5 py-2 text-center">
                  <span
                    className={
                      r.pro === '✓'
                        ? 'font-semibold text-accent-strong'
                        : 'text-ink-muted/60'
                    }
                  >
                    {r.pro}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* bottom CTA */}
      <div className="flex flex-col items-center rounded-xl border border-accent/30 bg-accent-soft/40 px-6 py-8 text-center">
        <div className="mb-3 flex items-center gap-2 text-accent-strong">
          <Sparkles className="size-5" />
          <p className="text-[15px] font-semibold">
            Ready to go beyond?
          </p>
        </div>
        <p className="mb-4 max-w-md text-[13px] text-ink-secondary">
          MyNote Pro uses signed offline license keys — no account needed,
          no data leaves your machine. Generate a key, paste it in the Pro
          app, and unlock everything instantly.
        </p>
        <button
          type="button"
          onClick={openPro}
          disabled={proOnline === false}
          className="btn-primary gap-2 px-6 py-2.5 text-[13px]"
        >
          <Check className="size-4" />
          Launch MyNote Pro
        </button>
        <p className="mt-3 font-mono text-[11px] text-ink-muted">
          Run{' '}
          <code className="rounded bg-surface px-1.5 py-0.5 text-accent-strong">
            npm run license
          </code>{' '}
          inside note-pro to generate your first key.
        </p>
      </div>
    </div>
  )
}