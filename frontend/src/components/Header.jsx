import { useState } from 'react'
import { MapPin, Clock, Calendar, ExternalLink, LogIn, LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Header({ config }) {
  const { admin, login, logout, loading } = useAuth()
  const [loginData, setLoginData] = useState({ login: '', senha: '' })
  const [showLogin, setShowLogin] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    const result = await login(loginData.login, loginData.senha)
    if (result.success) {
      toast.success(`Bem-vindo, ${admin?.nome || 'Administrador'}!`)
      setShowLogin(false)
      setLoginData({ login: '', senha: '' })
    } else {
      toast.error(result.error)
    }
  }

  const fotoLucca = config?.foto_lucca ? config.foto_lucca : null

  return (
    <header className="bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

          {/* Lado esquerdo - Foto + Nome */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {fotoLucca ? (
                <img src={fotoLucca} alt="Lucca" className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/20 border-3 border-white flex items-center justify-center text-2xl shadow-lg">
                  🎂
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 text-lg">✨</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide">Lucca</h1>
              <p className="text-white/80 text-sm">Lista de Presentes 🎁</p>
            </div>
          </div>

          {/* Centro - Info da festa */}
          {config && (config.local || config.data) && (
            <div className="bg-white/15 backdrop-blur rounded-2xl px-5 py-3 text-center">
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-2">Detalhes da Festa</p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                {config.local && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="opacity-80" />
                    <span className="font-medium">{config.local}</span>
                  </div>
                )}
                {config.data && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="opacity-80" />
                    <span>{config.data}</span>
                  </div>
                )}
                {config.horario && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="opacity-80" />
                    <span>{config.horario}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lado direito - Login/Admin */}
          <div className="flex items-center gap-3">
            {admin ? (
              <div className="flex items-center gap-2">
                <div className="bg-white/15 rounded-xl px-3 py-2 flex items-center gap-2">
                  <User size={16} />
                  <span className="text-sm font-medium">{admin.nome}</span>
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">ADMIN</span>
                </div>
                <button
                  onClick={() => { logout(); toast.success('Você saiu do sistema') }}
                  className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <LogOut size={15} />
                  Sair
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowLogin(!showLogin)}
                  className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                >
                  <LogIn size={15} />
                  Área Admin
                  <ChevronDown size={14} className={`transition-transform ${showLogin ? 'rotate-180' : ''}`} />
                </button>

                {showLogin && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl p-5 z-40 animate-fade-in">
                    <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
                      <LogIn size={18} className="text-primary-600" />
                      Login Administrativo
                    </h3>
                    <form onSubmit={handleLogin} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Login"
                        value={loginData.login}
                        onChange={e => setLoginData(p => ({ ...p, login: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        autoComplete="username"
                      />
                      <input
                        type="password"
                        placeholder="Senha"
                        value={loginData.senha}
                        onChange={e => setLoginData(p => ({ ...p, senha: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        autoComplete="current-password"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-700 hover:bg-primary-800 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-60 text-sm"
                      >
                        {loading ? 'Entrando...' : 'Entrar'}
                      </button>
                    </form>
                    <p className="text-xs text-gray-400 mt-3 text-center">Acesso restrito a administradores</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
