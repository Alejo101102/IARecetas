import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login/Login'
import Inventario from './pages/inventario/Inventario'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/inventario" element={<Inventario />} />
      </Routes>
    </BrowserRouter>
  )
}