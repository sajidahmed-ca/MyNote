import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useNoteStore } from './store/useNoteStore'
import AppShell from './components/AppShell'
import NotesView from './components/NotesView'
import BookNotesView from './components/BookNotesView'
import FlashcardsView from './components/FlashcardsView'
import Settings from './components/Settings'
import UpgradePro from './components/UpgradePro'

export default function App() {
  const hydrate = useNoteStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

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
          <Route path="/settings" element={<Settings />} />
          <Route path="/upgrade" element={<UpgradePro />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}