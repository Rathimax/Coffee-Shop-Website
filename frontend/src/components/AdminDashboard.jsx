import React, { useState, useEffect, useRef } from 'react';
import { logout } from '../firebase';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, HeadingLevel, BorderStyle, AlignmentType, ShadingType } from 'docx';
import { saveAs } from 'file-saver';

// --- Monochromatic Icons ---
const Icons = {
  Analytics: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Coffee: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>,
  Sparkles: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>,
  TrendingUp: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  ShoppingBag: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  DollarSign: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Snow: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m14 10-5.5 5.5"/><path d="m10 14 5.5-5.5"/><path d="M14 22v-3"/><path d="M14 5V2"/><path d="M22 14h-3"/><path d="M5 14H2"/><path d="M4.93 4.93 7.05 7.05"/><path d="m16.95 16.95 2.12 2.12"/><path d="m16.95 7.05 2.12-2.12"/><path d="M4.93 19.07 7.05 16.95"/></svg>,
  Cookie: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>,
  ClipboardList: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
};

// --- Custom Category Combobox ---
const PRESET_CATEGORIES = ['Hot Coffee', 'Cold Brews', 'Artisan Snacks', 'Seasonal Specials', 'Pastries'];

const CategoryCombobox = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value || '');
  const containerRef = useRef(null);

  // Sync input when parent value changes
  useEffect(() => { setInput(value || ''); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (e) => {
    setInput(e.target.value);
    onChange(e.target.value);
    setOpen(true);
  };

  const handleSelect = (cat) => {
    setInput(cat);
    onChange(cat);
    setOpen(false);
  };

  const filtered = PRESET_CATEGORIES.filter(c =>
    c.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div ref={containerRef} className="combobox-wrapper">
      <div className="combobox-input-row">
        <input
          type="text"
          placeholder="Category (type or pick)"
          value={input}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          className="combobox-input"
          autoComplete="off"
        />
        <button
          type="button"
          className="combobox-arrow"
          onClick={() => setOpen(o => !o)}
          tabIndex={-1}
          aria-label="Toggle options"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d={open ? 'M2 8L6 4L10 8' : 'M2 4L6 8L10 4'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      {open && (
        <ul className="combobox-dropdown">
          {filtered.length > 0 ? filtered.map(cat => (
            <li
              key={cat}
              className={`combobox-option ${input === cat ? 'selected' : ''}`}
              onMouseDown={() => handleSelect(cat)}
            >
              <span className="combobox-option-dot" />
              {cat}
            </li>
          )) : (
            <li className="combobox-option muted">
              Press Enter to use “{input}”
            </li>
          )}
          {input && !PRESET_CATEGORIES.includes(input) && (
            <li
              className="combobox-option custom"
              onMouseDown={() => handleSelect(input)}
            >
              <span style={{ opacity: 0.5, fontSize: '0.8rem', marginRight: '8px' }}>+</span>
              Use “{input}” as custom
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

// --- Custom Filter Dropdown ---
const CustomDropdown = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '200px' }}>
      <button 
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'white',
          border: '1px solid rgba(163, 119, 100, 0.15)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '0.85rem',
          fontFamily: 'inherit',
          cursor: 'pointer',
          color: 'var(--foreground)'
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {options.find(o => o.value === value)?.label || 'Select...'}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, marginLeft: '8px' }}>
          <path d={open ? 'M2 8L6 4L10 8' : 'M2 4L6 8L10 4'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      {open && (
        <ul style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid rgba(163, 119, 100, 0.15)',
          borderRadius: '8px',
          padding: '6px 0',
          margin: 0,
          listStyle: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          zIndex: 100,
          maxHeight: '250px',
          overflowY: 'auto'
        }}>
          {options.map((opt) => (
            <li 
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: '8px 16px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: value === opt.value ? 'rgba(163, 119, 100, 0.08)' : 'transparent',
                fontWeight: value === opt.value ? '600' : '400',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                if (value !== opt.value) e.target.style.background = 'rgba(163, 119, 100, 0.04)';
              }}
              onMouseLeave={(e) => {
                if (value !== opt.value) e.target.style.background = 'transparent';
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// --- Revenue Dropdown ---
const RevenueDropdown = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button 
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(0,0,0,0.15)',
          border: 'none',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '0.75rem',
          fontWeight: '600',
          fontFamily: 'inherit',
          cursor: 'pointer',
          color: 'inherit',
          transition: 'background 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.25)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
      >
        <span style={{ whiteSpace: 'nowrap' }}>
          {options.find(o => o.value === value)?.label || 'Select...'}
        </span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <path d={open ? 'M2 8L6 4L10 8' : 'M2 4L6 8L10 4'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      {open && (
        <ul style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: 0,
          background: '#5a3e31', // Darker brown for contrast
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          padding: '4px 0',
          margin: 0,
          listStyle: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 100,
          minWidth: '110px'
        }}>
          {options.map((opt) => (
            <li 
              key={opt.value}
              onClick={(e) => { e.stopPropagation(); onChange(opt.value); setOpen(false); }}
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                background: value === opt.value ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: 'white',
                fontWeight: value === opt.value ? '600' : '400',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                if (value !== opt.value) e.target.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                if (value !== opt.value) e.target.style.background = 'transparent';
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// --- Count Type Info Tooltip ---
const CountTypeInfo = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ display: 'inline-block', position: 'relative', marginLeft: '6px' }}>
      <button 
        type="button" 
        onClick={() => setOpen(!open)}
        style={{
          width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(0,0,0,0.1)', 
          color: 'var(--muted-foreground)', fontSize: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer', padding: 0, fontWeight: 'bold'
        }}
        title="More info"
      >
        i
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-20%)', /* slightly offset so it doesn't overflow left */
          width: '240px', background: 'white', border: '1px solid #e9e7d9', borderRadius: '8px',
          padding: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100,
          fontSize: '12px', color: 'var(--foreground)', fontWeight: '400', lineHeight: '1.5',
          fontFamily: 'var(--font-sans)', textTransform: 'none', letterSpacing: 'normal'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Exact Count</strong><br/>
            Strictly auto-deducts per order. Item automatically goes out of stock when it hits zero.
          </div>
          <div>
            <strong>Approximate</strong><br/>
            For estimated inventory (e.g. coffee beans in bulk). Starts tracking from your estimate. You can reconcile discrepancies later via the live collection list.
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [stats, setStats] = useState({
    monthlyVisits: 0,
    totalPurchases: 0,
    todayRevenue: 0,
    thisWeekRevenue: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    totalVisits: 0
  });
  const [revenueFilter, setRevenueFilter] = useState('todayRevenue');
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: '', imageUrl: '', stockQuantity: '', stockType: 'exact' });
  const [reconcilingItemId, setReconcilingItemId] = useState(null);
  const [reconcileCount, setReconcileCount] = useState('');
  const [reconcileResult, setReconcileResult] = useState(null);

  const mainRef = useRef(null);
  const sidebarRef = useRef(null);

  const [analyticsSearch, setAnalyticsSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [menuCatFilter, setMenuCatFilter] = useState('ALL');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFileName, setExportFileName] = useState('inventory_report');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [itemToDelete, setItemToDelete] = useState(null);

  // Dynamic analytics helper calculations
  const getTopSellingItems = () => {
    const counts = {};
    orders.forEach(order => {
      if (order.status === 'CANCELLED') return;
      order.items.forEach(item => {
        const name = item.name;
        if (!counts[name]) {
          counts[name] = {
            name: name,
            quantity: 0,
            revenue: 0,
            category: 'Other'
          };
          const menuMatch = menu.find(m => m.name === name || m.id === item.productId);
          if (menuMatch) counts[name].category = menuMatch.category;
        }
        counts[name].quantity += item.quantity;
        counts[name].revenue += item.quantity * item.price;
      });
    });
    return Object.values(counts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const getCategorySales = () => {
    const sales = {};
    orders.forEach(order => {
      if (order.status === 'CANCELLED') return;
      order.items.forEach(item => {
        const menuMatch = menu.find(m => m.name === item.name || m.id === item.productId);
        const category = menuMatch ? menuMatch.category : 'Other';
        if (!sales[category]) {
          sales[category] = 0;
        }
        sales[category] += item.quantity * item.price;
      });
    });
    return Object.entries(sales).map(([cat, rev]) => ({ category: cat, revenue: rev }));
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = orderStatusFilter === 'ALL' || order.status === orderStatusFilter;
    const matchesSearch = orderSearchQuery === '' || 
      order.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) || 
      order.userEmail.toLowerCase().includes(orderSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredMenu = menu.filter(item => {
    const matchesCat = menuCatFilter === 'ALL' || item.category === menuCatFilter;
    const matchesSearch = menuSearchQuery === '' || 
      item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) || 
      (item.description && item.description.toLowerCase().includes(menuSearchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';

  useEffect(() => {
    // Simple entrance animation via CSS — no GSAP on sidebar/main to keep it clean
    if (sidebarRef.current) sidebarRef.current.style.animation = 'slideInLeft 0.6s ease forwards';
    if (mainRef.current) mainRef.current.style.animation = 'fadeInUp 0.6s 0.2s ease both';

    fetchStats();
    fetchMenu();
    fetchOrders();
  }, []);

  useEffect(() => {
    let interval;
    if (activeTab === 'orders') {
      interval = setInterval(() => {
        fetchOrders();
      }, 5000); // Poll every 5 seconds for live orders
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/analytics`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // Check if an item is sold out based on the same logic used in the storefront
  const checkSoldOut = (item) => {
    if (item.available === false) return true;
    if (item.stockQuantity === null || item.stockQuantity === '') return true;
    if (item.stockQuantity !== undefined && item.stockQuantity <= 0) return true;
    return false;
  };

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/menu`);
      const data = await res.json();
      setMenu(data);
    } catch (err) {
      console.error("Failed to fetch menu:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/orders`);
      const data = await res.json();
      // Sort orders so newest are at the top, or order by status logic
      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      alert("Failed to update order status");
    }
  };

  const toggleAvailability = async (item) => {
    try {
      const isAvailable = item.available !== false; // Check current availability
      const res = await fetch(`${apiUrl}/api/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, available: !isAvailable })
      });
      if (res.ok) fetchMenu();
    } catch (err) {
      alert("Failed to toggle availability");
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Beige & Beans - Inventory Report', 14, 15);
    
    const tableColumn = ["Name", "Category", "Price", "Stock Type", "Stock Qty", "Available"];
    const tableRows = [];

    menu.forEach(item => {
      const itemData = [
        item.name,
        item.category || 'N/A',
        `$${item.price.toFixed(2)}`,
        item.stockType || 'exact',
        item.stockQuantity !== null && item.stockQuantity !== undefined ? item.stockQuantity : 'N/A',
        checkSoldOut(item) ? 'No' : 'Yes'
      ];
      tableRows.push(itemData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [163, 119, 100] } // matches var(--primary) roughly
    });

    const finalName = exportFileName.trim() ? exportFileName.trim() : 'inventory_report';
    doc.save(`${finalName}.pdf`);
    setShowExportModal(false);
  };

  const exportToWord = async () => {
    const finalName = exportFileName.trim() ? exportFileName.trim() : 'inventory_report';

    const headerStyle = {
      margins: { top: 100, bottom: 100, left: 100, right: 100 },
      shading: { fill: "A37764", type: ShadingType.CLEAR }
    };
    const cellStyle = { margins: { top: 80, bottom: 80, left: 100, right: 100 } };

    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ ...headerStyle, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Name", bold: true, color: "FFFFFF" })] })] }),
          new TableCell({ ...headerStyle, width: { size: 2000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Category", bold: true, color: "FFFFFF" })] })] }),
          new TableCell({ ...headerStyle, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Price", bold: true, color: "FFFFFF" })] })] }),
          new TableCell({ ...headerStyle, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Stock Type", bold: true, color: "FFFFFF" })] })] }),
          new TableCell({ ...headerStyle, width: { size: 1250, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Stock Qty", bold: true, color: "FFFFFF" })] })] }),
          new TableCell({ ...headerStyle, width: { size: 1250, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Available", bold: true, color: "FFFFFF" })] })] }),
        ]
      }),
      ...menu.map(item => new TableRow({
        children: [
          new TableCell({ ...cellStyle, children: [new Paragraph({ text: item.name })] }),
          new TableCell({ ...cellStyle, children: [new Paragraph({ text: item.category || 'N/A' })] }),
          new TableCell({ ...cellStyle, children: [new Paragraph({ text: `$${item.price.toFixed(2)}` })] }),
          new TableCell({ ...cellStyle, children: [new Paragraph({ text: item.stockType || 'exact' })] }),
          new TableCell({ ...cellStyle, children: [new Paragraph({ text: `${item.stockQuantity !== null && item.stockQuantity !== undefined ? item.stockQuantity : 'N/A'}` })] }),
          new TableCell({ ...cellStyle, children: [new Paragraph({ text: checkSoldOut(item) ? 'No' : 'Yes' })] }),
        ]
      }))
    ];

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ 
            text: "Beige & Beans - Inventory Report", 
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 }
          }),
          new Table({
            columnWidths: [2500, 2000, 1500, 1500, 1250, 1250],
            width: { size: 10000, type: WidthType.DXA },
            layout: 'fixed',
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "E9E7D9" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "E9E7D9" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "E9E7D9" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "E9E7D9" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E9E7D9" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E9E7D9" }
            },
            rows: tableRows
          })
        ],
      }]
    });

    try {
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${finalName}.docx`);
    } catch (error) {
      console.error("Error creating Word document:", error);
      alert("Failed to export Word document.");
    }

    setShowExportModal(false);
  };

  const handleDownload = () => {
    if (exportFormat === 'pdf') {
      exportToPDF();
    } else {
      exportToWord();
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const payload = {
      ...newItem,
      initialEstimate: newItem.stockQuantity !== '' ? parseInt(newItem.stockQuantity) : null,
      stockSetAt: new Date().toISOString()
    };
    try {
      const res = await fetch(`${apiUrl}/api/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNewItem({ name: '', description: '', price: '', category: '', imageUrl: '', stockQuantity: '', stockType: 'exact' });
        fetchMenu();
      }
    } catch (err) {
      alert("Failed to add item");
    }
  };

  const handleReconcile = async (itemId) => {
    if (reconcileCount === '') return;
    try {
      const res = await fetch(`${apiUrl}/api/menu/${itemId}/reconcile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actualCount: parseInt(reconcileCount) })
      });
      if (res.ok) {
        const data = await res.json();
        setReconcileResult(data);
        fetchMenu();
        // Auto-close after 5 seconds
        setTimeout(() => {
          setReconcilingItemId(null);
          setReconcileResult(null);
          setReconcileCount('');
        }, 6000);
      }
    } catch (err) {
      alert("Failed to reconcile stock");
    }
  };

  const getDaysSince = (dateStr) => {
    if (!dateStr) return null;
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/api/menu/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem)
      });
      if (res.ok) {
        setEditingItem(null);
        fetchMenu();
      }
    } catch (err) {
      alert("Failed to update item");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/api/menu/${id}`, { method: 'DELETE' });
      if (res.ok) fetchMenu();
    } catch (err) {
      alert("Failed to delete item");
    } finally {
      setItemToDelete(null);
    }
  };

  if (loading && menu.length === 0) {
    return (
      <div style={{ 
        height: '100vh', 
        width: '100vw', 
        background: 'var(--background)', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid var(--primary)', 
          borderTopColor: 'transparent', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <h2 style={{ color: 'var(--primary)', fontFamily: 'var(--font-serif)', fontWeight: '400' }}>Brewing Artisan Dashboard...</h2>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Sidebar */}
      <aside ref={sidebarRef} style={sidebarStyle}>
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: '5px' }}>Beige & Beans</h2>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.5 }}>Owner Dashboard</p>
        </div>
        
        <nav style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <TabButton 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')}
            label="Analytics Overview"
            icon={Icons.Analytics}
          />
          <TabButton 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')}
            label="Live Orders"
            icon={Icons.ClipboardList}
          />
          <TabButton 
            active={activeTab === 'cms'} 
            onClick={() => setActiveTab('cms')}
            label="Menu Management"
            icon={Icons.Coffee}
          />
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          <button onClick={() => window.location.href = '/'} style={returnButtonStyle} className="admin-sidebar-item">
            Return to Site <span>↗</span>
          </button>
          <button onClick={handleLogout} style={logoutButtonStyle} className="admin-sidebar-item">
            Logout <span>→</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main ref={mainRef} style={{ flexGrow: 1, marginLeft: '300px', padding: '60px 80px', overflowX: 'hidden', maxWidth: 'calc(100vw - 300px)' }}>
        {activeTab === 'analytics' ? (
          <div>
            <header style={{ marginBottom: '40px' }}>
              <h1 style={titleStyle}>Business Insights</h1>
              <p style={{ opacity: 0.6 }}>Tracking the pulse of your artisan coffee shop.</p>
            </header>

            <div key={activeTab} className="admin-stats-grid">
              <StatCard 
                title="Total Visits" 
                value={stats.totalVisits} 
                subtitle="Since launch"
                icon={Icons.Sparkles}
              />
              <StatCard 
                title="Monthly Visits" 
                value={stats.monthlyVisits} 
                subtitle="Last 30 days"
                icon={Icons.TrendingUp}
              />
              <StatCard 
                title="Total Purchases" 
                value={stats.totalPurchases} 
                subtitle="Completed orders"
                icon={Icons.ShoppingBag}
              />
              <StatCard 
                title="Revenue"
                action={
                  <RevenueDropdown 
                    value={revenueFilter}
                    onChange={(val) => setRevenueFilter(val)}
                    options={[
                      { value: 'todayRevenue', label: 'Today' },
                      { value: 'thisWeekRevenue', label: 'This Week' },
                      { value: 'monthlyRevenue', label: 'This Month' },
                      { value: 'totalRevenue', label: 'All Time' }
                    ]}
                  />
                }
                value={`$${(stats[revenueFilter] || 0).toFixed(2)}`} 
                subtitle="Gross earnings"
                icon={Icons.DollarSign}
                highlight
              />
            </div>

            {/* High Density Analytical Insights Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginTop: '40px' }} className="responsive-insights-grid">
              
              {/* Left Column: Recent Orders Activity Log */}
              <div className="admin-card" style={{ padding: '24px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', margin: 0 }}>Recent Activity Log</h3>
                    <p style={{ fontSize: '0.78rem', opacity: 0.5, margin: '2px 0 0' }}>Search and track recent customer transactions</p>
                  </div>
                  <div style={{ width: '220px' }}>
                    <input 
                      type="text" 
                      placeholder="Search email or ID..." 
                      className="admin-search-input"
                      value={analyticsSearch}
                      onChange={(e) => setAnalyticsSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Time</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.filter(o => 
                        analyticsSearch === '' || 
                        o.id.toLowerCase().includes(analyticsSearch.toLowerCase()) || 
                        o.userEmail.toLowerCase().includes(analyticsSearch.toLowerCase())
                      ).slice(0, 7).map(order => {
                        const itemsSummary = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
                        return (
                          <tr key={order.id}>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: '0.8rem' }}>#{order.id.slice(-6).toUpperCase()}</td>
                            <td style={{ fontSize: '0.8rem', opacity: 0.8 }}>{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td style={{ fontSize: '0.8rem', fontWeight: '500' }} title={order.userEmail}>{order.userEmail.split('@')[0]}</td>
                            <td style={{ fontSize: '0.8rem', opacity: 0.7, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={itemsSummary}>{itemsSummary}</td>
                            <td style={{ fontWeight: '600', fontFamily: 'var(--font-mono)' }}>${order.totalAmount.toFixed(2)}</td>
                            <td>
                              <span className="admin-badge" style={{
                                background: order.status === 'COMPLETED' ? '#e6f4ea' : order.status === 'READY' ? '#fce8b2' : order.status === 'PREPARING' ? '#e8eaed' : order.status === 'CANCELLED' ? '#fce8e6' : '#fff3e0',
                                color: order.status === 'COMPLETED' ? '#1e8e3e' : order.status === 'READY' ? '#f29900' : order.status === 'PREPARING' ? '#5f6368' : order.status === 'CANCELLED' ? '#d93025' : '#e67c73'
                              }}>{order.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '30px', opacity: 0.5, fontStyle: 'italic' }}>No transactions recorded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Performance Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* Top Selling Offerings */}
                <div className="admin-card" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '4px' }}>Top Offerings</h3>
                  <p style={{ fontSize: '0.78rem', opacity: 0.5, marginBottom: '20px' }}>Popular items by units sold</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {getTopSellingItems().map((item, idx) => {
                      const maxUnits = Math.max(...getTopSellingItems().map(i => i.quantity), 1);
                      const percent = (item.quantity / maxUnits) * 100;
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{item.name}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{item.quantity} sold</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
                            <div className="progress-bar-bg" style={{ flexGrow: 1 }}>
                              <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', opacity: 0.6, width: '45px', textAlign: 'right' }}>
                              ${item.revenue.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {getTopSellingItems().length === 0 && (
                      <p style={{ opacity: 0.5, fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>No sales data available.</p>
                    )}
                  </div>
                </div>

                {/* Sales by Category */}
                <div className="admin-card" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '4px' }}>Category Sales</h3>
                  <p style={{ fontSize: '0.78rem', opacity: 0.5, marginBottom: '20px' }}>Revenue distribution by type</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {getCategorySales().map((item, idx) => {
                      const totalRev = getCategorySales().reduce((acc, c) => acc + c.revenue, 0) || 1;
                      const pct = (item.revenue / totalRev) * 100;
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{ fontWeight: '600' }}>{item.category}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{pct.toFixed(0)}%</span>
                          </div>
                          <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                          </div>
                        </div>
                      );
                    })}
                    {getCategorySales().length === 0 && (
                      <p style={{ opacity: 0.5, fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>No sales data available.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        ) : activeTab === 'orders' ? (
          <div>
            <header style={{ marginBottom: '40px' }}>
              <h1 style={titleStyle}>Live Orders</h1>
              <p style={{ opacity: 0.6 }}>Manage incoming orders and track their fulfillment status.</p>
              
              {/* Order Stats Header */}
              <div style={{ 
                display: 'flex', 
                gap: '30px', 
                marginTop: '25px', 
                background: '#fdfcfb', 
                padding: '16px 24px', 
                borderRadius: '12px', 
                border: '1px solid rgba(163, 119, 100, 0.1)',
                fontSize: '0.85rem'
              }}>
                <div>
                  <span style={{ opacity: 0.6 }}>Active Orders: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontSize: '0.95rem' }}>
                    {orders.filter(o => ['PENDING', 'PREPARING', 'READY'].includes(o.status)).length}
                  </strong>
                </div>
                <div style={{ width: '1px', background: 'rgba(163, 119, 100, 0.15)' }} />
                <div>
                  <span style={{ opacity: 0.6 }}>Pending Queue: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: '#b78103', fontSize: '0.95rem' }}>
                    {orders.filter(o => o.status === 'PENDING').length}
                  </strong>
                </div>
                <div style={{ width: '1px', background: 'rgba(163, 119, 100, 0.15)' }} />
                <div>
                  <span style={{ opacity: 0.6 }}>Completed Today: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: '#1e8e3e', fontSize: '0.95rem' }}>
                    {orders.filter(o => o.status === 'COMPLETED' && new Date(o.timestamp).toDateString() === new Date().toDateString()).length}
                  </strong>
                </div>
              </div>

              {/* Advanced Filtering and Search Bar */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginTop: '20px', 
                gap: '20px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {['ALL', 'PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map(status => {
                    const count = status === 'ALL' ? orders.length : orders.filter(o => o.status === status).length;
                    return (
                      <button
                        key={status}
                        onClick={() => setOrderStatusFilter(status)}
                        className={`admin-filter-pill ${orderStatusFilter === status ? 'active' : ''}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        {status} 
                        <span style={{ 
                          fontSize: '0.7rem', 
                          background: orderStatusFilter === status ? 'rgba(255,255,255,0.2)' : 'rgba(163, 119, 100, 0.1)', 
                          color: orderStatusFilter === status ? 'white' : 'var(--primary)',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          fontFamily: 'var(--font-mono)'
                        }}>{count}</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ width: '280px' }}>
                  <input 
                    type="text" 
                    placeholder="Search customer email or #..." 
                    className="admin-search-input"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </header>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {filteredOrders.length === 0 ? (
                <p style={{ opacity: 0.5, fontStyle: 'italic', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No orders matching the current filter criteria.</p>
              ) : (
                filteredOrders.map(order => (
                  <div key={order.id} style={cmsCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--primary)', fontFamily: 'var(--font-serif)' }}>Order #{order.id.slice(-6).toUpperCase()}</strong>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(order.timestamp).toLocaleString()}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          padding: '5px 12px', 
                          borderRadius: '20px', 
                          fontSize: '0.75rem', 
                          fontWeight: 'bold',
                          background: order.status === 'COMPLETED' ? '#e6f4ea' : order.status === 'READY' ? '#fce8b2' : order.status === 'PREPARING' ? '#e8eaed' : order.status === 'CANCELLED' ? '#fce8e6' : '#fff3e0',
                          color: order.status === 'COMPLETED' ? '#1e8e3e' : order.status === 'READY' ? '#f29900' : order.status === 'PREPARING' ? '#5f6368' : order.status === 'CANCELLED' ? '#d93025' : '#e67c73'
                        }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px' }}>Customer: <span style={{fontWeight: 'normal', opacity: 0.8}}>{order.userEmail}</span></p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.88rem', opacity: 0.9 }}>
                        {order.items.map((item, i) => (
                          <li key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span>
                              <strong style={{ fontFamily: 'var(--font-mono)', marginRight: '6px' }}>{item.quantity}x</strong> 
                              {item.name}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.7 }}>${(item.quantity * item.price).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed rgba(0,0,0,0.1)', fontWeight: 'bold' }}>
                        <span>Total</span>
                        <span>${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {order.status === 'PENDING' && <button onClick={() => updateOrderStatus(order.id, 'PREPARING')} style={{...saveButtonStyle, flex: 1}}>Start Preparing</button>}
                      {order.status === 'PREPARING' && <button onClick={() => updateOrderStatus(order.id, 'READY')} style={{...saveButtonStyle, flex: 1, background: '#f29900'}}>Mark Ready</button>}
                      {order.status === 'READY' && <button onClick={() => updateOrderStatus(order.id, 'COMPLETED')} style={{...saveButtonStyle, flex: 1, background: '#1e8e3e'}}>Complete Order</button>}
                      {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && <button onClick={() => updateOrderStatus(order.id, 'CANCELLED')} style={{...cancelButtonStyle, flex: 1}}>Cancel</button>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div>
            <header style={{ marginBottom: '40px' }}>
              <h1 style={titleStyle}>Menu Curations</h1>
              <p style={{ opacity: 0.6 }}>Manage your coffee offerings and artisan snacks.</p>

              {/* Menu Stats Summary */}
              <div style={{ 
                display: 'flex', 
                gap: '30px', 
                marginTop: '25px', 
                background: '#fdfcfb', 
                padding: '16px 24px', 
                borderRadius: '12px', 
                border: '1px solid rgba(163, 119, 100, 0.1)',
                fontSize: '0.85rem'
              }}>
                <div>
                  <span style={{ opacity: 0.6 }}>Total Offerings: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontSize: '0.95rem' }}>{menu.length}</strong>
                </div>
                <div style={{ width: '1px', background: 'rgba(163, 119, 100, 0.15)' }} />
                <div>
                  <span style={{ opacity: 0.6 }}>In Stock: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: '#1e8e3e', fontSize: '0.95rem' }}>{menu.filter(item => !checkSoldOut(item)).length}</strong>
                </div>
                <div style={{ width: '1px', background: 'rgba(163, 119, 100, 0.15)' }} />
                <div>
                  <span style={{ opacity: 0.6 }}>Sold Out: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: '#d93025', fontSize: '0.95rem' }}>{menu.filter(item => checkSoldOut(item)).length}</strong>
                </div>
              </div>

            </header>
            
            {/* Add New Item */}
            <section className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '25px', fontSize: '1.4rem' }}>Create New Offering</h3>
              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Row 1 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted-foreground)', fontWeight: '500', marginBottom: '6px' }}>Name</label>
                    <input type="text" placeholder="e.g., Cold Brew Latte" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required style={formInputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted-foreground)', fontWeight: '500', marginBottom: '6px' }}>Description</label>
                    <input type="text" placeholder="Brief description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} required style={formInputStyle} />
                  </div>
                </div>

                {/* Row 2 */}
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 140px 100px', gap: '16px', alignItems: 'start' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted-foreground)', fontWeight: '500', marginBottom: '6px' }}>Price</label>
                    <input type="number" step="0.01" placeholder="0.00" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value === '' ? '' : parseFloat(e.target.value)})} required style={formInputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted-foreground)', fontWeight: '500', marginBottom: '6px' }}>Category</label>
                    <CategoryCombobox value={newItem.category} onChange={(val) => setNewItem({...newItem, category: val})} />
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: 'var(--muted-foreground)', fontWeight: '500', marginBottom: '6px' }}>
                      Count type <CountTypeInfo />
                    </label>
                    <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e9e7d9', background: '#fdfcfb', height: '36px' }}>
                      <button type="button" onClick={() => setNewItem({...newItem, stockType: 'exact'})} style={{
                        flex: 1, padding: '0', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
                        background: newItem.stockType === 'exact' ? 'var(--primary)' : 'transparent',
                        color: newItem.stockType === 'exact' ? 'white' : 'var(--foreground)',
                        transition: 'all 0.2s ease'
                      }}>Exact</button>
                      <button type="button" onClick={() => setNewItem({...newItem, stockType: 'approximate'})} style={{
                        flex: 1, padding: '0', border: 'none', borderLeft: '1px solid #e9e7d9', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
                        background: newItem.stockType === 'approximate' ? '#e8a87c' : 'transparent',
                        color: newItem.stockType === 'approximate' ? 'white' : 'var(--foreground)',
                        transition: 'all 0.2s ease'
                      }}>Approx</button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted-foreground)', fontWeight: '500', marginBottom: '6px' }}>Stock</label>
                    <input type="number" placeholder="0" value={newItem.stockQuantity} onChange={e => setNewItem({...newItem, stockQuantity: e.target.value === '' ? '' : parseInt(e.target.value)})} required style={formInputStyle} />
                  </div>
                </div>

                {/* Row 3 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted-foreground)', fontWeight: '500', marginBottom: '6px' }}>Image URL</label>
                    <input type="text" placeholder="https://..." value={newItem.imageUrl} onChange={e => setNewItem({...newItem, imageUrl: e.target.value})} style={formInputStyle} />
                  </div>
                </div>

                <button type="submit" style={{ ...addButtonStyle, width: '100%', marginTop: '8px' }}>Add to collection</button>
              </form>
            </section>

            {/* Menu List */}
            <section style={{ marginTop: '50px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', margin: 0, fontSize: '1.4rem' }}>Live Collection</h3>
                  <button 
                    onClick={() => setShowExportModal(true)} 
                    style={{ 
                      padding: '6px 12px', fontSize: '0.75rem', fontWeight: '600', 
                      background: '#fdfcfb', border: '1px solid #e9e7d9', borderRadius: '6px', 
                      cursor: 'pointer', color: 'var(--primary)', transition: 'all 0.2s ease',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={e => { e.target.style.background = '#f5f4ed'; e.target.style.borderColor = 'var(--primary)'; }}
                    onMouseLeave={e => { e.target.style.background = '#fdfcfb'; e.target.style.borderColor = '#e9e7d9'; }}
                  >
                    Export
                  </button>
                </div>
                
                {/* Search & Category Filter */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', opacity: 0.7 }}>Category:</span>
                    <CustomDropdown 
                      value={menuCatFilter}
                      onChange={(val) => setMenuCatFilter(val)}
                      options={[
                        { value: 'ALL', label: 'All Categories' },
                        ...Array.from(new Set(menu.map(m => m.category))).filter(Boolean).map(cat => ({ value: cat, label: cat }))
                      ]}
                    />
                  </div>
                  <div style={{ width: '280px' }}>
                    <input 
                      type="text" 
                      placeholder="Search offering name or desc..." 
                      className="admin-search-input"
                      value={menuSearchQuery}
                      onChange={(e) => setMenuSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {loading && menu.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>Brewing menu...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s ease' }}>
                  {filteredMenu.map(item => (
                    <div key={item.id} className="admin-card admin-card-hover admin-menu-item">
                      {editingItem?.id === item.id ? (
                        <form onSubmit={handleUpdate} style={{ ...formStyle, width: '100%' }}>
                          <div style={inputGroupStyle}>
                            <input type="text" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} style={inputStyle} />
                            <input type="number" step="0.01" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value)})} style={inputStyle} />
                            <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e9e7d9', background: '#fdfcfb' }}>
                                <button type="button" onClick={() => setEditingItem({...editingItem, stockType: 'exact'})} style={{
                                  flex: 1, padding: '8px', border: 'none', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
                                  background: (editingItem.stockType || 'exact') === 'exact' ? 'var(--primary)' : 'transparent',
                                  color: (editingItem.stockType || 'exact') === 'exact' ? 'white' : 'var(--foreground)'
                                }}>Exact</button>
                                <button type="button" onClick={() => setEditingItem({...editingItem, stockType: 'approximate'})} style={{
                                  flex: 1, padding: '8px', border: 'none', borderLeft: '1px solid #e9e7d9', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
                                  background: editingItem.stockType === 'approximate' ? '#e8a87c' : 'transparent',
                                  color: editingItem.stockType === 'approximate' ? 'white' : 'var(--foreground)'
                                }}>≈ Approx</button>
                              </div>
                              <input type="number" value={editingItem.stockQuantity ?? ''} onChange={e => setEditingItem({...editingItem, stockQuantity: e.target.value === '' ? null : parseInt(e.target.value), initialEstimate: e.target.value === '' ? null : parseInt(e.target.value), stockSetAt: new Date().toISOString()})} placeholder="Stock Quantity" style={{...inputStyle, minWidth: 0}} />
                            </div>
                          </div>
                          <input type="text" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} style={inputStyle} />
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" style={saveButtonStyle}>Save Changes</button>
                            <button onClick={() => setEditingItem(null)} style={cancelButtonStyle}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                              <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#f5f4ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                {item.category?.toLowerCase().includes('cold') ? Icons.Snow : item.category?.toLowerCase().includes('snack') || item.category?.toLowerCase().includes('pastr') ? Icons.Cookie : Icons.Coffee}
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                  <strong style={{ fontSize: '1.1rem', color: 'var(--primary)', fontFamily: 'var(--font-serif)' }}>{item.name}</strong>
                                  <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>${item.price.toFixed(2)}</span>
                                  <span style={{ 
                                    fontSize: '0.85rem', fontWeight: 'bold', padding: '2px 10px', borderRadius: '4px',
                                    color: item.stockType === 'approximate' ? '#b87333' : 'var(--primary)', 
                                    background: item.stockType === 'approximate' ? 'rgba(232, 168, 124, 0.15)' : 'rgba(163, 119, 100, 0.1)'
                                  }}>
                                    {item.stockType === 'approximate' ? '≈ ' : 'Stock: '}{item.stockQuantity ?? '—'}
                                  </span>
                                  {item.stockType === 'approximate' && getDaysSince(item.stockSetAt) !== null && (
                                    <span style={{ 
                                      fontSize: '0.72rem', 
                                      padding: '2px 8px', 
                                      borderRadius: '10px',
                                      background: getDaysSince(item.stockSetAt) >= 7 ? '#fff3e0' : 'rgba(0,0,0,0.04)',
                                      color: getDaysSince(item.stockSetAt) >= 7 ? '#e65100' : 'var(--muted-foreground)',
                                      fontWeight: getDaysSince(item.stockSetAt) >= 7 ? '700' : '500'
                                    }}>
                                      {getDaysSince(item.stockSetAt) >= 7 ? '⚠ Reconcile needed' : `set ${getDaysSince(item.stockSetAt)}d ago`}
                                    </span>
                                  )}
                                </div>
                                <p style={{ fontSize: '0.85rem', opacity: 0.5, margin: '5px 0 0' }}>{item.description}</p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexShrink: 0 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', opacity: !checkSoldOut(item) ? 1 : 0.5 }}>
                                <input type="checkbox" checked={item.available !== false} onChange={() => toggleAvailability(item)} style={{ accentColor: 'var(--primary)', transform: 'scale(1.2)' }} />
                                {checkSoldOut(item) ? 'Sold Out' : 'In Stock'}
                              </label>
                              <div style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.1)' }}></div>
                              {item.stockType === 'approximate' && (
                                <button onClick={() => { setReconcilingItemId(reconcilingItemId === item.id ? null : item.id); setReconcileResult(null); setReconcileCount(''); }} style={{ color: '#b87333', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}>Reconcile</button>
                              )}
                              <button onClick={() => setEditingItem(item)} style={editButtonStyle}>Edit</button>
                              <button onClick={() => setItemToDelete(item)} style={deleteButtonStyle}>Archive</button>
                            </div>
                          </div>

                          {/* Inline Reconciliation Panel */}
                          {reconcilingItemId === item.id && (
                            <div style={{ 
                              marginTop: '18px', 
                              padding: '20px 24px', 
                              background: 'linear-gradient(135deg, #fef9f4, #fdf5ed)', 
                              borderRadius: '14px', 
                              border: '1px solid rgba(184, 115, 51, 0.15)',
                              animation: 'cardFadeIn 0.3s ease'
                            }}>
                              <h4 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-serif)', color: '#8b5e3c', margin: '0 0 16px' }}>Stock Reconciliation</h4>
                              
                              {reconcileResult ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                    <div style={{ background: 'white', padding: '12px 16px', borderRadius: '10px', textAlign: 'center' }}>
                                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.5, marginBottom: '4px' }}>Initial Est.</div>
                                      <div style={{ fontSize: '1.3rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{reconcileResult.initialEstimate}</div>
                                    </div>
                                    <div style={{ background: 'white', padding: '12px 16px', borderRadius: '10px', textAlign: 'center' }}>
                                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.5, marginBottom: '4px' }}>Sold</div>
                                      <div style={{ fontSize: '1.3rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#1e8e3e' }}>−{reconcileResult.ordersDeducted}</div>
                                    </div>
                                    <div style={{ background: 'white', padding: '12px 16px', borderRadius: '10px', textAlign: 'center' }}>
                                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.5, marginBottom: '4px' }}>Actual</div>
                                      <div style={{ fontSize: '1.3rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{reconcileResult.actualCount}</div>
                                    </div>
                                    <div style={{ background: reconcileResult.variance > 0 ? '#fce8e6' : reconcileResult.variance < 0 ? '#e6f4ea' : 'white', padding: '12px 16px', borderRadius: '10px', textAlign: 'center' }}>
                                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.6, marginBottom: '4px' }}>Variance</div>
                                      <div style={{ fontSize: '1.3rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: reconcileResult.variance > 0 ? '#d93025' : reconcileResult.variance < 0 ? '#1e8e3e' : 'var(--foreground)' }}>
                                        {reconcileResult.variance > 0 ? `−${reconcileResult.variance}` : reconcileResult.variance < 0 ? `+${Math.abs(reconcileResult.variance)}` : '0'}
                                      </div>
                                    </div>
                                  </div>
                                  <p style={{ fontSize: '0.82rem', color: '#8b5e3c', fontStyle: 'italic', margin: 0 }}>
                                    {reconcileResult.variance > 0 
                                      ? `${reconcileResult.variance} unit${reconcileResult.variance !== 1 ? 's' : ''} unaccounted — possible spillage, samples, or damage.`
                                      : reconcileResult.variance < 0 
                                      ? `${Math.abs(reconcileResult.variance)} extra unit${Math.abs(reconcileResult.variance) !== 1 ? 's' : ''} found — check if restocked or miscounted.`
                                      : 'Perfect match — no discrepancy detected. ✓'}
                                  </p>
                                  <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: 0 }}>Stock corrected to {reconcileResult.actualCount} (exact mode). Auto-closing...</p>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.82rem', opacity: 0.7 }}>
                                      <span>Initial Estimate: <strong style={{ fontFamily: 'var(--font-mono)' }}>{item.initialEstimate ?? item.stockQuantity ?? '—'}</strong></span>
                                      <span>Current (after orders): <strong style={{ fontFamily: 'var(--font-mono)' }}>{item.stockQuantity ?? '—'}</strong></span>
                                      <span>Orders Deducted: <strong style={{ fontFamily: 'var(--font-mono)' }}>{(item.initialEstimate ?? item.stockQuantity ?? 0) - (item.stockQuantity ?? 0)}</strong></span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                      <input 
                                        type="number" 
                                        placeholder="Enter physical count..." 
                                        value={reconcileCount} 
                                        onChange={(e) => setReconcileCount(e.target.value)} 
                                        style={{...inputStyle, minWidth: 0, flex: 1, padding: '12px 16px'}} 
                                      />
                                      <button onClick={() => handleReconcile(item.id)} style={{...saveButtonStyle, padding: '12px 24px', whiteSpace: 'nowrap'}}>Confirm Count</button>
                                      <button onClick={() => { setReconcilingItemId(null); setReconcileCount(''); }} style={{...cancelButtonStyle, padding: '12px 16px'}}>Cancel</button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: '0 0 15px 0', fontFamily: 'var(--font-serif)' }}>Export Inventory</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Choose format and filename for your report.</p>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>Format</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="radio" name="exportFormat" value="pdf" checked={exportFormat === 'pdf'} onChange={() => setExportFormat('pdf')} style={{ accentColor: 'var(--primary)' }} />
                    PDF (.pdf)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="radio" name="exportFormat" value="word" checked={exportFormat === 'word'} onChange={() => setExportFormat('word')} style={{ accentColor: 'var(--primary)' }} />
                    Word (.doc)
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>File Name</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e9e7d9', borderRadius: '8px', overflow: 'hidden', background: '#fdfcfb' }}>
                  <input 
                    type="text" 
                    value={exportFileName} 
                    onChange={e => setExportFileName(e.target.value)} 
                    autoFocus
                    style={{ flex: 1, padding: '10px 15px', border: 'none', background: 'transparent', outline: 'none' }}
                  />
                  <span style={{ padding: '10px 15px', background: '#f5f4ed', color: 'var(--muted-foreground)', fontWeight: 'bold', borderLeft: '1px solid #e9e7d9' }}>
                    .{exportFormat === 'pdf' ? 'pdf' : 'doc'}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowExportModal(false)} style={cancelButtonStyle}>Cancel</button>
                <button onClick={handleDownload} style={saveButtonStyle}>Download</button>
              </div>
            </div>
          </div>
        )}

        {/* Archive Confirmation Modal */}
        {itemToDelete && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: '0 0 15px 0', fontFamily: 'var(--font-serif)', color: '#dc3545' }}>Archive Item</h3>
              <p style={{ margin: '0 0 25px 0', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                Are you sure you want to archive <strong>{itemToDelete.name}</strong>? It will be removed from the live collection.
              </p>
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                <button onClick={() => setItemToDelete(null)} style={cancelButtonStyle}>Cancel</button>
                <button onClick={() => handleDelete(itemToDelete.id)} style={{...saveButtonStyle, background: '#dc3545'}}>Archive</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- Styled Components & Objects ---

const TabButton = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`admin-sidebar-item ${active ? 'active' : ''}`}
    style={{
      padding: '16px 20px',
      textAlign: 'left',
      borderRadius: '12px',
      background: active ? 'var(--primary)' : 'transparent',
      color: active ? 'white' : 'var(--foreground)',
      fontSize: '0.95rem',
      fontWeight: active ? '600' : '500',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      boxShadow: active ? '0 10px 20px rgba(163, 119, 100, 0.2)' : 'none',
      transform: active ? 'translateX(10px)' : 'none'
    }}
  >
    <span style={{ fontSize: '1.2rem' }}>{icon}</span>
    {label}
  </button>
);

