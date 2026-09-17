import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useNoteStore } from './store/useNoteStore'
import { useLicenseStore } from './store/useLicenseStore'
import AppShell from './components/AppShell'
import NotesView from './components/NotesView'
import BookNotesView from './components/BookNotesView'
import FlashcardsView from './components/FlashcardsView'
import Settings from './components/Settings'
import LicenseGate from './components/LicenseGate'
import Analytics from './components/Analytics'
import TrashView from './components/TrashView'

export default function App() {
  const hydrate = useNoteStore((s) => s.hydrate)
  const activated = useLicenseStore((s) => s.activated)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  if (!activated) return <LicenseGate />

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<NotesView />} />
          <Route path="/book-notes" element={<BookNotesView />} />
          <Route path="/flashcards" element={<FlashcardsView />} />
          <Route path="/journal" element={<NotesView typeFilter="journal" />} />
          <Route path="/tasks" element={<NotesView typeFilter="task" />} />
          <Route path="/pinned" element={<NotesView />} />
          <Route path="/folder/:folderId" element={<NotesView />} />
          <Route path="/tags/:tag" element={<NotesView />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/trash" element={<TrashView />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}