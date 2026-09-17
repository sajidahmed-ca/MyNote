import { useMemo } from 'react'
import {
  StickyNote,
  Brain,
  ListChecks,
  TrendingUp,
  Tag,
  Folder,
  FileText,
} from 'lucide-react'
import { useNoteStore } from '../store/useNoteStore'
import { TYPE_META, FOLDER_META } from '../constants'

const DAY = 86_400_000

function StatCard({ icon: Icon, label, value, sub, tint }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className={`mb-2 flex size-8 items-center justify-center rounded-lg ${tint}`}>
        <Icon className="size-4" />
      </div>
      <p className="text-[26px] font-bold leading-none tracking-tight text-ink">
        {value}
      </p>
      <p className="mt-1 text-[12px] font-medium text-ink-secondary">{label}</p>
      {sub && <p className="text-[11px] text-ink-muted">{sub}</p>}
    </div>
  )
}

function BarRow({ label, value, max, color }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 truncate text-[12px] text-ink-secondary">
        {label}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-hover">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: color || 'var(--accent)',
          }}
        />
      </div>
      <span className="w-8 shrink-0 text-right font-mono text-[11px] text-ink-muted">
        {value}
      </span>
    </div>
  )
}

export default function Analytics() {
  const notes = useNoteStore((s) => s.notes)
  const customFolders = useNoteStore((s) => s.customFolders)

  const stats = useMemo(() => {
    const visible = notes.filter((n) => !n.archived)
    const total = visible.length
    const flashcards = visible.reduce((a, n) => a + (n.flashcards?.length || 0), 0)
    const tasks = visible.flatMap((n) => n.tasks || [])
    const doneTasks = tasks.filter((t) => t.done).length

    const byType = ['standard', 'book', 'journal', 'task'].map((t) => ({
      name: TYPE_META[t].label,
      label: TYPE_META[t].label,
      value: visible.filter((n) => n.type === t).length,
      key: t,
    }))

    const tagMap = new Map()
    visible.forEach((n) => (n.tags || []).forEach((t) => tagMap.set(t, (tagMap.get(t) || 0) + 1)))
    const tags = [...tagMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }))

    const folderMap = new Map()
    visible.forEach((n) => folderMap.set(n.folder, (folderMap.get(n.folder) || 0) + 1))
    const folderList = [...Object.entries(FOLDER_META), ...customFolders.map((f) => [f.id, f])]
    const folders = folderList
      .map(([id, meta]) => ({
        name: meta?.label || id,
        value: folderMap.get(id) || 0,
      }))
      .filter((f) => f.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)

    const createdLast14 = Array.from({ length: 14 }, (_, i) => {
      const dayStart = new Date()
      dayStart.setHours(0, 0, 0, 0)
      dayStart.setDate(dayStart.getDate() - (13 - i))
      const next = dayStart.getTime() + DAY
      const value = visible.filter((n) => n.createdAt >= dayStart.getTime() && n.createdAt < next).length
      return {
        label: dayStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value,
      }
    })

    const updatedLast7 = visible.filter(
      (n) => Date.now() - (n.updatedAt || 0) < 7 * DAY,
    ).length

    return {
      total,
      flashcards,
      tasksTotal: tasks.length,
      tasksDone: doneTasks,
      taskPct: tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0,
      byType,
      tags,
      folders,
      createdLast14,
      updatedLast7,
      maxCreated: Math.max(...createdLast14.map((d) => d.value), 1),
    }
  }, [notes, customFolders])

  const { byType, folders, tags, createdLast14 } = stats
  const maxType = Math.max(...byType.map((b) => b.value), 1)
  const maxFolder = Math.max(...folders.map((f) => f.value), 1)
  const maxTag = Math.max(...tags.map((t) => t.value), 1)

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold tracking-[-0.02em]">Analytics</h1>
        <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
          A pulse-read on your writing, computed locally.
        </p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={StickyNote}
          label="Notes"
          value={stats.total}
          sub={`${stats.updatedLast7} updated this week`}
          tint="bg-accent-soft text-accent-strong"
        />
        <StatCard
          icon={Brain}
          label="Flashcards"
          value={stats.flashcards}
          sub="across all notes"
          tint="bg-sky-100 text-sky-700"
        />
        <StatCard
          icon={ListChecks}
          label="Tasks"
          value={stats.tasksTotal}
          sub={`${stats.tasksDone} completed`}
          tint="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          icon={TrendingUp}
          label="Task completion"
          value={`${stats.taskPct}%`}
          sub="of all tasks done"
          tint="bg-amber-100 text-amber-700"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* by type */}
        <div className="rounded-xl border border-line bg-surface p-5">
          <h3 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-ink">
            <FileText className="size-4 text-accent" />
            Notes by type
          </h3>
          <div className="space-y-3">
            {byType.map((b) => (
              <BarRow
                key={b.key}
                label={b.label}
                value={b.value}
                max={maxType}
              />
            ))}
          </div>
        </div>

        {/* by folder */}
        <div className="rounded-xl border border-line bg-surface p-5">
          <h3 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-ink">
            <Folder className="size-4 text-accent" />
            Notes by folder
          </h3>
          {folders.length ? (
            <div className="space-y-3">
              {folders.map((f) => (
                <BarRow
                  key={f.name}
                  label={f.name}
                  value={f.value}
                  max={maxFolder}
                />
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-ink-muted">No folders in use yet.</p>
          )}
        </div>

        {/* created last 14 days */}
        <div className="rounded-xl border border-line bg-surface p-5">
          <h3 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-ink">
            <TrendingUp className="size-4 text-accent" />
            Notes created — last 14 days
          </h3>
          <div className="flex h-32 items-end gap-1">
            {createdLast14.map((d, i) => (
              <div
                key={i}
                className="group relative flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className={`w-full rounded-t-md transition-all ${
                    d.value ? 'bg-accent' : 'bg-hover'
                  }`}
                  style={{ height: `${Math.max((d.value / stats.maxCreated) * 88, 4)}px` }}
                />
                <span className="hidden text-[9px] text-ink-muted group-hover:block">
                  {d.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between font-mono text-[9px] text-ink-muted">
            <span>{createdLast14[0]?.label}</span>
            <span>today</span>
          </div>
        </div>

        {/* top tags */}
        <div className="rounded-xl border border-line bg-surface p-5">
          <h3 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-ink">
            <Tag className="size-4 text-accent" />
            Top tags
          </h3>
          {tags.length ? (
            <div className="space-y-3">
              {tags.map((t) => (
                <BarRow
                  key={t.name}
                  label={`#${t.name}`}
                  value={t.value}
                  max={maxTag}
                />
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-ink-muted">
              No tags yet. Add tags to notes to see them here.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}