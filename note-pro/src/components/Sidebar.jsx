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
  LayoutDashboard,
  Trash2,
  PlusCircle,
  Trash,
  Crown,
  X,
  Check,
  Pencil,
} from 'lucide-react'
import { useNoteStore, allTags } from '../store/useNoteStore'
import { useLicenseStore } from '../store/useLicenseStore'
import { NAV_ITEMS, FOLDER_META, TYPE_META } from '../constants'

function SidebarLink({ to, end, icon: Icon, label, count, suffix, pro }) {
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
      {pro && (
        <span className="rounded bg-accent px-1 font-mono text-[8.5px] font-bold uppercase tracking-wide text-white">
          Pro
        </span>
      )}
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

function SectionHeader({ label, icon: Icon, count, minimized, onToggle, trailing }) {
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
      {trailing}
    </div>
  )
}

function FolderLink({ id, label, dot, count, active, onDelete, onRename }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(label)

  if (editing) {
    return (
      <div className="flex items-center gap-1 px-1">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onRename(draft.trim())
              setEditing(false)
            }
            if (e.key === 'Escape') setEditing(false)
          }}
          className="h-7 min-w-0 flex-1 rounded-lg border border-accent bg-canvas px-2 text-[12px] text-ink focus:border-accent"
        />
        <button
          type="button"
          onClick={() => {
            onRename(draft.trim())
            setEditing(false)
          }}
          className="size-6 shrink-0 rounded-md text-accent-strong hover:bg-hover"
        >
          <Check className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="size-6 shrink-0 rounded-md text-ink-muted hover:bg-hover"
        >
          <X className="size-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className={`group flex items-center rounded-lg ${active ? 'bg-accent-soft' : ''}`}>
      <NavLink
        to={`/folder/${id}`}
        className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2.5 py-[6px] text-[13px] transition-colors ${
          active ? 'font-medium text-accent-strong' : 'text-ink-secondary hover:text-ink'
        }`}
      >
        <span className={`size-1.5 shrink-0 rounded-full ${dot}`} />
        <span className="flex-1 truncate">{label}</span>
        {count > 0 && (
          <span className="font-mono text-[11px] text-ink-muted">{count}</span>
        )}
      </NavLink>
      {onDelete && onRename && (
        <span className="hidden shrink-0 items-center gap-0.5 pr-1 group-hover:flex">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="size-5 rounded-md text-ink-muted hover:bg-hover hover:text-ink"
            title="Rename"
          >
            <Pencil className="size-3" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="size-5 rounded-md text-ink-muted hover:bg-red-50 hover:text-red-500"
            title="Delete folder"
          >
            <Trash className="size-3" />
          </button>
        </span>
      )}
    </div>
  )
}

export default function Sidebar() {
  const notes = useNoteStore((s) => s.notes)
  const openTemplate = useNoteStore((s) => s.openTemplate)
  const user = useNoteStore((s) => s.user)
  const license = useLicenseStore((s) => s.license)
  const customFolders = useNoteStore((s) => s.customFolders)
  const addCustomFolder = useNoteStore((s) => s.addCustomFolder)
  const removeCustomFolder = useNoteStore((s) => s.removeCustomFolder)
  const renameCustomFolder = useNoteStore((s) => s.renameCustomFolder)
  const location = useLocation()
  const navigate = useNavigate()
  const [foldersMinimized, setFoldersMinimized] = useState(false)
  const [tagsMinimized, setTagsMinimized] = useState(false)
  const [addingFolder, setAddingFolder] = useState(false)
  const [folderDraft, setFolderDraft] = useState('')

  const visible = notes.filter((n) => !n.archived)
  const trashed = notes.filter((n) => n.archived)
  const pinnedCount = visible.filter((n) => n.pinned).length
  const countByType = (t) => visible.filter((n) => n.type === t).length
  const countByFolder = (f) => visible.filter((n) => n.folder === f).length
  const flashcardCount = notes
    .filter((n) => !n.archived)
    .reduce((acc, n) => acc + (n.flashcards?.length || 0), 0)
  const tags = allTags(visible)

  const isFolderActive = (id) => location.pathname === `/folder/${id}`
  const isTagActive = (name) =>
    location.pathname === `/tags/${encodeURIComponent(name)}`

  const folderList = [
    ...Object.entries(FOLDER_META).map(([id, meta]) => ({
      id,
      label: meta.label,
      dot: meta.dot,
      custom: false,
    })),
    ...customFolders.map((f) => ({
      id: f.id,
      label: f.label,
      dot: 'bg-gradient-to-r from-accent to-accent-hover',
      custom: true,
    })),
  ]

  const commitFolder = () => {
    const label = folderDraft.trim()
    if (label) addCustomFolder(label)
    setFolderDraft('')
    setAddingFolder(false)
  }

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-line bg-surface">
      {/* brand */}
      <div className="flex items-center gap-2.5 px-4 pb-3 pt-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-accent shadow-sm">
          <Sparkles className="size-4 text-white" />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[14px] font-bold tracking-tight">MyNote</p>
            <span className="rounded bg-accent px-1 py-px font-mono text-[8.5px] font-bold uppercase tracking-wide text-white">
              Pro
            </span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            {license?.name || 'Activated'} · v3.0
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

        {/* pro section */}
        <div className="pt-2">
          <p className="px-2.5 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-accent-strong">
            Pro workspace
          </p>
          <div className="space-y-0.5">
            <SidebarLink to="/analytics" icon={LayoutDashboard} label="Analytics" pro />
            <SidebarLink
              to="/trash"
              icon={Trash2}
              label="Trash"
              count={trashed.length}
              pro
            />
          </div>
        </div>

        {/* folders */}
        <div className="pt-4">
          <SectionHeader
            label="Folders"
            count={folderList.length}
            minimized={foldersMinimized}
            onToggle={() => setFoldersMinimized((v) => !v)}
            trailing={
              <button
                type="button"
                onClick={() => setAddingFolder((v) => !v)}
                className="mr-1.5 size-5 shrink-0 rounded-md text-ink-muted transition-colors hover:bg-hover hover:text-accent-strong"
                title="New folder"
              >
                <PlusCircle className="size-4" />
              </button>
            }
          />
          {addingFolder && (
            <div className="mb-1 flex items-center gap-1 px-1">
              <input
                autoFocus
                value={folderDraft}
                onChange={(e) => setFolderDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitFolder()
                  if (e.key === 'Escape') setAddingFolder(false)
                }}
                placeholder="Folder name"
                className="h-7 min-w-0 flex-1 rounded-lg border border-accent bg-canvas px-2 text-[12px] text-ink placeholder:text-ink-muted/50 focus:border-accent"
              />
              <button
                type="button"
                onClick={commitFolder}
                className="size-6 shrink-0 rounded-md text-accent-strong hover:bg-hover"
              >
                <Check className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAddingFolder(false)}
                className="size-6 shrink-0 rounded-md text-ink-muted hover:bg-hover"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}
          {!foldersMinimized && (
            <div className="space-y-0.5">
              {folderList.map((folder) => (
                <FolderLink
                  key={folder.id}
                  id={folder.id}
                  label={folder.label}
                  dot={folder.dot}
                  count={countByFolder(folder.id)}
                  active={isFolderActive(folder.id)}
                  onDelete={
                    folder.custom
                      ? () => {
                          if (
                            window.confirm(
                              `Delete folder "${folder.label}"? Notes inside it move to Uncategorized.`,
                            )
                          ) {
                            removeCustomFolder(folder.id)
                          }
                        }
                      : undefined
                  }
                  onRename={
                    folder.custom
                      ? (label) => renameCustomFolder(folder.id, label)
                      : undefined
                  }
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
                {tags.map(({ name, count }) => (
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

      {/* pro status strip */}
      <div className="mx-3 mb-1 flex items-center gap-2 rounded-lg bg-accent-soft/70 px-2.5 py-2">
        <Crown className="size-3.5 shrink-0 text-accent-strong" />
        <p className="min-w-0 flex-1 truncate text-[11px] font-medium text-accent-strong">
          {license?.name ? `Licensed to ${license.name}` : 'Pro activated'}
        </p>
      </div>

      {/* profile card */}
      <div className="border-t border-line p-3 pt-2">
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