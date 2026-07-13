// hero-3d.js - Interactive Three.js WebGL Scene for NxtGen-Solutions

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('hero-canvas-container');
  const canvas = document.getElementById('hero-canvas');
  
  if (!container || !canvas || typeof THREE === 'undefined') {
    console.warn("Three.js canvas elements not found or library not loaded.");
    return;
  }

  // 1. Initialise Scene, Camera & Renderer
  const scene = new THREE.Scene();
  
  let width = container.clientWidth;
  let height = container.clientHeight;
  
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 12);
  
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // 2. Interactive Group Container
  const mainGroup = new THREE.Group();
  scene.add(mainGroup);
  
  // 3. Dynamic Canvas Textures Drawing
  function createCanvasTexture(type) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    
    // Background card base
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 512, 512);
    
    // Rounded border
    ctx.lineWidth = 16;
    ctx.strokeStyle = 'rgba(20, 184, 166, 0.3)';
    ctx.strokeRect(8, 8, 496, 496);
    
    if (type === 'id') {
      // Header brand
      ctx.fillStyle = '#2563EB';
      ctx.fillRect(0, 0, 512, 100);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('NxtGen IDENTITY', 40, 65);
      
      // Photo slot
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(60, 140, 140, 180);
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.arc(130, 200, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(130, 290, 55, Math.PI, 0);
      ctx.fill();
      
      // Info details lines
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(240, 160, 210, 20);
      ctx.fillStyle = '#64748B';
      ctx.fillRect(240, 210, 170, 14);
      ctx.fillRect(240, 240, 190, 14);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(240, 270, 140, 14);
      
      // Chip details
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(60, 370, 80, 60);
      
      // Signature slot
      ctx.fillStyle = '#EEF6FF';
      ctx.fillRect(240, 370, 210, 50);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(250, 400);
      ctx.bezierCurveTo(280, 380, 310, 420, 350, 390);
      ctx.lineTo(430, 395);
      ctx.stroke();
      
    } else if (type === 'access') {
      // Header band
      ctx.fillStyle = '#14B8A6';
      ctx.fillRect(0, 0, 512, 120);
      
      // Wireless signal waves
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.arc(256, 60, 20, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(256, 60, 45, Math.PI, 0);
      ctx.stroke();
      
      // Card text
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 40px Arial';
      ctx.fillText('NxtGen ACCESS', 90, 230);
      
      // Graphics base
      ctx.fillStyle = '#F1F7FF';
      ctx.fillRect(80, 280, 352, 150);
      
      // Barcode bars
      ctx.fillStyle = '#64748B';
      const bars = [15, 8, 24, 10, 30, 8, 16, 25, 8, 12, 28];
      let startX = 100;
      bars.forEach(width => {
        ctx.fillRect(startX, 310, width, 90);
        startX += width + 10;
      });
      
    } else {
      // Dashboard graphic
      ctx.fillStyle = '#FAFBFC';
      ctx.fillRect(0, 0, 512, 120);
      ctx.fillStyle = '#2563EB';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('SYSTEM MONITOR', 40, 75);
      
      // Grid lines
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 150; i < 480; i += 60) {
        ctx.moveTo(30, i);
        ctx.lineTo(482, i);
      }
      ctx.stroke();
      
      // Spline chart
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(40, 400);
      ctx.bezierCurveTo(120, 200, 200, 420, 280, 250);
      ctx.bezierCurveTo(360, 100, 420, 350, 480, 180);
      ctx.stroke();
      
      // Nodes highlights
      ctx.fillStyle = '#14B8A6';
      ctx.beginPath();
      ctx.arc(280, 250, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(480, 180, 12, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(c);
  }

  const textureID = createCanvasTexture('id');
  const textureAccess = createCanvasTexture('access');
  const textureDash = createCanvasTexture('dash');

  // 4. Create Geometries & Materials
  
  // Card base geometry (thin Box)
  const cardGeo = new THREE.BoxGeometry(2.4, 3.4, 0.08);
  const cardMatID = new THREE.MeshPhongMaterial({ map: textureID, shininess: 80 });
  const cardMatAccess = new THREE.MeshPhongMaterial({ map: textureAccess, shininess: 80 });
  
  // Create Mesh - ID Card
  const meshID = new THREE.Mesh(cardGeo, cardMatID);
  meshID.position.set(-2, 0.8, 1);
  meshID.rotation.set(0.2, 0.4, -0.15);
  meshID.baseY = 0.8;
  meshID.floatSpeed = 0.35; // reduced from 1.2
  meshID.floatOffset = 0;
  mainGroup.add(meshID);
  
  // Create Mesh - Access Card
  const meshAccess = new THREE.Mesh(cardGeo, cardMatAccess);
  meshAccess.position.set(-1.2, -1.5, 2);
  meshAccess.rotation.set(-0.1, -0.5, 0.1);
  meshAccess.baseY = -1.5;
  meshAccess.floatSpeed = 0.25; // reduced from 0.9
  meshAccess.floatOffset = Math.PI / 3;
  mainGroup.add(meshAccess);
  
  // Create Mesh - Digital Dashboard
  const dashGeo = new THREE.BoxGeometry(3.5, 2.5, 0.06);
  const dashMat = new THREE.MeshPhongMaterial({ map: textureDash, transparent: true, opacity: 0.9, shininess: 60 });
  const meshDash = new THREE.Mesh(dashGeo, dashMat);
  meshDash.position.set(1.5, -0.2, -1.2);
  meshDash.rotation.set(0.15, -0.3, -0.05);
  meshDash.baseY = -0.2;
  meshDash.floatSpeed = 0.3; // reduced from 1.0
  meshDash.floatOffset = Math.PI / 1.5;
  mainGroup.add(meshDash);
 
  // Wireframe Security Shield
  const shieldShape = new THREE.Shape();
  shieldShape.moveTo(0, 1.2);
  shieldShape.quadraticCurveTo(0.8, 1.2, 0.8, 0.4);
  shieldShape.quadraticCurveTo(0.8, -0.4, 0, -1.2);
  shieldShape.quadraticCurveTo(-0.8, -0.4, -0.8, 0.4);
  shieldShape.quadraticCurveTo(-0.8, 1.2, 0, 1.2);
  
  const shieldGeo = new THREE.ExtrudeGeometry(shieldShape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.02, bevelSegments: 3 });
  const shieldMat = new THREE.MeshPhongMaterial({
    color: 0x14B8A6,
    wireframe: true,
    transparent: true,
    opacity: 0.85
  });
  const meshShield = new THREE.Mesh(shieldGeo, shieldMat);
  meshShield.position.set(2.4, 1.5, 0.5);
  meshShield.rotation.set(0.1, -0.2, 0.15);
  meshShield.baseY = 1.5;
  meshShield.floatSpeed = 0.4; // reduced from 1.5
  meshShield.floatOffset = Math.PI;
  mainGroup.add(meshShield);
 
  // CCTV Camera Mesh Group
  const cctvGroup = new THREE.Group();
  
  const bodyGeo = new THREE.BoxGeometry(0.5, 0.5, 1.1);
  const silverMat = new THREE.MeshPhongMaterial({ color: 0xe2e8f0, shininess: 100 });
  const cameraBody = new THREE.Mesh(bodyGeo, silverMat);
  cctvGroup.add(cameraBody);
  
  const lensGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16);
  const lensMat = new THREE.MeshPhongMaterial({ color: 0x0f172a, shininess: 150 });
  const cameraLens = new THREE.Mesh(lensGeo, lensMat);
  cameraLens.rotation.x = Math.PI / 2;
  cameraLens.position.set(0, 0, 0.6);
  cctvGroup.add(cameraLens);
  
  const mountGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8);
  const cameraMount = new THREE.Mesh(mountGeo, silverMat);
  cameraMount.position.set(0, -0.4, -0.2);
  cctvGroup.add(cameraMount);
  
  cctvGroup.position.set(-2.2, 2.2, -0.5);
  cctvGroup.rotation.set(0.3, 0.6, -0.2);
  cctvGroup.baseY = 2.2;
  cctvGroup.floatSpeed = 0.22; // reduced from 0.8
  cctvGroup.floatOffset = Math.PI / 4;
  mainGroup.add(cctvGroup);
 
  // Fingerprint Scanner Panel
  const scannerGroup = new THREE.Group();
  
  const panelGeo = new THREE.BoxGeometry(1.2, 1.2, 0.1);
  const panelMat = new THREE.MeshPhongMaterial({ color: 0x0f172a, shininess: 80 });
  const panelBase = new THREE.Mesh(panelGeo, panelMat);
  scannerGroup.add(panelBase);
  
  // Blue scan area
  const scanAreaGeo = new THREE.PlaneGeometry(0.9, 0.9);
  const scanAreaMat = new THREE.MeshBasicMaterial({ color: 0x2563EB, transparent: true, opacity: 0.3 });
  const scanArea = new THREE.Mesh(scanAreaGeo, scanAreaMat);
  scanArea.position.z = 0.06;
  scannerGroup.add(scanArea);
  
  // Wireframe laser scanner
  const lineGeo = new THREE.BoxGeometry(1.0, 0.05, 0.05);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x14B8A6 });
  const scanLine = new THREE.Mesh(lineGeo, lineMat);
  scanLine.position.z = 0.08;
  scannerGroup.add(scanLine);
  
  scannerGroup.position.set(1.0, -2.0, 0.8);
  scannerGroup.rotation.set(-0.25, -0.4, 0.1);
  scannerGroup.baseY = -2.0;
  scannerGroup.floatSpeed = 0.33; // reduced from 1.1
  scannerGroup.floatOffset = Math.PI / 2.5;
  mainGroup.add(scannerGroup);

  // 5. Lighting Configs
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambientLight);
  
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight1.position.set(5, 10, 7);
  scene.add(dirLight1);
  
  const dirLight2 = new THREE.DirectionalLight(0x2563EB, 0.45);
  dirLight2.position.set(-6, -2, 4);
  scene.add(dirLight2);
  
  const spotLight = new THREE.SpotLight(0x14B8A6, 0.5);
  spotLight.position.set(0, 8, 2);
  scene.add(spotLight);

  // 6. Interactive Mouse Coordinates Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  
  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.0006;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.0006;
  });

  // 7. Animation rendering loop
  const clock = new THREE.Clock();
  
  function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    
    // Parallax damping lerp
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;
    
    mainGroup.rotation.y = targetX;
    mainGroup.rotation.x = targetY;
    
    // Floating coordinates calculations
    mainGroup.children.forEach(mesh => {
      if (mesh.baseY !== undefined) {
        mesh.position.y = mesh.baseY + Math.sin(time * mesh.floatSpeed + mesh.floatOffset) * 0.15;
        mesh.rotation.y += Math.sin(time * 0.5) * 0.0004;
      }
    });
    
    // Custom scanner laser bar sliding
    if (scanLine) {
      scanLine.position.y = Math.sin(time * 2.5) * 0.4;
    }
    
    renderer.render(scene, camera);
  }
  
  animate();
  
  // 8. Handle Window Resizes
  window.addEventListener('resize', () => {
    width = container.clientWidth;
    height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
});
