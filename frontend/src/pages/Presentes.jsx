import { useEffect, useState } from 'react'
import { ShoppingCart, Package, Search, SlidersHorizontal } from 'lucide-react'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'

function PresentCard({ presente }) {
  const { addItem, items } = useCart()
  const [qty, setQty] = useState(1)

  const inCart = items.find(i => i.presente_id === presente.id)
  const inCartQty = inCart?.quantidade || 0
  const available = presente.quantidade - inCartQty
  const outOfStock = presente.quantidade <= 0

  const handleAdd = () => {
    if (available < qty) {
      toast.error(`Disponível no carrinho: ${available}`)
      return
    }
    addItem(presente, qty)
    setQty(1)
  }

  return (
    <div className="card overflow-hidden flex flex-col animate-fade-in">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden">
        {presente.imagem ? (
          <img src={presente.imagem} alt={presente.nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🎁</div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-full text-sm">Esgotado</span>
          </div>
        )}
        {!outOfStock && inCartQty > 0 && (
          <div className="absolute top-2 right-2 bg-primary-700 text-white text-xs font-bold px-2 py-1 rounded-full">
            {inCartQty} no carrinho
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">{presente.nome}</h3>
        {presente.descricao && (
          <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-3 line-clamp-2">{presente.descricao}</p>
        )}

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-extrabold text-primary-700">
              R$ {parseFloat(presente.valor).toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Package size={14} />
            <span>{presente.quantidade} disponíveis</span>
          </div>
        </div>

        {!outOfStock && (
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="px-3 py-2 text-gray-600 hover:bg-gray-50 font-bold transition-colors"
              >−</button>
              <span className="px-3 py-2 font-semibold text-gray-800 min-w-[36px] text-center">{qty}</span>
              <button
                onClick={() => setQty(q => Math.min(available, q + 1))}
                className="px-3 py-2 text-gray-600 hover:bg-gray-50 font-bold transition-colors"
              >+</button>
            </div>
            <button
              onClick={handleAdd}
              disabled={available <= 0}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 disabled:bg-gray-300 text-white font-semibold py-2.5 px-4 rounded-xl transition-all active:scale-95 text-sm"
            >
              <ShoppingCart size={16} />
              Adicionar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Presentes() {
  const [presentes, setPresentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('todos')

  useEffect(() => {
    api.get('/presentes')
      .then(r => setPresentes(r.data))
      .catch(() => toast.error('Erro ao carregar presentes'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = presentes.filter(p => {
    const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) ||
      (p.descricao || '').toLowerCase().includes(search.toLowerCase())
    if (filter === 'disponiveis') return matchSearch && p.quantidade > 0
    if (filter === 'esgotados') return matchSearch && p.quantidade === 0
    return matchSearch
  })

  if (loading) return <Loading text="Carregando presentes..." />

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-1">Lista de Presentes 🎁</h2>
        <p className="text-gray-500">{presentes.length} presentes disponíveis para o Lucca</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar presente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-11"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-gray-400" />
          {['todos', 'disponiveis', 'esgotados'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                filter === f ? 'bg-primary-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'
              }`}
            >
              {f === 'todos' ? 'Todos' : f === 'disponiveis' ? 'Disponíveis' : 'Esgotados'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🔍</p>
          <p className="text-gray-400 text-lg font-medium">Nenhum presente encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(p => <PresentCard key={p.id} presente={p} />)}
        </div>
      )}
    </div>
  )
}