const StatCard = ({ title, value, subtitle, icon, highlight, action }) => (
  <div className={`admin-card ${highlight ? 'highlight' : ''}`} style={{
    position: 'relative',
    overflow: 'visible',
    padding: '20px 24px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '125px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
    border: '1px solid rgba(163, 119, 100, 0.08)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'space-between' }}>
        <div style={{ margin: 0, opacity: highlight ? 0.9 : 0.6, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '600' }}>{title}</div>
        {action && <div>{action}</div>}
      </div>
      <div style={{ fontSize: '1.2rem', opacity: highlight ? 0.9 : 0.6, color: highlight ? 'white' : 'var(--primary)', flexShrink: 0 }}>{icon}</div>
    </div>
    <div style={{ marginTop: '10px' }}>
      <p style={{ fontSize: '1.9rem', fontWeight: '700', margin: '0 0 4px 0', fontFamily: 'var(--font-mono)', letterSpacing: '-0.5px' }}>{value}</p>
      <p style={{ margin: 0, fontSize: '0.75rem', opacity: highlight ? 0.8 : 0.5 }}>{subtitle}</p>
    </div>
  </div>
);

const sidebarStyle = {
  width: '300px',
  background: '#f9f8f6',
  padding: '60px 30px',
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  height: '100vh',
  borderRight: '1px solid rgba(163, 119, 100, 0.1)',
  zIndex: 100
};

const titleStyle = {
  fontSize: '3rem',
  fontFamily: 'var(--font-serif)',
  fontWeight: '500',
  marginBottom: '10px',
  color: 'var(--foreground)'
};

const returnButtonStyle = {
  padding: '16px 20px',
  background: '#fdfcfb',
  border: '1px solid rgba(163, 119, 100, 0.2)',
  color: 'var(--primary)',
  borderRadius: '12px',
  fontWeight: '600',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  fontFamily: 'var(--font-serif)',
  cursor: 'pointer'
};

const logoutButtonStyle = {
  padding: '16px 20px',
  background: 'var(--destructive)',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontWeight: '600',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  transition: 'transform 0.3s ease',
  fontFamily: 'var(--font-serif)',
  cursor: 'pointer'
};

const cmsCardStyle = {
  background: 'white',
  padding: '40px',
  borderRadius: '24px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
  border: '1px solid rgba(163, 119, 100, 0.05)'
};

const menuItemStyle = {
  ...cmsCardStyle,
  padding: '25px 35px',
  transition: 'all 0.3s ease',
  cursor: 'default'
};

const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGroupStyle = { display: 'flex', gap: '15px', flexWrap: 'wrap' };
const inputStyle = { 
  flex: 1, 
  minWidth: '180px',
  padding: '15px 20px', 
  borderRadius: '12px', 
  border: '1px solid #e9e7d9', 
  background: '#fdfcfb',
  fontSize: '0.95rem',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s'
};

const formInputStyle = { 
  width: '100%',
  padding: '8px 12px', 
  borderRadius: '8px', 
  border: '1px solid #e9e7d9', 
  background: '#fdfcfb',
  fontSize: '0.9rem',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  boxSizing: 'border-box'
};

const selectStyle = { ...inputStyle, cursor: 'pointer' };

const addButtonStyle = { 
  padding: '15px', 
  background: 'var(--primary)', 
  color: 'white', 
  borderRadius: '12px', 
  fontWeight: '600',
  fontSize: '1rem',
  boxShadow: '0 10px 20px rgba(163, 119, 100, 0.2)'
};

const editButtonStyle = { color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'underline' };
const deleteButtonStyle = { color: '#dc3545', fontWeight: '600', fontSize: '0.9rem', opacity: 0.7 };
const saveButtonStyle = { padding: '8px 20px', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontSize: '0.85rem' };
const cancelButtonStyle = { padding: '8px 20px', background: '#f0f0f0', color: '#666', borderRadius: '8px', fontSize: '0.85rem' };

export default AdminDashboard;
