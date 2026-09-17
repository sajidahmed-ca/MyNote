import {
  FileText,
  BookOpen,
  Feather,
  ListChecks,
} from 'lucide-react'

export const TYPE_META = {
  standard: {
    label: 'Note',
    icon: FileText,
    chip: 'bg-accent-soft text-accent-strong',
    tint: 'text-accent-strong',
    glyph: 'bg-accent-soft text-accent-strong',
  },
  book: {
    label: 'Book note',
    icon: BookOpen,
    chip: 'bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300',
    tint: 'text-sky-700',
    glyph: 'bg-sky-100 text-sky-700',
  },
  journal: {
    label: 'Journal',
    icon: Feather,
    chip: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    tint: 'text-amber-700',
    glyph: 'bg-amber-100 text-amber-700',
  },
  task: {
    label: 'Task list',
    icon: ListChecks,
    chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    tint: 'text-emerald-700',
    glyph: 'bg-emerald-100 text-emerald-700',
  },
}

export const TEMPLATES = [
  {
    type: 'standard',
    title: 'Standard note',
    desc: 'Blank canvas for raw thoughts, lists, and ideas.',
    shortcut: 'N',
  },
  {
    type: 'book',
    title: 'Book note',
    desc: 'Title, author, page tracking + flashcard pipeline.',
    shortcut: 'B',
  },
  {
    type: 'journal',
    title: 'Quick journal',
    desc: 'Timestamped reflection, one entry at a time.',
    shortcut: 'J',
  },
  {
    type: 'task',
    title: 'Task list',
    desc: 'A checklist that tracks its own progress.',
    shortcut: 'T',
  },
]

export const NAV_ITEMS = [
  { to: '/', label: 'All notes', type: null },
  { to: '/book-notes', label: 'Book notes', type: 'book' },
  { to: '/flashcards', label: 'Flashcards', type: null },
  { to: '/journal', label: 'Journal', type: 'journal' },
  { to: '/tasks', label: 'Task lists', type: 'task' },
]

export const FOLDER_META = {
  uncategorized: { label: 'Uncategorized', dot: 'bg-slate-300' },
  study: { label: 'Study', dot: 'bg-indigo-400' },
  work: { label: 'Work', dot: 'bg-sky-400' },
  personal: { label: 'Personal', dot: 'bg-emerald-400' },
  ideas: { label: 'Ideas', dot: 'bg-amber-400' },
}

export const DEFAULT_TAG_SUGGESTIONS = [
  'reading',
  'work',
  'personal',
  'meeting',
  'ideas',
  'dev',
  'health',
]