import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import CreatorModal from './CreatorModal';

const AboutSection = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const sectionRef = useRef(null);
    const textRef = useRef(null);

    useGSAP(() => {
        gsap.from(textRef.current, {
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 80%",
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    }, { scope: sectionRef });

    return (
        <section
            id="about"
            ref={sectionRef}
            style={{
                padding: '0px 5% 100px',
                background: 'var(--background)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div ref={textRef} style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '30px', color: 'var(--foreground)' }}>
                    Our <span style={{ color: 'var(--primary)' }}>Story</span>
                </h2>
                <p style={{ fontSize: '1.2rem', color: 'var(--foreground)', opacity: 0.8, marginBottom: '40px', lineHeight: '1.8' }}>
                    At Beige & Beans, we believe that every cup of coffee tells a story of passion, precision, and craftsmanship. 
                    What started as a small roastery in the heart of the city has grown into a sanctuary for coffee lovers who 
                    appreciate the finer details of the bean. We invite you to experience our world and meet the vision behind it.
                </p>
                
                <div 
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '15px',
                        cursor: 'pointer',
                        padding: '20px 40px',
                        background: 'linear-gradient(135deg, rgba(163, 119, 100, 0.1), rgba(163, 119, 100, 0.05))',
                        borderRadius: '20px',
                        border: '1px solid rgba(163, 119, 100, 0.2)',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(163, 119, 100, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(163, 119, 100, 0.1), rgba(163, 119, 100, 0.05))';
                    }}
                >
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        Meet the Creator
                    </span>
                    <span style={{ fontSize: '1.5rem' }}>☕</span>
                </div>
            </div>

            <CreatorModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </section>
    );
};

export default AboutSection;
