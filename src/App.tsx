import { Navigate, Route, Routes } from 'react-router-dom'
import Header from '@/components/Header'
import RequireAuth from '@/components/RequireAuth'

import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import HallOfFamePage from '@/pages/HallOfFamePage'
import SettingsPage from '@/pages/SettingsPage'

import PlayersPage from '@/pages/players/PlayersPage'
import PlayerNewPage from '@/pages/players/PlayerNewPage'
import PlayerDetailPage from '@/pages/players/PlayerDetailPage'
import PlayerEditPage from '@/pages/players/PlayerEditPage'

import EventsPage from '@/pages/events/EventsPage'
import EventNewPage from '@/pages/events/EventNewPage'
import EventDetailPage from '@/pages/events/EventDetailPage'
import EventEditPage from '@/pages/events/EventEditPage'
import EventLivePage from '@/pages/events/EventLivePage'

import SeasonsPage from '@/pages/seasons/SeasonsPage'
import SeasonNewPage from '@/pages/seasons/SeasonNewPage'
import SeasonDetailPage from '@/pages/seasons/SeasonDetailPage'
import SeasonEditPage from '@/pages/seasons/SeasonEditPage'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/hall-of-fame" element={<HallOfFamePage />} />
          <Route
            path="/settings"
            element={
              <RequireAuth adminOnly>
                <SettingsPage />
              </RequireAuth>
            }
          />

          <Route path="/players" element={<PlayersPage />} />
          <Route
            path="/players/new"
            element={
              <RequireAuth adminOnly>
                <PlayerNewPage />
              </RequireAuth>
            }
          />
          <Route path="/players/:playerId" element={<PlayerDetailPage />} />
          <Route
            path="/players/:playerId/edit"
            element={
              <RequireAuth adminOnly>
                <PlayerEditPage />
              </RequireAuth>
            }
          />

          <Route path="/events" element={<EventsPage />} />
          <Route
            path="/events/new"
            element={
              <RequireAuth adminOnly>
                <EventNewPage />
              </RequireAuth>
            }
          />
          <Route path="/events/:eventId" element={<EventDetailPage />} />
          <Route
            path="/events/:eventId/edit"
            element={
              <RequireAuth adminOnly>
                <EventEditPage />
              </RequireAuth>
            }
          />
          <Route
            path="/events/:eventId/live"
            element={
              <RequireAuth>
                <EventLivePage />
              </RequireAuth>
            }
          />

          <Route path="/seasons" element={<SeasonsPage />} />
          <Route
            path="/seasons/new"
            element={
              <RequireAuth adminOnly>
                <SeasonNewPage />
              </RequireAuth>
            }
          />
          <Route path="/seasons/:seasonId" element={<SeasonDetailPage />} />
          <Route
            path="/seasons/:seasonId/edit"
            element={
              <RequireAuth adminOnly>
                <SeasonEditPage />
              </RequireAuth>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
