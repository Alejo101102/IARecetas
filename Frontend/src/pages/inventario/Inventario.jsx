import { useState, useMemo } from "react";
import "./Inventario.css";
import {
  getProductos,
  addProducto,
  deleteProducto,
  updateProducto,
  diasParaVencer,
} from "../store/inventarioStore";

// ─────────────────────────────────────────────────────────────
//  CATEGORÍAS con emoji + color de fondo para el ícono
// ─────────────────────────────────────────────────────────────
const CATEGORIAS = [
  { id: "lacteos", label: "Lácteos", emoji: "🥛", bg: "#eff6ff" },
  { id: "verduras", label: "Verduras", emoji: "🥦", bg: "#f0fdf4" },
  { id: "granos", label: "Granos y Pasta", emoji: "🌾", bg: "#fefce8" },
  { id: "especias", label: "Especias", emoji: "🌶️", bg: "#fff7ed" },
  { id: "carnes", label: "Carnes", emoji: "🥩", bg: "#fef2f2" },
  { id: "frutas", label: "Frutas", emoji: "🍎", bg: "#fdf4ff" },
  { id: "bebidas", label: "Bebidas", emoji: "🧃", bg: "#eff6ff" },
  { id: "otros", label: "Otros", emoji: "📦", bg: "#f9fafb" },
];

const UNIDADES = ["g", "kg", "ml", "L", "unidades"];

const FILTROS = ["Todos", ...CATEGORIAS.map((c) => c.label)];

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────
function getCatInfo(catId) {
  return (
    CATEGORIAS.find((c) => c.id === catId) ||
    CATEGORIAS.find((c) => c.id === "otros")
  );
}

function StatusBadge({ fechaVencimiento }) {
  const dias = diasParaVencer(fechaVencimiento);

  if (dias === null) {
    return (
      <span className="inv-card-status nodate">📅 Sin fecha disponible</span>
    );
  }
  if (dias < 0) {
    return <span className="inv-card-status expired">⛔ Vencido</span>;
  }
  if (dias <= 5) {
    return (
      <span className="inv-card-status expiring">
        ⚠️ Caduca pronto (
        {dias === 0 ? "hoy" : `${dias} día${dias > 1 ? "s" : ""}`})
      </span>
    );
  }
  return <span className="inv-card-status ok">✅ Buen estado</span>;
}

function cardClass(fechaVencimiento) {
  const dias = diasParaVencer(fechaVencimiento);
  if (dias === null) return "inv-card";
  if (dias < 0) return "inv-card expired";
  if (dias <= 5) return "inv-card expiring";
  return "inv-card";
}

// ─────────────────────────────────────────────────────────────
//  MODAL DE AÑADIR PRODUCTO
// ─────────────────────────────────────────────────────────────
const FORM_INIT = {
  nombre: "",
  cantidad: "",
  unidad: "g",
  categoria: "lacteos",
  tieneFecha: false,
  fechaVencimiento: "",
};

