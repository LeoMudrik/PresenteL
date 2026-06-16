import { useNavigate } from 'react-router-dom'
import { Gift, ShoppingCart, Star, Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const navigate = useNavigate()
  const { admin } = useAuth()
  const [config, setConfig] = useState(null)
  const [totalPresentes, setTotalPresentes] = useState(0)

  useEffect(() => {
    api.get('/config').then(r => setConfig(r.data)).catch(() => {})
    api.get('/presentes').then(r => setTotalPresentes(r.data.length)).catch(() => {})
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-700 to-secondary-500 rounded-3xl p-8 text-white mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 text-8xl opacity-20 -mt-4 -mr-4">🎂</div>
        <h2 className="text-3xl font-extrabold mb-2">
          Bem-vindo à festa do Lucca! 🎉
        </h2>
        {config?.texto_convite && (
          <p className="text-white/90 text-lg">{config.texto_convite}</p>
        )}
        {admin && (
          <div className="mt-3 inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40 rounded-xl px-3 py-1.5">
            <span className="text-yellow-300 text-sm font-semibold">👑 Você está como Administrador</span>
          </div>
        )}
      </div>

      {/* Info cards */}
      {config && (config.local || config.data) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {config.local && (
            <div className="card p-5 text-center">
              <div className="text-3xl mb-2">📍</div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Local</p>
              <p className="text-gray-800 font-semibold">{config.local}</p>
            </div>
          )}
          {config.data && (
            <div className="card p-5 text-center">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Data</p>
              <p className="text-gray-800 font-semibold">{config.data}</p>
            </div>
          )}
          {config.horario && (
            <div className="card p-5 text-center">
              <div className="text-3xl mb-2">⏰</div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Horário</p>
              <p className="text-gray-800 font-semibold">{config.horario}</p>
            </div>
          )}
        </div>
      )}

      {/* Quick actions */}
      <h3 className="text-xl font-bold text-gray-800 mb-4">O que você deseja fazer?</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/presentes')}
          className="card p-6 text-left hover:scale-[1.02] transition-transform cursor-pointer group"
        >
          <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
            <Gift size={28} className="text-primary-700" />
          </div>
          <h4 className="text-lg font-bold text-gray-800 mb-1">Ver Presentes</h4>
          <p className="text-gray-500 text-sm">Escolha um presente especial entre {totalPresentes} opções disponíveis</p>
          <div className="mt-4 flex items-center gap-2 text-primary-700 font-semibold text-sm">
            Ver lista <span>→</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/carrinho')}
          className="card p-6 text-left hover:scale-[1.02] transition-transform cursor-pointer group"
        >
          <div className="w-14 h-14 bg-secondary-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-secondary-200 transition-colors">
            <ShoppingCart size={28} className="text-secondary-600" />
          </div>
          <h4 className="text-lg font-bold text-gray-800 mb-1">Meu Carrinho</h4>
          <p className="text-gray-500 text-sm">Finalize sua escolha e realize o pagamento via PIX</p>
          <div className="mt-4 flex items-center gap-2 text-secondary-600 font-semibold text-sm">
            Ver carrinho <span>→</span>
          </div>
        </button>
      </div>

      {/* Admin shortcut */}
      {admin && (
        <div className="mt-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="w-full card p-5 flex items-center gap-4 hover:scale-[1.01] transition-transform cursor-pointer group border-2 border-yellow-200"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-2xl">👑</div>
            <div className="text-left">
              <h4 className="font-bold text-gray-800">Painel Administrativo</h4>
              <p className="text-gray-500 text-sm">Gerenciar presentes, pagamentos e configurações</p>
            </div>
            <span className="ml-auto text-gray-400 group-hover:text-primary-700 transition-colors">→</span>
          </button>
        </div>
      )}
    </div>
  )
}
