import { useEffect, useState } from 'react'
import { Save, QrCode, Copy, CheckCircle } from 'lucide-react'
import api from '../../services/api'
import Loading from '../../components/Loading'
import toast from 'react-hot-toast'

export default function AdminPix() {
  const [form, setForm] = useState({ chave_pix: '', nome_recebedor: '', cidade_pix: '', descricao_pix: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [testValor, setTestValor] = useState('10')
  const [generatingQr, setGeneratingQr] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.get('/config').then(r => {
      const d = r.data
      setForm({
        chave_pix: d.chave_pix || '',
        nome_recebedor: d.nome_recebedor || '',
        cidade_pix: d.cidade_pix || '',
        descricao_pix: d.descricao_pix || '',
      })
    }).catch(() => toast.error('Erro ao carregar')).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!form.chave_pix.trim()) return toast.error('Chave PIX é obrigatória')
    setSaving(true)
    try {
      await api.put('/config/pix', form)
      toast.success('Configurações PIX salvas!')
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const gerarQrTeste = async () => {
    if (!form.chave_pix) return toast.error('Salve a chave PIX primeiro')
    setGeneratingQr(true)
    try {
      const { data } = await api.post('/pagamentos/pix', { valor: parseFloat(testValor) || 10 })
      setQrCode(data.qrCode)
      toast.success('QR Code gerado!')
    } catch {
      toast.error('Erro ao gerar QR Code')
    } finally {
      setGeneratingQr(false)
    }
  }

  const copiar = () => {
    if (form.chave_pix) {
      navigator.clipboard.writeText(form.chave_pix)
      setCopied(true)
      toast.success('Chave copiada!')
      setTimeout(() => setCopied(false), 3000)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-gray-800">Configuração PIX 💸</h2>
        <p className="text-gray-500 text-sm">Configure sua chave PIX para receber os pagamentos</p>
      </div>

      <div className="space-y-6">
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <QrCode size={18} className="text-primary-600" /> Dados do Recebedor
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label">Chave PIX *</label>
              <div className="relative">
                <input
                  value={form.chave_pix}
                  onChange={e => setForm(f => ({ ...f, chave_pix: e.target.value }))}
                  className="input pr-12"
                  placeholder="CPF, CNPJ, Email, Telefone ou Chave Aleatória"
                />
                <button onClick={copiar} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors">
                  {copied ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Ex: 123.456.789-00 | email@gmail.com | +5511999999999</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nome do Recebedor</label>
                <input value={form.nome_recebedor} onChange={e => setForm(f => ({ ...f, nome_recebedor: e.target.value }))} className="input" placeholder="Lucca" />
              </div>
              <div>
                <label className="label">Cidade</label>
                <input value={form.cidade_pix} onChange={e => setForm(f => ({ ...f, cidade_pix: e.target.value }))} className="input" placeholder="Sao Paulo" />
                <p className="text-xs text-gray-400 mt-1">Sem acentos</p>
              </div>
            </div>

            <div>
              <label className="label">Descrição do Pagamento</label>
              <input value={form.descricao_pix} onChange={e => setForm(f => ({ ...f, descricao_pix: e.target.value }))} className="input" placeholder="Presente Lucca" />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="w-full btn-primary flex items-center justify-center gap-2 mt-5 disabled:opacity-60">
            <Save size={18} />
            {saving ? 'Salvando...' : 'Salvar Configurações PIX'}
          </button>
        </div>

        {/* Teste QR Code */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4">Testar QR Code</h3>
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="label">Valor de teste (R$)</label>
              <input type="number" min="0.01" step="0.01" value={testValor} onChange={e => setTestValor(e.target.value)} className="input" />
            </div>
            <div className="flex items-end">
              <button onClick={gerarQrTeste} disabled={generatingQr} className="btn-secondary disabled:opacity-60 whitespace-nowrap">
                {generatingQr ? 'Gerando...' : 'Gerar QR'}
              </button>
            </div>
          </div>

          {qrCode && (
            <div className="text-center bg-gray-50 rounded-2xl p-6">
              <p className="text-sm text-gray-500 mb-3">QR Code gerado para R$ {parseFloat(testValor).toFixed(2)}:</p>
              <img src={qrCode} alt="QR Code PIX" className="mx-auto w-52 h-52 rounded-xl shadow-md" />
              <p className="text-xs text-green-600 mt-3 font-medium">✅ QR Code válido! Pronto para receber pagamentos.</p>
            </div>
          )}

          {!qrCode && (
            <div className="text-center bg-gray-50 rounded-2xl p-8 text-gray-400">
              <QrCode size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">O QR Code aparecerá aqui após o teste</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
