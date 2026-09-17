import { Loader2 } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { useNoteStore } from '../store/useNoteStore'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import TemplateLauncher from './TemplateLauncher'
import NoteEditor from '../editor/NoteEditor'
import FloatingActionBar from './FloatingActionBar'

function Splash() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex size-11 animate-pulse items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
        <Loader2 className="size-5 animate-spin" />
      </div>
      <p className="font-mono text-xs text-ink-muted">waking up local store…</p>
    </div>
  )
}

const FONT_SIZE_MAP = {
  small: '13px',
  medium: '15px',
  large: '17px',
  'x-large': '19px',
}

export default function AppShell() {
  const hydrated = useNoteStore((s) => s.hydrated)
  const a11y = useNoteStore((s) => s.accessibility)
  const theme = useNoteStore((s) => s.theme)

  const style = {
    fontSize: FONT_SIZE_MAP[a11y.fontSize] || '15px',
  }

  const a11yClasses = [
    a11y.highContrast ? 'a11y-high-contrast' : '',
    a11y.dyslexiaFont ? 'a11y-dyslexia-font' : '',
    a11y.compactMode ? 'a11y-compact' : '',
    a11y.reducedMotion || !a11y.animationsEnabled ? 'a11y-reduced-motion' : '',
    a11y.focusIndicators ? 'a11y-focus' : '',
    theme.mode === 'dark' ? 'theme-dark' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={`flex h-screen overflow-hidden bg-canvas text-ink ${a11yClasses}`}
      style={style}
      data-accent={theme.accent}
    >
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="nice-scroll relative flex-1 overflow-y-auto px-6 pb-24 pt-6">
          {hydrated ? <Outlet /> : <Splash />}
        </main>
      </div>

      {/* global overlays */}
      <TemplateLauncher />
      <NoteEditor />
      <FloatingActionBar />
    </div>
  )
}