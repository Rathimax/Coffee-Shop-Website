import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

const CoffeeHero = () => {
    const heroRef = useRef(null);
    const contentRef = useRef(null);
    const videoRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline();

        tl.from(heroRef.current, {
            opacity: 0,
            duration: 1.5,
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
            "-=0.5"
        );

        // Subtle slow zoom for the video background
        gsap.to(videoRef.current, {
            scale: 1.1,
            duration: 20,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }, { scope: heroRef });

    const scrollToAbout = () => {
        gsap.to(window, { 
            duration: 1.5, 
            scrollTo: { y: "#about", offsetY: 80 }, 
            ease: "power4.inOut" 
        });
    };

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
                color: 'white',
                textAlign: 'center',
                overflow: 'hidden'
            }}
        >
            {/* Background Video */}
            <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: -2,
                }}
            >
                <source src="/hero-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Premium Gradient Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8))',
                zIndex: -1
            }} />

            <div 
                ref={contentRef} 
                style={{ 
                    maxWidth: '850px', 
                    padding: '20px',
                    position: 'relative',
                    zIndex: 2
                }}
            >
                <h1 style={{
                    fontSize: 'clamp(3.5rem, 10vw, 7rem)',
                    fontFamily: 'var(--font-serif)',
                    marginBottom: '24px',
                    lineHeight: '1',
                    color: '#ffffff',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '-1px',
                    textShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                    Wake up to <br /> <span style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: '400' }}>Pure Elegance</span>
                </h1>
                <p style={{
                    fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                    marginBottom: '48px',
                    color: '#ffffff',
                    fontWeight: '300',
                    letterSpacing: '1px',
                    opacity: 0.9,
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    maxWidth: '700px',
                    margin: '0 auto 40px'
                }}>
                    Experience the finest artisan coffee, roasted to perfection and brewed with passion in every cup.
                </p>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <button style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '18px 45px',
                        borderRadius: '40px',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease'
                    }}>
                        Ethiopia Coffee
                    </button>
                    <button 
                        onClick={scrollToAbout}
                        style={{
                            border: '2px solid rgba(255,255,255,0.8)',
                            color: 'white',
                            padding: '18px 45px',
                            borderRadius: '40px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            backdropFilter: 'blur(10px)',
                            background: 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Our Story
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CoffeeHero;

