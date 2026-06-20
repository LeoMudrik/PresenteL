import { useEffect, useState } from 'react'
import { Gift, Users, DollarSign, ShoppingBag, Download, CheckCircle, Clock, XCircle, FileText, Eye } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../../services/api'
import Loading from '../../components/Loading'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  confirmado: '#22c55e',
  pendente: '#f59e0b',
  aguardando_confirmacao: '#3b82f6',
  cancelado: '#ef4444',
}
const STATUS_LABELS = {
  confirmado: 'Confirmado',
  pendente: 'Pendente',
  aguardando_confirmacao: 'Com comprovante',
  cancelado: 'Cancelado',
}
const STATUS_ICONS = {
  confirmado: CheckCircle,
  pendente: Clock,
  aguardando_confirmacao: Clock,
  cancelado: XCircle,
}

function MetricCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
          <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('700', '100')}`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    api.get('/relatorios/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Erro ao carregar dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const exportar = async () => {
    setExporting(true)
    try {
      const res = await api.get('/relatorios/exportar', { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio_lucca_${Date.now()}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Relatório exportado!')
    } catch {
      toast.error('Erro ao exportar relatório')
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <Loading text="Carregando dashboard..." />
  if (!data) return null

  const pieData = [
    { name: 'Confirmados', value: data.pagamentosConfirmados, color: '#22c55e' },
    { name: 'Pendentes', value: data.pagamentosPendentes, color: '#f59e0b' },
  ].filter(d => d.value > 0)

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800">Dashboard 📊</h2>
          <p className="text-gray-500">Visão geral da festa do Lucca</p>
        </div>
        <button
          onClick={exportar}
          disabled={exporting}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60 shadow-lg"
        >
          <Download size={18} />
          {exporting ? 'Exportando...' : 'Exportar Excel'}
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={Gift} label="Total de Presentes" value={data.totalPresentes} color="text-primary-700" />
        <MetricCard icon={Users} label="Convidados" value={data.totalConvidados} color="text-secondary-600" sub="participantes" />
        <MetricCard icon={DollarSign} label="Total Arrecadado" value={`R$ ${parseFloat(data.totalArrecadado).toFixed(2)}`} color="text-green-700" sub="confirmados" />
        <MetricCard icon={ShoppingBag} label="Pendente" value={`R$ ${parseFloat(data.totalPendente).toFixed(2)}`} color="text-yellow-600" sub="aguardando" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top presentes */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-bold text-gray-800 mb-4">Presentes Mais Escolhidos</h3>
          {data.presentesMaisEscolhidos.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.presentesMaisEscolhidos} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, 'Escolhas']} />
                <Bar dataKey="vezes_escolhido" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <p>Nenhum presente escolhido ainda</p>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4">Status Pagamentos</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <span className="text-gray-600">{d.name}</span>
                    <span className="ml-auto font-bold">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              <p>Sem pagamentos</p>
            </div>
          )}
        </div>
      </div>

      {/* Ultimos pagamentos */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-800 mb-4">Últimos Pagamentos</h3>
        {data.ultimosPagamentos.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-4xl mb-2">📭</p>
            <p>Nenhum pagamento registrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Convidado</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Valor</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Comprovante</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Ação</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {data.ultimosPagamentos.map(p => {
                  const Icon = STATUS_ICONS[p.status] || Clock
                  return (
                    <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${p.status === 'aguardando_confirmacao' ? 'bg-blue-50/40' : ''}`}>
                      <td className="py-3 px-2 font-medium text-gray-800">{p.usuario}</td>
                      <td className="py-3 px-2 font-bold text-primary-700">R$ {parseFloat(p.valor).toFixed(2)}</td>
                      <td className="py-3 px-2">
                        <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: STATUS_COLORS[p.status] + '20', color: STATUS_COLORS[p.status] }}>
                          <Icon size={12} />
                          {STATUS_LABELS[p.status] || p.status}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        {p.comprovante ? (
                          <a
                            href={p.comprovante}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {p.comprovante.match(/\.pdf$/i)
                              ? <FileText size={14} />
                              : <Eye size={14} />}
                            Ver
                          </a>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {p.status !== 'confirmado' && p.status !== 'cancelado' && (
                          <button
                            onClick={async () => {
                              try {
                                await api.patch(`/pagamentos/${p.id}/status`, { status: 'confirmado' })
                                toast.success('Pagamento confirmado!')
                                const r = await api.get('/relatorios/dashboard')
                                setData(r.data)
                              } catch { toast.error('Erro ao confirmar') }
                            }}
                            className="text-xs bg-green-100 hover:bg-green-200 text-green-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            ✅ Confirmar
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-2 text-gray-500 whitespace-nowrap">
                        {new Date(p.data).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
