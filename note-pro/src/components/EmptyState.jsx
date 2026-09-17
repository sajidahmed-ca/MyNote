export default function EmptyState({ icon: Icon, title, desc, action, tone = 'accent' }) {
  const tones = {
    accent: 'bg-accent-soft text-accent-strong',
    slate: 'bg-hover text-ink-muted',
  }
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className={`flex size-14 items-center justify-center rounded-2xl ${tones[tone]}`}
      >
        <Icon className="size-6" />
      </div>
      <h2 className="mt-4 text-[17px] font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-ink-muted">
        {desc}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}