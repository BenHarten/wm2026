import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LocaleProvider } from './hooks/useLocale'
import { Header } from './components/Header'
import { TabBar } from './components/TabBar'
import { Matches } from './pages/Matches'
import { Groups } from './pages/Groups'
import { Bracket } from './pages/Bracket'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, refetchOnWindowFocus: true },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <HashRouter>
          <div className="mx-auto flex min-h-svh max-w-3xl flex-col">
            <Header />
            <main className="flex-1 px-3 pb-24 sm:px-4">
              <Routes>
                <Route path="/" element={<Matches />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/bracket" element={<Bracket />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <TabBar />
          </div>
        </HashRouter>
      </LocaleProvider>
    </QueryClientProvider>
  )
}
