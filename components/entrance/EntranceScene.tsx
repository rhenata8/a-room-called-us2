"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Stage =
  | "idle"
  | "knocking"
  | "opening"
  | "pin"
  | "entering";

type EntranceSceneProps = {
  stage: Stage;
  onStageChange: (stage: Stage) => void;
};

const SHAKE_DURATION = 1200;
const OPEN_DELAY = 1380;
const OPEN_DURATION = 1550;

export default function EntranceScene({
  stage,
  onStageChange,
}: EntranceSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Stage>(stage);
  const onStageChangeRef = useRef(onStageChange);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    onStageChangeRef.current = onStageChange;
  }, [onStageChange]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frameId = 0;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      33,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );

    const cameraRest = new THREE.Vector3(0, 2.72, 10.2);
    const cameraEntering = new THREE.Vector3(0, 2.56, 8.7);
    const cameraLookAt = new THREE.Vector3(0, 2.08, 0);

    camera.position.copy(cameraRest);
    camera.lookAt(cameraLookAt);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.appendChild(renderer.domElement);

    // =========================================
    // LIGHTING
    // =========================================

    const hemisphereLight = new THREE.HemisphereLight(
      0xfff5f8,
      0x8b6677,
      1.6
    );
    scene.add(hemisphereLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(-4.5, 7.5, 6.4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -5.5;
    keyLight.shadow.camera.right = 5.5;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -1.2;
    keyLight.shadow.bias = -0.00012;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffd9ea, 1.1);
    fillLight.position.set(4.6, 4.2, 4.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffeff6, 1.05);
    rimLight.position.set(0, 5.3, -4.5);
    scene.add(rimLight);

    const backGlowLight = new THREE.PointLight(
      0xffedc4,
      0,
      10,
      2
    );
    backGlowLight.position.set(0, 2.18, -1.05);
    scene.add(backGlowLight);

    // =========================================
    // MATERIALS
    // =========================================

    const frameMaterial = new THREE.MeshPhysicalMaterial({
      color: "#e39abf",
      roughness: 0.34,
      metalness: 0.06,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
    });

    const frameLightMaterial = new THREE.MeshStandardMaterial({
      color: "#ffdceb",
      roughness: 0.34,
      metalness: 0.04,
    });

    const trimMaterial = new THREE.MeshPhysicalMaterial({
      color: "#d676a5",
      roughness: 0.32,
      metalness: 0.08,
      clearcoat: 0.18,
      clearcoatRoughness: 0.44,
    });

    const doorMaterial = new THREE.MeshPhysicalMaterial({
      color: "#f3b5cf",
      roughness: 0.42,
      metalness: 0.03,
      clearcoat: 0.22,
      clearcoatRoughness: 0.42,
    });

    const panelMaterial = new THREE.MeshPhysicalMaterial({
      color: "#f8cde0",
      roughness: 0.42,
      metalness: 0.02,
      clearcoat: 0.1,
    });

    const panelHighlightMaterial = new THREE.MeshStandardMaterial({
      color: "#ffe5ef",
      roughness: 0.36,
      metalness: 0.02,
    });

    const goldMaterial = new THREE.MeshStandardMaterial({
      color: "#c89643",
      roughness: 0.22,
      metalness: 0.84,
    });

    const goldLightMaterial = new THREE.MeshStandardMaterial({
      color: "#f5dda0",
      roughness: 0.18,
      metalness: 0.8,
    });

    const darkRoomMaterial = new THREE.MeshStandardMaterial({
      color: "#6b4759",
      roughness: 0.95,
      metalness: 0,
    });

    // =========================================
    // HELPERS
    // =========================================

    function addBox(
      parent: THREE.Object3D,
      width: number,
      height: number,
      depth: number,
      material: THREE.Material,
      x: number,
      y: number,
      z: number
    ) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        material
      );

      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);

      return mesh;
    }

    function addSphere(
      parent: THREE.Object3D,
      radius: number,
      material: THREE.Material,
      x: number,
      y: number,
      z: number
    ) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 24, 20),
        material
      );

      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);

      return mesh;
    }

    function addTube(
      parent: THREE.Object3D,
      points: THREE.Vector3[],
      radius: number,
      material: THREE.Material,
      segments = 48
    ) {
      const curve = new THREE.CatmullRomCurve3(
        points,
        false,
        "centripetal"
      );

      const geometry = new THREE.TubeGeometry(
        curve,
        segments,
        radius,
        10,
        false
      );

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);

      return mesh;
    }

    function addArchTube(
      parent: THREE.Object3D,
      radius: number,
      centerY: number,
      z: number,
      tubeRadius: number,
      material: THREE.Material
    ) {
      const points: THREE.Vector3[] = [];

      for (let i = 0; i <= 54; i += 1) {
        const angle = Math.PI - (Math.PI * i) / 54;

        points.push(
          new THREE.Vector3(
            Math.cos(angle) * radius,
            centerY + Math.sin(angle) * radius,
            z
          )
        );
      }

      return addTube(parent, points, tubeRadius, material, 72);
    }

    function createArchShape(
      width: number,
      height: number,
      straightHeight: number
    ) {
      const shape = new THREE.Shape();

      shape.moveTo(-width / 2, 0);
      shape.lineTo(-width / 2, straightHeight);

      shape.quadraticCurveTo(-width / 2, height, 0, height);
      shape.quadraticCurveTo(width / 2, height, width / 2, straightHeight);

      shape.lineTo(width / 2, 0);
      shape.closePath();

      return shape;
    }

    function createHalfDoorShape(
      width: number,
      height: number,
      straightHeight: number
    ) {
      const shape = new THREE.Shape();

      shape.moveTo(0, 0);
      shape.lineTo(0, straightHeight);
      shape.quadraticCurveTo(0, height, width, height);
      shape.lineTo(width, 0);
      shape.closePath();

      return shape;
    }

    function addRectPanel(
      parent: THREE.Object3D,
      centerX: number,
      centerY: number,
      width: number,
      height: number,
      z: number
    ) {
      const outerDepth = 0.05;
      const rail = 0.07;

      addBox(parent, width, rail, outerDepth, trimMaterial, centerX, centerY + height / 2 - rail / 2, z);
      addBox(parent, width, rail, outerDepth, trimMaterial, centerX, centerY - height / 2 + rail / 2, z);
      addBox(parent, rail, height, outerDepth, trimMaterial, centerX - width / 2 + rail / 2, centerY, z);
      addBox(parent, rail, height, outerDepth, trimMaterial, centerX + width / 2 - rail / 2, centerY, z);

      addBox(
        parent,
        width - 0.14,
        height - 0.14,
        0.024,
        panelMaterial,
        centerX,
        centerY,
        z + 0.035
      );

      addBox(
        parent,
        width - 0.2,
        height - 0.2,
        0.012,
        panelHighlightMaterial,
        centerX,
        centerY,
        z + 0.05
      );
    }

    function addTopArchPanel(
      parent: THREE.Object3D,
      xOffset: number,
      width: number
    ) {
      const outerShape = new THREE.Shape();

      outerShape.moveTo(xOffset, 2.58);
      outerShape.lineTo(xOffset, 2.83);
      outerShape.quadraticCurveTo(xOffset, 3.43, xOffset + width, 3.43);
      outerShape.lineTo(xOffset + width, 2.58);
      outerShape.closePath();

      const outerGeometry = new THREE.ExtrudeGeometry(outerShape, {
        depth: 0.045,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.012,
        bevelThickness: 0.01,
      });

      const outerMesh = new THREE.Mesh(outerGeometry, trimMaterial);
      outerMesh.position.z = 0.19;
      outerMesh.castShadow = true;
      outerMesh.receiveShadow = true;
      parent.add(outerMesh);

      const innerShape = new THREE.Shape();

      innerShape.moveTo(xOffset + 0.06, 2.64);
      innerShape.lineTo(xOffset + 0.06, 2.88);
      innerShape.quadraticCurveTo(
        xOffset + 0.06,
        3.33,
        xOffset + width - 0.06,
        3.33
      );
      innerShape.lineTo(xOffset + width - 0.06, 2.64);
      innerShape.closePath();

      const innerGeometry = new THREE.ExtrudeGeometry(innerShape, {
        depth: 0.025,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.008,
        bevelThickness: 0.008,
      });

      const innerMesh = new THREE.Mesh(innerGeometry, panelMaterial);
      innerMesh.position.z = 0.225;
      innerMesh.castShadow = true;
      innerMesh.receiveShadow = true;
      parent.add(innerMesh);
    }

    function addCapitalOrnament(
      parent: THREE.Object3D,
      x: number,
      y: number,
      mirror = false
    ) {
      const ornament = new THREE.Group();

      addBox(ornament, 0.18, 0.08, 0.08, goldMaterial, 0, 0, 0.02);
      addSphere(ornament, 0.038, goldLightMaterial, 0, 0.04, 0.08);
      addSphere(ornament, 0.032, goldMaterial, 0.055, 0, 0.05);
      addSphere(ornament, 0.032, goldMaterial, -0.055, 0, 0.05);

      const leftCurl = [
        new THREE.Vector3(0, 0.02, 0.06),
        new THREE.Vector3(-0.045, 0.06, 0.06),
        new THREE.Vector3(-0.08, 0.01, 0.06),
        new THREE.Vector3(-0.04, -0.045, 0.06),
      ];

      const rightCurl = [
        new THREE.Vector3(0, 0.02, 0.06),
        new THREE.Vector3(0.045, 0.06, 0.06),
        new THREE.Vector3(0.08, 0.01, 0.06),
        new THREE.Vector3(0.04, -0.045, 0.06),
      ];

      addTube(ornament, leftCurl, 0.012, goldMaterial, 24);
      addTube(ornament, rightCurl, 0.012, goldMaterial, 24);

      ornament.position.set(x, y, 0.24);
      ornament.scale.x = mirror ? -1 : 1;
      parent.add(ornament);
    }

    function addMainCrown(parent: THREE.Object3D) {
      const crown = new THREE.Group();

      addBox(crown, 0.56, 0.07, 0.13, trimMaterial, 0, 4.37, 0.1);
      addSphere(crown, 0.09, goldMaterial, 0, 4.5, 0.19);
      addSphere(crown, 0.055, goldLightMaterial, 0, 4.5, 0.25);
      addSphere(crown, 0.055, goldMaterial, -0.19, 4.49, 0.16);
      addSphere(crown, 0.055, goldMaterial, 0.19, 4.49, 0.16);

      const leftCurl = [
        new THREE.Vector3(-0.14, 4.46, 0.16),
        new THREE.Vector3(-0.24, 4.62, 0.16),
        new THREE.Vector3(-0.34, 4.6, 0.16),
        new THREE.Vector3(-0.3, 4.44, 0.16),
        new THREE.Vector3(-0.18, 4.37, 0.16),
      ];

      const rightCurl = leftCurl.map(
        (point) => new THREE.Vector3(-point.x, point.y, point.z)
      );

      addTube(crown, leftCurl, 0.017, goldMaterial, 28);
      addTube(crown, rightCurl, 0.017, goldMaterial, 28);

      parent.add(crown);
    }

    function createHandle(parent: THREE.Object3D, x: number, y: number) {
      addBox(parent, 0.11, 0.66, 0.04, goldMaterial, x, y, 0.28);

      const handleBar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.023, 0.023, 0.44, 18),
        goldLightMaterial
      );

      handleBar.position.set(x, y, 0.36);
      handleBar.castShadow = true;
      handleBar.receiveShadow = true;
      parent.add(handleBar);

      addSphere(parent, 0.03, goldMaterial, x, y + 0.21, 0.36);
      addSphere(parent, 0.03, goldMaterial, x, y - 0.21, 0.36);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.072, 0.012, 12, 24),
        goldLightMaterial
      );

      ring.position.set(x, y - 0.02, 0.385);
      ring.castShadow = true;
      ring.receiveShadow = true;
      parent.add(ring);
    }

    function createLeafVisual() {
      const group = new THREE.Group();

      const leafWidth = 1.35;
      const leafHeight = 3.82;
      const leafStraightHeight = 2.58;

      const bodyShape = createHalfDoorShape(
        leafWidth,
        leafHeight,
        leafStraightHeight
      );

      const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, {
        depth: 0.165,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.022,
        bevelThickness: 0.022,
      });

      const bodyMesh = new THREE.Mesh(bodyGeometry, doorMaterial);
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      group.add(bodyMesh);

      // softer outer trims
      addBox(group, 0.058, 2.6, 0.04, trimMaterial, 0.07, 1.34, 0.18);
      addBox(group, 0.058, 2.9, 0.04, trimMaterial, leafWidth - 0.05, 1.49, 0.18);
      addBox(group, leafWidth - 0.14, 0.06, 0.045, trimMaterial, leafWidth / 2, 0.09, 0.18);

      // top curved panel
      addTopArchPanel(group, 0.17, 0.84);

      // middle tall panel
      addRectPanel(group, leafWidth / 2, 1.82, 0.82, 1.06, 0.19);

      // lower panel
      addRectPanel(group, leafWidth / 2, 0.66, 0.82, 0.78, 0.19);

      // subtle highlight line near center stile
      addBox(group, 0.018, 2.7, 0.018, frameLightMaterial, leafWidth - 0.11, 1.48, 0.215);

      // decorative small gold dot near the arch shoulder
      addSphere(group, 0.028, goldLightMaterial, 0.18, 2.93, 0.22);

      // hinges
      [0.6, 1.94, 3.12].forEach((hingeY) => {
        const hinge = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.03, 0.2, 16),
          goldMaterial
        );

        hinge.position.set(0.05, hingeY, 0.13);
        hinge.castShadow = true;
        hinge.receiveShadow = true;
        group.add(hinge);
      });

      return group;
    }

    // =========================================
    // MAIN DOOR RIG
    // =========================================

    const doorRig = new THREE.Group();
    scene.add(doorRig);

    // inner opening
    const openingShape = createArchShape(2.78, 3.92, 2.6);
    const openingGeometry = new THREE.ExtrudeGeometry(openingShape, {
      depth: 0.05,
      bevelEnabled: false,
    });

    const openingMesh = new THREE.Mesh(
      openingGeometry,
      darkRoomMaterial
    );

    openingMesh.position.z = -0.22;
    openingMesh.receiveShadow = true;
    doorRig.add(openingMesh);

    // side posts
    addBox(doorRig, 0.28, 2.78, 0.34, frameMaterial, -1.58, 1.39, 0.02);
    addBox(doorRig, 0.28, 2.78, 0.34, frameMaterial, 1.58, 1.39, 0.02);

    // post trims
    [-1.68, -1.57, 1.57, 1.68].forEach((x) => {
      addBox(doorRig, 0.03, 2.56, 0.03, frameLightMaterial, x, 1.39, 0.21);
    });

    // outer arch
    addArchTube(doorRig, 1.71, 2.71, 0.04, 0.14, frameMaterial);
    addArchTube(doorRig, 1.55, 2.71, 0.11, 0.043, frameLightMaterial);
    addArchTube(doorRig, 1.45, 2.71, 0.12, 0.022, trimMaterial);
    addArchTube(doorRig, 1.83, 2.71, -0.02, 0.02, frameLightMaterial);

    // capitals / shoulder blocks
    [-1.58, 1.58].forEach((x) => {
      addBox(doorRig, 0.39, 0.14, 0.42, trimMaterial, x, 2.71, 0.03);
      addBox(doorRig, 0.34, 0.055, 0.44, frameLightMaterial, x, 2.82, 0.05);
    });

    // capital ornaments closer to reference
    addCapitalOrnament(doorRig, -1.42, 2.62, false);
    addCapitalOrnament(doorRig, 1.42, 2.62, true);

    // threshold
    addBox(doorRig, 3.56, 0.15, 0.42, trimMaterial, 0, 0.02, 0.02);
    addBox(doorRig, 3.42, 0.055, 0.46, frameLightMaterial, 0, 0.105, 0.04);

    // side gold dots
    [-1.59, 1.59].forEach((x) => {
      addSphere(doorRig, 0.065, goldMaterial, x, 2.58, 0.24);
    });

    // main crown
    addMainCrown(doorRig);

    // door leaves
    const leafWidth = 1.35;

    const leftPivot = new THREE.Group();
    leftPivot.position.set(-leafWidth, 0.11, 0.1);
    doorRig.add(leftPivot);

    const rightPivot = new THREE.Group();
    rightPivot.position.set(leafWidth, 0.11, 0.1);
    doorRig.add(rightPivot);

    const leftLeaf = createLeafVisual();
    leftPivot.add(leftLeaf);

    // Attach the handle to the moving door leaf, close to its center edge.
    // It now rotates together with the left door instead of staying in the doorway.
    createHandle(leftLeaf, 1.22, 1.78);

    const rightLeaf = createLeafVisual();
    rightLeaf.scale.x = -1;
    rightPivot.add(rightLeaf);

    // The right handle is also part of its own leaf.
    createHandle(rightLeaf, 1.22, 1.78);

    // =========================================
    // FLOATING PARTICLES
    // =========================================

    const particleCount = 96;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const baseParticlePositions = new Float32Array(particleCount * 3);
    const particleSeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3;

      const x = THREE.MathUtils.randFloatSpread(6.8);
      const y = THREE.MathUtils.randFloat(0.3, 4.85);
      const z = THREE.MathUtils.randFloat(-0.35, 1.1);

      particlePositions[i3] = x;
      particlePositions[i3 + 1] = y;
      particlePositions[i3 + 2] = z;

      baseParticlePositions[i3] = x;
      baseParticlePositions[i3 + 1] = y;
      baseParticlePositions[i3 + 2] = z;

      particleSeeds[i] = Math.random() * Math.PI * 2;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: "#fff7fb",
      size: 0.045,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particles.position.z = 0.14;
    scene.add(particles);

    // Wall shadow receiver: catches the door frame's soft cast shadow so
    // the arch reads as mounted to the wall instead of floating in front of it.
    const wallShadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 8),
      new THREE.ShadowMaterial({
        color: 0x7c5468,
        opacity: 0.11,
      })
    );

    wallShadowPlane.position.set(0, 2.45, -0.62);
    wallShadowPlane.receiveShadow = true;
    scene.add(wallShadowPlane);

    // Floor shadow receiver beneath the threshold.
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 10),
      new THREE.ShadowMaterial({
        color: 0x7c5468,
        opacity: 0.17,
      })
    );

    shadowPlane.rotation.x = -Math.PI / 2;
    // Extend the floor receiver toward the camera for a clear contact shadow.
    shadowPlane.position.set(0, -0.035, 0.05);
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // =========================================
    // INTERACTION
    // =========================================

    let interactionStarted = false;
    let interactionStartTime = 0;
    let openingTriggered = false;
    let pinTriggered = false;

    function playKnockSound() {
      try {
        const audio = new window.AudioContext();
        const start = audio.currentTime;

        [0, 0.22].forEach((delay) => {
          const oscillator = audio.createOscillator();
          const gain = audio.createGain();

          const time = start + delay;

          oscillator.type = "triangle";
          oscillator.frequency.setValueAtTime(125, time);
          oscillator.frequency.exponentialRampToValueAtTime(55, time + 0.14);

          gain.gain.setValueAtTime(0.0001, time);
          gain.gain.exponentialRampToValueAtTime(0.2, time + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);

          oscillator.connect(gain);
          gain.connect(audio.destination);

          oscillator.start(time);
          oscillator.stop(time + 0.2);
        });

        window.setTimeout(() => {
          void audio.close();
        }, 900);
      } catch {
        // optional
      }
    }

    function startKnockSequence() {
      if (interactionStarted) return;
      if (stageRef.current !== "idle") return;

      interactionStarted = true;
      interactionStartTime = performance.now();
      openingTriggered = false;
      pinTriggered = false;

      onStageChangeRef.current("knocking");
      playKnockSound();

      try {
        if (navigator.vibrate) {
          navigator.vibrate([70, 45, 70, 45, 45]);
        }
      } catch {
        // optional
      }
    }

    const handlePointerDown = () => {
      startKnockSequence();
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);

    // =========================================
    // RESIZE
    // =========================================

    const handleResize = () => {
      if (!mount) return;

      const width = mount.clientWidth;
      const height = mount.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    };

    window.addEventListener("resize", handleResize);

    // =========================================
    // ANIMATION LOOP
    // =========================================

    const clock = new THREE.Clock();

    const animate = () => {
      if (disposed) return;

      frameId = window.requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      const targetCamera =
        stageRef.current === "entering" ? cameraEntering : cameraRest;

      camera.position.lerp(
        targetCamera,
        stageRef.current === "entering" ? 0.042 : 0.035
      );
      camera.lookAt(cameraLookAt);

      const positions = particleGeometry.attributes.position
        .array as Float32Array;

      for (let i = 0; i < particleCount; i += 1) {
        const i3 = i * 3;
        const seed = particleSeeds[i];

        positions[i3] =
          baseParticlePositions[i3] +
          Math.sin(elapsed * 0.42 + seed) * 0.05;

        positions[i3 + 1] =
          baseParticlePositions[i3 + 1] +
          Math.cos(elapsed * 0.5 + seed * 1.4) * 0.07;

        positions[i3 + 2] =
          baseParticlePositions[i3 + 2] +
          Math.sin(elapsed * 0.34 + seed * 0.7) * 0.03;
      }

      particleGeometry.attributes.position.needsUpdate = true;
      particles.rotation.z = Math.sin(elapsed * 0.07) * 0.025;

      if (interactionStarted) {
        const actionElapsed = performance.now() - interactionStartTime;

        if (actionElapsed <= SHAKE_DURATION) {
          const shakeProgress = actionElapsed / SHAKE_DURATION;
          const envelope = 1 - shakeProgress * 0.55;

          doorRig.rotation.z =
            Math.sin(actionElapsed * 0.08) * 0.05 * envelope;

          doorRig.position.x =
            Math.sin(actionElapsed * 0.115) * 0.026 * envelope;

          doorRig.position.y =
            Math.sin(elapsed * 1.1) * 0.01 +
            Math.sin(actionElapsed * 0.06) * 0.01 * envelope;
        } else {
          doorRig.rotation.z = THREE.MathUtils.lerp(
            doorRig.rotation.z,
            0,
            0.12
          );

          doorRig.position.x = THREE.MathUtils.lerp(
            doorRig.position.x,
            0,
            0.12
          );

          doorRig.position.y = THREE.MathUtils.lerp(
            doorRig.position.y,
            0,
            0.08
          );
        }

        if (actionElapsed >= OPEN_DELAY && !openingTriggered) {
          openingTriggered = true;
          onStageChangeRef.current("opening");
        }

        if (actionElapsed >= OPEN_DELAY) {
          const progress = THREE.MathUtils.clamp(
            (actionElapsed - OPEN_DELAY) / OPEN_DURATION,
            0,
            1
          );

          const eased = 1 - Math.pow(1 - progress, 3);

          leftPivot.rotation.y = -eased * 1.82;
          rightPivot.rotation.y = eased * 1.82;

          const glowTarget =
            stageRef.current === "entering"
              ? 2.8
              : 1.95 * eased;

          backGlowLight.intensity = THREE.MathUtils.lerp(
            backGlowLight.intensity,
            glowTarget,
            0.05
          );

          if (progress >= 1 && !pinTriggered) {
            pinTriggered = true;
            onStageChangeRef.current("pin");
          }
        }
      } else {
        backGlowLight.intensity = THREE.MathUtils.lerp(
          backGlowLight.intensity,
          0,
          0.08
        );
      }

      if (stageRef.current === "entering") {
        backGlowLight.intensity = THREE.MathUtils.lerp(
          backGlowLight.intensity,
          2.8,
          0.05
        );
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      disposed = true;

      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);

      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();

      scene.traverse((object) => {
        const anyObject = object as THREE.Object3D & {
          geometry?: THREE.BufferGeometry;
          material?: THREE.Material | THREE.Material[];
        };

        if (anyObject.geometry) {
          geometries.add(anyObject.geometry);
        }

        if (Array.isArray(anyObject.material)) {
          anyObject.material.forEach((material) => materials.add(material));
        } else if (anyObject.material) {
          materials.add(anyObject.material);
        }
      });

      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());

      renderer.dispose();

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="three-door-canvas"
      aria-label="Interactive three dimensional pink double door"
    />
  );
}