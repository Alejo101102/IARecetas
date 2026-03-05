import { useState, useEffect } from 'react'
import './Biblioteca.css'

// ─── Receta quemada (la misma del generador) ──────────────
const RECETA_DEMO = {
  id: 'demo-1',
  nombre: 'Bowl de Pollo y Aguacate con Arroz Integral',
  imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  match: 98,
  tiempo: 25,
  dificultad: 'Fácil',
  calorias: 450,
  proteina: 35,
  carbos: 42,
  grasas: 18,
  descripcion: 'Un bowl nutritivo y equilibrado que combina la proteína magra del pollo con las grasas saludables del aguacate y los carbohidratos complejos del arroz integral. Perfecto para una comida completa.',
  tags: ['SALUDABLE', 'PROTEÍNA'],
  ingredientes: [
    { nombre: '500g de pechuga de pollo', detalle: 'Cortada en cubos' },
    { nombre: 'Arroz integral', detalle: '1 taza, cocido' },
    { nombre: 'Aguacate maduro', detalle: 'En láminas' },
    { nombre: 'Espinacas frescas', detalle: 'Lavadas' },
    { nombre: 'Tomates cherry', detalle: 'Cortados por la mitad' },
    { nombre: 'Aceite de oliva', detalle: '2 cdas' },
    { nombre: 'Sal y pimienta', detalle: 'Al gusto' },
  ],
  instrucciones: [
    { paso: 1, titulo: 'Preparar el arroz', desc: 'Cocina el arroz integral según las instrucciones del paquete. Normalmente tarda unos 20-25 minutos a fuego lento.' },
    { paso: 2, titulo: 'Cocinar el pollo', desc: 'Corta la pechuga de pollo en cubos. Salpimienta y saltéala con aceite de oliva en una sartén a fuego medio-alto durante 8-10 minutos.' },
    { paso: 3, titulo: 'Preparar los vegetales', desc: 'Lava las espinacas y corta los tomates cherry. Corta el aguacate en láminas finas.' },
    { paso: 4, titulo: 'Armar el bowl', desc: 'Coloca el arroz como base, añade el pollo, las espinacas, los tomates y las láminas de aguacate. Añade sal y pimienta al gusto.' },
  ],
}

// ─── Recetas del historial (quemadas) ────────────────────
const HISTORIAL_DEMO = [
  { id: 'h-1', nombre: 'Salteado de Verduras', tiempo: 'Hace 2 horas', icono: '🥗' },
  { id: 'h-2', nombre: 'Mojito de Fresa', tiempo: 'Ayer', icono: '🍹' },
  { id: 'h-3', nombre: 'Pasta Carbonara', tiempo: 'Ayer', icono: '🍝' },
  { id: 'h-4', nombre: 'Smoothie Bowl Detox', tiempo: 'Hace 2 días', icono: '🥣' },
  { id: 'h-5', nombre: 'Burger de Lentejas', tiempo: 'Hace 3 días', icono: '🍔' },
]

// ─── Helpers localStorage ─────────────────────────────────
const STORAGE_KEY = 'iarecetas_biblioteca'

function getFavoritos() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveFavoritos(lista) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lista))
  } catch {
    // Ignora errores de almacenamiento (modo privado o storage bloqueado).
  }
}

