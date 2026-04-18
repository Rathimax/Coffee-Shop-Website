import React, { useEffect, useState, useRef } from 'react';
import CoffeeCard from './CoffeeCard';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Guaranteed fallback data to ensure the UI is always beautiful and functional
const FALLBACK_MENU = [
    { id: 'f1', name: "Classic Espresso", description: "Rich and bold single shot of espresso roasted to perfection.", price: 3.50, category: "Hot", imageUrl: "/menu/hero-cafe.jpg" },
    { id: 'f2', name: "Velvet Latte", description: "Smooth steamed milk with a double shot of espresso and silky foam.", price: 4.50, category: "Hot", imageUrl: "/coffee.png" },
    { id: 'f3', name: "Iced Caramel Macchiato", description: "Layers of espresso, cold milk, and artisan caramel over ice.", price: 5.50, category: "Cold", imageUrl: "/coffee.png" },
    { id: 'f4', name: "Hazelnut Mocha", description: "A premium blend of dark chocolate, espresso, and roasted hazelnut.", price: 4.75, category: "Hot", imageUrl: "/coffee.png" },
    { id: 'f5', name: "Cold Brew", description: "Slow-steeped for 24 hours for an incredibly smooth, low-acid finish.", price: 4.00, category: "Cold", imageUrl: "/coffee.png" }
];

const MenuSection = () => {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const sectionRef = useRef(null);
    const gridRef = useRef(null);

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
        
        // Setting a timeout for the fetch to ensure we don't stay stuck on "Loading"
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            console.warn("Backend fetch timed out, using fallback menu.");
            setMenu(FALLBACK_MENU);
            setLoading(false);
        }, 3000);

        fetch(`${apiUrl}/api/menu`, { signal: controller.signal })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                clearTimeout(timeoutId);
                setMenu(Array.isArray(data) && data.length > 0 ? data : FALLBACK_MENU);
                setLoading(false);
            })
            .catch(err => {
                clearTimeout(timeoutId);
                console.error("Failed to fetch menu, using fallback:", err);
                setMenu(FALLBACK_MENU);
                setLoading(false);
            });
            
        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        if (!loading && menu.length > 0) {
            gsap.from(gridRef.current.children, {
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: "top 80%",
                },
                y: 60,
                opacity: 0,
                duration: 1.2,
                stagger: 0.2,
                ease: "power3.out"
            });
        }
    }, [loading, menu]);

    return (
        <section 
            id="menu"
            ref={sectionRef}
            style={{
                padding: '100px 5%',
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
                <div 
                    ref={gridRef}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '40px',
                        maxWidth: '1300px',
                        margin: '0 auto',
                        padding: '20px'
                    }}
                >
                    {menu.map(item => (
                        <CoffeeCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default MenuSection;

