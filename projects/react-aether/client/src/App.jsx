import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Studio from './pages/Studio'
import Playbooks from './pages/Playbooks'
import Blueprints from './pages/Blueprints'
import { CollaborationProvider } from './context/CollaborationContext'

function App() {
  return (
    <CollaborationProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Studio />} />
          <Route path="/playbooks" element={<Playbooks />} />
          <Route path="/blueprints" element={<Blueprints />} />
          <Route path="*" element={<Studio />} />
        </Route>
      </Routes>
    </CollaborationProvider>
  )
}

export default App
