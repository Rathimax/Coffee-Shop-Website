import React, { useEffect, useState, useRef } from 'react';
import CoffeeCard from './CoffeeCard';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MenuSection = () => {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const sectionRef = useRef(null);
    const gridRef = useRef(null);

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
        fetch(`${apiUrl}/api/menu`)
            .then(res => res.json())
            .then(data => {
                setMenu(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch menu:", err);
                setLoading(false);
            });
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
                duration: 0.8,
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
                    fontSize: '3rem', 
                    fontFamily: 'var(--font-serif)', 
                    color: 'var(--primary)',
                    marginBottom: '10px'
                }}>
                    Our Signature Menu
                </h2>
                <div style={{ 
                    width: '60px', 
                    height: '3px', 
                    background: 'var(--primary)', 
                    margin: '0 auto 20px' 
                }}></div>
                <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--muted-foreground)' }}>
                    From the rich intensity of our classic espresso to the creamy indulgence of our velvet lattes.
                </p>
            </div>

            {loading ? (
                <div style={{ color: 'var(--primary)' }}>Loading your favorite blends...</div>
            ) : (
                <div 
                    ref={gridRef}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '30px',
                        maxWidth: '1200px',
                        margin: '0 auto'
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
