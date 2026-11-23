
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

type LivingRoomSceneProps = {
  onReady?: () => void;
};

function createCanvasTexture(
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
  width = 1024,
  height = 1024
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas 2D context is not available.");
  }

  draw(ctx, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  return texture;
}

function createWoodTexture() {
  const texture = createCanvasTexture((ctx, width, height) => {
    ctx.fillStyle = "#d69e74";
    ctx.fillRect(0, 0, width, height);

    const plankCount = 10;
    const plankWidth = width / plankCount;

    const colors = [
      "#e6b083",
      "#cf936d",
      "#dca67f",
      "#e5b68d",
      "#c98663",
    ];

    for (let i = 0; i < plankCount; i++) {
      const x = i * plankWidth;

      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(x, 0, plankWidth, height);

      ctx.strokeStyle = "rgba(115, 67, 46, 0.18)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + plankWidth - 1, 0);
      ctx.lineTo(x + plankWidth - 1, height);
      ctx.stroke();

      for (let g = 0; g < 8; g++) {
        const y = 30 + g * 115 + (i % 2) * 12;

        ctx.strokeStyle = "rgba(255, 229, 205, 0.16)";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(x + 12, y);

        ctx.bezierCurveTo(
          x + plankWidth * 0.3,
          y - 5,
          x + plankWidth * 0.65,
          y + 8,
          x + plankWidth - 10,
          y
        );

        ctx.stroke();
      }
    }
  }, 1024, 1024);

  texture.repeat.set(3.5, 3.5);
  return texture;
}

function createRugTexture() {
  return createCanvasTexture((ctx, width, height) => {
    ctx.fillStyle = "#fff2c7";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#ff8eb6";
    ctx.lineWidth = 18;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.strokeStyle = "#9ce3bf";
    ctx.lineWidth = 9;
    ctx.strokeRect(62, 62, width - 124, height - 124);

    ctx.fillStyle = "#ffbfd8";
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2, 220, 145, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#c8b4ff";
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2, 110, 72, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffae63";
    ctx.lineWidth = 7;

    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate((Math.PI / 2) * i);

      ctx.beginPath();
      ctx.moveTo(-42, -220);
      ctx.quadraticCurveTo(-135, -160, -38, -105);
      ctx.stroke();

      ctx.restore();
    }
  }, 1024, 768);
}

function createArtworkTexture(variant: number) {
  const backgrounds = ["#fff4d9", "#ffeaf4", "#eafff6"];
  const lineColors = ["#63b989", "#f17f99", "#b393ff"];

  return createCanvasTexture((ctx, width, height) => {
    ctx.fillStyle = backgrounds[variant % backgrounds.length];
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(190, 112, 145, 0.28)";
    ctx.lineWidth = 6;
    ctx.strokeRect(28, 28, width - 56, height - 56);

    const drawFlower = (x: number, y: number, color: string) => {
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, -22, 14, 28, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      ctx.fillStyle = "#ffd25a";
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    };

    ctx.strokeStyle = lineColors[variant % lineColors.length];
    ctx.lineWidth = 8;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(180, 700);
    ctx.bezierCurveTo(220, 560, 300, 420, 320, 160);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(450, 700);
    ctx.bezierCurveTo(430, 560, 400, 430, 470, 220);
    ctx.stroke();

    drawFlower(320, 160, "#ff96b2");
    drawFlower(470, 220, "#ffbf73");
    drawFlower(230, 340, "#9edfb8");
    drawFlower(400, 430, "#c8b0ff");

    ctx.fillStyle = "rgba(125, 89, 96, 0.82)";
    ctx.font = "italic 30px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("little joy", width / 2, height - 55);
  }, 640, 820);
}

