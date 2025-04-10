import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UniqueLoginAnimation = () => {
  const canvasRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [phase, setPhase] = useState(0);
  const navigate = useNavigate();
  
  // Use refs for animation-related variables that don't need to trigger renders
  const animationStateRef = useRef({
    animationFrameId: null,
    particles: [],
    rings: [],
    stars: [],
    angle: 0,
    scale: 0,
    starsVisible: false
  });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const state = animationStateRef.current;
    
    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Color palette
    const colors = {
      darkBlue: '#1a2b47',
      mediumBlue: '#2d4263',
      lightBlue: '#3e5f8a',
      orange: '#ff7d00',
      lightOrange: '#ff9a40',
      textLight: '#f5f5f5'
    };
    
    // Create particles
    const createParticles = () => {
      const particles = [];
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      for (let i = 0; i < 150; i++) {
        const radius = Math.random() * 2 + 0.5;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 150 + 50;
        
        particles.push({
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance,
          radius: radius,
          originalRadius: radius,
          angle: angle,
          distance: distance,
          originalDistance: distance,
          color: i % 5 === 0 ? colors.orange : 
                 i % 4 === 0 ? colors.lightOrange : 
                 i % 3 === 0 ? colors.darkBlue : 
                 i % 2 === 0 ? colors.mediumBlue : colors.lightBlue,
          speed: Math.random() * 0.04 + 0.02, // Doubled speed
          pulseSpeed: Math.random() * 0.08 + 0.04, // Doubled pulse speed
          pulseAmount: Math.random() * 0.5 + 0.5,
          pulseOffset: Math.random() * Math.PI * 2
        });
      }
      return particles;
    };
    
    // Create rings
    const createRings = () => {
      const rings = [];
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      for (let i = 0; i < 5; i++) {
        rings.push({
          x: centerX,
          y: centerY,
          radius: 80 + i * 30,
          thickness: 2,
          color: i % 2 === 0 ? colors.orange : colors.mediumBlue,
          angle: 0,
          speed: 0.02 - (i * 0.004), // Doubled speed
          dashOffset: 0,
          dashArray: [10, 15]
        });
      }
      return rings;
    };
    
    // Create stars
    const createStars = () => {
      const stars = [];
      
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2 + 0.5;
        
        stars.push({
          x: x,
          y: y,
          size: size,
          opacity: 0,
          targetOpacity: Math.random() * 0.7 + 0.3,
          blinkSpeed: Math.random() * 0.02 + 0.01 // Doubled blink speed
        });
      }
      return stars;
    };
    
    // Initialize all elements
    state.particles = createParticles();
    state.rings = createRings();
    state.stars = createStars();
    
    // Draw hexagon
    const drawHexagon = (x, y, size, color, rotationOffset = 0) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i + rotationOffset;
        const pX = x + size * Math.cos(angle);
        const pY = y + size * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(pX, pY);
        } else {
          ctx.lineTo(pX, pY);
        }
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };
    
    // Draw star
    const drawStar = (x, y, size, color, points = 5, rotationOffset = 0) => {
      ctx.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? size : size * 0.4;
        const angle = (Math.PI * 2 / (points * 2)) * i + rotationOffset;
        const pX = x + radius * Math.cos(angle);
        const pY = y + radius * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(pX, pY);
        } else {
          ctx.lineTo(pX, pY);
        }
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };
    
    // Draw dashed circle
    const drawDashedCircle = (x, y, radius, color, thickness, dashArray, dashOffset) => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.setLineDash(dashArray);
      ctx.lineDashOffset = dashOffset;
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.stroke();
      ctx.setLineDash([]);
    };
    
    // Phase transition management
    const handlePhaseTransition = () => {
      if (phase === 1) {
        setIsTransitioning(true);
        setTimeout(() => {
          setIsTransitioning(false);
          setPhase(2);
        }, 1000); // Reduced from 2000ms to 1000ms
      }
    };
    
    // Set up first phase transition - faster
    const phaseOneTimer = phase === 0 ? setTimeout(() => {
      state.starsVisible = true;
      setPhase(1);
    }, 1000) : null; // Reduced from 2000ms to 1000ms
    
    // Set up second phase transition - faster
    const phaseTwoTimer = phase === 1 ? setTimeout(handlePhaseTransition, 2500) : null; // Reduced from 5000ms to 2500ms
    
    // Main animation loop
    const animate = () => {
      if (!canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      state.angle += 0.02; // Doubled rotation speed
      
      // Phase control - faster transitions
      if (phase === 0 && state.scale < 1) {
        state.scale += 0.02; // Doubled scale speed
      } else if (phase === 2) {
        state.scale -= 0.02; // Doubled scale speed for exit
        if (state.scale <= 0) {
          setPhase(3);
          // Redirect to login route when animation completes
          navigate('/login');
        }
      }
      
      // Draw stars (background)
      if (state.starsVisible) {
        state.stars.forEach(star => {
          if (phase === 1 && star.opacity < star.targetOpacity) {
            star.opacity += 0.02; // Doubled fade-in speed
          } else if (phase === 2 && star.opacity > 0) {
            star.opacity -= 0.04; // Doubled fade-out speed
          }
          
          star.opacity += Math.sin(state.angle * star.blinkSpeed) * 0.05;
          star.opacity = Math.max(0, Math.min(1, star.opacity));
          
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
          ctx.fill();
        });
      }
      
      // Draw particles
      state.particles.forEach((p, index) => {
        // Update particle position
        p.angle += p.speed;
        p.distance = p.originalDistance + Math.sin(state.angle * p.pulseSpeed + p.pulseOffset) * 20 * p.pulseAmount;
        
        // Scale effect for intro/outro
        const scaledDistance = p.distance * state.scale;
        
        p.x = centerX + Math.cos(p.angle) * scaledDistance;
        p.y = centerY + Math.sin(p.angle) * scaledDistance;
        p.radius = p.originalRadius * (1 + Math.sin(state.angle * p.pulseSpeed + p.pulseOffset) * 0.3);
        
        // Special effect for phase transition - faster movement
        if (isTransitioning) {
          const dist = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
          const maxDist = 300;
          
          if (dist < maxDist) {
            const forceFactor = 1 - (dist / maxDist);
            p.x += (centerX - p.x) * forceFactor * 0.1; // Doubled force
            p.y += (centerY - p.y) * forceFactor * 0.1; // Doubled force
          }
        }
        
        // Draw particle
        if (index % 10 === 0) {
          drawHexagon(p.x, p.y, p.radius * 2, p.color, state.angle);
        } else if (index % 15 === 0) {
          drawStar(p.x, p.y, p.radius * 3, p.color, 5, state.angle * 0.5);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
      });
      
      // Draw rings
      state.rings.forEach(ring => {
        ring.angle += ring.speed;
        ring.dashOffset += 1; // Doubled dash animation speed
        const scaledRadius = ring.radius * state.scale;
        
        drawDashedCircle(
          ring.x, 
          ring.y, 
          scaledRadius, 
          ring.color, 
          ring.thickness, 
          ring.dashArray, 
          ring.dashOffset
        );
      });
      
      // Draw central icon based on phase
      if (state.scale > 0) {
        const iconSize = 40 * state.scale;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(state.angle * 0.5);
        
        if (phase === 0) {
          // Lock icon (stylized)
          ctx.beginPath();
          ctx.arc(0, -iconSize * 0.2, iconSize * 0.3, Math.PI, 0);
          ctx.lineTo(iconSize * 0.3, iconSize * 0.3);
          ctx.lineTo(-iconSize * 0.3, iconSize * 0.3);
          ctx.closePath();
          ctx.fillStyle = colors.orange;
          ctx.fill();
          
          // Lock body
          drawHexagon(0, iconSize * 0.2, iconSize * 0.4, colors.lightOrange, state.angle);
          
          // Keyhole
          ctx.beginPath();
          ctx.arc(0, iconSize * 0.2, iconSize * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = colors.darkBlue;
          ctx.fill();
        } else if (phase === 1 || phase === 2) {
          // User icon (stylized)
          ctx.beginPath();
          ctx.arc(0, -iconSize * 0.1, iconSize * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = colors.orange;
          ctx.fill();
          
          // Body
          ctx.beginPath();
          ctx.moveTo(-iconSize * 0.3, iconSize * 0.4);
          ctx.lineTo(iconSize * 0.3, iconSize * 0.4);
          ctx.lineTo(iconSize * 0.2, 0);
          ctx.lineTo(-iconSize * 0.2, 0);
          ctx.closePath();
          ctx.fillStyle = colors.lightOrange;
          ctx.fill();
        }
        
        ctx.restore();
        
        // Draw welcome text
        if (phase === 1) {
          const welcomeText = "Welcome";
          const pulseScale = 1 + Math.sin(state.angle * 3) * 0.05;
          
          ctx.save();
          ctx.font = `${30 * pulseScale}px Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = colors.textLight;
          
          // Text shadow
          ctx.shadowColor = colors.orange;
          ctx.shadowBlur = 15;
          ctx.fillText(welcomeText, centerX, centerY + 100 * state.scale);
          ctx.restore();
        }
      }
      
      state.animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(state.animationFrameId);
      clearTimeout(phaseOneTimer);
      clearTimeout(phaseTwoTimer);
    };
  }, [phase, isTransitioning, navigate]);
  
  return (
    <div className="w-full h-screen relative overflow-hidden bg-gray-900">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
};

export default UniqueLoginAnimation;