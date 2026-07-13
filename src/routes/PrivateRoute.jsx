import React, { useEffect, useState, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../api'

export default function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const intervalRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      // no token -> no need to call backend
      setAuthed(false)
      setLoading(false)
      return
    }

    // Start countdown for UX (3s)
    setCountdown(3)
    intervalRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(intervalRef.current)
          return 0
        }
        return c - 1
      })
    }, 1000)

    api.get('/auth/me')
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false))
      .finally(() => {
        setLoading(false)
        if (intervalRef.current) clearInterval(intervalRef.current)
      })
  }, [])

  if (loading) return <div className="p-8">Chargement... {countdown > 0 ? `(${countdown})` : ''}</div>
  if (!authed) return <Navigate to="/login" replace />
  return children
}
