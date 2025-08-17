import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ParkingAnimation = ({ isAnimated }) => {
  const mountRef = useRef(null);
  
  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1929);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75, 
      2, // Default aspect ratio, will be updated on resize
      0.1, 
      1000
    );
    camera.position.set(5, 8, 15);
    camera.lookAt(0, 0, 0);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add renderer to DOM
    mountRef.current.appendChild(renderer.domElement);
    
    // Handle resizing
    const handleResize = () => {
      if (mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };
    
    // Initial sizing
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    
    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333, 
      roughness: 0.8 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);
    
    // Add parking lot markings
    const addParkingLines = () => {
      const lineWidth = 0.1;
      const lineLength = 5;
      const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      
      // Create multiple parking spots
      for (let i = -2; i <= 2; i++) {
        if (i === 0) continue; // Skip middle for driving lane
        
        const spotX = i * 3;
        
        // Horizontal lines (back of spots)
        const hLineGeometry = new THREE.BoxGeometry(lineLength, 0.01, lineWidth);
        const hLine = new THREE.Mesh(hLineGeometry, lineMaterial);
        hLine.position.set(spotX, -0.49, -2);
        scene.add(hLine);
        
        // Vertical lines (sides of spots)
        for (let j = -1; j <= 1; j += 2) {
          const vLineGeometry = new THREE.BoxGeometry(lineWidth, 0.01, 4);
          const vLine = new THREE.Mesh(vLineGeometry, lineMaterial);
          vLine.position.set(spotX + j * lineLength/2, -0.49, 0);
          scene.add(vLine);
        }
      }
      
      // Add center driving lane markings
      const centerLineGeometry = new THREE.BoxGeometry(lineWidth, 0.01, 30);
      const centerLineMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFF7A00,
        emissive: 0xFF7A00,
        emissiveIntensity: 0.3
      });
      const centerLine = new THREE.Mesh(centerLineGeometry, centerLineMaterial);
      centerLine.position.set(0, -0.49, 0);
      scene.add(centerLine);
    };
    
    addParkingLines();
    
    // Create car
    const createCar = () => {
      const carGroup = new THREE.Group();
      
      // Car body
      const bodyGeometry = new THREE.BoxGeometry(1.8, 0.8, 4);
      const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFF7A00,
        metalness: 0.6,
        roughness: 0.4
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.4;
      carGroup.add(body);
      
      // Car roof
      const roofGeometry = new THREE.BoxGeometry(1.7, 0.7, 2);
      const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFF7A00,
        metalness: 0.6,
        roughness: 0.4
      });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.y = 1.15;
      roof.position.z = -0.3;
      carGroup.add(roof);
      
      // Car windows
      const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x88CCFF,
        metalness: 0.8,
        roughness: 0.2
      });
      
      // Front windshield
      const frontWindowGeometry = new THREE.BoxGeometry(1.6, 0.6, 0.1);
      const frontWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
      frontWindow.position.set(0, 1, 0.7);
      frontWindow.rotation.x = Math.PI * 0.15;
      carGroup.add(frontWindow);
      
      // Rear windshield
      const rearWindowGeometry = new THREE.BoxGeometry(1.6, 0.6, 0.1);
      const rearWindow = new THREE.Mesh(rearWindowGeometry, windowMaterial);
      rearWindow.position.set(0, 1, -1.3);
      rearWindow.rotation.x = -Math.PI * 0.15;
      carGroup.add(rearWindow);
      
      // Wheels
      const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
      const wheelMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.9
      });
      
      const wheelPositions = [
        [-0.9, 0, 1.3],  // Front left
        [0.9, 0, 1.3],   // Front right
        [-0.9, 0, -1.3], // Rear left
        [0.9, 0, -1.3]   // Rear right
      ];
      
      wheelPositions.forEach(position => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(...position);
        wheel.rotation.z = Math.PI / 2;
        carGroup.add(wheel);
      });
      
      // Headlights
      const headlightGeometry = new THREE.SphereGeometry(0.2, 16, 16);
      const headlightMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        emissive: 0xFFFFEE,
        emissiveIntensity: 0.5
      });
      
      const headlightPositions = [
        [-0.6, 0.4, 2],  // Left
        [0.6, 0.4, 2]    // Right
      ];
      
      headlightPositions.forEach(position => {
        const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        headlight.position.set(...position);
        carGroup.add(headlight);
      });
      
      // Taillights
      const taillightGeometry = new THREE.BoxGeometry(0.6, 0.2, 0.1);
      const taillightMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFF0000,
        emissive: 0xFF0000,
        emissiveIntensity: 0.5
      });
      
      const taillightPositions = [
        [-0.6, 0.4, -2],  // Left
        [0.6, 0.4, -2]    // Right
      ];
      
      taillightPositions.forEach(position => {
        const taillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
        taillight.position.set(...position);
        carGroup.add(taillight);
      });
      
      // Initial position
      carGroup.position.set(-8, 0, 0);
      carGroup.rotation.y = Math.PI / 2;
      
      return carGroup;
    };
    
    const car = createCar();
    scene.add(car);
    
    // Create parking lot structures
    const createParkingStructures = () => {
      // Parking signs
      const signGeometry = new THREE.BoxGeometry(1.5, 2, 0.2);
      const signMaterial = new THREE.MeshStandardMaterial({ color: 0x0066CC });
      
      for (let i = -2; i <= 2; i++) {
        if (i === 0) continue; // Skip middle for driving lane
        
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(i * 3, 0.5, -4);
        scene.add(sign);
        
        // P letter on sign
        const textGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
        const textMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const pSymbol = new THREE.Mesh(textGeometry, textMaterial);
        pSymbol.position.set(i * 3, 0.8, -3.9);
        scene.add(pSymbol);
      }
      
      // Add a highlight to the target parking spot
      const spotlightGeometry = new THREE.CircleGeometry(1.5, 32);
      const spotlightMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFF7A00, 
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      const spotlight = new THREE.Mesh(spotlightGeometry, spotlightMaterial);
      spotlight.position.set(6, -0.48, 0);
      spotlight.rotation.x = -Math.PI / 2;
      scene.add(spotlight);
    };
    
    createParkingStructures();
    
    // Animation variables
    let animationPhase = 0; // 0: driving in, 1: turning, 2: parking, 3: parked
    let animationProgress = 0;
    
    // Animation paths
    const pathPoints = [
      { x: -8, z: 0, rot: Math.PI / 2 },  // Start position
      { x: 0, z: 0, rot: Math.PI / 2 },   // Middle of the road
      { x: 4, z: 0, rot: Math.PI / 2 },   // Before turning
      { x: 6, z: 2, rot: 0 },            // Turning into spot
      { x: 6, z: 0, rot: 0 }             // Parked position
    ];
    
    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (isAnimated && animationPhase < pathPoints.length - 1) {
        animationProgress += 0.005;
        
        if (animationProgress >= 1) {
          animationPhase++;
          animationProgress = 0;
          
          // If we've completed all phases, stop
          if (animationPhase >= pathPoints.length - 1) {
            animationPhase = pathPoints.length - 2;
            animationProgress = 1;
          }
        }
        
        // Get current and next points
        const current = pathPoints[animationPhase];
        const next = pathPoints[animationPhase + 1];
        
        // Interpolate position and rotation
        car.position.x = current.x + (next.x - current.x) * animationProgress;
        car.position.z = current.z + (next.z - current.z) * animationProgress;
        
        // Smooth rotation
        car.rotation.y = current.rot + (next.rot - current.rot) * animationProgress;
      }
      
      // Render the scene
      renderer.render(scene, camera);
    };
    
    // Start animation loop
    animate();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [isAnimated]);
  
  return (
    <div 
      ref={mountRef} 
      style={{ 
        position: "absolute", 
        right: 0, 
        bottom: 0, 
        width: "50%", 
        height: "80%", 
        pointerEvents: "none",
        opacity: isAnimated ? 1 : 0,
        transition: "opacity 1.5s ease-out",
      }}
    />
  );
};

export default ParkingAnimation;