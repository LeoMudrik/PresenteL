import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]')
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (presente, quantidade = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.presente_id === presente.id)
      if (existing) {
        const newQty = existing.quantidade + quantidade
        if (newQty > presente.quantidade) {
          toast.error(`Estoque insuficiente! Máximo: ${presente.quantidade}`)
          return prev
        }
        toast.success(`${presente.nome} atualizado no carrinho!`)
        return prev.map(i => i.presente_id === presente.id ? { ...i, quantidade: newQty } : i)
      }
      if (quantidade > presente.quantidade) {
        toast.error(`Estoque insuficiente! Máximo: ${presente.quantidade}`)
        return prev
      }
      toast.success(`${presente.nome} adicionado ao carrinho!`)
      return [...prev, {
        presente_id: presente.id,
        nome: presente.nome,
        descricao: presente.descricao,
        valor: presente.valor,
        imagem: presente.imagem,
        estoqueMax: presente.quantidade,
        quantidade,
      }]
    })
  }

  const updateQty = (presente_id, quantidade, estoqueMax) => {
    if (quantidade < 1) return removeItem(presente_id)
    if (quantidade > estoqueMax) {
      toast.error(`Estoque máximo: ${estoqueMax}`)
      return
    }
    setItems(prev => prev.map(i => i.presente_id === presente_id ? { ...i, quantidade } : i))
  }

  const removeItem = (presente_id) => {
    setItems(prev => prev.filter(i => i.presente_id !== presente_id))
    toast.success('Item removido do carrinho')
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, i) => sum + i.valor * i.quantidade, 0)
  const totalItems = items.reduce((sum, i) => sum + i.quantidade, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, total, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
