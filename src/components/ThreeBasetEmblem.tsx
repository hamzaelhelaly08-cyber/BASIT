import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface ThreeBasetEmblemProps {
  className?: string;
  isRtl?: boolean;
}

export const ThreeBasetEmblem: React.FC<ThreeBasetEmblemProps> = ({
  className = 'w-full h-48 sm:h-56',
  isRtl = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL safely
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const width = container.clientWidth || 280;
    const height = container.clientHeight || 200;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.2);
    camera.lookAt(0, 0.3, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Procedural Studio Environment Map
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {
      // Graceful fallback
    }

    // Studio Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xFFE899, 2.2);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 512;
      keyLight.shadow.mapSize.height = 512;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x7E3FD6, 0x1F172F, 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xFFC928, 1.5);
    rimLight.position.set(-3, 2, -3);
    scene.add(rimLight);

    // Composite Procedural Model: Luxury Royal Catering Cloche & Platter (BASET Emblem)
    const clocheGroup = new THREE.Group();

    // 1. Base Silver/Titanium Serving Platter (Lathe Geometry)
    const platterPoints: THREE.Vector2[] = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(1.7, 0),
      new THREE.Vector2(1.8, 0.06),
      new THREE.Vector2(1.65, 0.12),
      new THREE.Vector2(1.3, 0.08),
      new THREE.Vector2(0, 0.08),
    ];
    const platterGeo = new THREE.LatheGeometry(platterPoints, 48);
    const platterMat = new THREE.MeshStandardMaterial({
      color: 0xEEEEF5,
      metalness: 0.92,
      roughness: 0.22,
    });
    const platterMesh = new THREE.Mesh(platterGeo, platterMat);
    platterMesh.receiveShadow = !isSoftwareGl;
    clocheGroup.add(platterMesh);

    // 2. Dome Cloche Cover (Fiery Golden Mirror Finish)
    const domeGeo = new THREE.SphereGeometry(1.25, 48, 28, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0xFFC928, // Fiery Golden Yellow
      metalness: 0.96,
      roughness: 0.14,
    });
    const domeMesh = new THREE.Mesh(domeGeo, domeMat);
    domeMesh.position.y = 0.08;
    domeMesh.castShadow = !isSoftwareGl;
    domeMesh.receiveShadow = !isSoftwareGl;
    clocheGroup.add(domeMesh);

    // 3. Royal Purple Decorative Waist Ring
    const ringGeo = new THREE.TorusGeometry(1.24, 0.045, 16, 48);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x62339A, // Royal Purple
      metalness: 0.85,
      roughness: 0.2,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.16;
    clocheGroup.add(ringMesh);

    // 4. Gold Pedestal Collar for Top Handle
    const collarGeo = new THREE.CylinderGeometry(0.2, 0.26, 0.14, 32);
    const collarMesh = new THREE.Mesh(collarGeo, domeMat);
    collarMesh.position.y = 1.34;
    clocheGroup.add(collarMesh);

    // 5. Crown Royal Jewel Handle (Luminous Purple Faceted Gem)
    const jewelGeo = new THREE.OctahedronGeometry(0.22, 1);
    const jewelMat = new THREE.MeshPhysicalMaterial({
      color: 0xA855F7,
      metalness: 0.1,
      roughness: 0.08,
      transmission: isSoftwareGl ? 0 : 0.85,
      transparent: true,
      opacity: 0.95,
      ior: 1.8,
    });
    const jewelMesh = new THREE.Mesh(jewelGeo, jewelMat);
    jewelMesh.position.y = 1.52;
    jewelMesh.rotation.y = Math.PI / 4;
    clocheGroup.add(jewelMesh);

    // 6. Gold Finial Ring on Top
    const topRingGeo = new THREE.TorusGeometry(0.12, 0.025, 16, 32);
    topRingGeo.rotateY(Math.PI / 2);
    const topRingMesh = new THREE.Mesh(topRingGeo, domeMat);
    topRingMesh.position.y = 1.76;
    clocheGroup.add(topRingMesh);

    // 7. Soft Radial Ground Contact Shadow
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(15, 10, 25, 0.65)');
      gradient.addColorStop(0.5, 'rgba(45, 20, 80, 0.35)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.6,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = -0.01;
    scene.add(shadowMesh);

    // Position cloche group slightly lower for balance
    clocheGroup.position.set(0, 0, 0);
    scene.add(clocheGroup);

    // Mouse / Touch Interaction for tactile feedback
    let isDragging = false;
    let prevPointerX = 0;
    let targetRotationY = isRtl ? -0.3 : 0.3;
    let currentRotationY = targetRotationY;
    let autoRotateSpeed = 0.008;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevPointerX = e.clientX;
      autoRotateSpeed = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevPointerX;
      prevPointerX = e.clientX;
      targetRotationY += deltaX * 0.015;
    };

    const onPointerUp = () => {
      isDragging = false;
      autoRotateSpeed = 0.006;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 280;
      const newH = container.clientHeight || 200;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Render Loop with Exponential Damping
    let frameId = 0;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      targetRotationY += autoRotateSpeed * (dt * 60);

      // Smooth exponential damping
      const dampingFactor = 1 - Math.exp(-8 * dt);
      currentRotationY += (targetRotationY - currentRotationY) * dampingFactor;
      clocheGroup.rotation.y = currentRotationY;

      // Subtle breathing float on cloche
      clocheGroup.position.y = Math.sin(time * 0.002) * 0.04;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      // Dispose Three.js resources
      platterGeo.dispose();
      platterMat.dispose();
      domeGeo.dispose();
      domeMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      collarGeo.dispose();
      jewelGeo.dispose();
      jewelMat.dispose();
      topRingGeo.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();

      renderer.dispose();
      if (domElem.parentElement === container) {
        container.removeChild(domElem);
      }
    };
  }, [isRtl]);

  return (
    <div
      ref={mountRef}
      className={`relative cursor-grab active:cursor-grabbing touch-none select-none ${className}`}
      title={isRtl ? 'اسحب لتدوير الختم الملوكي ثلاثي الأبعاد' : 'Drag to rotate 3D Royal Emblem'}
    />
  );
};
