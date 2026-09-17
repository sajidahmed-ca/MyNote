import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Plus,
  StickyNote,
  Settings,
  Pin,
  Tag,
  Sparkles,
  ChevronDown,
} from 'lucide-react'
import { useNoteStore, allTags } from '../store/useNoteStore'
import { NAV_ITEMS, FOLDER_META, TYPE_META } from '../constants'

function SidebarLink({ to, end, icon: Icon, label, count, suffix }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-colors ${
          isActive
            ? 'bg-accent-soft text-accent-strong'
            : 'text-ink-secondary hover:bg-hover hover:text-ink'
        }`
      }
    >
      <Icon
        className={`size-4 shrink-0 ${
          suffix === 'active' ? 'text-accent-strong' : 'text-ink-muted group-hover:text-ink'
        }`}
      />
      <span className="flex-1 truncate">{label}</span>
      {suffix === 'active' ? (
        <span className="flex size-5 items-center justify-center rounded-full bg-accent-strong text-[10px] font-semibold text-white">
          {count}
        </span>
      ) : (
        count > 0 && (
          <span className="font-mono text-[11px] text-ink-muted">{count}</span>
        )
      )}
    </NavLink>
  )
}

function FolderLink({ id, label, dot, count, active }) {
  return (
    <NavLink
      to={`/folder/${id}`}
      className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-[6px] text-[13px] transition-colors ${
        active
          ? 'bg-accent-soft font-medium text-accent-strong'
          : 'text-ink-secondary hover:bg-hover hover:text-ink'
      }`}
    >
      <span className={`size-1.5 shrink-0 rounded-full ${dot}`} />
      <span className="flex-1 truncate">{label}</span>
      {count > 0 && (
        <span className="font-mono text-[11px] text-ink-muted">{count}</span>
      )}
    </NavLink>
  )
}

function SectionHeader({ label, icon: Icon, count, minimized, onToggle }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 pb-1.5">
      <button
        type="button"
        onClick={onToggle}
        className="flex flex-1 items-center gap-1.5 text-left font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-muted transition-colors hover:text-ink"
      >
        {Icon && <Icon className="size-3" />}
        <span className="flex-1">{label}</span>
        {count > 0 && (
          <span className="rounded bg-hover px-1.5 py-0.5 text-[10px] text-ink-muted">
            {count}
          </span>
        )}
        <ChevronDown
          className={`size-3 transition-transform ${minimized ? '-rotate-90' : ''}`}
        />
      </button>
    </div>
  )
}

export default function Sidebar() {
  const notes = useNoteStore((s) => s.notes)
  const openTemplate = useNoteStore((s) => s.openTemplate)
  const user = useNoteStore((s) => s.user)
  const location = useLocation()
  const navigate = useNavigate()
  const [foldersMinimized, setFoldersMinimized] = useState(false)
  const [tagsMinimized, setTagsMinimized] = useState(false)

  const visible = notes.filter((n) => !n.archived)
  const pinnedCount = visible.filter((n) => n.pinned).length
  const countByType = (t) => visible.filter((n) => n.type === t).length
  const countByFolder = (f) => visible.filter((n) => n.folder === f).length
  const flashcardCount = notes
    .filter((n) => !n.archived)
    .reduce((acc, n) => acc + (n.flashcards?.length || 0), 0)
  const tags = allTags(visible)

  const isFolderActive = (id) => location.pathname === `/folder/${id}`
  const isTagActive = (name) => location.pathname === `/tags/${name}`

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-line bg-surface">
      {/* brand */}
      <div className="flex items-center gap-2.5 px-4 pb-3 pt-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-accent shadow-sm">
          <Sparkles className="size-4 text-white" />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[14px] font-bold tracking-tight">MyNote</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            v2.0 · local-first
          </p>
        </div>
      </div>

      {/* new note */}
      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={openTemplate}
          className="btn-primary w-full justify-start gap-2 py-2 text-[13px]"
        >
          <Plus className="size-4" />
          New Note
        </button>
      </div>

      {/* nav */}
      <nav className="nice-scroll flex-1 space-y-0.5 overflow-y-auto px-2.5 pb-2">
        {pinnedCount > 0 && (
          <SidebarLink
            to="/pinned"
            end
            icon={Pin}
            label="Pinned"
            count={pinnedCount}
          />
        )}
        {NAV_ITEMS.map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            icon={item.type ? TYPE_META[item.type].icon : StickyNote}
            label={item.label}
            count={
              item.type === 'book'
                ? countByType('book')
                : item.type === 'journal'
                  ? countByType('journal')
                  : item.type === 'task'
                    ? countByType('task')
                    : item.label === 'Flashcards'
                      ? flashcardCount
                      : visible.length
            }
            suffix={item.label === 'Flashcards' && flashcardCount > 0 ? 'active' : undefined}
          />
        ))}

        {/* folders */}
        <div className="pt-4">
          <SectionHeader
            label="Folders"
            count={Object.keys(FOLDER_META).length}
            minimized={foldersMinimized}
            onToggle={() => setFoldersMinimized((v) => !v)}
          />
          {!foldersMinimized && (
            <div className="space-y-0.5">
              {Object.entries(FOLDER_META).map(([id, meta]) => (
                <FolderLink
                  key={id}
                  id={id}
                  label={meta.label}
                  dot={meta.dot}
                  count={countByFolder(id)}
                  active={isFolderActive(id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* tags */}
        {tags.length > 0 && (
          <div className="pt-4">
            <SectionHeader
              label="Tags"
              icon={Tag}
              count={tags.length}
              minimized={tagsMinimized}
              onToggle={() => setTagsMinimized((v) => !v)}
            />
            {!tagsMinimized && (
              <div className="space-y-0.5">
                {tags.slice(0, 12).map(({ name, count }) => (
                  <NavLink
                    key={name}
                    to={`/tags/${encodeURIComponent(name)}`}
                    className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-[6px] text-[13px] transition-colors ${
                      isTagActive(name)
                        ? 'bg-accent-soft font-medium text-accent-strong'
                        : 'text-ink-secondary hover:bg-hover hover:text-ink'
                    }`}
                  >
                    <span className="size-1.5 shrink-0 rounded-full bg-accent/60" />
                    <span className="flex-1 truncate">#{name}</span>
                    <span className="font-mono text-[11px] text-ink-muted">
                      {count}
                    </span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="h-3" />
      </nav>

      {/* upgrade to pro */}
      <div className="mx-3 mb-2">
        <NavLink
          to="/upgrade"
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors ${
              isActive
                ? 'border-accent bg-accent-soft text-accent-strong'
                : 'border-accent/20 bg-accent-soft/50 text-accent-strong hover:bg-accent-soft'
            }`
          }
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-accent text-white">
            <span className="text-[10px] font-bold">P</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-semibold leading-tight">
              Upgrade to Pro
            </span>
            <span className="block text-[10.5px] text-accent-strong/70">
              Themes · Analytics · Trash
            </span>
          </span>
        </NavLink>
      </div>

      {/* profile card */}
      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2.5 rounded-xl bg-hover p-2.5">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="Profile"
              className="size-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover text-[13px] font-semibold text-white">
              {user.name
                .split(' ')
                .map((w) => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
          )}
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-semibold">{user.name}</p>
            <p className="truncate font-mono text-[10.5px] text-ink-muted">
              local · {visible.length} notes
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="icon-btn size-7"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}