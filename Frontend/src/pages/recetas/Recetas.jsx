import { useState } from 'react'
import './Recetas.css'

// ─── Productos del inventario (los mismos del store) ───────
function getProductos() {
  try {
    const raw = localStorage.getItem('iarecetas_inventario')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

// ─── Helpers para sincronizar favoritos con Biblioteca ────
const BIB_KEY = 'iarecetas_biblioteca'

function getBiblioteca() {
  try {
    const raw = sessionStorage.getItem(BIB_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function isEnBiblioteca(id) {
  return getBiblioteca().some(r => r.id === id)
}

function toggleBiblioteca(receta) {
  const lista = getBiblioteca()
  const existe = lista.find(r => r.id === receta.id)
  const nueva = existe
    ? lista.filter(r => r.id !== receta.id)
    : [receta, ...lista]
  try {
    sessionStorage.setItem(BIB_KEY, JSON.stringify(nueva))
  } catch {
    // Ignora errores de almacenamiento (modo privado o storage bloqueado).
  }
  return !existe // retorna si quedó guardado
}

// ─── Receta quemada de prueba ───────────────────────────────
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

// ─── Ingredientes del inventario mapeados ──────────────────
const CATEGORIAS_ICON = {
  lacteos: '🥛', verduras: '🥦', granos: '🌾',
  especias: '🌶️', carnes: '🥩', frutas: '🍎',
  bebidas: '🧃', otros: '📦',
}

// ─── Componente: Panel izquierdo (Tu Despensa) ────────────
function PanelDespensa({ productos, ingredientesSeleccionados, onToggle }) {
  const grouped = {}
  productos.forEach(p => {
    const cat = p.categoria || 'otros'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(p)
  })

  if (productos.length === 0) {
    return (
      <div className="rec-panel rec-panel-despensa">
        <div className="rec-panel-title">
          <span className="rec-panel-icon">🏪</span>
          Tu Despensa
        </div>
        <p className="rec-panel-sub">Selecciona los ingredientes disponibles</p>
        <div className="rec-empty-despensa">
          <span>🥗</span>
          <p>Añade productos en tu inventario para verlos aquí</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rec-panel rec-panel-despensa">
      <div className="rec-panel-title">
        <span className="rec-panel-icon">🏪</span>
        Tu Despensa
      </div>
      <p className="rec-panel-sub">Selecciona los ingredientes disponibles</p>

      <div className="rec-despensa-list">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="rec-despensa-group">
            <div className="rec-despensa-cat">
              {CATEGORIAS_ICON[cat] || '📦'} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </div>
            {items.map(p => {
              const sel = ingredientesSeleccionados.includes(p.id)
              return (
                <label key={p.id} className={`rec-despensa-item${sel ? ' selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={sel}
                    onChange={() => onToggle(p.id)}
                  />
                  <span className="rec-despensa-name">{p.nombre}</span>
                  <span className="rec-despensa-qty">{p.cantidad}{p.unidad}</span>
                </label>
              )
            })}
          </div>
        ))}
      </div>

      <button className="rec-add-manual">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Añadir ingrediente manual
      </button>
    </div>
  )
}

// ─── Componente: Panel central (Objetivo + Preferencias) ──
function PanelConfig({ objetivo, setObjetivo, tiempo, setTiempo, bajoCal, setBajoCal, unaOlla, setUnaOlla }) {
  const OBJETIVOS = ['Equilibrado', 'Bajar de peso', 'Ganar músculo', 'Vegano']

  return (
    <div className="rec-panel-center">
      {/* Objetivo nutricional */}
      <div className="rec-panel rec-panel-small">
        <div className="rec-panel-title">
          <span className="rec-panel-icon">🎯</span>
          Objetivo Nutricional
        </div>
        <div className="rec-obj-grid">
          {OBJETIVOS.map(o => (
            <button
              key={o}
              className={`rec-obj-btn${objetivo === o ? ' active' : ''}`}
              onClick={() => setObjetivo(o)}
            >
              {o}
            </button>
          ))}
        </div>

        <div className="rec-tiempo-section">
          <div className="rec-panel-label">Tiempo disponible</div>
          <div className="rec-tiempo-slider">
            <input
              type="range"
              min={15}
              max={130}
              step={5}
              value={tiempo}
              onChange={e => setTiempo(Number(e.target.value))}
            />
            <div className="rec-tiempo-marks">
              <span>15 min</span>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>{tiempo} min</span>
              <span>2h+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferencias */}
      <div className="rec-panel rec-panel-small">
        <div className="rec-panel-title">
          <span className="rec-panel-icon">⚙️</span>
          Preferencias
        </div>
        <div className="rec-pref-list">
          <div className="rec-pref-item">
            <div className="rec-pref-left">
              <span className="rec-pref-icon">🔥</span>
              <span className="rec-pref-label">Bajo en calorías</span>
            </div>
            <button
              className={`rec-toggle${bajoCal ? ' on' : ''}`}
              onClick={() => setBajoCal(p => !p)}
            >
              <span className="rec-toggle-thumb" />
            </button>
          </div>
          <div className="rec-pref-item">
            <div className="rec-pref-left">
              <span className="rec-pref-icon">🍳</span>
              <span className="rec-pref-label">Solo una olla</span>
            </div>
            <button
              className={`rec-toggle${unaOlla ? ' on' : ''}`}
              onClick={() => setUnaOlla(p => !p)}
            >
              <span className="rec-toggle-thumb" />
            </button>
          </div>
        </div>
      </div>

      {/* Botón generar */}
      <button className="rec-generar-btn" id="generar-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        Generar Receta con IA
      </button>
    </div>
  )
}

// ─── Componente: Panel derecho (Receta resultado) ──────────
function PanelReceta({ receta, onVerCompleta, guardada, onGuardar }) {
  if (!receta) return null

  return (
    <div className="rec-panel rec-panel-result">
      {/* Imagen hero */}
      <div className="rec-result-hero">
        <img src={receta.imagen} alt={receta.nombre} />
        <div className="rec-result-overlay">
          <div className="rec-result-badges">
            <span className="rec-match-badge">⭐ {receta.match}% MATCH</span>
            <span className="rec-info-badge">⏱ {receta.tiempo} min</span>
            <span className="rec-info-badge">📊 {receta.dificultad}</span>
          </div>
          <div className="rec-result-title-row">
            <h2 className="rec-result-title">{receta.nombre}</h2>
            <button
              className={`rec-heart-btn${guardada ? ' saved' : ''}`}
              onClick={onGuardar}
              title={guardada ? 'Guardado en biblioteca' : 'Guardar en biblioteca'}
            >
              {guardada ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#ff4d6d" stroke="#ff4d6d" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="rec-macros">
        {[
          { label: 'CALORÍAS', val: receta.calorias, unit: '' },
          { label: 'PROTEÍNA', val: receta.proteina, unit: 'g' },
          { label: 'CARBOS',   val: receta.carbos,   unit: 'g' },
          { label: 'GRASAS',   val: receta.grasas,   unit: 'g' },
        ].map(m => (
          <div key={m.label} className="rec-macro-item">
            <span className="rec-macro-label">{m.label}</span>
            <span className="rec-macro-val">{m.val}{m.unit}</span>
          </div>
        ))}
      </div>

      {/* Instrucciones (preview) */}
      <div className="rec-instrucciones">
        <div className="rec-inst-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          Instrucciones
        </div>
        {receta.instrucciones.slice(0, 3).map(inst => (
          <div key={inst.paso} className="rec-inst-item">
            <div className="rec-inst-num">{inst.paso}</div>
            <div>
              <div className="rec-inst-step-title">{inst.titulo}</div>
              <div className="rec-inst-step-desc">{inst.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="rec-ver-completa" onClick={onVerCompleta}>
        Ver receta completa
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </div>
  )
}

// ─── Componente: Vista completa de receta ─────────────────
function VistaCompleta({ receta, onVolver, guardada, onGuardar }) {
  const [ingredientesMarcados, setIngredientesMarcados] = useState([])

  const toggleIngrediente = (idx) => {
    setIngredientesMarcados(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  return (
    <div className="rec-vista-completa">
      {/* Back */}
      <button className="rec-volver" onClick={onVolver}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Volver a Generación de Recetas
      </button>

      <div className="rec-vc-grid">
        {/* Columna izquierda */}
        <div className="rec-vc-left">
          <div className="rec-vc-tag">RECETA GENERADA</div>
          <h1 className="rec-vc-titulo">{receta.nombre}</h1>
          <p className="rec-vc-desc">{receta.descripcion}</p>

          {/* Ingredientes */}
          <div className="rec-vc-section">
            <div className="rec-vc-section-title">
              <div className="rec-vc-accent" />
              Ingredientes
            </div>
            <div className="rec-vc-ingredientes">
              {receta.ingredientes.map((ing, idx) => (
                <label key={idx} className={`rec-vc-ing-item${ingredientesMarcados.includes(idx) ? ' checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={ingredientesMarcados.includes(idx)}
                    onChange={() => toggleIngrediente(idx)}
                  />
                  <div>
                    <div className="rec-vc-ing-name">{ing.nombre}</div>
                    <div className="rec-vc-ing-detail">{ing.detalle}</div>
                  </div>
                </label>
              ))}
              <button className="rec-vc-add-lista">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                Añadir a la lista de compras
              </button>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="rec-vc-section">
            <div className="rec-vc-section-title">
              <div className="rec-vc-accent" />
              Instrucciones
            </div>
            <div className="rec-vc-instrucciones">
              {receta.instrucciones.map(inst => (
                <div key={inst.paso} className="rec-vc-inst-item">
                  <div className="rec-vc-inst-num">{inst.paso}</div>
                  <div className="rec-vc-inst-content">
                    <div className="rec-vc-inst-titulo">{inst.titulo}</div>
                    <div className="rec-vc-inst-desc">{inst.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="rec-vc-right">
          {/* Stats cards */}
          <div className="rec-vc-stats-grid">
            {[
              { icon: '⏱', label: 'PREP', val: `${receta.tiempo} min` },
              { icon: '👥', label: 'PORCIONES', val: '4 pers.' },
              { icon: '📊', label: 'NIVEL', val: receta.dificultad },
              { icon: '🔥', label: 'CALORÍAS', val: `${receta.calorias} kcal` },
            ].map(s => (
              <div key={s.label} className="rec-vc-stat-card">
                <div className="rec-vc-stat-icon">{s.icon}</div>
                <div className="rec-vc-stat-label">{s.label}</div>
                <div className="rec-vc-stat-val">{s.val}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="rec-vc-actions">
            <button className="rec-vc-btn-print">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Imprimir Receta
            </button>
            <div className="rec-vc-btn-row">
              <button
                className={`rec-vc-btn-guardar${guardada ? ' saved' : ''}`}
                onClick={onGuardar}
              >
                {guardada ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff4d6d" stroke="#ff4d6d" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                )}
                {guardada ? 'Guardado' : 'Guardar'}
              </button>
              <button className="rec-vc-btn-compartir">
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

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────
export default function Recetas() {
  const productos = getProductos()
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState(
    productos.slice(0, 4).map(p => p.id)
  )
  const [objetivo, setObjetivo] = useState('Equilibrado')
  const [tiempo, setTiempo] = useState(30)
  const [bajoCal, setBajoCal] = useState(false)
  const [unaOlla, setUnaOlla] = useState(false)
  const [recetaGenerada, setRecetaGenerada] = useState(null)
  const [generando, setGenerando] = useState(false)
  const [verCompleta, setVerCompleta] = useState(false)
  const [guardada, setGuardada] = useState(() => isEnBiblioteca(RECETA_DEMO.id))

  const toggleIngrediente = (id) => {
    setIngredientesSeleccionados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleGenerar = () => {
    setGenerando(true)
    setRecetaGenerada(null)
    setTimeout(() => {
      setRecetaGenerada(RECETA_DEMO)
      setGenerando(false)
    }, 1400)
  }

  const handleGuardar = () => {
    if (recetaGenerada) {
      const ahora = toggleBiblioteca(recetaGenerada)
      setGuardada(ahora)
    }
  }

  if (verCompleta && recetaGenerada) {
    return (
      <div className="rec-page">
        <div className="rec-container">
          <VistaCompleta
            receta={recetaGenerada}
            onVolver={() => setVerCompleta(false)}
            guardada={guardada}
            onGuardar={handleGuardar}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="rec-page">
      <div className="rec-container">
        <div className="rec-layout">
          {/* Columna izquierda: Tu Despensa */}
          <PanelDespensa
            productos={productos}
            ingredientesSeleccionados={ingredientesSeleccionados}
            onToggle={toggleIngrediente}
          />

          {/* Columna central: Config + Generar */}
          <div className="rec-panel-center">
            <div className="rec-panel rec-panel-small">
              <div className="rec-panel-title">
                <span className="rec-panel-icon">🎯</span>
                Objetivo Nutricional
              </div>
              <div className="rec-obj-grid">
                {['Equilibrado', 'Bajar de peso', 'Ganar músculo', 'Vegano'].map(o => (
                  <button
                    key={o}
                    className={`rec-obj-btn${objetivo === o ? ' active' : ''}`}
                    onClick={() => setObjetivo(o)}
                  >{o}</button>
                ))}
              </div>
              <div className="rec-tiempo-section">
                <div className="rec-panel-label">Tiempo disponible</div>
                <div className="rec-tiempo-slider">
                  <input
                    type="range" min={15} max={130} step={5}
                    value={tiempo}
                    onChange={e => setTiempo(Number(e.target.value))}
                  />
                  <div className="rec-tiempo-marks">
                    <span>15 min</span>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>{tiempo} min</span>
                    <span>2h+</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rec-panel rec-panel-small">
              <div className="rec-panel-title">
                <span className="rec-panel-icon">⚙️</span>
                Preferencias
              </div>
              <div className="rec-pref-list">
                {[
                  { label: 'Bajo en calorías', icon: '🔥', val: bajoCal, set: setBajoCal },
                  { label: 'Solo una olla',    icon: '🍳', val: unaOlla, set: setUnaOlla },
                ].map(pref => (
                  <div key={pref.label} className="rec-pref-item">
                    <div className="rec-pref-left">
                      <span className="rec-pref-icon">{pref.icon}</span>
                      <span className="rec-pref-label">{pref.label}</span>
                    </div>
                    <button
                      className={`rec-toggle${pref.val ? ' on' : ''}`}
                      onClick={() => pref.set(p => !p)}
                    >
                      <span className="rec-toggle-thumb" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              className={`rec-generar-btn${generando ? ' loading' : ''}`}
              onClick={handleGenerar}
              disabled={generando}
            >
              {generando ? (
                <>
                  <span className="rec-spinner" />
                  Generando receta...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  Generar Receta con IA
                </>
              )}
            </button>
          </div>

          {/* Columna derecha: Resultado */}
          <div className="rec-panel rec-panel-result">
            {!recetaGenerada && !generando && (
              <div className="rec-result-placeholder">
                <div className="rec-placeholder-icon">🍽️</div>
                <h3>Tu receta aparecerá aquí</h3>
                <p>Selecciona ingredientes y haz clic en <strong>Generar Receta con IA</strong></p>
              </div>
            )}

            {generando && (
              <div className="rec-result-placeholder">
                <div className="rec-generating-anim">
                  <div className="rec-gen-circle" />
                  <div className="rec-gen-circle" />
                  <div className="rec-gen-circle" />
                </div>
                <h3>Creando tu receta perfecta...</h3>
                <p>Analizando tus ingredientes y preferencias</p>
              </div>
            )}

            {recetaGenerada && !generando && (
              <PanelReceta
                receta={recetaGenerada}
                onVerCompleta={() => setVerCompleta(true)}
                guardada={guardada}
                onGuardar={handleGuardar}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}