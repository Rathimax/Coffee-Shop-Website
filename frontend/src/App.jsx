import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import CoffeeHero from './components/CoffeeHero'
import MenuSection from './components/MenuSection'
import AboutSection from './components/AboutSection'
import LoginModal from './components/LoginModal'
import AuthDetailsForm from './components/AuthDetailsForm'
import CartDrawer from './components/CartDrawer'
import AccountDrawer from './components/AccountDrawer'
import AdminDashboard from './components/AdminDashboard'
import AdminRoute from './components/AdminRoute'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { cartService } from './services/cartService'

function App() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [user, setUser] = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [showDetailsForm, setShowDetailsForm] = React.useState(false);
  const [cart, setCart] = React.useState([]);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isAccountOpen, setIsAccountOpen] = React.useState(false);
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  // 1. Auth State Listener
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser && !currentUser.displayName) {
        setShowDetailsForm(true);
      } else {
        setShowDetailsForm(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Initial Data Load is now handled by the Cart Syncing effect after auth resolves.
  // We removed the old init() effect to prevent race conditions with auth.

  const hasLoggedVisit = React.useRef(false);

  // 3. Analytics Visit Logging — only count authenticated Gmail users, once per page session
  React.useEffect(() => {
    if (authLoading || !user?.email || hasLoggedVisit.current) return;

    const logVisit = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
        await fetch(`${apiUrl}/api/analytics/visit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail: user.email })
        });
        hasLoggedVisit.current = true; // Mark as logged for this page session
      } catch (err) {
        console.warn("Analytics visit log failed:", err);
      }
    };

    logVisit();
  }, [user?.email, authLoading]);

  // 4. Cart Syncing & State Management
  React.useEffect(() => {
    if (authLoading) return; // Wait for auth to resolve

    if (!user) {
      // User is a guest
      const savedCart = localStorage.getItem('beige_beans_cart_guest');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        // Migration from old generic key
        const oldCart = localStorage.getItem('beige_beans_cart');
        if (oldCart) {
          setCart(JSON.parse(oldCart));
          localStorage.setItem('beige_beans_cart_guest', oldCart);
          localStorage.removeItem('beige_beans_cart');
        } else {
          setCart([]);
        }
      }
    } else {
      // User is logged in
      const syncOnLogin = async () => {
        const dbCart = await cartService.getCart(user.uid);
        
        // Grab guest cart (or old generic cart) to merge
        const guestCart = JSON.parse(localStorage.getItem('beige_beans_cart_guest') || '[]');
        const oldCart = JSON.parse(localStorage.getItem('beige_beans_cart') || '[]');
        const toMerge = guestCart.length > 0 ? guestCart : oldCart;
        
        let mergedCart = [...dbCart];
        if (toMerge.length > 0) {
          for (const localItem of toMerge) {
            const itemId = localItem.id || localItem._id;
            if (!mergedCart.find(i => i.id === itemId)) {
              mergedCart.push(localItem);
              await cartService.saveItem(user.uid, localItem);
            }
          }
          // Clear guest cart after merge to prevent leaking to another account
          localStorage.removeItem('beige_beans_cart_guest');
          localStorage.removeItem('beige_beans_cart');
        }
        
        setCart(mergedCart);
      };
      syncOnLogin();
    }
  }, [user, authLoading]);

  React.useEffect(() => {
    if (authLoading) return;
    const key = user ? `beige_beans_cart_${user.uid}` : 'beige_beans_cart_guest';
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, user, authLoading]);

  const addToCart = (item) => {
    const itemId = item.id || item._id;
    const maxStock = item.stockQuantity !== undefined ? item.stockQuantity : 100;

    let wasAdded = true;
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === itemId);
      if (existingItem) {
        if (existingItem.quantity >= maxStock) {
          alert(`Cannot add more. Only ${maxStock} items left in stock.`);
          wasAdded = false;
          return prevCart;
        }
        return prevCart.map(i => i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        if (maxStock <= 0) {
          alert(`Item is sold out!`);
          wasAdded = false;
          return prevCart;
        }
        return [...prevCart, { ...item, id: itemId, quantity: 1 }];
      }
    });

    if (user && wasAdded) {
      const existingItem = cart.find(i => i.id === itemId);
      const newQty = existingItem ? existingItem.quantity + 1 : 1;
      cartService.saveItem(user.uid, { ...item, id: itemId, quantity: newQty });
    }
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
    if (user) {
      cartService.removeItem(user.uid, id);
    }
  };

  const updateQuantity = (id, delta) => {
    let canUpdate = true;
    setCart(prevCart => {
      const newCart = prevCart.map(item => {
        if (item.id === id) {
          const maxStock = item.stockQuantity !== undefined ? item.stockQuantity : 100;
          const newQty = item.quantity + delta;
          if (newQty > maxStock) {
            alert(`Cannot add more. Only ${maxStock} items left in stock.`);
            canUpdate = false;
            return item;
          }
          return { ...item, quantity: Math.max(0, newQty) };
        }
        return item;
      }).filter(item => item.quantity > 0);
      return newCart;
    });

    if (user && canUpdate) {
      const item = cart.find(i => i.id === id);
      if (item) {
        const newQty = item.quantity + delta;
        if (newQty > 0) {
          cartService.saveItem(user.uid, { ...item, quantity: newQty });
        } else {
          cartService.removeItem(user.uid, id);
        }
      }
    }
  };

  const checkout = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (cart.length === 0) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
      const orderData = {
        userEmail: user.email,
        items: cart,
        totalAmount: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
      };

      const res = await fetch(`${apiUrl}/api/orders/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        setCart([]);
        localStorage.removeItem('beige_beans_cart');
        alert("Order placed successfully! Thank you for your purchase. ☕");
        setIsCartOpen(false);
      } else {
        throw new Error("Failed to place order");
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Something went wrong with your order. Please try again.");
    }
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={
          <>
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
              onCheckout={checkout}
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
          </>
        } />
        <Route path="/admin" element={
          <AdminRoute user={user} loading={authLoading}>
            <AdminDashboard />
          </AdminRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
