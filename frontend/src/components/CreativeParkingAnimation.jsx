import React, { useState, useEffect } from 'react';

const CreativeParkingAnimation = () => {
  const [animationStep, setAnimationStep] = useState(0);
  const [pulseOpacity, setPulseOpacity] = useState(0.7);
  
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 5);
    }, 2500);
    
    const pulseInterval = setInterval(() => {
      setPulseOpacity(prev => prev === 0.7 ? 0.2 : 0.7);
    }, 800);
    
    return () => {
      clearInterval(stepInterval);
      clearInterval(pulseInterval);
    };
  }, []);
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Dynamic city background */}
      <div className="absolute inset-0">
        <svg viewBox="0 0 400 300" className="w-full h-full">
          {/* Sky gradient with animated stars */}
          <defs>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#081525" />
              <stop offset="100%" stopColor="#112240" />
            </linearGradient>
            <radialGradient id="spotlightGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FF7A00" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#222" />
              <stop offset="50%" stopColor="#333" />
              <stop offset="100%" stopColor="#222" />
            </linearGradient>
          </defs>
          
          {/* Sky background */}
          <rect x="0" y="0" width="400" height="300" fill="url(#skyGradient)" />
          
          {/* Animated stars */}
          {[...Array(15)].map((_, i) => (
            <circle 
              key={i} 
              cx={50 + Math.random() * 300} 
              cy={10 + Math.random() * 80} 
              r={0.5 + Math.random() * 1} 
              fill="white" 
              opacity={Math.random() > 0.5 ? pulseOpacity : 1 - pulseOpacity} 
            />
          ))}
          
          {/* Futuristic city skyline */}
          <path d="M0,180 L20,180 L20,140 L30,140 L30,165 L45,165 L45,130 L55,130 L55,150 
                   L65,120 L75,120 L75,140 L90,140 L90,110 L100,110 L100,160 L110,160 L110,120 
                   L125,120 L125,150 L140,90 L155,90 L155,140 L165,140 L165,110 L180,110 L180,150
                   L200,150 L200,80 L210,80 L210,100 L220,100 L220,70 L240,70 L240,130 L260,130
                   L260,90 L275,90 L275,145 L290,145 L290,115 L310,115 L310,155 L330,155 L330,125
                   L350,125 L350,165 L370,165 L370,145 L390,145 L390,180 L400,180 L400,300 L0,300 Z" 
                fill="#071018" opacity="0.9" />
                
          {/* Building windows with random lighting */}
          {[...Array(30)].map((_, i) => (
            <rect 
              key={i + 100} 
              x={40 + Math.random() * 320} 
              y={100 + Math.random() * 70} 
              width={3 + Math.random() * 5} 
              height={3 + Math.random() * 5} 
              fill="#F8E71C" 
              opacity={Math.random() * 0.7} 
            />
          ))}
        </svg>
      </div>
      
      {/* Smart city infrastructure */}
      <div className="absolute bottom-0 w-full h-3/4">
        <svg viewBox="0 0 400 225" className="w-full h-full">
          {/* Main road */}
          <rect x="0" y="160" width="400" height="40" fill="url(#roadGradient)" />
          
          {/* Road markings */}
          {[...Array(8)].map((_, i) => (
            <rect key={i} x={i * 50} y="179" width="30" height="2" fill="white" />
          ))}
          
          {/* Smart parking area */}
          <rect x="80" y="70" width="240" height="90" rx="2" fill="#111A2A" stroke="#223" strokeWidth="1" />
          
          {/* Smart parking IoT indicators - Fixed y attribute to be cy for the circle elements */}
          {[0, 1, 2, 3, 4, 5].map(i => {
            const isAvailable = i !== 2 && i !== 4;
            const isTarget = i === 3;
            
            return (
              <g key={i + 500}>
                <rect 
                  x={90 + i * 38} 
                  y="75" 
                  width="28" 
                  height="80" 
                  rx="1"
                  fill={isTarget && animationStep >= 3 ? "#112240" : "#0A1525"}
                  stroke={isTarget && animationStep >= 3 ? "#FF7A00" : "#334"}
                  strokeWidth="1"
                />
                <circle 
                  cx={104 + i * 38} 
                  cy="85" // Changed from y to cy for proper circle positioning
                  r="3" 
                  fill={isAvailable ? "#4ADE80" : "#EF4444"} 
                  opacity={isTarget && animationStep === 3 ? pulseOpacity : 0.6} 
                />
              </g>
            );
          })}
          
          {/* Spotlight effect for the targeted spot */}
          {animationStep >= 3 && (
            <circle cx="202" cy="115" r="25" fill="url(#spotlightGradient)" opacity={pulseOpacity} />
          )}
          
          {/* Smart parking sign */}
          <rect x="65" y="55" width="5" height="15" fill="#445" />
          <rect x="60" y="40" width="15" height="15" rx="2" fill="#2563EB" />
          <text x="67.5" y="51" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">P</text>
          
          {/* Smart city elements - street lamps */}
          {[1, 3, 5].map(i => (
            <g key={i + 200}>
              <rect x={50 + i * 70} y="140" width="3" height="20" fill="#556" />
              <circle cx={51.5 + i * 70} cy="140" r="5" fill="#223" stroke="#445" strokeWidth="1" />
              <circle cx={51.5 + i * 70} cy="140" r="2" fill="#FFF9C4" opacity="0.8" />
            </g>
          ))}
        </svg>
      </div>
      
      {/* Futuristic car animation */}
      <div className={`absolute transition-all duration-1500 ease-in-out ${
        animationStep === 0 ? 'bottom-20 right-0 opacity-100' : 
        animationStep === 1 ? 'bottom-20 right-1/4 opacity-100' :
        animationStep === 2 ? 'bottom-20 right-1/3 opacity-100' :
        animationStep === 3 ? 'bottom-20 right-2/5 opacity-100' :
        'bottom-20 right-2/5 opacity-100'
      }`}>
        <svg viewBox="0 0 70 35" className="w-32 h-16">
          {/* Car body - futuristic design */}
          <path d="M10,22 L15,12 C15,12 25,10 35,10 C45,10 55,12 55,12 L60,22 L10,22 Z" fill="#2F6BFE" />
          <path d="M8,22 L8,26 L62,26 L62,22 L8,22 Z" fill="#1A4BDE" />
          
          {/* Windows - tinted */}
          <path d="M20,12 L18,21 L52,21 L50,12 C50,12 40,11 35,11 C30,11 20,12 20,12 Z" fill="#A4CAFE" opacity="0.7" />
          
          {/* Headlights and taillights */}
          <rect x="58" y="18" width="4" height="4" rx="1" fill="#F8E71C" opacity={pulseOpacity} />
          <rect x="8" y="18" width="4" height="4" rx="1" fill="#F05252" opacity="0.8" />
          
          {/* Wheels with electric blue details */}
          <circle cx="18" cy="26" r="6" fill="#222" />
          <circle cx="18" cy="26" r="3" fill="#111" />
          <circle cx="18" cy="26" r="1" fill="#2F6BFE" />
          
          <circle cx="52" cy="26" r="6" fill="#222" />
          <circle cx="52" cy="26" r="3" fill="#111" />
          <circle cx="52" cy="26" r="1" fill="#2F6BFE" />
          
          {/* Tech details */}
          <rect x="30" y="13" width="10" height="1" rx="0.5" fill="#FFF" opacity="0.6" />
          <rect x="32" y="15" width="6" height="1" rx="0.5" fill="#FFF" opacity="0.6" />
        </svg>
      </div>
      
      {/* Floating smartphone with app interface */}
      <div className={`absolute transition-all duration-1000 ease-in-out ${
        animationStep >= 1 ? 'bottom-32 left-12 opacity-100 scale-100' : 'bottom-32 left-0 opacity-0 scale-75'
      }`}>
        <svg viewBox="0 0 50 90" className="w-20 h-36">
          {/* Phone casing */}
          <rect x="5" y="5" width="40" height="80" rx="5" fill="#111827" />
          <rect x="7" y="8" width="36" height="74" rx="3" fill="#1E293B" />
          <rect x="9" y="12" width="32" height="62" rx="2" fill="#0F172A" />
          
          {/* FindMySpot App Interface */}
          <rect x="11" y="16" width="28" height="8" rx="1" fill="#0D2748" />
          <circle cx="15" cy="20" r="2" fill="#FF7A00" />
          <rect x="19" y="19" width="16" height="2" rx="1" fill="#64748B" />
          
          {/* Map interface */}
          <rect x="11" y="26" width="28" height="35" rx="1" fill="#060F1E" />
          
          {/* Navigation elements */}
          <path d="M12,40 L38,40 L38,58 L25,50 L12,58 Z" fill="#0D2748" stroke="#223" strokeWidth="0.5" />
          
          {/* Parking markers - dynamic based on animation step */}
          <circle cx="20" cy="45" r="1.5" fill="#FF7A00" opacity={animationStep >= 2 ? 1 : 0.3} />
          <circle cx="28" cy="48" r="1.5" fill="#4ADE80" />
          <circle cx="24" cy="36" r="1.5" fill="#EF4444" />
          <circle cx="32" cy="42" r="1.5" fill="#EF4444" />
          
          {/* Current location pin */}
          <circle cx="25" cy="52" r="1.5" fill="#3B82F6" />
          <path d="M25,48 L25,52" stroke="#3B82F6" strokeWidth="0.5" />
          
          {/* Routing line that appears on step 2 */}
          {animationStep >= 2 && (
            <path d="M25,52 C25,52 22,48 20,45" stroke="#FF7A00" strokeWidth="0.8" fill="none" strokeDasharray="1,1" />
          )}
          
          {/* Success button that appears on step 3 */}
          {animationStep >= 3 && (
            <rect x="11" y="63" width="28" height="8" rx="4" fill="#FF7A00" opacity={pulseOpacity} />
          )}
          
          {/* Phone button */}
          <circle cx="25" cy="78" r="3" fill="#374151" />
        </svg>
      </div>
      
      {/* Success confirmation animation */}
      <div className={`absolute bottom-32 right-2/5 transition-all duration-500 ease-in-out transform ${
        animationStep === 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      }`}>
        <svg viewBox="0 0 60 60" className="w-24 h-24">
          <circle cx="30" cy="30" r="25" fill="#FF7A00" opacity="0.15" />
          <circle cx="30" cy="30" r="15" fill="#FF7A00" />
          <path d="M20,30 L27,37 L40,24" stroke="white" strokeWidth="3" fill="none" />
        </svg>
      </div>
      
      {/* Connection lines between car and app - Fixed positioning for better visibility */}
      {animationStep >= 2 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300">
          <path 
            d={`M${120 + animationStep * 15},200 C${150 + animationStep * 10},150 ${180 - animationStep * 5},100 200,100`} 
            stroke="#FF7A00" 
            strokeWidth="1" 
            strokeDasharray="5,3" 
            fill="none" 
            opacity="0.6" 
          />
        </svg>
      )}
      
      {/* Data visualization elements - Improved positioning */}
      {animationStep >= 2 && (
        <div className="absolute top-8 right-8 transition-all duration-700 ease-in-out opacity-70">
          <svg viewBox="0 0 100 40" className="w-32 h-12">
            <rect x="5" y="5" width="90" height="30" rx="2" fill="#0A1525" />
            <text x="10" y="15" fontSize="5" fill="#64748B">PARKING AVAILABILITY</text>
            
            {/* Mini bar chart */}
            <rect x="10" y="20" width="10" height="10" fill="#EF4444" />
            <rect x="25" y="25" width="10" height="5" fill="#F59E0B" />
            <rect x="40" y="18" width="10" height="12" fill="#10B981" />
            <rect x="55" y="22" width="10" height="8" fill="#3B82F6" />
            <rect x="70" y="15" width="10" height="15" fill="#FF7A00" />
            
            {/* Time indicators */}
            <text x="10" y="33" fontSize="3" fill="#64748B">9AM</text>
            <text x="25" y="33" fontSize="3" fill="#64748B">11AM</text>
            <text x="40" y="33" fontSize="3" fill="#64748B">1PM</text>
            <text x="55" y="33" fontSize="3" fill="#64748B">3PM</text>
            <text x="70" y="33" fontSize="3" fill="#64748B">5PM</text>
          </svg>
        </div>
      )}
    </div>
  );
};

export default CreativeParkingAnimation;