import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import Header from './header/Header'

export default function Layout({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
        if (!currentUser) {
            navigate('/')
        } else {
            setUser(currentUser)
        }
        setLoading(false)
        })
        return () => unsub()
    }, [navigate])

    if (loading) return null // o un spinner

    return (
        <>
        <Header user={user} />
        <main>{children}</main>
        </>
    )
}