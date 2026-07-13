import React, { useEffect, useState } from 'react'
import api from './api'

export default function MessagesPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/messages')
      .then(res => setMessages(res.data))
      .catch(() => alert("Erreur lors du chargement des messages"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Messages de contact</h2>
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="grid gap-4">
          {messages.length === 0 ? (
            <p className="text-gray-500">Aucun message reçu.</p>
          ) : (
            messages.map(m => (
              <div key={m._id} className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-lg">{m.name}</span>
                    <span className="text-gray-500 text-sm ml-2">({m.email})</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(m.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-700 mb-2">Sujet: {m.subject}</div>
                <p className="text-gray-600 whitespace-pre-wrap">{m.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
