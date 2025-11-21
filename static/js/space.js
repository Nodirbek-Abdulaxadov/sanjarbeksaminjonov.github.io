// Advanced 3D Space with Three.js - Tunnel Effect
class ThreeJsSpace {
  constructor() {
    this.canvas = document.getElementById('space-canvas');
    if (!this.canvas) return;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = [];
    this.galaxy = null;
    this.tunnel = [];
    this.clock = new THREE.Clock();
    this.mouse = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };
    this.currentRotation = { x: 0, y: 0 };
    
    this.init();
    this.createStarField();
    this.createGalaxy();
    this.createTunnel();
    this.createFloatingGeometry();
    this.animate();
    this.setupEventListeners();
  }
  
  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.0008);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  
  createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 15000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    const colorPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0x667eea),
      new THREE.Color(0x4facfe),
      new THREE.Color(0xf093fb),
      new THREE.Color(0xf5576c)
    ];
    
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      
      // Position - создаем сферу звезд
      const radius = Math.random() * 200 + 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Color
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      // Size
      sizes[i] = Math.random() * 2 + 0.5;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const starMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    
    this.starField = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starField);
  }
  
  createGalaxy() {
    const galaxyGeometry = new THREE.BufferGeometry();
    const galaxyCount = 8000;
    const positions = new Float32Array(galaxyCount * 3);
    const colors = new Float32Array(galaxyCount * 3);
    
    for (let i = 0; i < galaxyCount; i++) {
      const i3 = i * 3;
      
      // Spiral galaxy shape
      const radius = Math.random() * 15;
      const spinAngle = radius * 2;
      const branchAngle = ((i % 3) / 3) * Math.PI * 2;
      
      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1);
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1);
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1);
      
      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY * 0.3;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
      
      // Color gradient from center
      const colorInner = new THREE.Color(0x667eea);
      const colorOuter = new THREE.Color(0xf093fb);
      const mixedColor = colorInner.clone();
      mixedColor.lerp(colorOuter, radius / 15);
      
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }
    
    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const galaxyMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    this.galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
    this.galaxy.position.z = -30;
    this.scene.add(this.galaxy);
  }
  
  createTunnel() {
    // Create a tunnel effect with rings
    const ringCount = 50;
    
    for (let i = 0; i < ringCount; i++) {
      const geometry = new THREE.TorusGeometry(4, 0.1, 16, 100);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(i / ringCount, 1, 0.5),
        transparent: true,
        opacity: 0.6,
        wireframe: true
      });
      
      const ring = new THREE.Mesh(geometry, material);
      ring.position.z = -i * 5 - 10;
      ring.rotation.x = Math.random() * 0.5;
      ring.userData.speed = 0.05 + Math.random() * 0.05;
      ring.userData.rotationSpeed = (Math.random() - 0.5) * 0.02;
      
      this.tunnel.push(ring);
      this.scene.add(ring);
    }
  }
  
  createFloatingGeometry() {
    this.floatingObjects = [];
    
    // Platonic solids floating around
    const geometries = [
      new THREE.TetrahedronGeometry(0.5),
      new THREE.OctahedronGeometry(0.5),
      new THREE.IcosahedronGeometry(0.5),
      new THREE.DodecahedronGeometry(0.5)
    ];
    
    for (let i = 0; i < 15; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
        wireframe: true,
        transparent: true,
        opacity: 0.4
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 100 - 20
      );
      
      mesh.userData.velocity = {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      };
      
      mesh.userData.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.03,
        y: (Math.random() - 0.5) * 0.03,
        z: (Math.random() - 0.5) * 0.03
      };
      
      this.floatingObjects.push(mesh);
      this.scene.add(mesh);
    }
    
    // Add some glowing spheres
    for (let i = 0; i < 20; i++) {
      const geometry = new THREE.SphereGeometry(0.3, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 1, 0.6),
        transparent: true,
        opacity: 0.6
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 120 - 30
      );
      
      // Add glow
      const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: material.color,
        transparent: true,
        opacity: 0.2
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      sphere.add(glow);
      
      sphere.userData.floatSpeed = Math.random() * 0.5 + 0.5;
      sphere.userData.floatOffset = Math.random() * Math.PI * 2;
      
      this.floatingObjects.push(sphere);
      this.scene.add(sphere);
    }
  }
  
  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      this.targetRotation.x = this.mouse.y * 0.3;
      this.targetRotation.y = this.mouse.x * 0.3;
    });
    
    // Mouse wheel for zoom effect
    window.addEventListener('wheel', (e) => {
      const delta = e.deltaY * 0.001;
      this.camera.position.z = Math.max(2, Math.min(10, this.camera.position.z + delta));
    });
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    const elapsedTime = this.clock.getElapsedTime();
    
    // Rotate star field slowly
    if (this.starField) {
      this.starField.rotation.y = elapsedTime * 0.02;
      this.starField.rotation.x = Math.sin(elapsedTime * 0.01) * 0.1;
    }
    
    // Rotate and pulse galaxy
    if (this.galaxy) {
      this.galaxy.rotation.y = elapsedTime * 0.05;
      this.galaxy.rotation.x = Math.sin(elapsedTime * 0.03) * 0.2;
      const scale = 1 + Math.sin(elapsedTime * 0.5) * 0.1;
      this.galaxy.scale.set(scale, scale, scale);
    }
    
    // Animate tunnel - move forward and rotate
    this.tunnel.forEach((ring) => {
      ring.position.z += ring.userData.speed;
      ring.rotation.z += ring.userData.rotationSpeed;
      
      // Reset position when ring passes camera
      if (ring.position.z > 5) {
        ring.position.z = -245;
      }
      
      // Pulsate
      const scale = 1 + Math.sin(elapsedTime * 2 + ring.position.z * 0.1) * 0.1;
      ring.scale.set(scale, scale, scale);
    });
    
    // Animate floating objects
    this.floatingObjects.forEach((obj) => {
      if (obj.userData.velocity) {
        obj.position.x += obj.userData.velocity.x;
        obj.position.y += obj.userData.velocity.y;
        obj.position.z += obj.userData.velocity.z;
        
        // Wrap around
        if (Math.abs(obj.position.x) > 50) obj.userData.velocity.x *= -1;
        if (Math.abs(obj.position.y) > 50) obj.userData.velocity.y *= -1;
        if (Math.abs(obj.position.z) > 100) obj.userData.velocity.z *= -1;
      }
      
      if (obj.userData.rotationSpeed) {
        obj.rotation.x += obj.userData.rotationSpeed.x;
        obj.rotation.y += obj.userData.rotationSpeed.y;
        obj.rotation.z += obj.userData.rotationSpeed.z;
      }
      
      if (obj.userData.floatSpeed) {
        obj.position.y += Math.sin(elapsedTime * obj.userData.floatSpeed + obj.userData.floatOffset) * 0.01;
      }
    });
    
    // Smooth camera rotation based on mouse
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.05;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.05;
    
    this.camera.rotation.x = this.currentRotation.x;
    this.camera.rotation.y = this.currentRotation.y;
    
    // Camera breathing effect
    this.camera.position.z = 5 + Math.sin(elapsedTime * 0.5) * 0.5;
    
    this.renderer.render(this.scene, this.camera);
  }
}

