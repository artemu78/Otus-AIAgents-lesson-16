import { Search } from '../Search';

export const Header = ({ user, setActiveFilter, totalItems, onOpenLogin, onOpenCart, onLogout, onSearch, onClearSearch }) => {

    return (
        <header className="header">
        <a href="#" className="logo">ÉLISE</a>
        <Search onSearch={onSearch} onClear={onClearSearch} />
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
              <button className="auth-toggle" onClick={onLogout}>Log Out</button>
            </div>
          ) : (
            <button className="auth-toggle" onClick={onOpenLogin}>Sign In</button>
          )}
          <button className="cart-button" onClick={onOpenCart}>
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
    )
}