import { BrowserRouter } from 'react-router-dom'
import { AppProviders } from './providers.tsx'
import { AppRoutes } from './routes.tsx'

export default function App() {
  return <BrowserRouter><AppProviders><AppRoutes /></AppProviders></BrowserRouter>
}
