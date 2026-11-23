"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

type LivingRoomSceneProps = {
  onReady?: () => void;
};

type MaterialSet = {
  wall: THREE.MeshStandardMaterial;
  cream: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  walnut: THREE.MeshStandardMaterial;
  walnutLight: THREE.MeshStandardMaterial;
  brass: THREE.MeshStandardMaterial;
  brassLight: THREE.MeshStandardMaterial;
  pink: THREE.MeshPhysicalMaterial;
  pinkDeep: THREE.MeshPhysicalMaterial;
  pinkLight: THREE.MeshPhysicalMaterial;
  sage: THREE.MeshStandardMaterial;
  sageDark: THREE.MeshStandardMaterial;
  terracotta: THREE.MeshStandardMaterial;
  lavender: THREE.MeshStandardMaterial;
  paper: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  darkGreen: THREE.MeshStandardMaterial;
};

function createCanvasTexture(
  draw: (context: CanvasRenderingContext2D, width: number, height: number) => void,
  width = 768,
  height = 768
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context is not available.");
  }

  draw(context, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createArtworkTexture(variant: number) {
  const backgrounds = ["#f4e9d9", "#eee3d8", "#f5e8df"];
  const ink = ["#71866c", "#bb806c", "#8b7895"];

  return createCanvasTexture((ctx, width, height) => {
    ctx.fillStyle = backgrounds[variant % backgrounds.length];
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = 0.18;
    for (let y = 20; y < height; y += 34) {
      for (let x = 20; x < width; x += 34) {
        ctx.fillStyle = "#b99c86";
        ctx.beginPath();
        ctx.arc(x + ((y / 34) % 2) * 8, y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "rgba(139, 111, 91, 0.38)";
    ctx.lineWidth = 5;
    ctx.strokeRect(26, 26, width - 52, height - 52);

    const drawLeaf = (
      x: number,
      y: number,
      angle: number,
      leafWidth: number,
      leafHeight: number,
      color: string
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        -leafWidth * 0.72,
        -leafHeight * 0.34,
        -leafWidth * 0.5,
        -leafHeight,
        0,
        -leafHeight
      );
      ctx.bezierCurveTo(
        leafWidth * 0.5,
        -leafHeight,
        leafWidth * 0.72,
        -leafHeight * 0.34,
        0,
        0
      );
      ctx.fill();

      ctx.strokeStyle = "rgba(245, 235, 211, 0.72)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -leafHeight * 0.92);
      ctx.stroke();
      ctx.restore();
    };

    const drawFlower = (x: number, y: number, radius: number, color: string) => {
      for (let petal = 0; petal < 6; petal += 1) {
        const angle = (Math.PI * 2 * petal) / 6;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, -radius * 0.62, radius * 0.32, radius * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = "#d3a65f";
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.23, 0, Math.PI * 2);
      ctx.fill();
    };

    if (variant === 0) {
      ctx.strokeStyle = ink[0];
      ctx.lineWidth = 9;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(250, 640);
      ctx.bezierCurveTo(330, 480, 240, 330, 330, 130);
      ctx.stroke();

      [
        [285, 520, -0.8],
        [315, 450, 0.9],
        [272, 365, -0.8],
        [322, 280, 0.85],
        [300, 205, -0.6],
      ].forEach(([x, y, angle], index) => {
        drawLeaf(x, y, angle, 60, 130, index % 2 ? "#91a184" : "#71866c");
      });

      drawFlower(420, 180, 42, "#d99aa5");
      drawFlower(185, 285, 30, "#c98b83");
      drawFlower(410, 420, 27, "#d6b46f");
    } else if (variant === 1) {
      ctx.fillStyle = "#d8a4a0";
      ctx.beginPath();
      ctx.arc(385, 230, 125, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#e7c7a6";
      ctx.beginPath();
      ctx.arc(385, 230, 88, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#a5b39a";
      ctx.beginPath();
      ctx.moveTo(100, 610);
      ctx.bezierCurveTo(180, 490, 280, 510, 360, 610);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#c98578";
      ctx.beginPath();
      ctx.moveTo(300, 610);
      ctx.bezierCurveTo(420, 450, 560, 500, 670, 610);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#8b796f";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(185, 630);
      ctx.lineTo(185, 350);
      ctx.stroke();

      drawLeaf(185, 500, -0.95, 58, 120, "#829477");
      drawLeaf(185, 435, 0.95, 54, 112, "#9aaa8a");
    } else {
      ctx.strokeStyle = ink[2];
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(230, 640);
      ctx.bezierCurveTo(270, 500, 440, 430, 360, 145);
      ctx.stroke();

      drawLeaf(265, 525, -1.05, 52, 120, "#a3ad91");
      drawLeaf(315, 460, 0.92, 48, 105, "#7f9479");
      drawLeaf(365, 365, -0.8, 55, 118, "#9aaa8a");
      drawLeaf(375, 285, 0.9, 45, 100, "#879b7c");
      drawFlower(360, 145, 42, "#d8a1ad");
      drawFlower(470, 310, 27, "#d6b16f");
      drawFlower(175, 370, 25, "#c58b82");
    }

    ctx.fillStyle = "rgba(111, 94, 79, 0.72)";
    ctx.font = "italic 28px Georgia";
    ctx.textAlign = "center";
    ctx.fillText(
      variant === 1 ? "little things" : "study of flowers",
      width / 2,
      height - 56
    );
  }, 640, 820);
}

function createWindowTexture() {
  return createCanvasTexture((ctx, width, height) => {
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#c8d8d0");
    sky.addColorStop(0.56, "#e8d8c8");
    sky.addColorStop(1, "#d5b9a5");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#a9b79c";
    ctx.beginPath();
    ctx.moveTo(0, height * 0.72);
    ctx.bezierCurveTo(width * 0.25, height * 0.52, width * 0.42, height * 0.8, width * 0.62, height * 0.65);
    ctx.bezierCurveTo(width * 0.78, height * 0.54, width * 0.9, height * 0.68, width, height * 0.6);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#8b9c7e";
    ctx.beginPath();
    ctx.moveTo(0, height * 0.86);
    ctx.bezierCurveTo(width * 0.3, height * 0.72, width * 0.62, height * 0.9, width, height * 0.76);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255, 244, 215, 0.8)";
    ctx.beginPath();
    ctx.arc(width * 0.72, height * 0.24, 45, 0, Math.PI * 2);
    ctx.fill();
  }, 512, 768);
}

function createFloorTexture() {
  return createCanvasTexture((ctx, width, height) => {
    ctx.fillStyle = "#b98f78";
    ctx.fillRect(0, 0, width, height);

    const plankHeight = height / 9;
    const plankColors = ["#c39b83", "#b98d77", "#c9a18a", "#b68a75", "#c29a82"];

    for (let row = 0; row < 9; row += 1) {
      const y = row * plankHeight;
      ctx.fillStyle = plankColors[row % plankColors.length];
      ctx.fillRect(0, y, width, plankHeight - 5);

      ctx.strokeStyle = "rgba(104, 68, 52, 0.24)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, y + plankHeight - 3);
      ctx.lineTo(width, y + plankHeight - 3);
      ctx.stroke();

      for (let col = 0; col < 4; col += 1) {
        const x = ((col + (row % 2) * 0.5) * width) / 4;
        ctx.strokeStyle = "rgba(111, 72, 54, 0.16)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + plankHeight - 5);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(255, 228, 202, 0.2)";
      ctx.lineWidth = 2;
      for (let grain = 0; grain < 5; grain += 1) {
        const grainY = y + 18 + grain * 17;
        ctx.beginPath();
        ctx.moveTo(30, grainY);
        ctx.bezierCurveTo(width * 0.25, grainY - 8, width * 0.52, grainY + 8, width - 35, grainY - 3);
        ctx.stroke();
      }
    }
  }, 1024, 768);
}

function createRugTexture() {
  return createCanvasTexture((ctx, width, height) => {
    ctx.fillStyle = "#e8d9c5";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#b98779";
    ctx.lineWidth = 15;
    ctx.strokeRect(22, 22, width - 44, height - 44);

    ctx.strokeStyle = "#f8eee1";
    ctx.lineWidth = 7;
    ctx.strokeRect(45, 45, width - 90, height - 90);

    ctx.strokeStyle = "rgba(170, 126, 111, 0.38)";
    ctx.lineWidth = 3;
    for (let x = 65; x < width - 65; x += 34) {
      ctx.beginPath();
      ctx.moveTo(x, 58);
      ctx.lineTo(x, height - 58);
      ctx.stroke();
    }

    ctx.fillStyle = "#d4a6a0";
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2, 150, 92, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#eee2d0";
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2, 100, 58, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#9ba78b";
    ctx.lineWidth = 7;
    for (let side = 0; side < 4; side += 1) {
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate((Math.PI / 2) * side);
      ctx.beginPath();
      ctx.moveTo(-40, -height * 0.34);
      ctx.quadraticCurveTo(-95, -height * 0.22, -38, -height * 0.12);
      ctx.stroke();
      ctx.restore();
    }
  }, 1024, 640);
}

export default function LivingRoomScene({ onReady }: LivingRoomSceneProps) {
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
    scene.background = new THREE.Color("#f5e9df");
    scene.fog = new THREE.Fog("#f5e9df", 18, 34);

    const camera = new THREE.PerspectiveCamera(
      38,
      mount.clientWidth / Math.max(mount.clientHeight, 1),
      0.1,
      80
    );
    camera.position.set(0, 4.8, 17.2);
    const cameraTarget = new THREE.Vector3(0, 2.75, -0.5);
    camera.lookAt(cameraTarget);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // -------------------------------------------------
    // LIGHTS
    // -------------------------------------------------

    const hemisphere = new THREE.HemisphereLight(0xfff3e8, 0x786052, 2.05);
    scene.add(hemisphere);

    const ambient = new THREE.AmbientLight(0xfff5ed, 0.55);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.6);
    keyLight.position.set(-5.5, 9, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 34;
    keyLight.shadow.camera.left = -9;
    keyLight.shadow.camera.right = 9;
    keyLight.shadow.camera.top = 9;
    keyLight.shadow.camera.bottom = -3;
    keyLight.shadow.bias = -0.00015;
    keyLight.shadow.normalBias = 0.025;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf6cbd7, 1.15);
    fillLight.position.set(6, 5, 5);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffe6c9, 0.65);
    backLight.position.set(0, 6, -5);
    scene.add(backLight);

    // -------------------------------------------------
    // MATERIALS
    // -------------------------------------------------

    const wallTexture = createCanvasTexture((ctx, width, height) => {
      ctx.fillStyle = "#f1e5d9";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(190, 151, 132, 0.075)";
      ctx.lineWidth = 2;
      for (let x = 18; x < width; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(194, 153, 137, 0.1)";
      for (let y = 28; y < height; y += 92) {
        for (let x = 28; x < width; x += 92) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }, 1024, 768);

    const floorTexture = createFloorTexture();
    const rugTexture = createRugTexture();
    const windowTexture = createWindowTexture();
    const artworkTextures = [createArtworkTexture(0), createArtworkTexture(1), createArtworkTexture(2)];

    const materials: MaterialSet = {
      wall: new THREE.MeshStandardMaterial({
        color: "#fff6ec",
        map: wallTexture,
        roughness: 0.96,
      }),
      cream: new THREE.MeshStandardMaterial({ color: "#f1e4d5", roughness: 0.78 }),
      trim: new THREE.MeshStandardMaterial({ color: "#d9b9a5", roughness: 0.48 }),
      walnut: new THREE.MeshStandardMaterial({ color: "#805c49", roughness: 0.5 }),
      walnutLight: new THREE.MeshStandardMaterial({ color: "#ad8061", roughness: 0.5 }),
      brass: new THREE.MeshStandardMaterial({ color: "#9e713a", metalness: 0.78, roughness: 0.28 }),
      brassLight: new THREE.MeshStandardMaterial({ color: "#e4c17b", metalness: 0.72, roughness: 0.22 }),
      pink: new THREE.MeshPhysicalMaterial({
        color: "#d98eaa",
        roughness: 0.72,
        sheen: 0.55,
        sheenColor: "#ffe0e8",
        sheenRoughness: 0.85,
      }),
      pinkDeep: new THREE.MeshPhysicalMaterial({
        color: "#bd718e",
        roughness: 0.68,
        sheen: 0.42,
        sheenColor: "#f6cbd7",
      }),
      pinkLight: new THREE.MeshPhysicalMaterial({
        color: "#f0c3cc",
        roughness: 0.78,
        sheen: 0.5,
        sheenColor: "#fff0ed",
      }),
      sage: new THREE.MeshStandardMaterial({ color: "#9eae8f", roughness: 0.82 }),
      sageDark: new THREE.MeshStandardMaterial({ color: "#637d64", roughness: 0.9 }),
      terracotta: new THREE.MeshStandardMaterial({ color: "#bd806b", roughness: 0.8 }),
      lavender: new THREE.MeshStandardMaterial({ color: "#aa9ab9", roughness: 0.8 }),
      paper: new THREE.MeshStandardMaterial({ color: "#f5ebdf", roughness: 0.94 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: "#d9e6dd",
        roughness: 0.18,
        metalness: 0.04,
        transmission: 0.18,
        transparent: true,
        opacity: 0.74,
      }),
      darkGreen: new THREE.MeshStandardMaterial({ color: "#405f4a", roughness: 0.9 }),
    };

    const room = new THREE.Group();
    scene.add(room);

    // -------------------------------------------------
    // GEOMETRY HELPERS
    // -------------------------------------------------

    function addBox(
      parent: THREE.Object3D,
      width: number,
      height: number,
      depth: number,
      material: THREE.Material,
      x: number,
      y: number,
      z: number,
      castShadow = true
    ) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
      mesh.position.set(x, y, z);
      mesh.castShadow = castShadow;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }

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
        new RoundedBoxGeometry(width, height, depth, 5, radius),
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
        new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments),
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
      const mesh = new THREE.Mesh(new THREE.LatheGeometry(points, segments), material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }

    // -------------------------------------------------
    // ROOM SHELL
    // -------------------------------------------------

    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(14.5, 7.4, 0.32),
      materials.wall
    );
    wall.position.set(0, 3.72, -3.55);
    wall.receiveShadow = true;
    room.add(wall);

    const leftReturnWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 7.4, 7.8),
      new THREE.MeshStandardMaterial({ color: "#ead8ca", roughness: 0.96 })
    );
    leftReturnWall.position.set(-7.22, 3.72, 0.25);
    leftReturnWall.receiveShadow = true;
    room.add(leftReturnWall);

    const rightReturnWall = leftReturnWall.clone();
    rightReturnWall.position.x = 7.22;
    room.add(rightReturnWall);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(14.5, 9.5),
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        map: floorTexture,
        roughness: 0.84,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0.015, 0.75);
    floor.receiveShadow = true;
    room.add(floor);

    // Wall cornice and skirting.
    addRoundedBox(room, 14.45, 0.2, 0.28, 0.045, materials.cream, 0, 7.22, -3.31);
    addRoundedBox(room, 14.45, 0.24, 0.26, 0.045, materials.trim, 0, 0.22, -3.31);
    addRoundedBox(room, 14.3, 0.07, 0.29, 0.025, materials.cream, 0, 0.36, -3.28);

    // Gentle lower wall paneling, intentionally quiet behind the furniture.
    addBox(room, 14.2, 1.15, 0.035, materials.cream, 0, 0.96, -3.345, false);
    for (let x = -6.2; x <= 6.21; x += 1.55) {
      addRoundedBox(room, 1.34, 0.86, 0.045, 0.018, materials.trim, x, 0.97, -3.29);
      addRoundedBox(room, 1.24, 0.75, 0.035, 0.014, materials.cream, x, 0.97, -3.255);
    }

    // Side-wall panel lines add depth without making the room feel boxed in.
    [-1, 1].forEach((side) => {
      for (let index = 0; index < 3; index += 1) {
        addRoundedBox(
          room,
          0.05,
          5.9,
          0.05,
          0.02,
          materials.trim,
          side * 7.04,
          3.75,
          -1.9 + index * 2.05
        );
      }
    });

    // -------------------------------------------------
    // WALL FRAMES
    // -------------------------------------------------

    function createWallFrame(x: number, y: number, variant: number) {
      const frame = new THREE.Group();
      frame.position.set(x, y, -3.28);

      addRoundedBox(frame, 1.58, 2.08, 0.19, 0.075, materials.walnut, 0, 0, 0);
      addRoundedBox(frame, 1.44, 1.94, 0.075, 0.03, materials.brass, 0, 0, 0.105);
      addRoundedBox(frame, 1.36, 1.86, 0.06, 0.025, materials.cream, 0, 0, 0.15);

      const artwork = new THREE.Mesh(
        new THREE.PlaneGeometry(1.18, 1.62),
        new THREE.MeshStandardMaterial({
          map: artworkTextures[variant],
          roughness: 0.94,
        })
      );
      artwork.position.z = 0.185;
      artwork.receiveShadow = true;
      frame.add(artwork);

      const cornerPositions = [
        [-0.65, -0.87],
        [0.65, -0.87],
        [-0.65, 0.87],
        [0.65, 0.87],
      ];

      cornerPositions.forEach(([cx, cy]) => {
        const pin = new THREE.Mesh(
          new THREE.SphereGeometry(0.025, 14, 12),
          materials.brassLight
        );
        pin.position.set(cx, cy, 0.205);
        frame.add(pin);
      });

      room.add(frame);
    }

    createWallFrame(-1.82, 4.88, 0);
    createWallFrame(0, 4.88, 1);
    createWallFrame(1.82, 4.88, 2);

    // -------------------------------------------------
    // WINDOW AND CURTAINS
    // -------------------------------------------------

    const windowGroup = new THREE.Group();
    windowGroup.position.set(-5.35, 0, -3.27);
    room.add(windowGroup);

    addRoundedBox(windowGroup, 2.28, 3.36, 0.2, 0.09, materials.walnut, 0, 4.43, 0);
    addRoundedBox(windowGroup, 2.12, 3.2, 0.1, 0.04, materials.cream, 0, 4.43, 0.115);

    const windowPane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.92, 2.98),
      new THREE.MeshStandardMaterial({
        map: windowTexture,
        roughness: 0.75,
      })
    );
    windowPane.position.set(0, 4.43, 0.176);
    windowGroup.add(windowPane);

    addRoundedBox(windowGroup, 0.09, 3.0, 0.08, 0.025, materials.cream, 0, 4.43, 0.22);
    addRoundedBox(windowGroup, 1.95, 0.09, 0.08, 0.025, materials.cream, 0, 4.43, 0.22);

    // Curtain rod and finials.
    addCylinder(windowGroup, 0.035, 0.035, 2.95, materials.brass, 0, 6.18, 0.34, 18).rotation.z = Math.PI / 2;
    [-1.55, 1.55].forEach((x) => {
      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.09, 18, 14), materials.brassLight);
      finial.position.set(x, 6.18, 0.34);
      windowGroup.add(finial);
    });

    const curtainMaterial = new THREE.MeshStandardMaterial({
      color: "#e8d4c9",
      roughness: 0.95,
      side: THREE.DoubleSide,
    });

    const curtainGroups: THREE.Group[] = [];

    function createCurtain(x: number, side: number) {
      const curtain = new THREE.Group();
      curtain.position.set(x, 4.43, 0.32);

      addRoundedBox(curtain, 0.62, 3.55, 0.28, 0.14, curtainMaterial, 0, 0, 0);

      for (let fold = -2; fold <= 2; fold += 1) {
        addTube(
          curtain,
          [
            new THREE.Vector3(fold * 0.1, 1.7, 0.15),
            new THREE.Vector3(fold * 0.105, 0.8, 0.19),
            new THREE.Vector3(fold * 0.1, -0.2, 0.18),
            new THREE.Vector3(fold * 0.12, -1.7, 0.15),
          ],
          0.012,
          new THREE.MeshStandardMaterial({ color: "#f4e7dc", roughness: 1 })
        );
      }

      curtain.rotation.y = side * -0.08;
      curtainGroups.push(curtain);
      windowGroup.add(curtain);
    }

    createCurtain(-1.16, -1);
    createCurtain(1.16, 1);

    // -------------------------------------------------
    // WALL SCONCES
    // -------------------------------------------------

    const sconceLights: THREE.PointLight[] = [];

    function createSconce(x: number) {
      const group = new THREE.Group();
      group.position.set(x, 4.35, -3.08);
      room.add(group);

      const backplate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.07, 28),
        materials.brass
      );
      backplate.rotation.x = Math.PI / 2;
      backplate.position.z = 0;
      group.add(backplate);

      addCylinder(group, 0.035, 0.035, 0.42, materials.brassLight, 0, -0.13, 0.18);
      addCylinder(group, 0.13, 0.19, 0.26, materials.brass, 0, 0.2, 0.2);

      const shade = addLathe(
        group,
        [
          new THREE.Vector2(0.04, 0),
          new THREE.Vector2(0.16, 0.04),
          new THREE.Vector2(0.2, 0.16),
          new THREE.Vector2(0.12, 0.34),
          new THREE.Vector2(0.06, 0.38),
        ],
        materials.cream,
        0,
        0.32,
        0.2
      );
      shade.scale.set(1, 1, 0.8);

      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.105, 20, 16),
        new THREE.MeshBasicMaterial({ color: "#fff0c8" })
      );
      bulb.position.set(0, 0.62, 0.2);
      group.add(bulb);

      const light = new THREE.PointLight(0xffdca2, 1.05, 5.5, 2);
      light.position.set(x, 4.99, -2.66);
      room.add(light);
      sconceLights.push(light);
    }

    createSconce(-4.1);
    createSconce(4.1);

    // -------------------------------------------------
    // BOOKSHELF
    // -------------------------------------------------

    const bookshelf = new THREE.Group();
    bookshelf.position.set(5.55, 0, -3.0);
    room.add(bookshelf);

    const shelfWidth = 1.88;
    const shelfHeight = 4.55;
    const shelfDepth = 0.62;

    addRoundedBox(bookshelf, 0.16, shelfHeight, shelfDepth, 0.045, materials.walnut, -shelfWidth / 2 + 0.08, 2.55, 0);
    addRoundedBox(bookshelf, 0.16, shelfHeight, shelfDepth, 0.045, materials.walnut, shelfWidth / 2 - 0.08, 2.55, 0);
    addRoundedBox(bookshelf, shelfWidth, 0.16, shelfDepth, 0.045, materials.walnutLight, 0, 4.82, 0);
    addRoundedBox(bookshelf, shelfWidth, 0.18, shelfDepth, 0.045, materials.walnutLight, 0, 0.28, 0);

    const shelfYs = [1.32, 2.34, 3.36];
    shelfYs.forEach((y) => {
      addRoundedBox(bookshelf, shelfWidth - 0.12, 0.12, shelfDepth - 0.04, 0.025, materials.walnutLight, 0, y, 0);
      addBox(bookshelf, shelfWidth - 0.2, 0.025, 0.04, materials.brass, 0, y + 0.07, 0.28, false);
    });

    const bookColors = ["#b77d71", "#87977e", "#d7b77e", "#9d8aa9", "#e6c6b7", "#6f806c", "#c28c91"];
    const bookRows = [
      { y: 0.4, start: -0.73, count: 7 },
      { y: 1.4, start: -0.74, count: 6 },
      { y: 2.42, start: -0.74, count: 7 },
      { y: 3.44, start: -0.72, count: 6 },
    ];

    bookRows.forEach((row, rowIndex) => {
      let x = row.start;
      for (let index = 0; index < row.count; index += 1) {
        const width = 0.14 + ((index + rowIndex) % 3) * 0.035;
        const height = 0.48 + ((index * 2 + rowIndex) % 4) * 0.09;
        const color = new THREE.MeshStandardMaterial({
          color: bookColors[(index + rowIndex * 2) % bookColors.length],
          roughness: 0.9,
        });

        const book = addRoundedBox(
          bookshelf,
          width,
          height,
          0.34,
          0.018,
          color,
          x + width / 2,
          row.y + height / 2,
          0.03
        );
        book.rotation.z = ((index % 2) - 0.5) * 0.035;

        addBox(
          bookshelf,
          width * 0.62,
          0.018,
          0.012,
          materials.brassLight,
          x + width / 2,
          row.y + height * 0.74,
          0.205,
          false
        );

        x += width + 0.045;
      }
    });

    // A small ceramic vase on the top shelf.
    const shelfVase = addLathe(
      bookshelf,
      [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.13, 0.02),
        new THREE.Vector2(0.2, 0.18),
        new THREE.Vector2(0.16, 0.38),
        new THREE.Vector2(0.08, 0.48),
        new THREE.Vector2(0.07, 0.55),
      ],
      new THREE.MeshStandardMaterial({ color: "#d7a39c", roughness: 0.36 }),
      0.53,
      4.82,
      0.03
    );
    shelfVase.scale.set(0.82, 0.82, 0.82);

    // -------------------------------------------------
    // PLANTS
    // -------------------------------------------------

    const swayingPlants: THREE.Group[] = [];

    function createPlant(x: number, z: number, scale: number, potMaterial: THREE.Material) {
      const plant = new THREE.Group();
      plant.position.set(x, 0, z);
      plant.scale.setScalar(scale);
      room.add(plant);

      addLathe(
        plant,
        [
          new THREE.Vector2(0, 0),
          new THREE.Vector2(0.28, 0.02),
          new THREE.Vector2(0.38, 0.18),
          new THREE.Vector2(0.45, 0.78),
          new THREE.Vector2(0.34, 0.88),
          new THREE.Vector2(0, 0.88),
        ],
        potMaterial,
        0,
        0,
        0
      );

      addCylinder(
        plant,
        0.34,
        0.34,
        0.035,
        new THREE.MeshStandardMaterial({ color: "#4b3d32" }),
        0,
        0.83,
        0
      );

      const foliage = new THREE.Group();
      foliage.position.y = 0.8;
      plant.add(foliage);
      swayingPlants.push(foliage);

      const leafGeometry = new THREE.SphereGeometry(1, 18, 14);
      const leafMaterials = [
        materials.sage,
        materials.sageDark,
        new THREE.MeshStandardMaterial({ color: "#7f9b78", roughness: 0.88 }),
      ];

      const leafDirections = [
        new THREE.Vector3(-0.85, 0.75, 0.05),
        new THREE.Vector3(-0.55, 1.15, 0.28),
        new THREE.Vector3(-0.15, 1.45, -0.08),
        new THREE.Vector3(0.48, 1.25, 0.18),
        new THREE.Vector3(0.9, 0.88, -0.04),
        new THREE.Vector3(0.2, 0.92, 0.5),
        new THREE.Vector3(-0.42, 0.9, -0.32),
      ];

      leafDirections.forEach((direction, index) => {
        const dir = direction.clone().normalize();
        const start = new THREE.Vector3(0, 0.05 + index * 0.025, 0);
        const end = start.clone().add(dir.clone().multiplyScalar(1.18));

        addTube(foliage, [start, start.clone().lerp(end, 0.55), end], 0.018, materials.sageDark);

        const leaf = new THREE.Mesh(leafGeometry, leafMaterials[index % leafMaterials.length]);
        leaf.position.copy(start.clone().add(dir.clone().multiplyScalar(0.64)));
        leaf.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        leaf.scale.set(0.22, 0.66, 0.075);
        leaf.castShadow = true;
        foliage.add(leaf);
      });

      return plant;
    }

    createPlant(-6.25, -1.05, 1.18, materials.terracotta);
    createPlant(6.25, 0.55, 0.9, materials.cream);

    // -------------------------------------------------
    // SOFA
    // -------------------------------------------------

    const sofa = new THREE.Group();
    sofa.position.set(0, 0, -0.5);
    room.add(sofa);

    // Main upholstered base and back.
    addRoundedBox(sofa, 5.55, 0.72, 1.52, 0.24, materials.pinkDeep, 0, 0.83, -0.22);
    addRoundedBox(sofa, 5.42, 1.62, 0.68, 0.24, materials.pink, 0, 1.78, -0.77);

    // Three plush back cushions.
    const backCushionXs = [-1.63, 0, 1.63];
    backCushionXs.forEach((x, index) => {
      const cushionMaterial = index === 1 ? materials.pinkLight : materials.pink;
      addRoundedBox(sofa, 1.62, 1.32, 0.4, 0.2, cushionMaterial, x, 1.95, -0.39);

      [-0.43, 0, 0.43].forEach((offset, buttonIndex) => {
        if (buttonIndex === 1) return;
        const tuft = new THREE.Mesh(
          new THREE.SphereGeometry(0.035, 14, 12),
          materials.pinkDeep
        );
        tuft.position.set(x + offset, 2.03, -0.175);
        tuft.scale.set(1, 0.8, 0.55);
        sofa.add(tuft);
      });
    });

    // Seat cushions.
    backCushionXs.forEach((x, index) => {
      addRoundedBox(
        sofa,
        1.68,
        0.28,
        1.16,
        0.13,
        index === 1 ? materials.pinkLight : materials.pink,
        x,
        1.18,
        0.13
      );
    });

    // Rounded arms and soft arm caps.
    [-1, 1].forEach((side) => {
      addRoundedBox(sofa, 0.78, 1.36, 1.5, 0.28, materials.pinkDeep, side * 2.42, 1.43, -0.12);
      addRoundedBox(sofa, 0.82, 0.32, 1.42, 0.15, materials.pink, side * 2.42, 2.08, -0.12);

      const armButton = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 14, 12),
        materials.pinkLight
      );
      armButton.position.set(side * 2.42, 1.55, 0.66);
      sofa.add(armButton);
    });

    // Small decorative piping along the sofa front.
    addRoundedBox(sofa, 4.62, 0.045, 0.035, 0.012, materials.pinkLight, 0, 0.88, 0.56);

    // Wooden feet.
    [-2.28, 2.28].forEach((x) => {
      [-0.72, 0.42].forEach((z) => {
        const foot = addCylinder(sofa, 0.075, 0.11, 0.42, materials.walnut, x, 0.27, z);
        foot.rotation.z = x < 0 ? -0.08 : 0.08;
      });
    });

    // Playful accent cushions in sage, terracotta and lavender.
    const throwPillows = [
      { x: -1.92, y: 1.55, z: 0.26, color: materials.sage, rotation: -0.18 },
      { x: -0.95, y: 1.48, z: 0.35, color: materials.terracotta, rotation: 0.12 },
      { x: 1.12, y: 1.5, z: 0.34, color: materials.lavender, rotation: -0.12 },
      { x: 1.95, y: 1.56, z: 0.25, color: materials.cream, rotation: 0.18 },
    ];

    throwPillows.forEach((pillow) => {
      const cushion = addRoundedBox(
        sofa,
        0.76,
        0.76,
        0.28,
        0.13,
        pillow.color,
        pillow.x,
        pillow.y,
        pillow.z
      );
      cushion.rotation.z = pillow.rotation;
      cushion.rotation.y = -0.12;
    });

    // -------------------------------------------------
    // RUG
    // -------------------------------------------------

    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(7.8, 4.25),
      new THREE.MeshStandardMaterial({
        map: rugTexture,
        roughness: 0.98,
      })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.04, 1.05);
    rug.receiveShadow = true;
    room.add(rug);

    // -------------------------------------------------
    // COFFEE TABLE AND DECOR
    // -------------------------------------------------

    const coffeeTable = new THREE.Group();
    coffeeTable.position.set(0, 0, 1.35);
    room.add(coffeeTable);

    addRoundedBox(coffeeTable, 3.25, 0.18, 1.28, 0.11, materials.walnutLight, 0, 0.78, 0);
    addRoundedBox(coffeeTable, 2.72, 0.07, 0.92, 0.035, materials.walnut, 0, 0.43, 0);

    [-1.28, 1.28].forEach((x) => {
      [-0.42, 0.42].forEach((z) => {
        addCylinder(coffeeTable, 0.055, 0.075, 0.72, materials.walnut, x, 0.37, z);
      });
    });

    // Stacked vintage books.
    const tableBookColors = ["#b77b70", "#e4cba7", "#82947a"];
    tableBookColors.forEach((color, index) => {
      const book = addRoundedBox(
        coffeeTable,
        0.82 - index * 0.04,
        0.1,
        0.55,
        0.025,
        new THREE.MeshStandardMaterial({ color, roughness: 0.9 }),
        -0.72,
        0.94 + index * 0.105,
        -0.12
      );
      book.rotation.y = -0.12 + index * 0.08;
    });

    // Ceramic vase with a small bouquet.
    const vaseMaterial = new THREE.MeshStandardMaterial({ color: "#d8a39a", roughness: 0.34 });
    addLathe(
      coffeeTable,
      [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.16, 0.02),
        new THREE.Vector2(0.23, 0.22),
        new THREE.Vector2(0.2, 0.43),
        new THREE.Vector2(0.1, 0.53),
        new THREE.Vector2(0.08, 0.68),
      ],
      vaseMaterial,
      0.72,
      0.88,
      0.1
    );

    const flowerColors = [
      new THREE.MeshStandardMaterial({ color: "#e6b6bd", roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: "#d9bd83", roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: "#b5a5c6", roughness: 0.8 }),
    ];

    for (let flowerIndex = 0; flowerIndex < 5; flowerIndex += 1) {
      const angle = (Math.PI * 2 * flowerIndex) / 5;
      const stemTop = new THREE.Vector3(
        0.72 + Math.cos(angle) * 0.23,
        1.95 + (flowerIndex % 2) * 0.16,
        0.1 + Math.sin(angle) * 0.18
      );
      addTube(
        coffeeTable,
        [
          new THREE.Vector3(0.72, 1.48, 0.1),
          new THREE.Vector3(0.72 + Math.cos(angle) * 0.1, 1.7, 0.1 + Math.sin(angle) * 0.08),
          stemTop,
        ],
        0.012,
        materials.sageDark
      );

      const flowerHead = new THREE.Group();
      flowerHead.position.copy(stemTop);
      coffeeTable.add(flowerHead);

      for (let petal = 0; petal < 5; petal += 1) {
        const petalMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 12, 10),
          flowerColors[flowerIndex % flowerColors.length]
        );
        const petalAngle = (Math.PI * 2 * petal) / 5;
        petalMesh.position.set(Math.cos(petalAngle) * 0.075, Math.sin(petalAngle) * 0.075, 0);
        petalMesh.scale.set(1, 0.7, 0.6);
        flowerHead.add(petalMesh);
      }

      const center = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 12, 10),
        materials.brassLight
      );
      flowerHead.add(center);
    }

    // Tea cup and saucer.
    addCylinder(coffeeTable, 0.18, 0.18, 0.035, materials.cream, -1.05, 0.89, 0.35, 32);
    addCylinder(coffeeTable, 0.12, 0.14, 0.22, materials.cream, -1.05, 1.02, 0.35, 32);

    const cupHandle = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.025, 10, 24),
      materials.cream
    );
    cupHandle.position.set(-0.88, 1.02, 0.35);
    coffeeTable.add(cupHandle);

    // -------------------------------------------------
    // ACCENT ARMCHAIR
    // -------------------------------------------------

    const armchair = new THREE.Group();
    armchair.position.set(-4.15, 0, 1.3);
    armchair.rotation.y = -0.18;
    armchair.scale.setScalar(0.86);
    room.add(armchair);

    addRoundedBox(armchair, 1.72, 0.42, 1.42, 0.18, materials.sage, 0, 0.92, 0);
    addRoundedBox(armchair, 1.72, 1.42, 0.42, 0.2, materials.sageDark, 0, 1.73, -0.48);
    addRoundedBox(armchair, 1.55, 0.28, 1.25, 0.12, materials.cream, 0, 1.17, 0.08);

    [-1, 1].forEach((side) => {
      addRoundedBox(armchair, 0.32, 0.9, 1.25, 0.14, materials.sage, side * 0.72, 1.3, 0.02);
      addRoundedBox(armchair, 0.35, 0.22, 1.18, 0.1, materials.cream, side * 0.72, 1.78, 0.02);
    });

    [-0.62, 0.62].forEach((x) => {
      [-0.48, 0.48].forEach((z) => {
        addCylinder(armchair, 0.045, 0.06, 0.62, materials.walnut, x, 0.35, z);
      });
    });

    // Decorative cushion on the armchair.
    const chairPillow = addRoundedBox(
      armchair,
      0.68,
      0.7,
      0.2,
      0.14,
      materials.terracotta,
      0.36,
      1.58,
      -0.12
    );
    chairPillow.rotation.z = -0.16;

    // -------------------------------------------------
    // FLOOR LAMP AND SIDE TABLE
    // -------------------------------------------------

    const floorLamp = new THREE.Group();
    floorLamp.position.set(4.05, 0, -0.9);
    room.add(floorLamp);

    addCylinder(floorLamp, 0.38, 0.42, 0.12, materials.brass, 0, 0.08, 0);
    addCylinder(floorLamp, 0.045, 0.045, 3.05, materials.brassLight, 0, 1.62, 0);

    addLathe(
      floorLamp,
      [
        new THREE.Vector2(0.08, 0),
        new THREE.Vector2(0.28, 0.08),
        new THREE.Vector2(0.42, 0.62),
        new THREE.Vector2(0.37, 0.72),
        new THREE.Vector2(0.1, 0.78),
      ],
      materials.cream,
      0,
      3.1,
      0
    );

    const lampGlow = new THREE.PointLight(0xffd8a2, 1.25, 5.2, 2);
    lampGlow.position.set(0, 3.55, 0.18);
    floorLamp.add(lampGlow);

    // Small side table with a little plant pot.
    const sideTable = new THREE.Group();
    sideTable.position.set(3.65, 0, 1.35);
    room.add(sideTable);

    addRoundedBox(sideTable, 1.05, 0.13, 0.88, 0.09, materials.walnutLight, 0, 0.78, 0);
    addCylinder(sideTable, 0.07, 0.11, 0.74, materials.walnut, 0, 0.39, 0);
    addLathe(
      sideTable,
      [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.12, 0.02),
        new THREE.Vector2(0.18, 0.2),
        new THREE.Vector2(0.13, 0.34),
        new THREE.Vector2(0.07, 0.4),
      ],
      new THREE.MeshStandardMaterial({ color: "#a5ad8e", roughness: 0.75 }),
      0,
      0.85,
      0
    );

    // -------------------------------------------------
    // DUST MOTES
    // -------------------------------------------------

    const dustCount = 58;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustSeeds = new Float32Array(dustCount);

    for (let index = 0; index < dustCount; index += 1) {
      const i3 = index * 3;
      dustPositions[i3] = (Math.random() - 0.5) * 12.5;
      dustPositions[i3 + 1] = 1.2 + Math.random() * 5.2;
      dustPositions[i3 + 2] = -1.5 + Math.random() * 3.2;
      dustSeeds[index] = Math.random() * Math.PI * 2;
    }

    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));

    const dust = new THREE.Points(
      dustGeometry,
      new THREE.PointsMaterial({
        color: "#fff0d5",
        size: 0.045,
        transparent: true,
        opacity: 0.52,
        depthWrite: false,
        sizeAttenuation: true,
      })
    );
    room.add(dust);

    // -------------------------------------------------
    // POINTER PARALLAX AND RESPONSIVE CAMERA
    // -------------------------------------------------

    const pointer = new THREE.Vector2(0, 0);
    const targetCameraPosition = new THREE.Vector3();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = mount.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
    };

    const handlePointerLeave = () => {
      pointer.set(0, 0);
    };

    mount.addEventListener("pointermove", handlePointerMove);
    mount.addEventListener("pointerleave", handlePointerLeave);

    const resizeObserver = new ResizeObserver(() => {
      if (!mount || disposed) return;

      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      const aspect = width / height;

      camera.aspect = aspect;

      if (aspect < 0.78) {
        camera.fov = 54;
        camera.position.z = 15.8;
        room.scale.x = 0.56;
      } else if (aspect < 1.15) {
        camera.fov = 45;
        camera.position.z = 16.8;
        room.scale.x = 0.82;
      } else {
        camera.fov = 38;
        camera.position.z = 17.2;
        room.scale.x = 1;
      }

      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
      renderer.setSize(width, height);
    });

    resizeObserver.observe(mount);

    // -------------------------------------------------
    // ANIMATION LOOP
    // -------------------------------------------------

    const clock = new THREE.Clock();

    const animate = () => {
      if (disposed) return;

      frameId = window.requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      if (!reducedMotion) {
        swayingPlants.forEach((plant, index) => {
          plant.rotation.z = Math.sin(elapsed * 0.42 + index * 1.7) * 0.018;
        });

        curtainGroups.forEach((curtain, index) => {
          curtain.rotation.z = Math.sin(elapsed * 0.48 + index) * 0.006;
        });

        dust.rotation.y = Math.sin(elapsed * 0.06) * 0.035;
        dust.position.y = Math.sin(elapsed * 0.22) * 0.035;

        sconceLights.forEach((light, index) => {
          light.intensity = 0.96 + Math.sin(elapsed * 2.1 + index) * 0.06;
        });
      }

      targetCameraPosition.set(
        pointer.x * 0.22,
        4.8 + pointer.y * 0.1,
        camera.position.z
      );

      camera.position.lerp(targetCameraPosition, reducedMotion ? 0.04 : 0.025);
      camera.lookAt(
        pointer.x * 0.12,
        cameraTarget.y + pointer.y * 0.045,
        cameraTarget.z
      );

      renderer.render(scene, camera);
    };

    animate();
    onReadyRef.current?.();

    // -------------------------------------------------
    // CLEANUP
    // -------------------------------------------------

    return () => {
      disposed = true;

      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      mount.removeEventListener("pointermove", handlePointerMove);
      mount.removeEventListener("pointerleave", handlePointerLeave);

      const geometries = new Set<THREE.BufferGeometry>();
      const materialsToDispose = new Set<THREE.Material>();
      const textures = new Set<THREE.Texture>();

      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) geometries.add(mesh.geometry);

        const material = mesh.material;
        if (Array.isArray(material)) {
          material.forEach((item) => materialsToDispose.add(item));
        } else if (material) {
          materialsToDispose.add(material);
        }
      });

      materialsToDispose.forEach((material) => {
        const materialWithMap = material as THREE.Material & {
          map?: THREE.Texture | null;
        };
        if (materialWithMap.map) textures.add(materialWithMap.map);
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
    aria-label="A cozy, colorful three-dimensional vintage living room"
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
