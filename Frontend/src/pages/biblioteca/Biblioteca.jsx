import { useState, useEffect } from "react";
import "./Biblioteca.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Vista completa de receta ─────────────────────────────
function VistaCompleta({ receta, onVolver, esFavorito, onToggleFavorito }) {
  const [ingredientesMarcados, setIngredientesMarcados] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleIngrediente = (idx) => {
    setIngredientesMarcados((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  return (
    <div className="bib-vista-completa">
      <button className="bib-volver" onClick={onVolver}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Volver a Mi Biblioteca
      </button>

      <div className="bib-vc-grid">
        {/* Izquierda */}
        <div className="bib-vc-left">
          <div className="bib-vc-tags">
            {receta.tags?.map((t, idx) => (
              <span key={`${t}-${idx}`} className="bib-vc-tag">
                {t}
              </span>
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
                <label
                  key={ing.nombre || idx}
                  className={`bib-vc-ing-item${ingredientesMarcados.includes(idx) ? " checked" : ""}`}
                >
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
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
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
              {receta.instrucciones.map((inst) => (
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
            <img
              src={
                receta.imagen ||
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
              }
              alt={receta.nombre}
            />
          </div>

          <div className="bib-vc-stats-grid">
            {[
              { icon: "⏱", label: "PREP", val: `${receta.tiempo} min` },
              { icon: "👥", label: "PORCIONES", val: "4 pers." },
              { icon: "📊", label: "NIVEL", val: receta.dificultad },
              { icon: "🔥", label: "CALORÍAS", val: `${receta.calorias} kcal` },
            ].map((s) => (
              <div key={s.label} className="bib-vc-stat-card">
                <div className="bib-vc-stat-icon">{s.icon}</div>
                <div className="bib-vc-stat-label">{s.label}</div>
                <div className="bib-vc-stat-val">{s.val}</div>
              </div>
            ))}
          </div>

          <div className="bib-vc-actions">
            <button className="bib-vc-btn-print" onClick={() => window.print()}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Imprimir Receta
            </button>
            <div className="bib-vc-btn-row">
              <button
                className={`bib-vc-btn-guardar${esFavorito ? " saved" : ""}`}
                onClick={onToggleFavorito}
              >
                {esFavorito ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="#ff4d6d"
                    stroke="#ff4d6d"
                    strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                )}
                {esFavorito ? "Guardado" : "Guardar"}
              </button>
              <button className="bib-vc-btn-compartir">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Compartir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Card de receta favorita ──────────────────────────────
function RecetaCard({ receta, esFavorito, onToggleFavorito, onVerCompleta }) {
  return (
    <div className="bib-card" onClick={onVerCompleta}>
      <div className="bib-card-img">
        <img
          src={
            receta.imagen ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
          }
          alt={receta.nombre}
        />
      </div>
      <div className="bib-card-inner">
        <div className="bib-card-tags">
          {receta.tags?.map((t) => (
            <span
              key={t}
              className={`bib-card-tag bib-card-tag--${t.toLowerCase().replace(" ", "-")}`}
            >
              {t}
            </span>
          ))}
        </div>

        <button
          className={`bib-card-heart${esFavorito ? " saved" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorito();
          }}
          title={esFavorito ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          {esFavorito ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="#ff4d6d"
              stroke="#ff4d6d"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ccc"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </button>

        <h3 className="bib-card-nombre">{receta.nombre}</h3>
        <p className="bib-card-desc">{receta.descripcion}</p>

        <div className="bib-card-meta">
          <span className="bib-card-meta-item">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {receta.tiempo} mins
          </span>
          <span className="bib-card-meta-item">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 2h18M3 8h18M3 14l5 5M3 14l5-5" />
            </svg>
            {receta.dificultad}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────

const iconosHistorial = ["🥘", "🍝", "🥗", "🍳", "🍲"];

function formatFecha(date) {
  if (!date) return "";

  const d = date._seconds ? new Date(date._seconds * 1000) : new Date(date);

  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const año = d.getFullYear();

  return `${dia}/${mes}/${año}`;
}

export default function Biblioteca() {
  // Favoritos solo duran la sesión (sessionStorage)
  const [favoritos, setFavoritos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [recetaViendo, setRecetaViendo] = useState(null);

  const esFavorito = (id) => favoritos.some((r) => r.id === id);

  const cargarHistorial = async () => {
    try {
      const uid = sessionStorage.getItem("uid");

      const res = await fetch(`${API_BASE}/api/history/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });

      const data = await res.json();

      if (!Array.isArray(data)) {
        setHistorial([]);
        return;
      }

      const historialNormalizado = data.map((item) => ({
        id: item.id,
        history_id: item.id,

        nombre: item.recipe?.titulo || "Receta",
        descripcion: item.recipe?.descripcion || "",
        tiempo: item.recipe?.tiempo_estimado || 0,
        dificultad: item.recipe?.dificultad || "Media",

        ingredientes:
          item.recipe?.ingredientes?.map((ing) => ({
            nombre: ing.nombre || "Ingrediente",
            detalle: ing.cantidad || "",
          })) || [],

        instrucciones:
          item.recipe?.instrucciones?.map((inst, i) => ({
            paso: i + 1,
            titulo: `Paso ${i + 1}`,
            desc: inst,
          })) || [],

        calorias: item.recipe?.calorias || 0,
        porciones: item.recipe?.porciones || 1,

        date: item.date,
      }));

      setHistorial(historialNormalizado);
    } catch (error) {
      console.error("Error cargando historial:", error);
      setHistorial([]);
    }
  };

  const cargarFavoritos = async () => {
    try {
      const uid = sessionStorage.getItem("uid");
      console.log("UID encontrado:", uid);

      const res = await fetch(`${API_BASE}/api/favorites/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });

      const data = await res.json();

      const recetas = data.map((f) => ({
        id: f.original_history_id,
        fav_id: f.fav_id,
        history_id: f.original_history_id,

        // 🔹 CAMPOS CORRECTOS SEGÚN FIREBASE
        nombre: f.recipe?.titulo || "Receta",
        descripcion: f.recipe?.descripcion || "",
        tiempo: f.recipe?.tiempo_estimado || 0,
        dificultad: f.recipe?.dificultad || "Media",

        imagen:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",

        ingredientes: f.recipe?.ingredientes || [],
        instrucciones:
          f.recipe?.instrucciones?.map((inst, i) => ({
            paso: i + 1,
            titulo: `Paso ${i + 1}`,
            desc: typeof inst === "string" ? inst : inst.desc || "",
          })) || [],
        calorias: f.recipe?.calorias || 0,
        porciones: f.recipe?.porciones || 1,
      }));

      setFavoritos(recetas);
    } catch (error) {
      console.error("Error cargando favoritos:", error);
    }
  };

  const toggleFavorito = async (receta) => {
    const uid = sessionStorage.getItem("uid");
    console.log("UID encontrado:", uid);

    if (esFavorito(receta.id)) {
      const fav = favoritos.find((f) => f.id === receta.id);

      await fetch(`${API_BASE}/api/favorites/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          fav_id: fav.fav_id,
        }),
      });
    } else {
      await fetch(`${API_BASE}/api/favorites/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          history_id: receta.history_id,
        }),
      });
    }

    cargarFavoritos();
  };

  useEffect(() => {
    const cargarDatos = async () => {
      await cargarHistorial();
      await cargarFavoritos();
    };

    cargarDatos();
  }, []);

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
    );
  }

  return (
    <div className="bib-page">
      <div className="bib-container">
        {/* ── Header ── */}
        <div className="bib-header">
          <div className="bib-header-left">
            <h1 className="bib-titulo">Mi Biblioteca</h1>
            <p className="bib-subtitulo">
              Gestiona tus creaciones culinarias y favoritos sin distracciones
              visuales.
            </p>
          </div>
        </div>

        {/* ── Layout principal ── */}
        <div className="bib-layout">
          {/* Columna izquierda: Favoritos */}
          <div className="bib-col-main">
            <div className="bib-section-header">
              <div className="bib-section-title">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="#ff4d6d"
                  stroke="#ff4d6d"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Recetas Favoritas
              </div>
              {favoritos.length > 0 && (
                <span className="bib-section-count">
                  {favoritos.length} guardadas
                </span>
              )}
            </div>

            {favoritos.length === 0 ? (
              <div className="bib-empty">
                <div className="bib-empty-icon">💔</div>
                <h3>Aún no tienes favoritos</h3>
                <p>
                  Guarda recetas desde el generador de recetas usando el botón
                  ❤️
                </p>
                <p className="bib-empty-hint">
                  Los favoritos se reinician al cerrar la pestaña
                </p>
              </div>
            ) : (
              <div className="bib-cards-list">
                {favoritos.map((receta) => (
                  <RecetaCard
                    key={receta.fav_id}
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
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 .49-4.65" />
                  </svg>
                  Historial Reciente
                </div>
                <span className="bib-historial-badge">5/5 espacios</span>
              </div>

              <div className="bib-historial-list">
                {Array.isArray(historial) &&
                  historial.slice(0, 5).map((item, index) => (
                    <button
                      key={item.id || index}
                      className="bib-historial-item"
                      onClick={() => setRecetaViendo(item)}
                    >
                      <div className="bib-historial-icon">
                        {iconosHistorial[index] || "🍽️"}
                      </div>
                      <div className="bib-historial-info">
                        <span className="bib-historial-nombre">
                          {item.nombre}
                        </span>

                        <span className="bib-historial-tiempo">
                          {formatFecha(item.date)}
                        </span>
                      </div>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ccc"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                      </svg>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