export default function LivingRoomScene({
  onReady,
}: LivingRoomSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frameId = 0;

    const scene = new THREE.Scene();

    scene.background = new THREE.Color("#ffd7e7");
    scene.fog = new THREE.Fog("#ffd7e7", 16, 34);

    const camera = new THREE.PerspectiveCamera(
      48,
      mount.clientWidth / Math.max(mount.clientHeight, 1),
      0.1,
      100
    );

    camera.position.set(0, 2.8, 7.3);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.8)
    );

    renderer.setSize(mount.clientWidth, mount.clientHeight);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    renderer.shadowMap.enabled = true;

    // Updated: PCFSoftShadowMap is no longer supported.
    renderer.shadowMap.type = THREE.PCFShadowMap;

    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    mount.appendChild(renderer.domElement);

    /* =========================================
       ORBIT CONTROLS — 360 DEGREE VIEW
    ========================================= */

    const controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.06;

    controls.enablePan = false;

    controls.minDistance = 5.6;
    controls.maxDistance = 9.6;

    controls.minPolarAngle = 0.65;
    controls.maxPolarAngle = 1.48;

    controls.target.set(0, 1.9, 0);
    controls.update();

    /* =========================================
       LIGHTS
    ========================================= */

    const hemisphere = new THREE.HemisphereLight(
      0xfff3fb,
      0xffd59f,
      1.9
    );

    scene.add(hemisphere);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(
      0xfff3dc,
      2.35
    );

    keyLight.position.set(-5, 8, 6);
    keyLight.castShadow = true;

    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.left = -12;
    keyLight.shadow.camera.right = 12;
    keyLight.shadow.camera.top = 12;
    keyLight.shadow.camera.bottom = -8;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 40;
    keyLight.shadow.bias = -0.00018;
    keyLight.shadow.normalBias = 0.02;

    scene.add(keyLight);

    const pinkFill = new THREE.DirectionalLight(
      0xff9cc8,
      0.85
    );

    pinkFill.position.set(6, 4, -2);
    scene.add(pinkFill);

    const mintFill = new THREE.DirectionalLight(
      0xb8ffe2,
      0.45
    );

    mintFill.position.set(-4, 5, -6);
    scene.add(mintFill);

    /* =========================================
       TEXTURES
    ========================================= */

    const woodTexture = createWoodTexture();
    const rugTexture = createRugTexture();

    const artTextures = [
      createArtworkTexture(0),
      createArtworkTexture(1),
      createArtworkTexture(2),
    ];

    /* =========================================
       MATERIALS
    ========================================= */

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: "#ffb6d2",
      roughness: 0.95,
      side: THREE.DoubleSide,
    });

    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: "#fff4f8",
      roughness: 0.96,
      side: THREE.DoubleSide,
    });

    const trimMaterial = new THREE.MeshStandardMaterial({
      color: "#fff2b8",
      roughness: 0.76,
    });

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: woodTexture,
      roughness: 0.88,
    });

    const creamMaterial = new THREE.MeshStandardMaterial({
      color: "#fff7ef",
      roughness: 0.85,
    });

    const walnutMaterial = new THREE.MeshStandardMaterial({
      color: "#8f5f46",
      roughness: 0.54,
    });

    const walnutLightMaterial = new THREE.MeshStandardMaterial({
      color: "#b98567",
      roughness: 0.58,
    });

    const brassMaterial = new THREE.MeshStandardMaterial({
      color: "#f2b94b",
      metalness: 0.72,
      roughness: 0.28,
    });

    const pinkMaterial = new THREE.MeshPhysicalMaterial({
      color: "#ff8db8",
      roughness: 0.7,
      sheen: 0.6,
      sheenColor: "#ffe2ef",
      sheenRoughness: 0.8,
    });

    const pinkDeepMaterial = new THREE.MeshPhysicalMaterial({
      color: "#f05f97",
      roughness: 0.64,
      sheen: 0.5,
      sheenColor: "#ffc6da",
    });

    const pinkLightMaterial = new THREE.MeshPhysicalMaterial({
      color: "#ffd4e7",
      roughness: 0.76,
      sheen: 0.48,
      sheenColor: "#fff1f7",
    });

    const mintMaterial = new THREE.MeshStandardMaterial({
      color: "#8fe3b7",
      roughness: 0.82,
    });

    const mintDarkMaterial = new THREE.MeshStandardMaterial({
      color: "#4faa7a",
      roughness: 0.88,
    });

    const lavenderMaterial = new THREE.MeshStandardMaterial({
      color: "#c7b4ff",
      roughness: 0.84,
    });

    const coralMaterial = new THREE.MeshStandardMaterial({
      color: "#ff9869",
      roughness: 0.82,
    });

    const butterMaterial = new THREE.MeshStandardMaterial({
      color: "#ffe37c",
      roughness: 0.85,
    });

    const aquaMaterial = new THREE.MeshStandardMaterial({
      color: "#8edff4",
      roughness: 0.82,
    });

    const leafMaterial = new THREE.MeshStandardMaterial({
      color: "#48a96d",
      roughness: 0.88,
    });

    const darkLeafMaterial = new THREE.MeshStandardMaterial({
      color: "#2f7f54",
      roughness: 0.9,
    });

    /* =========================================
       HELPERS
    ========================================= */

    function addRoundedBox(
      parent: THREE.Object3D,
      width: number,
      height: number,
      depth: number,
      radius: number,
      material: THREE.Material,
      x: number,
      y: number,
      z: number
    ) {
      const mesh = new THREE.Mesh(
        new RoundedBoxGeometry(
          width,
          height,
          depth,
          6,
          radius
        ),
        material
      );

      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      parent.add(mesh);

      return mesh;
    }

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

    function addCylinder(
      parent: THREE.Object3D,
      radiusTop: number,
      radiusBottom: number,
      height: number,
      material: THREE.Material,
      x: number,
      y: number,
      z: number,
      radialSegments = 24
    ) {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(
          radiusTop,
          radiusBottom,
          height,
          radialSegments
        ),
        material
      );

      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      parent.add(mesh);

      return mesh;
    }

    function addLathe(
      parent: THREE.Object3D,
      points: THREE.Vector2[],
      material: THREE.Material,
      x: number,
      y: number,
      z: number,
      segments = 32
    ) {
      const mesh = new THREE.Mesh(
        new THREE.LatheGeometry(points, segments),
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
      material: THREE.Material
    ) {
      const curve = new THREE.CatmullRomCurve3(points);

      const mesh = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 24, radius, 8, false),
        material
      );

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      parent.add(mesh);

      return mesh;
    }

    /* =========================================
       ROOM SHELL
    ========================================= */

    const room = new THREE.Group();
    scene.add(room);

    const roomWidth = 14;
    const roomDepth = 14;
    const roomHeight = 5.8;

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(roomWidth, roomDepth),
      floorMaterial
    );

    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;

    room.add(floor);

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(roomWidth, roomDepth),
      ceilingMaterial
    );

    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomHeight;

    room.add(ceiling);

    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(roomWidth, roomHeight),
      wallMaterial
    );

    backWall.position.set(
      0,
      roomHeight / 2,
      -roomDepth / 2
    );

    room.add(backWall);

    const frontWall = new THREE.Mesh(
      new THREE.PlaneGeometry(roomWidth, roomHeight),
      wallMaterial
    );

    frontWall.rotation.y = Math.PI;
    frontWall.position.set(
      0,
      roomHeight / 2,
      roomDepth / 2
    );

    room.add(frontWall);

    const leftWall = new THREE.Mesh(
      new THREE.PlaneGeometry(roomDepth, roomHeight),
      wallMaterial
    );

    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(
      -roomWidth / 2,
      roomHeight / 2,
      0
    );

    room.add(leftWall);

    const rightWall = new THREE.Mesh(
      new THREE.PlaneGeometry(roomDepth, roomHeight),
      wallMaterial
    );

    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(
      roomWidth / 2,
      roomHeight / 2,
      0
    );

    room.add(rightWall);

    // Baseboards

    const baseboardDepth = 0.14;

    addRoundedBox(
      room, roomWidth, 0.22, baseboardDepth,
      0.03, trimMaterial, 0, 0.11, -roomDepth / 2 + 0.06
    );

    addRoundedBox(
      room, roomWidth, 0.22, baseboardDepth,
      0.03, trimMaterial, 0, 0.11, roomDepth / 2 - 0.06
    );

    addRoundedBox(
      room, baseboardDepth, 0.22, roomDepth,
      0.03, trimMaterial, -roomWidth / 2 + 0.06, 0.11, 0
    );

    addRoundedBox(
      room, baseboardDepth, 0.22, roomDepth,
      0.03, trimMaterial, roomWidth / 2 - 0.06, 0.11, 0
    );

    // Crown molding

    addRoundedBox(
      room, roomWidth, 0.16, 0.16,
      0.03, creamMaterial, 0, roomHeight - 0.08, -roomDepth / 2 + 0.08
    );

    addRoundedBox(
      room, roomWidth, 0.16, 0.16,
      0.03, creamMaterial, 0, roomHeight - 0.08, roomDepth / 2 - 0.08
    );

    addRoundedBox(
      room, 0.16, 0.16, roomDepth,
      0.03, creamMaterial, -roomWidth / 2 + 0.08, roomHeight - 0.08, 0
    );

    addRoundedBox(
      room, 0.16, 0.16, roomDepth,
      0.03, creamMaterial, roomWidth / 2 - 0.08, roomHeight - 0.08, 0
    );

    const ceilingRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.86, 0.06, 18, 42),
      butterMaterial
    );

    ceilingRing.rotation.x = Math.PI / 2;
    ceilingRing.position.set(0, roomHeight - 0.04, 0);

    room.add(ceilingRing);

    /* =========================================
       WALL FRAMES
    ========================================= */

    function createWallFrame(
      x: number,
      y: number,
      z: number,
      texture: THREE.Texture
    ) {
      const frame = new THREE.Group();

      frame.position.set(x, y, z);

      addRoundedBox(
        frame, 1.48, 2.12, 0.14,
        0.06, walnutMaterial, 0, 0, 0
      );

      addRoundedBox(
        frame, 1.32, 1.96, 0.05,
        0.025, creamMaterial, 0, 0, 0.08
      );

      const art = new THREE.Mesh(
        new THREE.PlaneGeometry(1.16, 1.76),
        new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.95,
        })
      );

      art.position.z = 0.11;
      frame.add(art);

      room.add(frame);
    }

    createWallFrame(-1.9, 4.15, -6.92, artTextures[0]);
    createWallFrame(0, 4.15, -6.92, artTextures[1]);
    createWallFrame(1.9, 4.15, -6.92, artTextures[2]);

    /* =========================================
       SOFA
    ========================================= */

    const sofa = new THREE.Group();

    sofa.position.set(0, 0, -4.85);
    room.add(sofa);

    addRoundedBox(
      sofa, 5.7, 0.72, 1.58,
      0.25, pinkDeepMaterial, 0, 0.84, -0.18
    );

    addRoundedBox(
      sofa, 5.48, 1.74, 0.72,
      0.25, pinkMaterial, 0, 1.82, -0.83
    );

    const backCushionXs = [-1.7, 0, 1.7];

    backCushionXs.forEach((x, index) => {
      const material =
        index === 1 ? pinkLightMaterial : pinkMaterial;

      addRoundedBox(
        sofa, 1.68, 1.36, 0.42,
        0.18, material, x, 1.97, -0.42
      );

      [-0.42, 0, 0.42].forEach((offset) => {
        const tuft = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 14, 12),
          pinkDeepMaterial
        );

        tuft.position.set(x + offset, 2.02, -0.19);
        tuft.scale.set(1, 0.82, 0.58);

        sofa.add(tuft);
      });
    });

    backCushionXs.forEach((x, index) => {
      addRoundedBox(
        sofa, 1.72, 0.3, 1.18,
        0.12,
        index === 1 ? pinkLightMaterial : pinkMaterial,
        x, 1.2, 0.14
      );
    });

    [-1, 1].forEach((side) => {
      addRoundedBox(
        sofa, 0.82, 1.38, 1.52,
        0.29, pinkDeepMaterial, side * 2.5, 1.44, -0.1
      );

      addRoundedBox(
        sofa, 0.86, 0.34, 1.44,
        0.15, pinkMaterial, side * 2.5, 2.1, -0.1
      );
    });

    addRoundedBox(
      sofa, 4.7, 0.05, 0.04,
      0.01, pinkLightMaterial, 0, 0.9, 0.58
    );

    [-2.35, 2.35].forEach((x) => {
      [-0.72, 0.42].forEach((z) => {
        const leg = addCylinder(
          sofa, 0.075, 0.11, 0.42,
          walnutMaterial, x, 0.27, z
        );

        leg.rotation.z = x < 0 ? -0.08 : 0.08;
      });
    });

    const throwPillows = [
      { x: -1.95, y: 1.55, z: 0.3, material: mintMaterial, rot: -0.16 },
      { x: -0.9, y: 1.48, z: 0.36, material: butterMaterial, rot: 0.09 },
      { x: 1.05, y: 1.5, z: 0.34, material: lavenderMaterial, rot: -0.12 },
      { x: 2.0, y: 1.56, z: 0.28, material: aquaMaterial, rot: 0.16 },
    ];

    throwPillows.forEach((pillow) => {
      const mesh = addRoundedBox(
        sofa,
        0.78,
        0.78,
        0.28,
        0.13,
        pillow.material,
        pillow.x,
        pillow.y,
        pillow.z
      );

      mesh.rotation.z = pillow.rot;
      mesh.rotation.y = -0.1;
    });

    /* =========================================
       RUG & COFFEE TABLE
    ========================================= */

    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(7.9, 4.8),
      new THREE.MeshStandardMaterial({
        map: rugTexture,
        roughness: 0.98,
      })
    );

    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.03, -1.7);
    rug.receiveShadow = true;

    room.add(rug);

    const coffeeTable = new THREE.Group();

    coffeeTable.position.set(0, 0, -1.7);
    room.add(coffeeTable);

    addRoundedBox(
      coffeeTable, 3.25, 0.18, 1.34,
      0.11, walnutLightMaterial, 0, 0.8, 0
    );

    addRoundedBox(
      coffeeTable, 2.76, 0.08, 0.96,
      0.03, walnutMaterial, 0, 0.45, 0
    );

    [-1.28, 1.28].forEach((x) => {
      [-0.44, 0.44].forEach((z) => {
        addCylinder(
          coffeeTable, 0.055, 0.075, 0.72,
          walnutMaterial, x, 0.38, z
        );
      });
    });

    const bookColors = ["#ff96b2", "#ffd876", "#98e7c2"];

    bookColors.forEach((color, index) => {
      const book = addRoundedBox(
        coffeeTable,
        0.84 - index * 0.05,
        0.1,
        0.54,
        0.02,
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.9,
        }),
        -0.7,
        0.95 + index * 0.1,
        -0.12
      );

      book.rotation.y = -0.12 + index * 0.08;
    });

    addLathe(
      coffeeTable,
      [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.16, 0.02),
        new THREE.Vector2(0.23, 0.22),
        new THREE.Vector2(0.2, 0.43),
        new THREE.Vector2(0.1, 0.54),
        new THREE.Vector2(0.08, 0.68),
      ],
      coralMaterial,
      0.74,
      0.9,
      0.1
    );

    const flowerMaterials = [
      pinkMaterial,
      butterMaterial,
      lavenderMaterial,
    ];

    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5;

      const top = new THREE.Vector3(
        0.74 + Math.cos(angle) * 0.2,
        1.95 + (i % 2) * 0.15,
        0.1 + Math.sin(angle) * 0.16
      );

      addTube(
        coffeeTable,
        [
          new THREE.Vector3(0.74, 1.45, 0.1),
          new THREE.Vector3(
            0.74 + Math.cos(angle) * 0.08,
            1.68,
            0.1 + Math.sin(angle) * 0.05
          ),
          top,
        ],
        0.012,
        darkLeafMaterial
      );

      const bloom = new THREE.Group();
      bloom.position.copy(top);
      coffeeTable.add(bloom);

      for (let p = 0; p < 5; p++) {
        const petal = new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 12, 10),
          flowerMaterials[i % flowerMaterials.length]
        );

        const petalAngle = (Math.PI * 2 * p) / 5;

        petal.position.set(
          Math.cos(petalAngle) * 0.075,
          Math.sin(petalAngle) * 0.075,
          0
        );

        petal.scale.set(1, 0.7, 0.6);
        bloom.add(petal);
      }

      const center = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 12, 10),
        brassMaterial
      );

      bloom.add(center);
    }

    addCylinder(
      coffeeTable, 0.19, 0.19, 0.035,
      creamMaterial, -1.05, 0.9, 0.34, 32
    );

    addCylinder(
      coffeeTable, 0.12, 0.14, 0.22,
      creamMaterial, -1.05, 1.03, 0.34, 32
    );

    const cupHandle = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.024, 10, 24),
      creamMaterial
    );

    cupHandle.position.set(-0.88, 1.03, 0.34);
    coffeeTable.add(cupHandle);

    /* =========================================
       LEFT WALL — WINDOW & ARMCHAIR
    ========================================= */

    const windowGroup = new THREE.Group();

    windowGroup.position.set(-6.82, 0, -1.3);
    windowGroup.rotation.y = Math.PI / 2;

    room.add(windowGroup);

    addRoundedBox(
      windowGroup, 2.5, 3.5, 0.14,
      0.08, creamMaterial, 0, 3.85, 0
    );

    addRoundedBox(
      windowGroup, 2.28, 3.28, 0.05,
      0.04, butterMaterial, 0, 3.85, 0.05
    );

    const viewPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.02, 3.02),
      new THREE.MeshStandardMaterial({
        color: "#c7f8ff",
        roughness: 0.6,
      })
    );

    viewPlane.position.set(0, 3.85, 0.08);
    windowGroup.add(viewPlane);

    addRoundedBox(
      windowGroup, 0.08, 3.06, 0.05,
      0.02, creamMaterial, 0, 3.85, 0.1
    );

    addRoundedBox(
      windowGroup, 2.05, 0.08, 0.05,
      0.02, creamMaterial, 0, 3.85, 0.1
    );

    const curtainMaterial = new THREE.MeshStandardMaterial({
      color: "#fff4bc",
      roughness: 0.95,
    });

    const leftCurtain = addRoundedBox(
      windowGroup, 0.72, 3.72, 0.24,
      0.12, curtainMaterial, -1.42, 3.82, 0.22
    );

    const rightCurtain = addRoundedBox(
      windowGroup, 0.72, 3.72, 0.24,
      0.12, curtainMaterial, 1.42, 3.82, 0.22
    );

    leftCurtain.rotation.y = 0.12;
    rightCurtain.rotation.y = -0.12;

    const armchair = new THREE.Group();

    armchair.position.set(-4.15, 0, -0.9);
    armchair.rotation.y = 0.48;

    room.add(armchair);

    addRoundedBox(
      armchair, 1.8, 0.42, 1.42,
      0.18, mintMaterial, 0, 0.92, 0
    );

    addRoundedBox(
      armchair, 1.72, 1.44, 0.44,
      0.2, mintDarkMaterial, 0, 1.74, -0.48
    );

    addRoundedBox(
      armchair, 1.56, 0.28, 1.24,
      0.12, creamMaterial, 0, 1.18, 0.08
    );

    [-1, 1].forEach((side) => {
      addRoundedBox(
        armchair, 0.34, 0.92, 1.24,
        0.14, mintMaterial, side * 0.74, 1.31, 0.02
      );

      addRoundedBox(
        armchair, 0.36, 0.22, 1.14,
        0.1, creamMaterial, side * 0.74, 1.78, 0.02
      );
    });

    [-0.64, 0.64].forEach((x) => {
      [-0.48, 0.48].forEach((z) => {
        addCylinder(
          armchair, 0.045, 0.06, 0.62,
          walnutMaterial, x, 0.35, z
        );
      });
    });

    const armPillow = addRoundedBox(
      armchair, 0.72, 0.72, 0.2,
      0.14, coralMaterial, 0.35, 1.58, -0.12
    );

    armPillow.rotation.z = -0.16;

    /* =========================================
       RIGHT WALL — BOOKSHELF
    ========================================= */

    const bookshelf = new THREE.Group();

    bookshelf.position.set(5.75, 0, -1.25);
    bookshelf.rotation.y = -Math.PI / 2;

    room.add(bookshelf);

    const shelfWidth = 2.1;
    const shelfHeight = 4.75;
    const shelfDepth = 0.68;

    addRoundedBox(
      bookshelf, 0.18, shelfHeight, shelfDepth,
      0.04, walnutMaterial,
      -shelfWidth / 2 + 0.09, 2.45, 0
    );

    addRoundedBox(
      bookshelf, 0.18, shelfHeight, shelfDepth,
      0.04, walnutMaterial,
      shelfWidth / 2 - 0.09, 2.45, 0
    );

    addRoundedBox(
      bookshelf, shelfWidth, 0.16, shelfDepth,
      0.04, walnutLightMaterial, 0, 4.76, 0
    );

    addRoundedBox(
      bookshelf, shelfWidth, 0.18, shelfDepth,
      0.04, walnutLightMaterial, 0, 0.28, 0
    );

    [1.3, 2.35, 3.4].forEach((y) => {
      addRoundedBox(
        bookshelf, shelfWidth - 0.12, 0.12, shelfDepth - 0.04,
        0.02, walnutLightMaterial, 0, y, 0
      );
    });

    const shelfBookColors = [
      "#ff9fbe",
      "#a2ecbb",
      "#ffe06f",
      "#beafff",
      "#95dcff",
      "#ffb28c",
    ];

    const rows = [
      { y: 0.35, count: 7 },
      { y: 1.38, count: 6 },
      { y: 2.43, count: 7 },
      { y: 3.48, count: 6 },
    ];

    rows.forEach((row, rowIndex) => {
      let x = -0.78;

      for (let i = 0; i < row.count; i++) {
        const width = 0.15 + ((i + rowIndex) % 3) * 0.04;
        const height = 0.5 + ((i * 2 + rowIndex) % 4) * 0.1;

        const book = addRoundedBox(
          bookshelf,
          width,
          height,
          0.34,
          0.015,
          new THREE.MeshStandardMaterial({
            color: shelfBookColors[
              (i + rowIndex) % shelfBookColors.length
            ],
            roughness: 0.9,
          }),
          x + width / 2,
          row.y + height / 2,
          0.03
        );

        book.rotation.z = ((i % 2) - 0.5) * 0.04;
        x += width + 0.05;
      }
    });

    addLathe(
      bookshelf,
      [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.12, 0.02),
        new THREE.Vector2(0.19, 0.18),
        new THREE.Vector2(0.15, 0.38),
        new THREE.Vector2(0.08, 0.48),
        new THREE.Vector2(0.07, 0.55),
      ],
      aquaMaterial,
      0.58,
      4.82,
      0.02
    );

    /* =========================================
       FRONT WALL — CONSOLE & MIRROR
    ========================================= */

    const frontConsole = new THREE.Group();

    frontConsole.position.set(0, 0, 5.15);
    frontConsole.rotation.y = Math.PI;

    room.add(frontConsole);

    addRoundedBox(
      frontConsole, 3.5, 0.18, 0.82,
      0.08, walnutLightMaterial, 0, 1.15, 0
    );

    [-1.45, -0.48, 0.48, 1.45].forEach((x) => {
      addCylinder(
        frontConsole, 0.055, 0.075, 1.04,
        walnutMaterial, x, 0.58, 0
      );
    });

    const mirrorGroup = new THREE.Group();

    mirrorGroup.position.set(0, 3.4, -1.48);
    frontConsole.add(mirrorGroup);

    const mirrorFrame = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.11, 18, 40),
      butterMaterial
    );

    mirrorGroup.add(mirrorFrame);

    const mirror = new THREE.Mesh(
      new THREE.CircleGeometry(1.12, 40),
      new THREE.MeshPhysicalMaterial({
        color: "#ecf8ff",
        metalness: 0.15,
        roughness: 0.1,
        transmission: 0.16,
        transparent: true,
        opacity: 0.85,
      })
    );

    mirror.position.z = 0.02;
    mirrorGroup.add(mirror);

    addLathe(
      frontConsole,
      [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.13, 0.02),
        new THREE.Vector2(0.2, 0.2),
        new THREE.Vector2(0.15, 0.42),
        new THREE.Vector2(0.08, 0.5),
      ],
      coralMaterial,
      -0.95,
      1.24,
      -0.12
    );

    addLathe(
      frontConsole,
      [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.16, 0.03),
        new THREE.Vector2(0.24, 0.24),
        new THREE.Vector2(0.18, 0.5),
        new THREE.Vector2(0.08, 0.6),
      ],
      mintMaterial,
      1.05,
      1.23,
      0.04
    );

    /* =========================================
       WALL SCONCES
    ========================================= */

    function createSconce(
      x: number,
      z: number,
      rotationY: number
    ) {
      const group = new THREE.Group();

      group.position.set(x, 3.95, z);
      group.rotation.y = rotationY;

      room.add(group);

      const backplate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.17, 0.17, 0.06, 24),
        brassMaterial
      );

      backplate.rotation.x = Math.PI / 2;
      group.add(backplate);

      addCylinder(
        group, 0.03, 0.03, 0.38,
        brassMaterial, 0, -0.08, 0.14
      );

      addCylinder(
        group, 0.12, 0.18, 0.24,
        brassMaterial, 0, 0.2, 0.18
      );

      addLathe(
        group,
        [
          new THREE.Vector2(0.04, 0),
          new THREE.Vector2(0.16, 0.04),
          new THREE.Vector2(0.21, 0.17),
          new THREE.Vector2(0.12, 0.36),
          new THREE.Vector2(0.06, 0.4),
        ],
        creamMaterial,
        0,
        0.31,
        0.18
      );

      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 14),
        new THREE.MeshBasicMaterial({
          color: "#fff0b9",
        })
      );

      bulb.position.set(0, 0.58, 0.18);
      group.add(bulb);

      const light = new THREE.PointLight(
        0xffdc8f,
        0.9,
        4.8,
        2
      );

      light.position.set(0, 0.62, 0.42);
      group.add(light);
    }

    createSconce(-4.6, -6.82, 0);
    createSconce(4.6, -6.82, 0);
    createSconce(-4.8, 6.82, Math.PI);
    createSconce(4.8, 6.82, Math.PI);

    /* =========================================
       FLOOR LAMP
    ========================================= */

    const floorLamp = new THREE.Group();

    floorLamp.position.set(4.9, 0, -4.3);
    room.add(floorLamp);

    addCylinder(
      floorLamp, 0.36, 0.42, 0.12,
      brassMaterial, 0, 0.08, 0
    );

    addCylinder(
      floorLamp, 0.045, 0.045, 3.1,
      brassMaterial, 0, 1.65, 0
    );

    addLathe(
      floorLamp,
      [
        new THREE.Vector2(0.08, 0),
        new THREE.Vector2(0.28, 0.08),
        new THREE.Vector2(0.42, 0.62),
        new THREE.Vector2(0.36, 0.74),
        new THREE.Vector2(0.1, 0.82),
      ],
      butterMaterial,
      0,
      3.12,
      0
    );

    const lampLight = new THREE.PointLight(
      0xffd88d,
      1.2,
      5.8,
      2
    );

    lampLight.position.set(0, 3.58, 0.18);
    floorLamp.add(lampLight);

    /* =========================================
       PLANTS
    ========================================= */

    const swayingPlants: THREE.Group[] = [];

    function createPlant(
      x: number,
      z: number,
      scale: number,
      potMaterial: THREE.Material
    ) {
      const plant = new THREE.Group();

      plant.position.set(x, 0, z);
      plant.scale.setScalar(scale);

      room.add(plant);

      addLathe(
        plant,
        [
          new THREE.Vector2(0, 0),
          new THREE.Vector2(0.26, 0.02),
          new THREE.Vector2(0.36, 0.18),
          new THREE.Vector2(0.43, 0.76),
          new THREE.Vector2(0.32, 0.88),
          new THREE.Vector2(0, 0.88),
        ],
        potMaterial,
        0,
        0,
        0
      );

      addCylinder(
        plant,
        0.32,
        0.32,
        0.04,
        new THREE.MeshStandardMaterial({
          color: "#4f3b31",
        }),
        0,
        0.83,
        0
      );

      const foliage = new THREE.Group();

      foliage.position.y = 0.82;
      plant.add(foliage);

      swayingPlants.push(foliage);

      const leafGeometry = new THREE.SphereGeometry(
        1,
        18,
        14
      );

      const directions = [
        new THREE.Vector3(-0.9, 0.72, 0.12),
        new THREE.Vector3(-0.62, 1.12, 0.25),
        new THREE.Vector3(-0.12, 1.38, -0.08),
        new THREE.Vector3(0.42, 1.24, 0.2),
        new THREE.Vector3(0.88, 0.82, -0.04),
        new THREE.Vector3(0.2, 0.98, 0.48),
        new THREE.Vector3(-0.38, 0.92, -0.32),
      ];

      directions.forEach((dir, index) => {
        const direction = dir.clone().normalize();

        const start = new THREE.Vector3(
          0,
          0.08 + index * 0.025,
          0
        );

        const end = start
          .clone()
          .add(direction.clone().multiplyScalar(1.1));

        addTube(
          foliage,
          [
            start,
            start.clone().lerp(end, 0.55),
            end,
          ],
          0.018,
          darkLeafMaterial
        );

        const leaf = new THREE.Mesh(
          leafGeometry,
          index % 2 === 0
            ? leafMaterial
            : darkLeafMaterial
        );

        leaf.position.copy(
          start.clone().add(
            direction.clone().multiplyScalar(0.64)
          )
        );

        leaf.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction
        );

        leaf.scale.set(0.22, 0.66, 0.075);
        leaf.castShadow = true;

        foliage.add(leaf);
      });

      return plant;
    }

    createPlant(-5.9, -5.6, 1.08, coralMaterial);
    createPlant(5.9, 5.4, 0.98, aquaMaterial);
    createPlant(-5.7, 5.3, 0.9, butterMaterial);

    /* =========================================
       SMALL DECOR
    ========================================= */

    const stoolLeft = new THREE.Group();

    stoolLeft.position.set(-2.85, 0, 0.9);
    room.add(stoolLeft);

    addCylinder(
      stoolLeft, 0.42, 0.42, 0.18,
      lavenderMaterial, 0, 0.82, 0, 28
    );

    [-0.18, 0.18].forEach((x) => {
      [-0.18, 0.18].forEach((z) => {
        addCylinder(
          stoolLeft, 0.04, 0.05, 0.72,
          walnutMaterial, x, 0.36, z
        );
      });
    });

    const stoolRight = new THREE.Group();

    stoolRight.position.set(2.95, 0, 0.95);
    room.add(stoolRight);

    addCylinder(
      stoolRight, 0.42, 0.42, 0.18,
      butterMaterial, 0, 0.82, 0, 28
    );

    [-0.18, 0.18].forEach((x) => {
      [-0.18, 0.18].forEach((z) => {
        addCylinder(
          stoolRight, 0.04, 0.05, 0.72,
          walnutMaterial, x, 0.36, z
        );
      });
    });

    createWallFrame(-4.3, 3.65, 6.9, artTextures[1]);
    createWallFrame(4.3, 3.65, 6.9, artTextures[0]);

    const ottoman = new THREE.Group();

    ottoman.position.set(0, 0, 2.2);
    room.add(ottoman);

    addCylinder(
      ottoman, 0.8, 0.8, 0.62,
      coralMaterial, 0, 0.46, 0, 32
    );

    addCylinder(
      ottoman, 0.72, 0.72, 0.12,
      pinkLightMaterial, 0, 0.79, 0, 32
    );

    /* =========================================
       DUST MOTES
    ========================================= */

    const dustCount = 62;
    const dustPositions = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      const i3 = i * 3;

      dustPositions[i3] = (Math.random() - 0.5) * 11;
      dustPositions[i3 + 1] = 1.1 + Math.random() * 4.3;
      dustPositions[i3 + 2] = (Math.random() - 0.5) * 11;
    }

    const dustGeometry = new THREE.BufferGeometry();

    dustGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(dustPositions, 3)
    );

    const dust = new THREE.Points(
      dustGeometry,
      new THREE.PointsMaterial({
        color: "#fff6cf",
        size: 0.05,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        sizeAttenuation: true,
      })
    );

    room.add(dust);

    /* =========================================
       RESIZE
    ========================================= */

    const resizeObserver = new ResizeObserver(() => {
      if (disposed) return;

      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);

      camera.aspect = width / height;

      if (width < 640) {
        camera.fov = 58;
        controls.minDistance = 5.8;
        controls.maxDistance = 10.4;
      } else if (width < 960) {
        camera.fov = 52;
        controls.minDistance = 5.8;
        controls.maxDistance = 10;
      } else {
        camera.fov = 48;
        controls.minDistance = 5.6;
        controls.maxDistance = 9.6;
      }

      camera.updateProjectionMatrix();

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.8)
      );

      renderer.setSize(width, height);
    });

    resizeObserver.observe(mount);

    /* =========================================
       ANIMATION
    ========================================= */

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Replaces deprecated THREE.Clock.
    let elapsed = 0;
    let previousTime = 0;

    const animate = (timestamp: number) => {
      if (disposed) return;

      frameId = window.requestAnimationFrame(animate);

      const delta =
        previousTime === 0
          ? 0
          : Math.min((timestamp - previousTime) / 1000, 0.05);

      previousTime = timestamp;
      elapsed += delta;

      if (!reducedMotion) {
        swayingPlants.forEach((plant, index) => {
          plant.rotation.z =
            Math.sin(elapsed * 0.42 + index * 1.7) * 0.018;
        });

        dust.rotation.y = Math.sin(elapsed * 0.08) * 0.04;
        dust.position.y = Math.sin(elapsed * 0.22) * 0.035;

        lampLight.intensity =
          1.15 + Math.sin(elapsed * 2.1) * 0.05;
      }

      controls.update();

      renderer.render(scene, camera);
    };

    frameId = window.requestAnimationFrame(animate);

    onReadyRef.current?.();

    /* =========================================
       CLEANUP
    ========================================= */

    return () => {
      disposed = true;

      window.cancelAnimationFrame(frameId);

      resizeObserver.disconnect();
      controls.dispose();

      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      const textures = new Set<THREE.Texture>();

      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;

        if (mesh.geometry) {
          geometries.add(mesh.geometry);
        }

        const material = mesh.material;

        if (Array.isArray(material)) {
          material.forEach((item) => materials.add(item));
        } else if (material) {
          materials.add(material);
        }
      });

      materials.forEach((material) => {
        const materialWithMaps = material as THREE.Material & {
          map?: THREE.Texture | null;
          normalMap?: THREE.Texture | null;
          roughnessMap?: THREE.Texture | null;
          metalnessMap?: THREE.Texture | null;
          alphaMap?: THREE.Texture | null;
        };

        if (materialWithMaps.map) {
          textures.add(materialWithMaps.map);
        }

        if (materialWithMaps.normalMap) {
          textures.add(materialWithMaps.normalMap);
        }

        if (materialWithMaps.roughnessMap) {
          textures.add(materialWithMaps.roughnessMap);
        }

        if (materialWithMaps.metalnessMap) {
          textures.add(materialWithMaps.metalnessMap);
        }

        if (materialWithMaps.alphaMap) {
          textures.add(materialWithMaps.alphaMap);
        }

        material.dispose();
      });

      geometries.forEach((geometry) => geometry.dispose());
      textures.forEach((texture) => texture.dispose());

      renderer.dispose();

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="living-room-canvas"
      role="img"
      aria-label="A bright pink, cheerful, playful vintage 3D living room that can be explored in 360 degrees."
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}
