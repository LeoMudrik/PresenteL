import { useState, useRef } from 'react'
import { Trash2, Plus, Minus, ShoppingCart, Copy, CheckCircle, Upload, Image, FileText, X, Smartphone } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'

const NUMERO_PIX = '31997672188'
const NUMERO_FORMATADO = '(31) 99767-2188'

// ──────────────────────────────────────────────
// Tela de PIX + upload de comprovante
// ──────────────────────────────────────────────
function PixScreen({ pixData, total, onFinalizar }) {
  const [copied, setCopied] = useState(false)
  const [comprovante, setComprovante] = useState(null)
  const [preview, setPreview] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const inputRef = useRef()

  const handleCopiar = () => {
    navigator.clipboard.writeText(NUMERO_PIX)
    setCopied(true)
    toast.success('Número copiado!')
    setTimeout(() => setCopied(false), 3000)
  }

  const handleArquivo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('Arquivo muito grande. Máximo 10 MB.'); return }
    setComprovante(file)
    setPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : 'pdf')
  }

  const handleEnviarComprovante = async () => {
    if (!comprovante) { toast.error('Selecione o comprovante primeiro'); return }
    setEnviando(true)
    try {
      const fd = new FormData()
      fd.append('comprovante', comprovante)
      await api.post(`/pagamentos/${pixData.id}/comprovante`, fd)
      setEnviado(true)
      toast.success('Comprovante enviado! Aguarde a confirmação. 🎉')
    } catch {
      toast.error('Erro ao enviar comprovante. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  const handleFinalizar = () => {
    if (comprovante && !enviado) {
      toast('Envie o comprovante antes de finalizar.', { icon: '⚠️' })
      return
    }
    onFinalizar()
  }

  return (
    <div className="p-4 max-w-lg mx-auto animate-fade-in space-y-5 pb-24 md:pb-6">

      {/* Cabeçalho */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle size={34} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-800">Quase lá! 🎉</h2>
        <p className="text-gray-500 text-sm mt-1">Transfira o valor abaixo via PIX e envie o comprovante</p>
      </div>

      {/* Valor */}
      <div className="card p-5 text-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <p className="text-sm text-gray-500 font-medium mb-1">Valor total</p>
        <p className="text-4xl font-extrabold text-primary-700">R$ {total.toFixed(2)}</p>
      </div>

      {/* Número do celular PIX */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone size={20} className="text-primary-600" />
          <p className="font-bold text-gray-800">Chave PIX — Celular</p>
        </div>

        <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-5 text-center mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Número para transferência</p>
          <p className="text-3xl font-extrabold text-gray-900 tracking-wide">{NUMERO_FORMATADO}</p>
          <p className="text-xs text-gray-400 mt-2">Livia · PIX Celular</p>
        </div>

        <button
          onClick={handleCopiar}
          className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all text-base ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-primary-700 hover:bg-primary-800 text-white'
          }`}
        >
          {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
          {copied ? 'Número copiado!' : 'Copiar número'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          Abra o app do seu banco → PIX → Transferir → Cole o número
        </p>
      </div>

      {/* Upload comprovante */}
      <div className="card p-5">
        <p className="font-bold text-gray-800 mb-1 flex items-center gap-2">
          <Upload size={18} className="text-primary-600" />
          Insira o comprovante de pagamento
        </p>
        <p className="text-xs text-gray-400 mb-4">
          Foto ou PDF do comprovante do PIX. Ajuda a confirmar mais rápido!
        </p>

        {enviado ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <CheckCircle size={40} className="text-green-500" />
            <p className="text-green-700 font-semibold">Comprovante enviado!</p>
            <p className="text-xs text-gray-400">Aguarde a confirmação</p>
          </div>
        ) : comprovante ? (
          <div className="relative">
            {preview === 'pdf' ? (
              <div className="w-full h-36 bg-red-50 rounded-2xl flex flex-col items-center justify-center border-2 border-red-200 gap-2">
                <FileText size={36} className="text-red-500" />
                <p className="text-sm font-medium text-red-700 truncate max-w-xs px-2">{comprovante.name}</p>
              </div>
            ) : (
              <img src={preview} alt="Comprovante" className="w-full h-48 object-contain rounded-2xl border border-gray-200 bg-gray-50" />
            )}
            <button
              onClick={() => { setComprovante(null); setPreview('') }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
            <button
              onClick={handleEnviarComprovante}
              disabled={enviando}
              className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Upload size={17} />
              {enviando ? 'Enviando...' : 'Enviar Comprovante'}
            </button>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="w-full h-36 border-2 border-dashed border-gray-300 hover:border-primary-400 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-gray-50 hover:bg-primary-50"
          >
            <Image size={32} className="text-gray-300" />
            <p className="text-sm font-medium text-gray-500">Clique para selecionar o comprovante</p>
            <p className="text-xs text-gray-400">Imagem (JPG, PNG) ou PDF — máx. 10 MB</p>
          </div>
        )}

        <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleArquivo} />
      </div>

      {/* Botão finalizar */}
      <div className="space-y-2">
        <button
          onClick={handleFinalizar}
          className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 text-lg shadow-lg"
        >
          ✅ Já realizei o pagamento
        </button>
        {!enviado && (
          <button onClick={onFinalizar} className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors underline">
            Finalizar sem comprovante
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center pb-2">
        Seu presente será reservado. O pagamento é confirmado pela Lívia.
      </p>
    </div>
  )
}

// ──────────────────────────────────────────────
// Carrinho principal
// ──────────────────────────────────────────────
export default function Carrinho() {
  const { items, updateQty, removeItem, clearCart, total } = useCart()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [pixData, setPixData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handlePagar = () => {
    if (items.length === 0) return toast.error('Seu carrinho está vazio!')
    setShowModal(true)
  }

  const handleConfirmarPagamento = async () => {
    if (!usuario.trim()) return toast.error('Por favor, informe seu nome')
    setLoading(true)
    try {
      const itens = items.map(i => ({
        presente_id: i.presente_id,
        nome: i.nome,
        quantidade: i.quantidade,
        valor: i.valor,
      }))
      const { data } = await api.post('/pagamentos', { usuario: usuario.trim(), valor: total, itens })
      setPixData(data)
      setShowModal(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao registrar pagamento')
    } finally {
      setLoading(false)
    }
  }

  const handleFinalizar = () => {
    toast.success('Obrigado! Seu presente foi registrado para o Lucca! 🎉')
    clearCart()
    navigate('/home')
  }

  if (pixData) {
    return <PixScreen pixData={pixData} total={total} onFinalizar={handleFinalizar} />
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

      <div className="space-y-4 mb-6">
        {items.map(item => (
          <div key={item.presente_id} className="card p-4 flex gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-primary-50 flex-shrink-0">
              {item.imagem
                ? <img src={item.imagem} alt={item.nome} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-3xl">🎁</div>}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 truncate">{item.nome}</h4>
              {item.descricao && <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{item.descricao}</p>}
              <p className="text-primary-700 font-bold mt-1">R$ {parseFloat(item.valor).toFixed(2)}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => updateQty(item.presente_id, item.quantidade - 1, item.estoqueMax)} className="p-2 hover:bg-gray-50 text-gray-600 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-sm font-bold text-gray-800">{item.quantidade}</span>
                  <button onClick={() => updateQty(item.presente_id, item.quantidade + 1, item.estoqueMax)} className="p-2 hover:bg-gray-50 text-gray-600 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-700">R$ {(item.valor * item.quantidade).toFixed(2)}</span>
                  <button onClick={() => removeItem(item.presente_id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex justify-between text-gray-600 mb-2">
          <span>Subtotal ({items.reduce((s, i) => s + i.quantidade, 0)} itens)</span>
          <span className="font-semibold">R$ {total.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between">
          <span className="text-xl font-extrabold text-gray-800">Total</span>
          <span className="text-xl font-extrabold text-primary-700">R$ {total.toFixed(2)}</span>
        </div>
        <button onClick={handlePagar} className="mt-6 w-full btn-primary flex items-center justify-center gap-2 text-base">
          <ShoppingCart size={20} />
          Pagar via PIX
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">Pagamento via PIX · número da Lívia</p>
      </div>

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
              onKeyDown={e => e.key === 'Enter' && handleConfirmarPagamento()}
              className="input"
              autoFocus
            />
          </div>
          <div className="bg-primary-50 rounded-xl p-4">
            <p className="text-sm font-medium text-primary-800 mb-2">Resumo do pedido:</p>
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
            {loading ? 'Registrando...' : 'Avançar para pagamento →'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
