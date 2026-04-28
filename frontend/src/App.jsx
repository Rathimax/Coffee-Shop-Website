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
import { cartService } from './services/cartService'

function App() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [user, setUser] = React.useState(null);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [showDetailsForm, setShowDetailsForm] = React.useState(false);
  const [cart, setCart] = React.useState([]);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isAccountOpen, setIsAccountOpen] = React.useState(false);
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  // 1. Initial load (LocalStorage for guests, then DB if logged in)
  React.useEffect(() => {
    const init = async () => {
      const savedCart = localStorage.getItem('beige_beans_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      setIsInitialLoad(false);
    };
    init();
  }, []);

  // 2. Fetch/Merge cart on login
  React.useEffect(() => {
    if (!user || isInitialLoad) return;

    const syncOnLogin = async () => {
      const dbCart = await cartService.getCart(user.uid);
      const localCart = JSON.parse(localStorage.getItem('beige_beans_cart') || '[]');
      
      if (dbCart.length > 0) {
        // Simple merge: Prefer DB items, but add local items that don't exist in DB
        const mergedCart = [...dbCart];
        for (const localItem of localCart) {
          const itemId = localItem.id || localItem._id;
          if (!mergedCart.find(i => i.id === itemId)) {
            mergedCart.push(localItem);
            await cartService.saveItem(user.uid, localItem);
          }
        }
        setCart(mergedCart);
      } else if (localCart.length > 0) {
        // If DB empty but local has items, upload local cart
        for (const item of localCart) {
          await cartService.saveItem(user.uid, item);
        }
        setCart(localCart);
      }
    };
    syncOnLogin();
  }, [user, isInitialLoad]);

  // 3. One-way Sync to DB whenever cart state changes (debounced/throttled or simple)
  // We'll use individual actions to sync to avoid full-sync overhead
  
  React.useEffect(() => {
    localStorage.setItem('beige_beans_cart', JSON.stringify(cart));
  }, [cart]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && !currentUser.displayName) {
        setShowDetailsForm(true);
      } else {
        setShowDetailsForm(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (item) => {
    const itemId = item.id || item._id;
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === itemId);
      if (existingItem) {
        return prevCart.map(i => i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        return [...prevCart, { ...item, id: itemId, quantity: 1 }];
      }
    });

    if (user) {
      // Find the updated quantity after state update (or just use logic)
      setCart(currentCart => {
        const updatedItem = currentCart.find(i => i.id === itemId);
        if (updatedItem) {
          cartService.saveItem(user.uid, updatedItem);
        }
        return currentCart;
      });
    }
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
    if (user) {
      cartService.removeItem(user.uid, id);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(prevCart => {
      const newCart = prevCart.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
      
      return newCart;
    });

    if (user) {
      // Use a timeout or secondary effect to sync after state update
      // For now, let's just use the current cart in a separate call
      setCart(currentCart => {
        const updatedItem = currentCart.find(i => i.id === id);
        if (updatedItem) {
          cartService.saveItem(user.uid, updatedItem);
        } else {
          cartService.removeItem(user.uid, id);
        }
        return currentCart;
      });
    }
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
