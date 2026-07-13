import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Login from './Login'
import NewsPage from './NewsPage'
import ActionPage from './ActionPage'
import ProjectPage from './ProjectPage'
import TestimonialsPage from './TestimonialsPage'
import MessagesPage from './MessagesPage'
import SubscribersPage from './SubscribersPage'
import UsersPage from './UsersPage'
import PrivateRoute from './routes/PrivateRoute'
import AdminLayout from './AdminLayout'
import ProfilePage from './ProfilePage'
import TrafficPage from './TrafficPage'
import api from './api'
import './index.css'

function Root() {
	const [user, setUser] = useState(null)

	useEffect(() => {
		api.get('/auth/me').then(res => setUser(res.data)).catch(() => {})
	}, [])

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login onLogin={(d) => { if (d?.username) localStorage.setItem('username', d.username); window.location.href = '/'; }} />} />
				
				<Route path="/" element={<PrivateRoute><AdminLayout><App /></AdminLayout></PrivateRoute>} />
				<Route path="/news" element={<PrivateRoute><AdminLayout><NewsPage /></AdminLayout></PrivateRoute>} />
				<Route path="/projects" element={<PrivateRoute><AdminLayout><ProjectPage /></AdminLayout></PrivateRoute>} />
				<Route path="/actions" element={<PrivateRoute><AdminLayout><ActionPage /></AdminLayout></PrivateRoute>} />
				<Route path="/testimonials" element={<PrivateRoute><AdminLayout><TestimonialsPage /></AdminLayout></PrivateRoute>} />
				<Route path="/messages" element={<PrivateRoute><AdminLayout><MessagesPage /></AdminLayout></PrivateRoute>} />
				<Route path="/subscribers" element={<PrivateRoute><AdminLayout><SubscribersPage /></AdminLayout></PrivateRoute>} />
				<Route path="/users" element={<PrivateRoute><AdminLayout><UsersPage /></AdminLayout></PrivateRoute>} />
				<Route path="/traffic" element={<PrivateRoute><AdminLayout><TrafficPage /></AdminLayout></PrivateRoute>} />
				<Route path="/profile" element={<PrivateRoute><AdminLayout><ProfilePage /></AdminLayout></PrivateRoute>} />
			</Routes>
		</BrowserRouter>
	)
}

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<Root />)
