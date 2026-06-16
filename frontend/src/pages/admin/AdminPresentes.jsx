import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import api from '../../services/api'
import Modal from '../../components/Modal'
import Loading from '../../components/Loading'
import toast from 'react-hot-toast'

const EMPTY_FORM = { nome: '', descricao: '', valor: '', quantidade: 1, imagem: null }

export default function AdminPresentes() {
  const [presentes, setPresentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = () => {
    api.get('/presentes')
      .then(r => setPresentes(r.data))
      .catch(() => toast.error('Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setPreview('')
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({ nome: p.nome, descricao: p.descricao || '', valor: p.valor, quantidade: p.quantidade, imagem: null })
    setPreview(p.imagem || '')
    setShowModal(true)
  }

  const handleImg = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm(f => ({ ...f, imagem: file }))
    setPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.nome.trim()) return toast.error('Nome é obrigatório')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('nome', form.nome)
      fd.append('descricao', form.descricao)
      fd.append('valor', form.valor || 0)
      fd.append('quantidade', form.quantidade || 1)
      if (form.imagem) fd.append('imagem', form.imagem)

      if (editing) {
        await api.put(`/presentes/${editing.id}`, fd)
        toast.success('Presente atualizado!')
      } else {
        await api.post('/presentes', fd)
        toast.success('Presente criado!')
      }
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/presentes/${id}`)
      toast.success('Presente excluído')
      setConfirmDelete(null)
      load()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  if (loading) return <Loading />

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">Gerenciar Presentes 🎁</h2>
          <p className="text-gray-500 text-sm">{presentes.length} presente(s) cadastrado(s)</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Adicionar Presente
        </button>
      </div>

      {presentes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🎁</p>
          <p className="text-gray-400 text-lg mb-4">Nenhum presente cadastrado</p>
          <button onClick={openAdd} className="btn-primary">Cadastrar primeiro presente</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {presentes.map(p => (
            <div key={p.id} className="card overflow-hidden">
              <div className="h-40 bg-primary-50 overflow-hidden">
                {p.imagem ? (
                  <img src={p.imagem} alt={p.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🎁</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 truncate">{p.nome}</h3>
                <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{p.descricao}</p>
                <div className="flex items-center justify-between mt-3 mb-3">
                  <span className="text-xl font-extrabold text-primary-700">R$ {parseFloat(p.valor).toFixed(2)}</span>
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Package size={14} /> {p.quantidade} un.
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-primary-400 hover:text-primary-700 text-gray-600 font-medium py-2 rounded-xl text-sm transition-all"
                  >
                    <Pencil size={14} /> Editar
                  </button>
                  <button
                    onClick={() => setConfirmDelete(p)}
                    className="flex items-center justify-center gap-1.5 border border-gray-200 hover:border-red-400 hover:text-red-600 text-gray-600 font-medium py-2 px-3 rounded-xl text-sm transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Presente' : 'Novo Presente'}>
        <div className="space-y-4">
          {/* Image upload */}
          <div>
            <label className="label">Foto do presente</label>
            <div className="relative">
              <div
                className="w-full h-40 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer hover:border-primary-400 transition-colors flex items-center justify-center bg-gray-50"
                onClick={() => document.getElementById('img-input').click()}
              >
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <p className="text-4xl mb-2">📷</p>
                    <p className="text-gray-400 text-sm">Clique para selecionar uma imagem</p>
                  </div>
                )}
              </div>
              <input id="img-input" type="file" accept="image/*" onChange={handleImg} className="hidden" />
              {preview && (
                <button
                  onClick={() => { setPreview(''); setForm(f => ({ ...f, imagem: null })) }}
                  className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg"
                >
                  Remover
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="label">Nome *</label>
            <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className="input" placeholder="Ex: Lego Star Wars" />
          </div>

          <div>
            <label className="label">Descrição</label>
            <textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} className="input resize-none h-20" placeholder="Descrição do presente..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Valor (R$) *</label>
              <input type="number" min="0" step="0.01" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} className="input" placeholder="0,00" />
            </div>
            <div>
              <label className="label">Quantidade</label>
              <input type="number" min="0" value={form.quantidade} onChange={e => setForm(f => ({ ...f, quantidade: e.target.value }))} className="input" />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="w-full btn-primary disabled:opacity-60">
            {saving ? 'Salvando...' : editing ? 'Salvar Alterações' : 'Criar Presente'}
          </button>
        </div>
      </Modal>

      {/* Confirm delete */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmar Exclusão" size="sm">
        <div className="text-center">
          <p className="text-5xl mb-4">🗑️</p>
          <p className="text-gray-700 mb-2 font-medium">Deseja excluir o presente:</p>
          <p className="font-bold text-gray-900 mb-6">"{confirmDelete?.nome}"?</p>
          <p className="text-sm text-red-500 mb-6">Esta ação não pode ser desfeita.</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDelete(null)} className="flex-1 btn-outline">Cancelar</button>
            <button onClick={() => handleDelete(confirmDelete.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-all">Excluir</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
