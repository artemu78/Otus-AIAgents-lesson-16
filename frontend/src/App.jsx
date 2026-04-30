import { useState, useEffect } from 'react'
import './App.css'
import { Login } from './components/Login'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Category } from './components/Category'
import { Hero } from "./components/Hero"
import { Cart } from "./components/Cart" 
import { ProductGrid } from './components/ProductGrid'
import { getCurrentUser, signOut } from './api/auth'
import { useGoods } from './hooks/useGoods'
import { transformDresses } from './lib/getgoo'
import { getEmbedding } from './lib/getEmbedding'

function App() {
  const [dresses, setDresses] = useState([])
  const { goods, loading: goodsLoading, searchGoods } = useGoods()
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [searchResults, setSearchResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    setDresses(transformDresses(goods))
  }, [goods])

  useEffect(() => {
    const restoreUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch {
        setUser(null)
      }
    }

    restoreUser()
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    await signOut()
    setUser(null)
  }

  const filteredDresses = searchResults !== null 
    ? searchResults
    : (activeFilter === 'all'
        ? dresses
        : dresses.filter(d => d.category === activeFilter))

  const handleSearch = async (query) => {
    setIsSearching(true)
    
    try {
      const embedding = await getEmbedding(query)
      const results = await searchGoods(query, embedding)
      setSearchResults(transformDresses(results))
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleClearSearch = () => {
    setSearchResults(null)
  }

  const handleSetFilter = (filter) => {
    setActiveFilter(filter)
    handleClearSearch()
  }

  const addToCart = (dress) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === dress.id)
      if (existing) {
        return prev.map(item =>
          item.id === dress.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...dress, quantity: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id, delta) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
        }
        return item
      }).filter(item => item.quantity > 0)
    )
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <>
      {/* Header */}
      <Header
        user={user}
        setActiveFilter={handleSetFilter}
        totalItems={totalItems}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
      />

      {/* Hero */}
      <Hero />

      {/* Category Filter */}
      <Category activeFilter={activeFilter} setActiveFilter={handleSetFilter} />

      {/* Products Grid */}
      <ProductGrid 
        loading={goodsLoading || isSearching} 
        filteredDresses={filteredDresses} 
        setActiveFilter={handleSetFilter} 
        addToCart={addToCart} 
      />

      {/* Footer */}
      <Footer />

      {/* Cart Overlay */}
      <div
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Sidebar */}
      <Cart
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cart={cart}
        totalPrice={totalPrice}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />

      <Login 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}

export default App
App