// 3D Card Tilt Effect
class CardTilt {
  constructor() {
    this.cards = document.querySelectorAll('.profile-card, .description-card');
    this.init();
  }
  
  init() {
    this.cards.forEach(card => {
      card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card));
      card.addEventListener('mouseleave', () => this.handleMouseLeave(card));
    });
  }
  
  handleMouseMove(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;
    
    card.style.transform = `
      perspective(1000px) 
      rotateX(${rotateX}deg) 
      rotateY(${rotateY}deg) 
      translateZ(20px)
      scale3d(1.03, 1.03, 1.03)
    `;
    
    // Add shine effect
    const shine = card.querySelector('.card-shine') || this.createShine(card);
    shine.style.background = `
      radial-gradient(
        circle at ${x}px ${y}px, 
        rgba(102, 126, 234, 0.3), 
        transparent 50%
      )
    `;
  }
  
  createShine(card) {
    const shine = document.createElement('div');
    shine.className = 'card-shine';
    shine.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      border-radius: inherit;
      transition: background 0.1s ease;
      z-index: 1;
    `;
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
    card.insertBefore(shine, card.firstChild);
    return shine;
  }
  
  handleMouseLeave(card) {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale3d(1, 1, 1)';
    const shine = card.querySelector('.card-shine');
    if (shine) {
      shine.style.background = 'transparent';
    }
  }
}

// Particle cursor trail
class ParticleCursor {
  constructor() {
    this.particles = [];
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(this.canvas);
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('mousemove', (e) => this.addParticle(e));
    
    this.animate();
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  addParticle(e) {
    const colors = ['#667eea', '#4facfe', '#f093fb', '#f5576c'];
    this.particles.push({
      x: e.clientX,
      y: e.clientY,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1
    });
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach((p, index) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.life -= 0.02;
      p.size *= 0.96;
      
      if (p.life <= 0) {
        this.particles.splice(index, 1);
        return;
      }
      
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    this.ctx.globalAlpha = 1;
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if Three.js is loaded
  if (typeof THREE !== 'undefined') {
    new ThreeJsSpace();
  }
  
  new CardTilt();
  new ParticleCursor();
  
  // Animation Toggle functionality
  initAnimationToggle();
});

// Animation Toggle
function initAnimationToggle() {
  const storageKey = 'animation-mode';
  const simpleClassName = 'simple-mode';
  
  function safeStorage() {
    try {
      var testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return localStorage;
    } catch (e) {
      return null;
    }
  }
  
  const storage = safeStorage();
  
  function getStoredMode() {
    if (!storage) return null;
    return storage.getItem(storageKey);
  }
  
  function storeMode(mode) {
    if (!storage) return;
    storage.setItem(storageKey, mode);
  }
  
  function applyMode(isSimple) {
    document.body.classList.toggle(simpleClassName, isSimple);
    
    const toggles = document.querySelectorAll('[data-animation-toggle]');
    toggles.forEach(toggle => {
      toggle.setAttribute('aria-pressed', isSimple ? 'false' : 'true');
      const label = toggle.querySelector('.animation-toggle__label');
      const icon = toggle.querySelector('.animation-toggle__icon');
      if (label) {
        label.textContent = isSimple ? '3D Mode' : 'Simple Mode';
      }
      if (icon) {
        icon.textContent = isSimple ? '🎨' : '🎬';
      }
    });
    
    storeMode(isSimple ? 'simple' : 'animated');
  }
  
  function handleToggleClick() {
    const isCurrentlySimple = document.body.classList.contains(simpleClassName);
    applyMode(!isCurrentlySimple);
  }
  
  // Initialize
  const storedMode = getStoredMode();
  if (storedMode === 'simple') {
    applyMode(true);
  }
  
  // Add event listeners
  const toggles = document.querySelectorAll('[data-animation-toggle]');
  toggles.forEach(toggle => {
    toggle.addEventListener('click', handleToggleClick);
  });
}

// Smooth scroll with parallax
let scrollPosition = 0;
window.addEventListener('scroll', () => {
  scrollPosition = window.pageYOffset;
  
  const planets = document.querySelectorAll('.planet, .asteroid, .comet');
  planets.forEach((planet, index) => {
    const speed = (index + 1) * 0.05;
    planet.style.transform = `translateY(${scrollPosition * speed}px)`;
  });
});

