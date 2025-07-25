import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Devices = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      window.innerWidth < 768 ? 60 : 50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = window.innerWidth < 768 ? 12 : 10;
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4080ff, 0.5);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    const phoneGroup = new THREE.Group();
    
    const phoneBody = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1.8, 0.1),
      new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1.0,
      })
    );
    phoneBody.castShadow = true;
    phoneGroup.add(phoneBody);

    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 1.6, 0.02),
      new THREE.MeshPhysicalMaterial({
        color: 0x0077ff,
        emissive: 0x002244,
        emissiveIntensity: 0.3,
      })
    );
    screen.position.z = 0.06;
    phoneGroup.add(screen);
    const indicator = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.05, 0.01),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    indicator.position.set(0, -0.7, 0.07);
    phoneGroup.add(indicator);
    const laptopGroup = new THREE.Group();
  
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.1, 1.6),
      new THREE.MeshPhysicalMaterial({
        color: 0xd4d4d4,
        metalness: 0.95,
        roughness: 0.05,
      })
    );
    base.castShadow = true;
    laptopGroup.add(base);

    const screenGroup = new THREE.Group();
    
    const screenFrame = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.6, 0.08),
      new THREE.MeshPhysicalMaterial({
        color: 0x2a2a2a,
        metalness: 0.9,
        roughness: 0.1,
      })
    );

    screenFrame.position.y = 0.8; 
    screenFrame.castShadow = true;
    screenGroup.add(screenFrame);

    const display = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.4, 0.02),
      new THREE.MeshPhysicalMaterial({
        color: 0x0099ff,
        emissive: 0x003366,
        emissiveIntensity: 0.4,
      })
    );
    display.position.y = 0.8; 
    display.position.z = 0.04; 
    screenGroup.add(display);

    screenGroup.position.set(0, 0.05, -0.8); 
    screenGroup.rotation.x = -Math.PI / 6; 
    laptopGroup.add(screenGroup);
    const keyboard = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.02, 1.2),
      new THREE.MeshPhysicalMaterial({ 
        color: 0x303030,
        metalness: 0.2,
        roughness: 0.8
      })
    );
    keyboard.position.y = 0.06;
    laptopGroup.add(keyboard);

    const trackpad = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.01, 0.4),
      new THREE.MeshPhysicalMaterial({ 
        color: 0x606060,
        metalness: 0.3,
        roughness: 0.5
      })
    );
    trackpad.position.set(0, 0.06, 0.5); 
    laptopGroup.add(trackpad);
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      phoneGroup.position.set(-3, -5, 0);
      phoneGroup.scale.set(0.8, 0.8, 0.8);
      laptopGroup.visible = false;
    } else {
      phoneGroup.position.set(-6, 0, 0);
      phoneGroup.scale.set(1.2, 1.2, 1.2);
      laptopGroup.position.set(6, -0.5, 0);
      laptopGroup.scale.set(1.0, 1.0, 1.0);
      laptopGroup.visible = true;
    }
    
    scene.add(phoneGroup);
    scene.add(laptopGroup);
    
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    function animate() {
      requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
    
      phoneGroup.rotation.y = time * 0.5;
      phoneGroup.rotation.x = Math.sin(time * 0.8) * 0.2;
      phoneGroup.rotation.z = Math.cos(time * 0.6) * 0.1;
      phoneGroup.position.y = Math.sin(time * 1.2) * 0.4 + (isMobile ? -5 : 0);
      phoneGroup.position.z = Math.sin(time * 0.8) * 0.3;
      phoneGroup.rotation.x += mouse.y * 0.1;
      phoneGroup.rotation.y += mouse.x * 0.1;
      
      if (!isMobile) {
        laptopGroup.rotation.y = -time * 0.4;
        laptopGroup.rotation.x = Math.cos(time * 0.7) * 0.15;
        laptopGroup.rotation.z = Math.sin(time * 0.5) * 0.08;
        laptopGroup.position.y = Math.cos(time * 1.2) * 0.4 - 0.5;
        laptopGroup.position.z = Math.cos(time * 0.8) * 0.3;
        
        laptopGroup.rotation.x += mouse.y * 0.08;
        laptopGroup.rotation.y += mouse.x * 0.08;

        screenGroup.rotation.x = -Math.PI / 6 + Math.sin(time * 0.3) * 0.1;
      }
      
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      const isMobile = width < 768;
      
      camera.aspect = width / height;
      camera.fov = isMobile ? 60 : 50;
      camera.position.z = isMobile ? 12 : 10;
      camera.updateProjectionMatrix();
      
      if (isMobile) {
        phoneGroup.position.set(-3, -5, 0);
        phoneGroup.scale.set(0.8, 0.8, 0.8);
        laptopGroup.visible = false;
      } else {
        phoneGroup.position.set(-6, 0, 0);
        phoneGroup.scale.set(1.2, 1.2, 1.2);
        laptopGroup.position.set(6, -0.5, 0);
        laptopGroup.scale.set(1.0, 1.0, 1.0);
        laptopGroup.visible = true;
      }
      
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 pointer-events-none md:block hidden"
      style={{ zIndex: 1 }}
    />
  );
};

export default Devices;