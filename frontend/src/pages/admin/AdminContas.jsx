import { useEffect, useState } from 'react'
import { Plus, Trash2, KeyRound, User, Save, Shield } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/Modal'
import Loading from '../../components/Loading'
import toast from 'react-hot-toast'

export default function AdminContas() {
  const { admin } = useAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showSenha, setShowSenha] = useState(false)
  const [showDados, setShowDados] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [saving, setSaving] = useState(false)

  const [novoAdmin, setNovoAdmin] = useState({ nome: '', login: '', senha: '', email: '' })
  const [senhaForm, setSenhaForm] = useState({ senhaAtual: '', novaSenha: '', confirmar: '' })
  const [dadosForm, setDadosForm] = useState({ nome: '', login: '', email: '' })

  const load = () => {
    api.get('/auth/admins')
      .then(r => setAdmins(r.data))
      .catch(() => toast.error('Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    if (admin) setDadosForm({ nome: admin.nome, login: admin.login, email: admin.email || '' })
  }, [admin])

  const handleAddAdmin = async () => {
    if (!novoAdmin.nome || !novoAdmin.login || !novoAdmin.senha) return toast.error('Preencha todos os campos obrigatórios')
    setSaving(true)
    try {
      await api.post('/auth/admins', novoAdmin)
      toast.success('Administrador criado!')
      setShowAdd(false)
      setNovoAdmin({ nome: '', login: '', senha: '', email: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao criar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/auth/admins/${id}`)
      toast.success('Administrador removido')
      setConfirmDelete(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao remover')
    }
  }

  const handleAlterarSenha = async () => {
    if (!senhaForm.senhaAtual || !senhaForm.novaSenha) return toast.error('Preencha todos os campos')
    if (senhaForm.novaSenha !== senhaForm.confirmar) return toast.error('As senhas não coincidem')
    setSaving(true)
    try {
      await api.put('/auth/senha', { senhaAtual: senhaForm.senhaAtual, novaSenha: senhaForm.novaSenha })
      toast.success('Senha alterada com sucesso!')
      setShowSenha(false)
      setSenhaForm({ senhaAtual: '', novaSenha: '', confirmar: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao alterar senha')
    } finally {
      setSaving(false)
    }
  }

  const handleAtualizarDados = async () => {
    if (!dadosForm.nome || !dadosForm.login) return toast.error('Nome e login são obrigatórios')
    setSaving(true)
    try {
      await api.put('/auth/dados', dadosForm)
      toast.success('Dados atualizados!')
      setShowDados(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao atualizar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800">Gerenciar Contas 👥</h2>
        <p className="text-gray-500 text-sm">Administradores do sistema</p>
      </div>

      {/* Minha conta */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Shield size={18} className="text-primary-600" /> Minha Conta
        </h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
            <User size={28} className="text-primary-600" />
          </div>
          <div>
            <p className="font-bold text-gray-800">{admin?.nome}</p>
            <p className="text-gray-500 text-sm">@{admin?.login}</p>
            {admin?.email && <p className="text-gray-400 text-xs">{admin.email}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowDados(true)} className="flex items-center gap-2 border border-gray-200 hover:border-primary-400 hover:text-primary-700 text-gray-600 font-medium px-4 py-2 rounded-xl text-sm transition-all">
            <User size={14} /> Atualizar Dados
          </button>
          <button onClick={() => setShowSenha(true)} className="flex items-center gap-2 border border-gray-200 hover:border-primary-400 hover:text-primary-700 text-gray-600 font-medium px-4 py-2 rounded-xl text-sm transition-all">
            <KeyRound size={14} /> Alterar Senha
          </button>
        </div>
      </div>

      {/* Lista de admins */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Administradores ({admins.length})</h3>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 btn-primary py-2 px-4 text-sm">
            <Plus size={16} /> Adicionar
          </button>
        </div>

        <div className="space-y-3">
          {admins.map(a => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 font-bold">
                {a.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{a.nome}</p>
                <p className="text-xs text-gray-400">@{a.login} {a.email && `· ${a.email}`}</p>
              </div>
              {a.id === admin?.id && (
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">Você</span>
              )}
              {a.id !== admin?.id && (
                <button onClick={() => setConfirmDelete(a)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add Admin */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Adicionar Administrador">
        <div className="space-y-4">
          <div>
            <label className="label">Nome *</label>
            <input value={novoAdmin.nome} onChange={e => setNovoAdmin(f => ({ ...f, nome: e.target.value }))} className="input" placeholder="Nome completo" />
          </div>
          <div>
            <label className="label">Login *</label>
            <input value={novoAdmin.login} onChange={e => setNovoAdmin(f => ({ ...f, login: e.target.value }))} className="input" placeholder="usuario" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={novoAdmin.email} onChange={e => setNovoAdmin(f => ({ ...f, email: e.target.value }))} className="input" placeholder="email@exemplo.com" />
          </div>
          <div>
            <label className="label">Senha *</label>
            <input type="password" value={novoAdmin.senha} onChange={e => setNovoAdmin(f => ({ ...f, senha: e.target.value }))} className="input" placeholder="Mínimo 6 caracteres" />
          </div>
          <button onClick={handleAddAdmin} disabled={saving} className="w-full btn-primary disabled:opacity-60">
            {saving ? 'Criando...' : 'Criar Administrador'}
          </button>
        </div>
      </Modal>

      {/* Modal: Alterar Senha */}
      <Modal open={showSenha} onClose={() => setShowSenha(false)} title="Alterar Senha" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Senha Atual</label>
            <input type="password" value={senhaForm.senhaAtual} onChange={e => setSenhaForm(f => ({ ...f, senhaAtual: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label">Nova Senha</label>
            <input type="password" value={senhaForm.novaSenha} onChange={e => setSenhaForm(f => ({ ...f, novaSenha: e.target.value }))} className="input" placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <label className="label">Confirmar Nova Senha</label>
            <input type="password" value={senhaForm.confirmar} onChange={e => setSenhaForm(f => ({ ...f, confirmar: e.target.value }))} className="input" />
          </div>
          <button onClick={handleAlterarSenha} disabled={saving} className="w-full btn-primary disabled:opacity-60">
            <Save size={16} className="inline mr-2" />
            {saving ? 'Salvando...' : 'Alterar Senha'}
          </button>
        </div>
      </Modal>

      {/* Modal: Atualizar Dados */}
      <Modal open={showDados} onClose={() => setShowDados(false)} title="Atualizar Dados" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Nome</label>
            <input value={dadosForm.nome} onChange={e => setDadosForm(f => ({ ...f, nome: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label">Login</label>
            <input value={dadosForm.login} onChange={e => setDadosForm(f => ({ ...f, login: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={dadosForm.email} onChange={e => setDadosForm(f => ({ ...f, email: e.target.value }))} className="input" />
          </div>
          <button onClick={handleAtualizarDados} disabled={saving} className="w-full btn-primary disabled:opacity-60">
            {saving ? 'Salvando...' : 'Salvar Dados'}
          </button>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Remover Administrador" size="sm">
        <div className="text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-gray-700 mb-1">Remover administrador:</p>
          <p className="font-bold text-gray-900 mb-4">"{confirmDelete?.nome}"?</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDelete(null)} className="flex-1 btn-outline">Cancelar</button>
            <button onClick={() => handleDelete(confirmDelete.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-all">Remover</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
