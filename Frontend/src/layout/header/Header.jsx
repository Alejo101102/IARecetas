import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase'
import './Header.css'

const BrandIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
    </svg>
    )

    const GearIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
    )

    const ProfileIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
    )

    const LogoutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
    )

    const HelpIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
    )

    const NAV_LINKS = [
        { to: '/inventario', label: 'Mi Despensa' },
        { to: '/recetas',   label: 'Generación de Recetas' },
        { to: '/biblioteca', label: 'Mi Biblioteca' },
    ]

    export default function Header({ user }) {
        const [settingsOpen, setSettingsOpen] = useState(false)
        const dropdownRef = useRef(null)
        const navigate = useNavigate()

        // Cierra el dropdown al hacer click fuera
        useEffect(() => {
            const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setSettingsOpen(false)
            }
            }
            if (settingsOpen) document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }, [settingsOpen])

        const handleLogout = async () => {
            try {
            await signOut(auth)
            navigate('/')
            } catch (err) {
            console.error('Error al cerrar sesión:', err)
            }
        }

        return (
            <header className="header">
            <div className="header-inner">

                {/* Brand */}
                <NavLink to="/inventario" className="header-brand">
                <div className="header-brand-icon">
                    <BrandIcon />
                </div>
                <span className="header-brand-name">Mi Despensa</span>
                </NavLink>

                {/* Nav central */}
                <nav className="header-nav">
                {NAV_LINKS.map(({ to, label }) => (
                    <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    >
                    {label}
                    </NavLink>
                ))}
                </nav>

                {/* Acciones */}
                <div className="header-actions">

                {/* Botón settings */}
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                    <button
                    className={`settings-btn${settingsOpen ? ' open' : ''}`}
                    onClick={() => setSettingsOpen(prev => !prev)}
                    aria-label="Ajustes"
                    >
                    <GearIcon />
                    </button>

                    {settingsOpen && (
                    <div className="settings-dropdown">
                        <div className="settings-dropdown-header">Cuenta</div>

                        <button className="settings-dropdown-item">
                        <ProfileIcon />
                        Mi perfil
                        </button>

                        <button className="settings-dropdown-item">
                        <HelpIcon />
                        Ayuda
                        </button>

                        <div className="settings-dropdown-divider" />

                        <button className="settings-dropdown-item danger" onClick={handleLogout}>
                        <LogoutIcon />
                        Cerrar sesión
                        </button>
                    </div>
                    )}
                </div>
                </div>

            </div>
            </header>
        )
}