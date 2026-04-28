import React from 'react'
import Navbar from './components/Navbar'
import CoffeeHero from './components/CoffeeHero'
import MenuSection from './components/MenuSection'
import AboutSection from './components/AboutSection'
import LoginModal from './components/LoginModal'
import AuthDetailsForm from './components/AuthDetailsForm'
import CartDrawer from './components/CartDrawer'
import AccountDrawer from './components/AccountDrawer'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import './App.css'

function App() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [user, setUser] = React.useState(null);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [showDetailsForm, setShowDetailsForm] = React.useState(false);
  const [cart, setCart] = React.useState([]);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isAccountOpen, setIsAccountOpen] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Show details form if user is logged in but has no display name (common for new email signups)
      if (currentUser && !currentUser.displayName) {
        setShowDetailsForm(true);
      } else {
        setShowDetailsForm(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === item.id);
      if (existingItem) {
        return prevCart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  return (
    <div className="App">
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <AuthDetailsForm 
        isOpen={showDetailsForm} 
        user={user} 
        onComplete={() => setShowDetailsForm(false)} 
      />
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />
      <AccountDrawer 
        isOpen={isAccountOpen} 
        onClose={() => setIsAccountOpen(false)} 
        user={user}
      />
      <Navbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        user={user} 
        onLoginClick={() => setShowLoginModal(true)}
        onAccountClick={() => setIsAccountOpen(true)}
        onCartClick={() => setIsCartOpen(true)}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
      />
      <CoffeeHero />
      <MenuSection 
        searchQuery={searchQuery} 
        user={user} 
        onOrderRequired={() => setShowLoginModal(true)} 
        onAddToCart={addToCart}
      />
      <AboutSection />

      {/* Footer Section */}
      <footer style={{
        padding: '30px 5%',
        background: 'var(--sidebar)',
        color: 'var(--foreground)',
        textAlign: 'center',
        borderTop: '1px solid var(--border)'
      }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '10px', fontSize: '1.5rem' }}>Beige & Beans</h2>
        <p style={{ opacity: 0.7, maxWidth: '400px', margin: '0 auto 15px', fontSize: '0.9rem' }}>
          Sustainable, artisan coffee delivered from our roastery to your cup.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '20px' }}>
          <span>Instagram</span>
          <span>Twitter</span>
          <span>Facebook</span>
        </div>
        <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>
          © 2026 Beige & Beans. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default App
