import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const GsapHero = () => {
    const heroRef = useRef(null);
    const textRef = useRef(null);
    const subTextRef = useRef(null);
    const videoRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Text entrance animation
            gsap.from([textRef.current, subTextRef.current], {
                y: 50,
                opacity: 0,
                duration: 1.2,
                stagger: 0.3,
                ease: "power3.out",
                delay: 0.5
            });
            
            // Subtle slow zoom for the video
            gsap.to(videoRef.current, {
                scale: 1.1,
                duration: 20,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <div 
            ref={heroRef}
            className="hero-container"
            style={{
                position: 'relative',
                height: '100vh',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                overflow: 'hidden',
                flexDirection: 'column'
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

            {/* Premium Overlay for contrast */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
                zIndex: -1
            }} />

            {/* Hero Content */}
            <h1 
                ref={textRef}
                style={{
                    fontSize: 'clamp(3rem, 10vw, 6rem)',
                    fontWeight: '900',
                    margin: 0,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8rem',
                    textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    zIndex: 1
                }}
            >
                New Era
            </h1>
            <p 
                ref={subTextRef}
                style={{ 
                    fontSize: '1.2rem',
                    opacity: 0.9, 
                    marginTop: '1.5rem',
                    letterSpacing: '0.2rem',
                    textTransform: 'uppercase',
                    fontWeight: '300',
                    zIndex: 1
                }}
            >
                Java + React + GSAP
            </p>
        </div>
    );
};

export default GsapHero;

