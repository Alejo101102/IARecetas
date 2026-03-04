import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login/Login'
import Layout from './layout/Layout'
import Inventario from './pages/inventario/Inventario'
import Recetas from './pages/recetas/Recetas'
import Biblioteca from './pages/biblioteca/Biblioteca'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />

        {/* Rutas protegidas con Header */}
        <Route path="/inventario" element={<Layout><Inventario /></Layout>} />
        <Route path="/recetas"    element={<Layout><Recetas /></Layout>} />
        <Route path="/biblioteca" element={<Layout><Biblioteca /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}