import React, { useEffect, useState } from 'react'
import api from './api'

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/subscribers')
      .then(res => setSubscribers(res.data))
      .catch(() => alert("Erreur lors du chargement des abonnés"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Abonnés Newsletter</h2>
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan="2" className="px-6 py-4 text-center text-gray-500">Aucun inscrit pour le moment.</td>
                </tr>
              ) : (
                subscribers.map(s => (
                  <tr key={s._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{s.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(s.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
