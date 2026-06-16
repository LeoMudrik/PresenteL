export default function Loading({ text = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
      <p className="text-primary-700 font-medium">{text}</p>
    </div>
  )
}
