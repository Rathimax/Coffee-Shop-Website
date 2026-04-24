import React, { useEffect, useState, useRef } from 'react';
import CoffeeCard from './CoffeeCard';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Guaranteed fallback data to ensure the UI is always beautiful and functional
const FALLBACK_MENU = [
    { id: 'f1', name: "Classic Espresso", description: "Rich and bold single shot of espresso roasted to perfection.", price: 3.50, category: "Hot", imageUrl: "/menu/classic-espresso.jpg" },
    { id: 'f2', name: "Velvet Latte", description: "Smooth steamed milk with a double shot of espresso and silky foam.", price: 4.50, category: "Hot", imageUrl: "/menu/velvet-latte.jpg" },
    { id: 'f3', name: "Iced Caramel Macchiato", description: "Layers of espresso, cold milk, and artisan caramel over ice.", price: 5.50, category: "Cold", imageUrl: "/menu/classic-espresso.jpg" },
    { id: 'f4', name: "Hazelnut Mocha", description: "A premium blend of dark chocolate, espresso, and roasted hazelnut.", price: 4.75, category: "Hot", imageUrl: "/menu/velvet-latte.jpg" },
    { id: 'f5', name: "Cold Brew", description: "Slow-steeped for 24 hours for an incredibly smooth, low-acid finish.", price: 4.00, category: "Cold", imageUrl: "/menu/classic-espresso.jpg" }
];

const MenuSection = () => {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const sectionRef = useRef(null);
    const gridRef = useRef(null);

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
        
        fetch(`${apiUrl}/api/menu`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setMenu(Array.isArray(data) && data.length > 0 ? data : FALLBACK_MENU);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch menu, using fallback:", err);
                setMenu(FALLBACK_MENU);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!loading && menu.length > 0) {
            // Force a refresh of all ScrollTriggers once content is definitely in the DOM
            ScrollTrigger.refresh();
        }
    }, [loading, menu]);

    return (
        <section 
            id="menu"
            ref={sectionRef}
            style={{
                padding: '80px 5% 10px',
                background: 'var(--background)',
                textAlign: 'center'
            }}
        >
            <div style={{ marginBottom: '60px' }}>
                <h2 style={{ 
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                    fontFamily: 'var(--font-serif)', 
                    color: 'var(--primary)',
                    marginBottom: '15px',
                    fontWeight: '800'
                }}>
                    Our Signature Menu
                </h2>
                <div style={{ 
                    width: '80px', 
                    height: '4px', 
                    background: 'var(--accent)', 
                    margin: '0 auto 25px' 
                }}></div>
                <p style={{ 
                    maxWidth: '650px', 
                    margin: '0 auto', 
                    color: 'var(--muted-foreground)',
                    fontSize: '1.1rem',
                    lineHeight: '1.6'
                }}>
                    From the rich intensity of our classic espresso to the creamy indulgence of our ivory velvet lattes.
                </p>
            </div>

            {loading ? (
                <div style={{ 
                    color: 'var(--primary)', 
                    fontSize: '1.2rem',
                    height: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    Brewing your menu...
                </div>
            ) : (
                <>
                    <style>{`
                        .pinterest-grid {
                            display: grid;
                            grid-template-columns: repeat(5, 1fr); /* Increased to 5 columns for smaller cards */
                            grid-auto-rows: 1px;
                            gap: 0 16px; /* Reduced gap for more compact look */
                            max-width: 1400px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        @media (max-width: 1200px) {
                            .pinterest-grid { grid-template-columns: repeat(4, 1fr); }
                        }
                        @media (max-width: 900px) {
                            .pinterest-grid { grid-template-columns: repeat(3, 1fr); }
                        }
                        @media (max-width: 600px) {
                            .pinterest-grid { 
                                grid-template-columns: repeat(2, 1fr); 
                                padding: 10px; 
                                gap: 0 10px; 
                            }
                        }
                    `}</style>
                    <div 
                        ref={gridRef}
                        className="pinterest-grid"
                    >
                        {menu.map((item, index) => (
                            <CoffeeCard key={item.id || item._id || index} item={item} index={index} />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};

export default MenuSection;

