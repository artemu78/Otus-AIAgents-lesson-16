import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/Login'

const dresses = [
  // Evening Collection
  {
    id: 1,
    name: 'Midnight Velvet Gown',
    description: 'Luxurious floor-length velvet dress with elegant draping',
    price: 489,
    category: 'evening',
    icon: '✦'
  },
  {
    id: 2,
    name: 'Silk Noir Slip',
    description: 'Minimalist silk slip dress with cowl neckline',
    price: 325,
    category: 'evening',
    icon: '◆'
  },
  {
    id: 3,
    name: 'Celestial Sequin',
    description: 'Hand-beaded sequin dress with starry constellation pattern',
    price: 695,
    category: 'evening',
    icon: '✧'
  },
  {
    id: 4,
    name: 'Emerald Satin',
    description: 'Emerald green satin midi with asymmetric hem',
    price: 445,
    category: 'evening',
    icon: '◇'
  },
  {
    id: 5,
    name: 'Champagne Dreams',
    description: 'Flowing champagne tulle with delicate embroidery',
    price: 550,
    category: 'evening',
    icon: '❖'
  },
  // Casual Collection
  {
    id: 6,
    name: 'Linen Sunrise',
    description: 'Breezy linen dress perfect for summer days',
    price: 195,
    category: 'casual',
    icon: '☀'
  },
  {
    id: 7,
    name: 'Cotton Meadow',
    description: 'Soft cotton midi with vintage floral print',
    price: 165,
    category: 'casual',
    icon: '✿'
  },
  {
    id: 8,
    name: 'Denim Serenity',
    description: 'Structured denim shirtdress with brass buttons',
    price: 225,
    category: 'casual',
    icon: '✦'
  },
  {
    id: 9,
    name: 'Bohemian Breeze',
    description: 'Flowing maxi dress with ethnic embroidery',
    price: 275,
    category: 'casual',
    icon: '❀'
  },
  {
    id: 10,
    name: 'Classic Stripes',
    description: 'Nautical striped dress with nautical details',
    price: 145,
    category: 'casual',
    icon: '⚓'
  },
  // Summer Collection
  {
    id: 11,
    name: 'Azure Breeze Maxi',
    description: 'Lightweight sky blue cotton maxi with spaghetti straps',
    price: 185,
    category: 'summer',
    icon: '☁'
  },
  {
    id: 12,
    name: 'Lemon Zest Sundress',
    description: 'Bright yellow linen dress with button-down front',
    price: 155,
    category: 'summer',
    icon: '☀'
  }
]

function App() {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is logged in via cookie
    const token = document.cookie.split('; ').find(row => row.startsWith('sb-access-token='))
    if (token) {
      // In a real app, we would fetch user data from Supabase using the token
      // For now, we'll just set a placeholder or look for a stored user info
      const storedUser = localStorage.getItem('elise_user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    }
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    localStorage.setItem('elise_user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    localStorage.removeItem('elise_user')
    setUser(null)
  }

  const filteredDresses = activeFilter === 'all'
    ? dresses
    : dresses.filter(d => d.category === activeFilter)

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
      <header className="header">
        <a href="#" className="logo">ÉLISE</a>
        <nav>
          <ul className="nav-links">
            <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveFilter('all'); }}>Collection</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveFilter('evening'); }}>Evening</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveFilter('casual'); }}>Casual</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveFilter('summer'); }}>Summer</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveFilter('workwear'); }}>Workwear</a></li>
            <li><a href="#">About</a></li>
          </ul>
        </nav>
        <div className="header-actions">
          {user ? (
            <div className="user-menu">
              <span className="user-name">Bonjour, {user.email.split('@')[0]}</span>
              <button className="auth-toggle" onClick={handleLogout}>Log Out</button>
            </div>
          ) : (
            <button className="auth-toggle" onClick={() => setIsLoginOpen(true)}>Sign In</button>
          )}
          <button className="cart-button" onClick={() => setIsCartOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <path d="M3 6h18"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            Bag
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <p className="hero-label">Spring/Summer Collection</p>
        <h1>Elegance Woven</h1>
        <p>Discover our curated collection of timeless dresses crafted for the modern woman</p>
      </section>

      {/* Category Filter */}
      <div className="category-filter">
        <button
          className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Pieces
        </button>
        <button
          className={`filter-button ${activeFilter === 'evening' ? 'active' : ''}`}
          onClick={() => setActiveFilter('evening')}
        >
          Evening
        </button>
        <button
          className={`filter-button ${activeFilter === 'casual' ? 'active' : ''}`}
          onClick={() => setActiveFilter('casual')}
        >
          Casual
        </button>
        <button
          className={`filter-button ${activeFilter === 'summer' ? 'active' : ''}`}
          onClick={() => setActiveFilter('summer')}
        >
          Summer
        </button>
        <button
          className={`filter-button ${activeFilter === 'workwear' ? 'active' : ''}`}
          onClick={() => setActiveFilter('workwear')}
        >
          Workwear
        </button>
      </div>

      {/* Products Grid */}
      <section className="products-section">
        <div className="products-grid">
          {filteredDresses.length === 0 ? (
            <div className="no-products">
              <p>No products found</p>
              <button className="clear-filter-btn" onClick={() => setActiveFilter('all')}>
                Clear Filters
              </button>
            </div>
          ) : (
            filteredDresses.map(dress => (
              <article key={dress.id} className="product-card">
                <div className="product-image">
                  <span className="product-image-placeholder">{dress.icon}</span>
                  <span className="product-category-tag">
                    {dress.category}
                  </span>
                </div>
                <div className="product-info">
                  <h3 className="product-name">{dress.name}</h3>
                  <p className="product-description">{dress.description}</p>
                  <div className="product-footer">
                    <span className="product-price">${dress.price}</span>
                    <button
                      className="add-to-cart"
                      onClick={() => addToCart(dress)}
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>ÉLISE</h3>
            <p>Timeless elegance for the modern woman. Each piece is thoughtfully designed to inspire confidence and grace.</p>
          </div>
          <div className="footer-section">
            <h3>Shop</h3>
            <a href="#">Evening Collection</a>
            <a href="#">Casual Collection</a>
            <a href="#">New Arrivals</a>
            <a href="#">Gift Cards</a>
          </div>
          <div className="footer-section">
            <h3>Help</h3>
            <a href="#">Size Guide</a>
            <a href="#">Shipping & Returns</a>
            <a href="#">Contact Us</a>
            <a href="#">FAQ</a>
          </div>
          <div className="footer-section">
            <h3>Connect</h3>
            <a href="#">Instagram</a>
            <a href="#">Pinterest</a>
            <a href="#">Newsletter</a>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 ÉLISE. All rights reserved.
        </div>
      </footer>

      {/* Cart Overlay */}
      <div
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Sidebar */}
      <aside className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2 className="cart-title">Shopping Bag</h2>
          <button className="close-cart" onClick={() => setIsCartOpen(false)}>
            ×
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>Your bag is empty</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Discover our collection
              </p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <span>{item.icon}</span>
                </div>
                <div className="cart-item-details">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <p className="cart-item-price">${item.price}</p>
                  <div className="cart-item-quantity">
                    <button
                      className="quantity-button"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      −
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      className="quantity-button"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      +
                    </button>
                    <button
                      className="remove-item"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-price">${totalPrice}</span>
            </div>
            <button className="checkout-button">
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>

      <Login 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}

export default App