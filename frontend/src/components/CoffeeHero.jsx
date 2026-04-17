import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

const CoffeeHero = () => {
    const heroRef = useRef(null);
    const contentRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            tl.from(heroRef.current, {
                scale: 1.1,
                duration: 2,
                ease: "power2.out"
            })
            .fromTo(contentRef.current.children,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.3,
                    ease: "power3.out"
                },
                "-=1"
            );
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="home"
            ref={heroRef}
            style={{
                height: '100vh',
                width: '100vw',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url("/hero-cafe.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                textAlign: 'center',
                overflow: 'hidden'
            }}
        >
            <div 
                ref={contentRef} 
                style={{ 
                    maxWidth: '800px', 
                    padding: '20px',
                    position: 'relative',
                    zIndex: 2
                }}
            >
                <h1 style={{
                    fontSize: 'clamp(3rem, 8vw, 6rem)',
                    fontFamily: 'var(--font-serif)',
                    marginBottom: '20px',
                    lineHeight: '1.1',
                    color: '#ffffff',
                    fontWeight: '800',
                    textShadow: '2px 2px 10px rgba(0,0,0,0.5)'
                }}>
                    Wake up to <br /> <span style={{ color: 'var(--accent)' }}>Pure Elegance</span>
                </h1>
                <p style={{
                    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                    marginBottom: '40px',
                    color: '#ffffff',
                    fontWeight: '400',
                    letterSpacing: '1px',
                    textShadow: '1px 1px 5px rgba(0,0,0,0.5)'
                }}>
                    Experience the finest artisan coffee, roasted to perfection and brewed with passion in every cup.
                </p>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <button style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '15px 40px',
                        borderRadius: '30px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                    }}>
                        Explore Menu
                    </button>
                    <button style={{
                        border: '2px solid white',
                        color: 'white',
                        padding: '15px 40px',
                        borderRadius: '30px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        backdropFilter: 'blur(5px)'
                    }}>
                        Our Story
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CoffeeHero;