function ModalAgregarProducto({ onClose, onAdd }) {
  const [form, setForm] = useState(FORM_INIT);
  const [error, setError] = useState("");

  const set = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.nombre.trim()) return setError("El nombre es obligatorio.");
    if (!form.cantidad || isNaN(form.cantidad) || Number(form.cantidad) <= 0)
      return setError("Ingresa una cantidad válida.");
    setError("");
    onAdd({
      nombre: form.nombre.trim(),
      cantidad: Number(form.cantidad),
      unidad: form.unidad,
      categoria: form.categoria,
      fechaVencimiento: form.tieneFecha ? form.fechaVencimiento : null,
    });
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <h2>➕ Añadir Producto</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Nombre */}
          <div className="form-group">
            <label>Nombre del producto</label>
            <input
              type="text"
              placeholder="Ej: Leche entera"
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              autoFocus
            />
          </div>

          {/* Cantidad + Unidad */}
          <div className="form-group">
            <label>Cantidad</label>
            <div className="form-qty-row">
              <input
                type="number"
                placeholder="Ej: 500"
                min="0"
                value={form.cantidad}
                onChange={(e) => set("cantidad", e.target.value)}
              />
              <select
                value={form.unidad}
                onChange={(e) => set("unidad", e.target.value)}
              >
                {UNIDADES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Categoría */}
          <div className="form-group">
            <label>Categoría</label>
            <select
              value={form.categoria}
              onChange={(e) => set("categoria", e.target.value)}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha de vencimiento (opcional) */}
          <div className="form-group">
            <label
              className="form-date-toggle"
              onClick={() => set("tieneFecha", !form.tieneFecha)}
            >
              <input
                type="checkbox"
                checked={form.tieneFecha}
                onChange={() => set("tieneFecha", !form.tieneFecha)}
                onClick={(e) => e.stopPropagation()}
              />
              <span>
                Agregar fecha de vencimiento <span>(opcional)</span>
              </span>
            </label>
            {form.tieneFecha && (
              <input
                type="date"
                value={form.fechaVencimiento}
                onChange={(e) => set("fechaVencimiento", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            )}
          </div>

          {error && (
            <p style={{ color: "var(--red)", fontSize: 13, margin: 0 }}>
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={!form.nombre || !form.cantidad}
          >
            Añadir producto
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MODAL DE EDITAR PRODUCTO
// ─────────────────────────────────────────────────────────────
function ModalEditarProducto({ producto, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: producto.nombre,
    cantidad: producto.cantidad,
    unidad: producto.unidad,
    categoria: producto.categoria,
    tieneFecha: !!producto.fechaVencimiento,
    fechaVencimiento: producto.fechaVencimiento || "",
  });
  const [error, setError] = useState("");

  const set = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.nombre.trim()) return setError("El nombre es obligatorio.");
    if (!form.cantidad || isNaN(form.cantidad) || Number(form.cantidad) <= 0)
      return setError("Ingresa una cantidad válida.");
    setError("");
    onSave({
      ...producto,
      nombre: form.nombre.trim(),
      cantidad: Number(form.cantidad),
      unidad: form.unidad,
      categoria: form.categoria,
      fechaVencimiento: form.tieneFecha ? form.fechaVencimiento : null,
    });
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <h2>✏️ Editar Producto</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Nombre del producto</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Cantidad</label>
            <div className="form-qty-row">
              <input
                type="number"
                min="0"
                value={form.cantidad}
                onChange={(e) => set("cantidad", e.target.value)}
              />
              <select
                value={form.unidad}
                onChange={(e) => set("unidad", e.target.value)}
              >
                {UNIDADES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Categoría</label>
            <select
              value={form.categoria}
              onChange={(e) => set("categoria", e.target.value)}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label
              className="form-date-toggle"
              onClick={() => set("tieneFecha", !form.tieneFecha)}
            >
              <input
                type="checkbox"
                checked={form.tieneFecha}
                onChange={() => set("tieneFecha", !form.tieneFecha)}
                onClick={(e) => e.stopPropagation()}
              />
              <span>
                Fecha de vencimiento <span>(opcional)</span>
              </span>
            </label>
            {form.tieneFecha && (
              <input
                type="date"
                value={form.fechaVencimiento}
                onChange={(e) => set("fechaVencimiento", e.target.value)}
              />
            )}
          </div>

          {error && (
            <p style={{ color: "var(--red)", fontSize: 13, margin: 0 }}>
              ⚠️ {error}
            </p>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={!form.nombre || !form.cantidad}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MODAL CONFIRMAR ELIMINACIÓN
// ─────────────────────────────────────────────────────────────
function ModalConfirmarEliminar({ producto, onClose, onConfirm }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <h2>Eliminar producto</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div
            style={{
              background: "var(--red-light)",
              color: "var(--red)",
              padding: "12px 14px",
              borderRadius: "var(--radius-sm)",
              fontSize: 13.5,
              fontWeight: 500,
            }}
          >
            Esta acción no se puede deshacer.
          </div>

          <div>
            <p
              style={{
                margin: "0 0 6px",
                fontSize: 14,
                color: "var(--text-secondary)",
              }}
            >
              ¿Estás seguro que deseas eliminar:
            </p>

            <p
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.2px",
              }}
            >
              {producto.nombre}
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>

          <button
            className="btn-submit btn-danger"
            onClick={() => onConfirm(producto.id)}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function Inventario() {
  const [productos, setProductos] = useState(() => getProductos());
  const [modalOpen, setModalOpen] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("Todos");

  // TODO (Backend): reemplaza getProductos() por fetch al API
  // useEffect(() => {
  //   fetch(`${API_BASE}/inventario`)
  //     .then(r => r.json())
  //     .then(data => setProductos(data))
  // }, [])

  const handleAdd = (producto) => {
    // TODO (Backend): POST al API y luego refrescar lista
    const updated = addProducto(producto);
    setProductos(updated);
    setModalOpen(false);
  };

  const [productoAEliminar, setProductoAEliminar] = useState(null);

  const handleDelete = (id) => {
    const updated = deleteProducto(id);
    setProductos(updated);
    setProductoAEliminar(null);
  };

  const handleEdit = (productoActualizado) => {
    // TODO (Backend): PUT al API
    const updated = updateProducto(productoActualizado);
    setProductos(updated);
    setProductoEditando(null);
  };

  // Filtrado reactivo
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const matchBusqueda = p.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());
      const catInfo = getCatInfo(p.categoria);
      const matchFiltro = filtro === "Todos" || catInfo?.label === filtro;
      return matchBusqueda && matchFiltro;
    });
  }, [productos, busqueda, filtro]);

  return (
    <div className="inv-page">
      <div className="inv-container">
        {/* ── Header ── */}
        <div className="inv-header">
          <div className="inv-header-left">
            <h1>Inventario</h1>
            <p>Gestiona tus ingredientes y descubre qué cocinar hoy.</p>
          </div>

          <div className="inv-header-right">
            {/* Búsqueda */}
            <div className="inv-search">
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Buscar ingredientes..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Añadir producto */}
            <button className="inv-add-btn" onClick={() => setModalOpen(true)}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Añadir Producto
            </button>
          </div>
        </div>

        {/* ── Filtros ── */}
        <div className="inv-filters">
          {FILTROS.map((f) => (
            <button
              key={f}
              className={`inv-filter-btn${filtro === f ? " active" : ""}`}
              onClick={() => setFiltro(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Grid de cards ── */}
        <div className="inv-grid">
          {productosFiltrados.length === 0 ? (
            <div className="inv-empty">
              <div className="inv-empty-icon">🥗</div>
              <h3>
                {busqueda || filtro !== "Todos"
                  ? "No se encontraron productos"
                  : "Tu despensa está vacía"}
              </h3>
              <p>
                {busqueda || filtro !== "Todos"
                  ? "Prueba con otro término o categoría."
                  : "Añade tu primer producto con el botón de arriba."}
              </p>
            </div>
          ) : (
            productosFiltrados.map((p) => {
              const cat = getCatInfo(p.categoria);
              return (
                <div key={p.id} className={cardClass(p.fechaVencimiento)}>
                  {/* Acciones: editar + eliminar */}
                  <div className="inv-card-actions">
                    <button
                      className="inv-card-edit"
                      onClick={() => setProductoEditando(p)}
                      title="Editar"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="inv-card-delete"
                      onClick={() => setProductoAEliminar(p)}
                      title="Eliminar"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>

                  {/* Icon */}
                  <div className="inv-card-icon" style={{ background: cat.bg }}>
                    {cat.emoji}
                  </div>

                  {/* Name */}
                  <p className="inv-card-name">{p.nombre}</p>

                  {/* Quantity */}
                  <div className="inv-card-qty-row">
                    <span className="inv-card-qty-label">Cantidad</span>
                    <span className="inv-card-qty-value">
                      {p.cantidad} {p.unidad}
                    </span>
                  </div>

                  {/* Status */}
                  <StatusBadge fechaVencimiento={p.fechaVencimiento} />
                </div>
              );
            })
          )}

          {/* Card placeholder para añadir */}
          {productosFiltrados.length > 0 && (
            <button className="inv-card-add" onClick={() => setModalOpen(true)}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Añadir Nuevo</span>
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                Agrega un nuevo ingrediente
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ── Modal añadir ── */}
      {modalOpen && (
        <ModalAgregarProducto
          onClose={() => setModalOpen(false)}
          onAdd={handleAdd}
        />
      )}

      {/* ── Modal editar ── */}
      {productoEditando && (
        <ModalEditarProducto
          producto={productoEditando}
          onClose={() => setProductoEditando(null)}
          onSave={handleEdit}
        />
      )}

      {productoAEliminar && (
        <ModalConfirmarEliminar
          producto={productoAEliminar}
          onClose={() => setProductoAEliminar(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
