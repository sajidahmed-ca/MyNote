import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react'
import {
  Search,
  Grid3x3,
  List,
  ChevronDown,
  ArrowUpDown,
  Download,
  CheckSquare,
  Square,
} from 'lucide-react'
import { useNoteStore } from '../store/useNoteStore'
import { downloadJson } from '../utils/format'

const SORTS = [
  { key: 'updated', dir: 'desc', label: 'Recently updated', hint: 'the freshest first' },
  { key: 'created', dir: 'desc', label: 'Recently created', hint: 'newest first' },
  { key: 'title', dir: 'asc', label: 'Title A → Z', hint: 'alphabetical' },
  { key: 'title', dir: 'desc', label: 'Title Z → A', hint: 'reverse alpha' },
]

const TITLES = {
  '/': 'All notes',
  '/book-notes': 'Book notes',
  '/flashcards': 'Flashcards',
  '/journal': 'Journal',
  '/tasks': 'Task lists',
  '/pinned': 'Pinned',
}

function contextTitle(path) {
  if (path.startsWith('/folder/')) return 'Folder'
  if (path.startsWith('/tags/')) return 'Tag'
  return TITLES[path] || 'All notes'
}

export default function Topbar() {
  const location = useLocation()
  const searchQuery = useNoteStore((s) => s.searchQuery)
  const setSearchQuery = useNoteStore((s) => s.setSearchQuery)
  const viewMode = useNoteStore((s) => s.viewMode)
  const setViewMode = useNoteStore((s) => s.setViewMode)
  const sortBy = useNoteStore((s) => s.sortBy)
  const sortDir = useNoteStore((s) => s.sortDir)
  const setSortBy = useNoteStore((s) => s.setSortBy)
  const toggleSortDir = useNoteStore((s) => s.toggleSortDir)
  const notes = useNoteStore((s) => s.notes)
  const selectionEnabled = useNoteStore((s) => s.selectionEnabled)
  const enterSelectionMode = useNoteStore((s) => s.enterSelectionMode)
  const exitSelectionMode = useNoteStore((s) => s.exitSelectionMode)

  const activeSort =
    useMemo(
      () =>
        SORTS.find((s) => s.key === sortBy && s.dir === sortDir) ||
        SORTS[0],
      [sortBy, sortDir],
    )
  const count = notes.filter((n) => !n.archived).length

  const doExport = () => {
    downloadJson(
      `mynote-export-${new Date().toISOString().slice(0, 10)}.json`,
      notes.filter((n) => !n.archived),
    )
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4">
      {/* context */}
      <div className="flex min-w-0 items-center gap-2">
        <h2 className="whitespace-nowrap text-[15px] font-semibold tracking-tight">
          {contextTitle(location.pathname)}
        </h2>
        <span className="rounded-full bg-hover px-2 py-0.5 font-mono text-[10.5px] text-ink-muted">
          {count}
        </span>
      </div>

      <div className="mx-1 h-6 w-px bg-line" aria-hidden />

      {/* search */}
      <label className="group relative flex min-w-0 flex-1 items-center sm:max-w-[340px]">
        <Search className="pointer-events-none absolute left-3 size-4 text-ink-muted" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes, tags, authors…"
          className="h-8.5 w-full rounded-lg border border-line bg-canvas py-1.5 pl-9 pr-16 text-[13px] text-ink placeholder:text-ink-muted/70 transition-all focus:border-accent focus:bg-surface focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
          style={{ height: 34 }}
        />
        <span className="pointer-events-none absolute right-2.5 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">
          ⌘K
        </span>
      </label>

      <div className="ml-auto flex items-center gap-1.5">
        {/* selection toggle */}
        <button
          type="button"
          onClick={selectionEnabled ? exitSelectionMode : enterSelectionMode}
          className={`icon-btn px-2 ${
            selectionEnabled
              ? 'bg-accent-soft text-accent-strong'
              : 'text-ink-muted'
          }`}
          title={selectionEnabled ? 'Exit selection mode' : 'Enter selection mode'}
        >
          {selectionEnabled ? (
            <CheckSquare className="size-4" />
          ) : (
            <Square className="size-4" />
          )}
        </button>

        {/* view toggle */}
        <div className="flex items-center rounded-lg border border-line bg-surface p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex size-7 items-center justify-center rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-hover text-ink'
                : 'text-ink-muted hover:text-ink'
            }`}
            title="Grid view"
          >
            <Grid3x3 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex size-7 items-center justify-center rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-hover text-ink'
                : 'text-ink-muted hover:text-ink'
            }`}
            title="List view"
          >
            <List className="size-4" />
          </button>
        </div>

        {/* sort menu */}
        <Menu as="div" className="relative">
          <MenuButton
            className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-[11px] font-medium text-ink-secondary transition-colors hover:bg-hover hover:text-ink"
            style={{ height: 34 }}
          >
            <ArrowUpDown className="size-3.5 text-ink-muted" />
            <span className="hidden sm:inline">{activeSort.label}</span>
            <ChevronDown className="size-3 text-ink-muted" />
          </MenuButton>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition duration-75 ease-out"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <MenuItems className="absolute right-0 z-40 mt-1.5 w-56 origin-top-right rounded-xl border border-line bg-surface p-1 shadow-pop">
              {SORTS.map((s) => {
                const active = s.key === sortBy && s.dir === sortDir
                return (
                  <MenuItem key={s.label}>
                    <button
                      type="button"
                      onClick={() => {
                        setSortBy(s.key)
                        if (s.key === sortBy) toggleSortDir()
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
                        active
                          ? 'bg-accent-soft font-medium text-accent-strong'
                          : 'text-ink-secondary hover:bg-hover hover:text-ink'
                      }`}
                    >
                      <span>
                        {s.label}
                        <span className="block text-[11px] font-normal text-ink-muted">
                          {s.hint}
                        </span>
                      </span>
                      {active && (
                        <span className="ml-2 size-1.5 shrink-0 rounded-full bg-accent" />
                      )}
                    </button>
                  </MenuItem>
                )
              })}
            </MenuItems>
          </Transition>
        </Menu>

        {/* export */}
        <button
          type="button"
          onClick={doExport}
          className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-hover hover:text-ink"
          style={{ height: 34 }}
          title="Export all notes (JSON)"
        >
          <Download className="size-3.5" />
          <span className="hidden lg:inline">Export</span>
        </button>
      </div>
    </header>
  )
}