// ─── Vista completa de receta ─────────────────────────────
function VistaCompleta({ receta, onVolver, esFavorito, onToggleFavorito }) {
  const [ingredientesMarcados, setIngredientesMarcados] = useState([])

  const toggleIngrediente = (idx) => {
    setIngredientesMarcados(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  return (
    <div className="bib-vista-completa">
      <button className="bib-volver" onClick={onVolver}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Volver a Mi Biblioteca
      </button>

      <div className="bib-vc-grid">
        {/* Izquierda */}
        <div className="bib-vc-left">
          <div className="bib-vc-tags">
            {receta.tags?.map(t => (
              <span key={t} className="bib-vc-tag">{t}</span>
            ))}
          </div>
          <h1 className="bib-vc-titulo">{receta.nombre}</h1>
          <p className="bib-vc-desc">{receta.descripcion}</p>

          {/* Ingredientes */}
          <div className="bib-vc-section">
            <div className="bib-vc-section-title">
              <div className="bib-vc-accent" />
              Ingredientes
            </div>
            <div className="bib-vc-ingredientes">
              {receta.ingredientes.map((ing, idx) => (
                <label key={idx} className={`bib-vc-ing-item${ingredientesMarcados.includes(idx) ? ' checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={ingredientesMarcados.includes(idx)}
                    onChange={() => toggleIngrediente(idx)}
                  />
                  <div>
                    <div className="bib-vc-ing-name">{ing.nombre}</div>
                    <div className="bib-vc-ing-detail">{ing.detalle}</div>
                  </div>
                </label>
              ))}
              <button className="bib-vc-add-lista">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                </svg>
                Añadir a la lista de compras
              </button>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bib-vc-section">
            <div className="bib-vc-section-title">
              <div className="bib-vc-accent" />
              Instrucciones
            </div>
            <div className="bib-vc-instrucciones">
              {receta.instrucciones.map(inst => (
                <div key={inst.paso} className="bib-vc-inst-item">
                  <div className="bib-vc-inst-num">{inst.paso}</div>
                  <div>
                    <div className="bib-vc-inst-titulo">{inst.titulo}</div>
                    <div className="bib-vc-inst-desc">{inst.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Derecha */}
        <div className="bib-vc-right">
          <div className="bib-vc-img-wrap">
            <img src={receta.imagen} alt={receta.nombre} />
          </div>

          <div className="bib-vc-stats-grid">
            {[
              { icon: '⏱', label: 'PREP', val: `${receta.tiempo} min` },
              { icon: '👥', label: 'PORCIONES', val: '4 pers.' },
              { icon: '📊', label: 'NIVEL', val: receta.dificultad },
              { icon: '🔥', label: 'CALORÍAS', val: `${receta.calorias} kcal` },
            ].map(s => (
              <div key={s.label} className="bib-vc-stat-card">
                <div className="bib-vc-stat-icon">{s.icon}</div>
                <div className="bib-vc-stat-label">{s.label}</div>
                <div className="bib-vc-stat-val">{s.val}</div>
              </div>
            ))}
          </div>

          <div className="bib-vc-actions">
            <button className="bib-vc-btn-print" onClick={() => window.print()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Imprimir Receta
            </button>
            <div className="bib-vc-btn-row">
              <button
                className={`bib-vc-btn-guardar${esFavorito ? ' saved' : ''}`}
                onClick={onToggleFavorito}
              >
                {esFavorito ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff4d6d" stroke="#ff4d6d" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                )}
                {esFavorito ? 'Guardado' : 'Guardar'}
              </button>
              <button className="bib-vc-btn-compartir">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Compartir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card de receta favorita ──────────────────────────────
function RecetaCard({ receta, esFavorito, onToggleFavorito, onVerCompleta }) {
  return (
    <div className="bib-card" onClick={onVerCompleta}>
      <div className="bib-card-inner">
        <div className="bib-card-tags">
          {receta.tags?.map(t => (
            <span key={t} className={`bib-card-tag bib-card-tag--${t.toLowerCase().replace(' ', '-')}`}>
              {t}
            </span>
          ))}
        </div>

        <button
          className={`bib-card-heart${esFavorito ? ' saved' : ''}`}
          onClick={e => { e.stopPropagation(); onToggleFavorito() }}
          title={esFavorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          {esFavorito ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff4d6d" stroke="#ff4d6d" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          )}
        </button>

        <h3 className="bib-card-nombre">{receta.nombre}</h3>
        <p className="bib-card-desc">{receta.descripcion}</p>

        <div className="bib-card-meta">
          <span className="bib-card-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {receta.tiempo} mins
          </span>
          <span className="bib-card-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2h18M3 8h18M3 14l5 5M3 14l5-5"/>
            </svg>
            {receta.dificultad}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────
export default function Biblioteca() {
  // Favoritos solo duran la sesión (sessionStorage)
  const [favoritos, setFavoritos] = useState(() => getFavoritos())
  const [recetaViendo, setRecetaViendo] = useState(null)

  // Sincronizar con sessionStorage cada vez que cambian favoritos
  useEffect(() => {
    saveFavoritos(favoritos)
  }, [favoritos])

  const toggleFavorito = (receta) => {
    setFavoritos(prev => {
      const existe = prev.find(r => r.id === receta.id)
      if (existe) {
        return prev.filter(r => r.id !== receta.id)
      } else {
        return [receta, ...prev]
      }
    })
  }

  const esFavorito = (id) => favoritos.some(r => r.id === id)

  // Si estamos viendo una receta completa
  if (recetaViendo) {
    return (
      <div className="bib-page">
        <div className="bib-container">
          <VistaCompleta
            receta={recetaViendo}
            onVolver={() => setRecetaViendo(null)}
            esFavorito={esFavorito(recetaViendo.id)}
            onToggleFavorito={() => toggleFavorito(recetaViendo)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bib-page">
      <div className="bib-container">
        {/* ── Header ── */}
        <div className="bib-header">
          <div className="bib-header-left">
            <h1 className="bib-titulo">Mi Biblioteca</h1>
            <p className="bib-subtitulo">Gestiona tus creaciones culinarias y favoritos sin distracciones visuales.</p>
          </div>
        </div>

        {/* ── Layout principal ── */}
        <div className="bib-layout">
          {/* Columna izquierda: Favoritos */}
          <div className="bib-col-main">
            <div className="bib-section-header">
              <div className="bib-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff4d6d" stroke="#ff4d6d" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                Recetas Favoritas
              </div>
              {favoritos.length > 0 && (
                <span className="bib-section-count">{favoritos.length} guardadas</span>
              )}
            </div>

            {favoritos.length === 0 ? (
              <div className="bib-empty">
                <div className="bib-empty-icon">💔</div>
                <h3>Aún no tienes favoritos</h3>
                <p>Guarda recetas desde el generador de recetas usando el botón ❤️</p>
                <p className="bib-empty-hint">Los favoritos se reinician al cerrar la pestaña</p>
              </div>
            ) : (
              <div className="bib-cards-list">
                {favoritos.map(receta => (
                  <RecetaCard
                    key={receta.id}
                    receta={receta}
                    esFavorito={esFavorito(receta.id)}
                    onToggleFavorito={() => toggleFavorito(receta)}
                    onVerCompleta={() => setRecetaViendo(receta)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Columna derecha: Historial */}
          <div className="bib-col-side">
            <div className="bib-historial-panel">
              <div className="bib-historial-header">
                <div className="bib-historial-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.65"/>
                  </svg>
                  Historial Reciente
                </div>
                <span className="bib-historial-badge">5/5 espacios</span>
              </div>

              <div className="bib-historial-list">
                {HISTORIAL_DEMO.map(item => (
                  <button
                    key={item.id}
                    className="bib-historial-item"
                    onClick={() => setRecetaViendo(RECETA_DEMO)}
                  >
                    <div className="bib-historial-icon">{item.icono}</div>
                    <div className="bib-historial-info">
                      <span className="bib-historial-nombre">{item.nombre}</span>
                      <span className="bib-historial-tiempo">{item.tiempo}</span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}