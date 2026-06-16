import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Landing() {
  const navigate = useNavigate()
  const [config, setConfig] = useState(null)

  useEffect(() => {
    api.get('/config').then(r => setConfig(r.data)).catch(() => {})
  }, [])

  const bgStyle = config?.imagem_fundo
    ? { backgroundImage: `url(${config.imagem_fundo})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={bgStyle}
    >
      {/* Gradient overlay / default bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-primary-700/80 to-secondary-600/90" />

      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['🎈', '🎁', '⭐', '🎊', '🎉', '🎀', '✨', '🌟'].map((emoji, i) => (
          <span
            key={i}
            className="absolute text-3xl animate-bounce-slow opacity-60"
            style={{
              left: `${[10, 20, 80, 90, 5, 70, 45, 55][i]}%`,
              top: `${[15, 75, 20, 60, 50, 10, 85, 30][i]}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${2 + i * 0.3}s`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6 animate-fade-in">
        {/* Photo */}
        <div className="relative">
          <div className="w-44 h-44 rounded-full border-8 border-white shadow-2xl overflow-hidden bg-white/20 flex items-center justify-center">
            {config?.foto_lucca ? (
              <img src={config.foto_lucca} alt="Lucca" className="w-full h-full object-cover" />
            ) : (
              <span className="text-8xl">👶</span>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-lg animate-bounce">
            🎂
          </div>
        </div>

        {/* Name */}
        <div>
          <h1 className="text-7xl font-extrabold text-white tracking-tight drop-shadow-2xl">
            Lucca
          </h1>
          {config?.texto_convite && (
            <p className="text-white/90 text-xl mt-3 font-light max-w-sm">
              {config.texto_convite}
            </p>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/home')}
          className="group relative bg-white text-primary-700 hover:bg-yellow-400 hover:text-primary-900 font-extrabold text-xl px-12 py-5 rounded-2xl shadow-2xl transition-all duration-300 active:scale-95 hover:scale-105"
        >
          <span className="flex items-center gap-3">
            Venha me Presentear
            <span className="text-2xl group-hover:animate-bounce">🎁</span>
          </span>
          <div className="absolute inset-0 rounded-2xl bg-white/20 scale-105 opacity-0 group-hover:opacity-100 transition-all -z-10" />
        </button>

        <p className="text-white/60 text-sm">Clique para ver a lista de presentes</p>
      </div>
    </div>
  )
}
