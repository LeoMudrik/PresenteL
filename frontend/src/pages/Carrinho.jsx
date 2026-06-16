import { useState } from 'react'
import { Trash2, Plus, Minus, ShoppingCart, Copy, CheckCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'

export default function Carrinho() {
  const { items, updateQty, removeItem, clearCart, total } = useCart()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showPix, setShowPix] = useState(false)
  const [pixData, setPixData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handlePagar = () => {
    if (items.length === 0) return toast.error('Seu carrinho está vazio!')
    setShowModal(true)
  }

  const handleConfirmarPagamento = async () => {
    if (!usuario.trim()) return toast.error('Por favor, informe seu nome')
    setLoading(true)
    try {
      const itens = items.map(i => ({ presente_id: i.presente_id, nome: i.nome, quantidade: i.quantidade, valor: i.valor }))
      const { data } = await api.post('/pagamentos', { usuario: usuario.trim(), valor: total, itens })
      setPixData(data)
      setShowModal(false)
      setShowPix(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao registrar pagamento')
    } finally {
      setLoading(false)
    }
  }

  const handleCopiarChave = () => {
    if (pixData?.pixPayload) {
      navigator.clipboard.writeText(pixData.pixPayload)
      setCopied(true)
      toast.success('Chave PIX copiada!')
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const handleJaPaguei = () => {
    toast.success('Obrigado! Seu presente foi registrado! 🎉')
    clearCart()
    navigate('/home')
  }

  if (showPix && pixData) {
    return (
      <div className="p-6 max-w-lg mx-auto animate-fade-in">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Quase lá! 🎉</h2>
          <p className="text-gray-500 mb-6">Realize o pagamento via PIX para confirmar o seu presente</p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <p className="text-4xl font-extrabold text-primary-700 mb-2">
              R$ {total.toFixed(2)}
            </p>
            <p className="text-gray-500 text-sm">Valor total da compra</p>
          </div>

          {pixData.qrCode && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-3">Escaneie o QR Code:</p>
              <img src={pixData.qrCode} alt="QR Code PIX" className="mx-auto w-56 h-56 rounded-2xl shadow-lg" />
            </div>
          )}

          {pixData.pixPayload && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Ou copie a chave PIX:</p>
              <div className="bg-gray-100 rounded-xl p-3 text-xs text-gray-600 break-all font-mono mb-2 max-h-20 overflow-y-auto">
                {pixData.pixPayload}
              </div>
              <button
                onClick={handleCopiarChave}
                className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-all ${
                  copied ? 'bg-green-600 text-white' : 'bg-primary-700 hover:bg-primary-800 text-white'
                }`}
              >
                {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                {copied ? 'Copiado!' : 'Copiar Chave PIX'}
              </button>
            </div>
          )}

          <button
            onClick={handleJaPaguei}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 text-lg shadow-lg"
          >
            ✅ Já realizei o pagamento
          </button>

          <p className="text-xs text-gray-400 mt-4">Após confirmar, seu presente será reservado automaticamente</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center py-20 animate-fade-in">
        <div className="text-7xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Carrinho vazio</h2>
        <p className="text-gray-400 mb-6">Adicione presentes para o Lucca!</p>
        <button onClick={() => navigate('/presentes')} className="btn-primary">
          Ver Presentes 🎁
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">Meu Carrinho 🛒</h2>
          <p className="text-gray-500 text-sm">{items.length} item(ns) selecionado(s)</p>
        </div>
        <button onClick={() => navigate('/presentes')} className="text-primary-700 font-medium text-sm hover:underline">
          + Adicionar mais
        </button>
      </div>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {items.map(item => (
          <div key={item.presente_id} className="card p-4 flex gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-primary-50 flex-shrink-0">
              {item.imagem ? (
                <img src={item.imagem} alt={item.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">🎁</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 truncate">{item.nome}</h4>
              {item.descricao && <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{item.descricao}</p>}
              <p className="text-primary-700 font-bold mt-1">R$ {parseFloat(item.valor).toFixed(2)}</p>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => updateQty(item.presente_id, item.quantidade - 1, item.estoqueMax)}
                    className="p-2 hover:bg-gray-50 text-gray-600 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-sm font-bold text-gray-800">{item.quantidade}</span>
                  <button
                    onClick={() => updateQty(item.presente_id, item.quantidade + 1, item.estoqueMax)}
                    className="p-2 hover:bg-gray-50 text-gray-600 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-700">
                    R$ {(item.valor * item.quantidade).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(item.presente_id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="card p-6">
        <div className="flex justify-between text-gray-600 mb-2">
          <span>Subtotal ({items.reduce((s, i) => s + i.quantidade, 0)} itens)</span>
          <span className="font-semibold">R$ {total.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between">
          <span className="text-xl font-extrabold text-gray-800">Total</span>
          <span className="text-xl font-extrabold text-primary-700">R$ {total.toFixed(2)}</span>
        </div>

        <button
          onClick={handlePagar}
          className="mt-6 w-full btn-primary flex items-center justify-center gap-2 text-base"
        >
          <ShoppingCart size={20} />
          Pagar via PIX
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">Pagamento rápido e seguro via PIX</p>
      </div>

      {/* Modal: nome do convidado */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Identificação do Convidado">
        <div className="space-y-4">
          <p className="text-gray-600">Para registrar seu presente, nos diga seu nome:</p>
          <div>
            <label className="label">Seu nome *</label>
            <input
              type="text"
              placeholder="Ex: João Silva"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              className="input"
              onKeyDown={e => e.key === 'Enter' && handleConfirmarPagamento()}
              autoFocus
            />
          </div>
          <div className="bg-primary-50 rounded-xl p-4">
            <p className="text-sm font-medium text-primary-800">Resumo do pedido:</p>
            {items.map(i => (
              <div key={i.presente_id} className="flex justify-between text-sm text-primary-700 mt-1">
                <span>{i.nome} x{i.quantidade}</span>
                <span>R$ {(i.valor * i.quantidade).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-primary-200 mt-2 pt-2 flex justify-between font-bold text-primary-800">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handleConfirmarPagamento}
            disabled={loading || !usuario.trim()}
            className="w-full btn-primary disabled:opacity-60"
          >
            {loading ? 'Gerando PIX...' : 'Gerar QR Code PIX →'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
