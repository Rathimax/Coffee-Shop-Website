import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const CreatorModal = ({ isOpen, onClose }) => {
    const modalRef = useRef(null);
    const overlayRef = useRef(null);
    const contentRef = useRef(null);

    useGSAP(() => {
        if (isOpen) {
            // Very smooth entry
            gsap.to(overlayRef.current, {
                opacity: 1,
                display: 'flex',
                duration: 0.5,
                ease: 'power2.out'
            });

            gsap.fromTo(contentRef.current,
                { y: 100, opacity: 0, scale: 0.8, rotateX: 20 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotateX: 0,
                    duration: 1,
                    ease: 'elastic.out(1, 0.8)',
                    delay: 0.2
                }
            );
        } else {
            // Smooth exit
            gsap.to(contentRef.current, {
                y: 50,
                opacity: 0,
                scale: 0.9,
                duration: 0.4,
                ease: 'power2.in',
                onComplete: () => {
                    gsap.to(overlayRef.current, {
                        opacity: 0,
                        display: 'none',
                        duration: 0.3
                    });
                }
            });
        }
    }, [isOpen]);

    return (
        <div
            ref={overlayRef}
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(8px)',
                zIndex: 10000,
                display: 'none',
                opacity: 0,
                alignItems: 'center',
                justifyContent: 'center',
                perspective: '1000px'
            }}
        >
            <div
                ref={contentRef}
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '90%',
                    maxWidth: '500px',
                    padding: '40px',
                    borderRadius: '30px',
                    background: 'linear-gradient(135deg, rgba(241, 240, 229, 0.2), rgba(163, 119, 100, 0.15))',
                    WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                    textAlign: 'center',
                    color: 'white'
                }}
            >
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '20px' }}>
                    About the <span style={{ color: 'var(--accent)' }}>Creator</span>
                </h2>
                <p style={{ lineHeight: '1.8', fontSize: '1.1rem', opacity: 0.9, marginBottom: '30px' }}>
                    I'm <strong>Abhay Raj Rathi</strong>. I made this website purely out of love for coffee and nothing else.
                    It can also be used by any cafe, so if you want this site to be yours, make sure to connect with me through my portfolio.
                </p>
                <a
                    href="https://abhayrajrathiportfolio.netlify.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-block',
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '15px 30px',
                        borderRadius: '25px',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        transition: 'transform 0.3s ease, background 0.3s ease',
                        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    Visit My Portfolio
                </a>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        color: 'white',
                        opacity: 0.6,
                        fontSize: '1.5rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    ×
                </button>
                <p style={{ marginTop: '30px', fontSize: '0.9rem', opacity: 0.7 }}>
                    Hope you like the website!
                </p>
            </div>
        </div>
    );
};

export default CreatorModal;
