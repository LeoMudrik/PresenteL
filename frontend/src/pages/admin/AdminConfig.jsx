import { useEffect, useState } from 'react'
import { Save, MapPin, Calendar, Clock, FileText, Image } from 'lucide-react'
import api from '../../services/api'
import Loading from '../../components/Loading'
import toast from 'react-hot-toast'

export default function AdminConfig() {
  const [form, setForm] = useState({ local: '', data: '', horario: '', texto_convite: '' })
  const [fotoLucca, setFotoLucca] = useState(null)
  const [imagemFundo, setImagemFundo] = useState(null)
  const [previewFoto, setPreviewFoto] = useState('')
  const [previewFundo, setPreviewFundo] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/config').then(r => {
      const d = r.data
      setForm({ local: d.local || '', data: d.data || '', horario: d.horario || '', texto_convite: d.texto_convite || '' })
      setPreviewFoto(d.foto_lucca || '')
      setPreviewFundo(d.imagem_fundo || '')
    }).catch(() => toast.error('Erro ao carregar')).finally(() => setLoading(false))
  }, [])

  const handleImg = (setter, previewSetter) => (e) => {
    const file = e.target.files[0]
    if (!file) return
    setter(file)
    previewSetter(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('local', form.local)
      fd.append('data', form.data)
      fd.append('horario', form.horario)
      fd.append('texto_convite', form.texto_convite)
      if (fotoLucca) fd.append('foto_lucca', fotoLucca)
      if (imagemFundo) fd.append('imagem_fundo', imagemFundo)

      await api.put('/config/festa', fd)
      toast.success('Configurações salvas com sucesso!')
    } catch {
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-gray-800">Configurações da Festa 🎉</h2>
        <p className="text-gray-500 text-sm">Personalize as informações exibidas para os convidados</p>
      </div>

      <div className="space-y-6">
        {/* Informações da festa */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-primary-600" /> Informações do Evento
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label flex items-center gap-1.5"><MapPin size={14} /> Local da Festa</label>
              <input value={form.local} onChange={e => setForm(f => ({ ...f, local: e.target.value }))} className="input" placeholder="Ex: Buffet XYZ - Rua das Flores, 123" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label flex items-center gap-1.5"><Calendar size={14} /> Data</label>
                <input value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} className="input" placeholder="Ex: 15/03/2024" />
              </div>
              <div>
                <label className="label flex items-center gap-1.5"><Clock size={14} /> Horário</label>
                <input value={form.horario} onChange={e => setForm(f => ({ ...f, horario: e.target.value }))} className="input" placeholder="Ex: 15:00h" />
              </div>
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><FileText size={14} /> Texto do Convite</label>
              <textarea value={form.texto_convite} onChange={e => setForm(f => ({ ...f, texto_convite: e.target.value }))} className="input resize-none h-24" placeholder="Ex: Venha comemorar comigo este dia especial!" />
            </div>
          </div>
        </div>

        {/* Imagens */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Image size={18} className="text-primary-600" /> Imagens
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Foto do Lucca */}
            <div>
              <label className="label">Foto do Lucca</label>
              <div
                className="h-40 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer hover:border-primary-400 transition-colors flex items-center justify-center bg-gray-50"
                onClick={() => document.getElementById('foto-lucca').click()}
              >
                {previewFoto ? (
                  <img src={previewFoto} alt="Foto Lucca" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <p className="text-4xl mb-2">👶</p>
                    <p className="text-xs text-gray-400">Clique para selecionar</p>
                  </div>
                )}
              </div>
              <input id="foto-lucca" type="file" accept="image/*" className="hidden" onChange={handleImg(setFotoLucca, setPreviewFoto)} />
              <p className="text-xs text-gray-400 mt-1">Foto exibida na tela inicial e no header</p>
            </div>

            {/* Imagem de fundo */}
            <div>
              <label className="label">Imagem de Fundo</label>
              <div
                className="h-40 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer hover:border-primary-400 transition-colors flex items-center justify-center bg-gray-50"
                onClick={() => document.getElementById('img-fundo').click()}
              >
                {previewFundo ? (
                  <img src={previewFundo} alt="Fundo" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <p className="text-4xl mb-2">🖼️</p>
                    <p className="text-xs text-gray-400">Clique para selecionar</p>
                  </div>
                )}
              </div>
              <input id="img-fundo" type="file" accept="image/*" className="hidden" onChange={handleImg(setImagemFundo, setPreviewFundo)} />
              <p className="text-xs text-gray-400 mt-1">Fundo da tela de entrada</p>
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base disabled:opacity-60">
          <Save size={18} />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  )
}
