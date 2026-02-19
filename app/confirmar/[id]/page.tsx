"use client"
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function ConfirmarTurnoPage() {
  const { id } = useParams()
  const [status, setStatus] = useState('confirmando')

  useEffect(() => {
    // Llamamos a tu API de Neon para confirmar
    fetch(`/api/turnos/confirmar?id=${id}`, { method: 'PATCH' })
      .then(res => {
        if (res.ok) setStatus('ok')
        else setStatus('error')
      })
  }, [id])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      {status === 'confirmando' && <p>Confirmando tu turno...</p>}
      {status === 'ok' && (
        <div className="bg-green-100 p-6 rounded-xl border border-green-200">
          <h1 className="text-2xl font-bold text-green-700">¡Turno Confirmado!</h1>
          <p className="text-green-600 mt-2">Ya agendamos tu lugar. ¡Te esperamos! 💈</p>
        </div>
      )}
      {status === 'error' && <p className="text-red-500">Hubo un error o el turno ya no existe.</p>}
    </div>
  )
}