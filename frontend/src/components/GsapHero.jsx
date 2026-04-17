import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const GsapHero = () => {
    const heroRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(textRef.current, {
                y: 100,
                opacity: 0,
                duration: 1.5,
                ease: "power4.out",
                delay: 0.5
            });
            
            gsap.to(heroRef.current, {
                backgroundPosition: "100% 100%",
                duration: 20,
                repeat: -1,
                yoyo: true,
                ease: "none"
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <div 
            ref={heroRef}
            className="hero-container"
            style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(45deg, #0f0c29, #302b63, #24243e)',
                backgroundSize: '400% 400%',
                color: 'white',
                overflow: 'hidden',
                flexDirection: 'column'
            }}
        >
            <h1 
                ref={textRef}
                style={{
                    fontSize: '5rem',
                    fontWeight: '800',
                    margin: 0,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5rem'
                }}
            >
                New Era
            </h1>
            <p style={{ opacity: 0.7, marginTop: '1rem' }}>
                Java + React + GSAP
            </p>
        </div>
    );
};

export default GsapHero;
