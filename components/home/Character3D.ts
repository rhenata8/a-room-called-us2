"use client";

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export type AvatarKind = "boy" | "girl";

export type AvatarRig = {
  root: THREE.Group;
  update: (
    time: number,
    delta: number,
    moving: boolean,
    standing: boolean,
  ) => void;
};

function makeMaterial(color: string, roughness = 0.86) {
  return new THREE.MeshStandardMaterial({ color, roughness });
}

function addSphere(
  parent: THREE.Object3D,
  material: THREE.Material,
  position: [number, number, number],
  scale: [number, number, number],
) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addRoundedBox(
  parent: THREE.Object3D,
  material: THREE.Material,
  size: [number, number, number],
  radius: number,
  position: [number, number, number],
) {
  const mesh = new THREE.Mesh(
    new RoundedBoxGeometry(size[0], size[1], size[2], 5, radius),
    material,
  );
  mesh.position.set(...position);
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
) {
  const curve = new THREE.CatmullRomCurve3(points);
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 24, radius, 8, false),
    material,
  );
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

/** A tapered, smooth strand used for the boy's sculpted hair. */
function addTaperedStrand(
  parent: THREE.Object3D,
  points: THREE.Vector3[],
  radius: number,
  material: THREE.Material,
) {
  const curve = new THREE.CatmullRomCurve3(points);
  const segments = 28;
  const radialSegments = 7;
  const frames = curve.computeFrenetFrames(segments, false);
  const vertices: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const taper = 0.1 + 0.9 * Math.pow(Math.sin(Math.PI * t), 0.55);
    const center = curve.getPointAt(t);

    for (let j = 0; j <= radialSegments; j += 1) {
      const angle = (j / radialSegments) * Math.PI * 2;
      const normal = frames.normals[i].clone().multiplyScalar(Math.cos(angle));
      const binormal = frames.binormals[i].clone().multiplyScalar(Math.sin(angle));
      const point = center
        .clone()
        .addScaledVector(normal, radius * taper)
        .addScaledVector(binormal, radius * taper);
      vertices.push(point.x, point.y, point.z);
    }
  }

  for (let i = 0; i < segments; i += 1) {
    for (let j = 0; j < radialSegments; j += 1) {
      const a = i * (radialSegments + 1) + j;
      const b = a + radialSegments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const strand = new THREE.Mesh(geometry, material);
  strand.castShadow = true;
  strand.receiveShadow = true;
  parent.add(strand);
  return strand;
}

function addCapsule(
  parent: THREE.Object3D,
  material: THREE.Material,
  radius: number,
  length: number,
  position: [number, number, number],
) {
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, length, 6, 16),
    material,
  );
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function createFace(
  head: THREE.Group,
  skin: THREE.Material,
  eyeColor: string,
  withGlasses: boolean,
  faceScale: [number, number, number] = [0.325, 0.415, 0.31],
) {
  const eyeWhite = makeMaterial("#fffdfb", 0.42);
  const iris = makeMaterial(eyeColor, 0.38);
  const pupil = makeMaterial("#20191a", 0.28);
  const glint = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const eyebrow = makeMaterial("#49302a");
  const nose = makeMaterial("#d9957d");
  const lips = makeMaterial("#a95759");
  const cheek = new THREE.MeshStandardMaterial({
    color: "#e99c8d",
    roughness: 1,
    transparent: true,
    opacity: 0.2,
  });

  addSphere(head, skin, [0, 0, 0.015], faceScale);

  const earX = faceScale[0] * 0.96;
  addSphere(head, skin, [-earX, -0.025, 0.015], [0.058, 0.085, 0.065]);
  addSphere(head, skin, [earX, -0.025, 0.015], [0.058, 0.085, 0.065]);

  const eyeSurfaceZ =
    0.015 +
    faceScale[2] *
      Math.sqrt(
        Math.max(
          0.1,
          1 - Math.pow(0.119 / faceScale[0], 2) - Math.pow(0.045 / faceScale[1], 2),
        ),
      ) +
    0.012;
  const eyeZ = eyeSurfaceZ;
  const browZ =
    0.015 +
    faceScale[2] *
      Math.sqrt(
        Math.max(0.1, 1 - Math.pow(0.119 / faceScale[0], 2) - Math.pow(0.145 / faceScale[1], 2)),
      ) +
    0.01;
  const cheekZ =
    0.015 +
    faceScale[2] *
      Math.sqrt(
        Math.max(0.1, 1 - Math.pow(0.19 / faceScale[0], 2) - Math.pow(0.09 / faceScale[1], 2)),
      ) +
    0.008;
  const noseZ =
    0.015 + faceScale[2] * Math.sqrt(Math.max(0.1, 1 - Math.pow(0.045 / faceScale[1], 2))) + 0.012;
  const mouthZ =
    0.015 + faceScale[2] * Math.sqrt(Math.max(0.1, 1 - Math.pow(0.178 / faceScale[1], 2))) + 0.012;

  for (const side of [-1, 1]) {
    const x = side * 0.119;

    addSphere(head, eyeWhite, [x, 0.045, eyeZ], [0.057, 0.071, 0.027]);
    addSphere(head, iris, [x, 0.043, eyeZ + 0.022], [0.034, 0.046, 0.016]);
    addSphere(head, pupil, [x, 0.043, eyeZ + 0.035], [0.019, 0.029, 0.01]);
    addSphere(head, glint, [x - 0.009, 0.06, eyeZ + 0.044], [0.008, 0.011, 0.005]);

    addTube(
      head,
      [
        new THREE.Vector3(x - 0.067, 0.145, browZ),
        new THREE.Vector3(x, 0.163, browZ + 0.013),
        new THREE.Vector3(x + 0.067, 0.145, browZ),
      ],
      0.009,
      eyebrow,
    );

    addSphere(head, cheek, [side * 0.19, -0.09, cheekZ], [0.055, 0.026, 0.012]);
  }

  addSphere(head, nose, [0, -0.045, noseZ], [0.027, 0.038, 0.027]);

  addTube(
    head,
    [
      new THREE.Vector3(-0.066, -0.157, mouthZ - 0.018),
      new THREE.Vector3(-0.032, -0.178, mouthZ),
      new THREE.Vector3(0.032, -0.178, mouthZ),
      new THREE.Vector3(0.066, -0.157, mouthZ - 0.018),
    ],
    0.009,
    lips,
  );

  if (withGlasses) {
    const frame = makeMaterial("#29272a", 0.34);
    const lens = new THREE.MeshPhysicalMaterial({
      color: "#dcecf4",
      transparent: true,
      opacity: 0.12,
      roughness: 0.12,
      metalness: 0.03,
      depthWrite: false,
    });

    for (const side of [-1, 1]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.108, 0.009, 8, 36),
        frame,
      );
      ring.position.set(side * 0.119, 0.045, eyeZ + 0.031);
      ring.castShadow = true;
      head.add(ring);

      const glass = new THREE.Mesh(new THREE.CircleGeometry(0.098, 36), lens);
      glass.position.set(side * 0.119, 0.045, eyeZ + 0.026);
      head.add(glass);

      addTube(
        head,
        [
          new THREE.Vector3(side * 0.225, 0.05, eyeZ + 0.025),
          new THREE.Vector3(side * 0.27, 0.065, eyeZ - 0.01),
          new THREE.Vector3(side * 0.29, 0.025, 0.105),
        ],
        0.007,
        frame,
      );
    }

    addRoundedBox(head, frame, [0.055, 0.014, 0.014], 0.006, [0, 0.045, eyeZ + 0.036]);
  }
}

/**
 * Reconstructed boy hairstyle based on the supplied MP4:
 * a rounded, swept, wavy top; full side coverage; and layered tapered strands
 * continuing down the back to the nape. The strands are attached to one smooth
 * hair mass rather than separate round clumps.
 */
function createHair(head: THREE.Group) {
  const hair = makeMaterial("#171619", 0.94);
  const hairMid = makeMaterial("#242125", 0.92);
  const hairLight = makeMaterial("#302a2d", 0.9);

  // Main scalp and rear volume. These overlap to create one continuous silhouette.
  addSphere(head, hair, [0, 0.205, -0.055], [0.315, 0.235, 0.295]);
  addSphere(head, hair, [0, 0.025, -0.105], [0.292, 0.205, 0.245]);

  // Full side panels taper down around the ears and toward the nape.
  const leftSide = addSphere(head, hair, [-0.265, 0.015, -0.015], [0.085, 0.205, 0.19]);
  leftSide.rotation.z = -0.12;
  const rightSide = addSphere(head, hair, [0.265, 0.015, -0.015], [0.085, 0.205, 0.19]);
  rightSide.rotation.z = 0.12;

  // A soft swept forelock gives the front silhouette the same lifted, wavy profile.
  const forelock = addSphere(head, hairMid, [-0.105, 0.315, 0.105], [0.185, 0.105, 0.16]);
  forelock.rotation.z = -0.24;
  forelock.rotation.x = -0.16;

  const topLocks: Array<Array<[number, number, number]>> = [
    [[-0.245, 0.225, 0.13], [-0.235, 0.34, 0.17], [-0.145, 0.425, 0.09], [-0.025, 0.405, -0.055]],
    [[-0.19, 0.275, 0.18], [-0.12, 0.405, 0.17], [0.015, 0.445, 0.055], [0.12, 0.385, -0.095]],
    [[-0.09, 0.31, 0.205], [0.015, 0.43, 0.16], [0.145, 0.415, 0.035], [0.205, 0.315, -0.105]],
    [[0.015, 0.31, 0.205], [0.13, 0.405, 0.16], [0.235, 0.36, 0.035], [0.245, 0.245, -0.09]],
    [[-0.265, 0.18, 0.105], [-0.28, 0.29, 0.075], [-0.21, 0.385, -0.045], [-0.105, 0.42, -0.16]],
    [[0.18, 0.245, 0.12], [0.255, 0.33, 0.045], [0.23, 0.36, -0.085], [0.13, 0.34, -0.205]],
  ];

  topLocks.forEach((lock, index) => {
    addTaperedStrand(
      head,
      lock.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
      index % 2 === 0 ? 0.022 : 0.018,
      index % 3 === 0 ? hairLight : hairMid,
    );
  });

  // Short curved fringe pieces sit along the hairline without forming a straight fringe.
  const fringe: Array<Array<[number, number, number]>> = [
    [[-0.25, 0.225, 0.16], [-0.205, 0.29, 0.235], [-0.115, 0.295, 0.255], [-0.055, 0.255, 0.26]],
    [[-0.14, 0.275, 0.205], [-0.055, 0.325, 0.235], [0.045, 0.31, 0.24], [0.105, 0.255, 0.22]],
    [[0.025, 0.29, 0.19], [0.115, 0.33, 0.19], [0.205, 0.29, 0.17], [0.245, 0.215, 0.13]],
  ];

  fringe.forEach((lock, index) => {
    addTaperedStrand(
      head,
      lock.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
      0.022,
      index === 1 ? hairLight : hairMid,
    );
  });

  // Side strands frame the temples and connect the top volume to the back.
  for (const side of [-1, 1]) {
    addTaperedStrand(
      head,
      [
        new THREE.Vector3(side * 0.235, 0.25, 0.12),
        new THREE.Vector3(side * 0.305, 0.15, 0.07),
        new THREE.Vector3(side * 0.32, 0.015, -0.025),
        new THREE.Vector3(side * 0.255, -0.12, -0.13),
      ],
      0.025,
      hairMid,
    );
  }

  // Layered back locks remain visible when the character turns around.
  const backXs = [-0.22, -0.15, -0.075, 0, 0.075, 0.15, 0.22];
  backXs.forEach((x, index) => {
    addTaperedStrand(
      head,
      [
        new THREE.Vector3(x * 0.72, 0.31, -0.205),
        new THREE.Vector3(x * 0.92, 0.19, -0.315),
        new THREE.Vector3(x, 0.035, -0.335),
        new THREE.Vector3(x * 0.78, -0.115, -0.27),
      ],
      index % 2 === 0 ? 0.018 : 0.015,
      index % 3 === 0 ? hairLight : hairMid,
    );
  });
}

function createHijab(head: THREE.Group) {
  const scarf = makeMaterial("#e8d8d0", 0.96);
  const scarfLight = makeMaterial("#f4e9e2", 0.98);
  const scarfShade = makeMaterial("#d5c0b8", 0.98);

  addSphere(head, scarf, [0, 0.015, -0.1], [0.435, 0.55, 0.28]);
  addSphere(head, scarfLight, [-0.29, -0.29, 0.04], [0.155, 0.43, 0.2]);
  addSphere(head, scarfLight, [0.29, -0.29, 0.04], [0.155, 0.43, 0.2]);
  addSphere(head, scarf, [0, -0.49, 0.04], [0.37, 0.2, 0.22]);

  addTube(
    head,
    [
      new THREE.Vector3(-0.285, 0.26, 0.225),
      new THREE.Vector3(-0.27, 0.1, 0.35),
      new THREE.Vector3(-0.22, -0.11, 0.36),
      new THREE.Vector3(0, -0.24, 0.365),
      new THREE.Vector3(0.22, -0.11, 0.36),
      new THREE.Vector3(0.27, 0.1, 0.35),
      new THREE.Vector3(0.285, 0.26, 0.225),
    ],
    0.024,
    scarfShade,
  );

  addSphere(head, scarfLight, [0, -0.46, 0.275], [0.12, 0.09, 0.035]);
}

function createArms(
  root: THREE.Group,
  sleeveMaterial: THREE.Material,
  skinMaterial: THREE.Material,
  stripeMaterial?: THREE.Material,
) {
  const arms: THREE.Group[] = [];

  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.405, 0.28, 0);
    root.add(arm);

    addCapsule(arm, sleeveMaterial, 0.125, 0.31, [0, -0.205, 0]);

    if (stripeMaterial) {
      addRoundedBox(arm, stripeMaterial, [0.245, 0.095, 0.255], 0.025, [0, -0.36, 0]);
    }

    const forearm = new THREE.Group();
    forearm.position.set(0, -0.39, 0);
    arm.add(forearm);
    addCapsule(forearm, skinMaterial, 0.088, 0.31, [0, -0.18, 0]);
    addSphere(forearm, skinMaterial, [0, -0.39, 0.025], [0.095, 0.105, 0.09]);

    arms.push(arm);
  }

  return arms;
}

function createBoyArms(
  torso: THREE.Group,
  shirt: THREE.Material,
  skin: THREE.Material,
  seam: THREE.Material,
) {
  const arms: THREE.Group[] = [];

  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.425, 0.285, 0);
    torso.add(arm);

    // Relaxed short sleeves, rounded but slimmer than the old block-like arms.
    addCapsule(arm, shirt, 0.108, 0.29, [0, -0.17, 0]);
    addTube(
      arm,
      [
        new THREE.Vector3(-0.07, -0.315, 0.005),
        new THREE.Vector3(0, -0.325, 0.012),
        new THREE.Vector3(0.07, -0.315, 0.005),
      ],
      0.006,
      seam,
    );

    const forearm = new THREE.Group();
    forearm.position.set(0, -0.34, 0);
    arm.add(forearm);
    addCapsule(forearm, skin, 0.071, 0.31, [0, -0.17, 0]);
    addRoundedBox(forearm, skin, [0.135, 0.16, 0.095], 0.055, [0, -0.36, 0.025]);

    // Four subtle fingers and a thumb give the hand a readable human silhouette.
    for (let finger = 0; finger < 4; finger += 1) {
      const x = (finger - 1.5) * 0.031;
      const length = finger === 1 || finger === 2 ? 0.09 : 0.075;
      addCapsule(forearm, skin, 0.018, length, [x, -0.475 - (finger === 0 || finger === 3 ? -0.012 : 0), 0.035]);
    }

    const thumb = addCapsule(forearm, skin, 0.021, 0.075, [side * 0.082, -0.39, 0.055]);
    thumb.rotation.z = side * -0.55;

    arms.push(arm);
  }

  return arms;
}

function createLegs(
  root: THREE.Group,
  pantsMaterial: THREE.Material,
  shoeMaterial: THREE.Material,
  soleMaterial: THREE.Material,
) {
  const legs: Array<{ hip: THREE.Group; knee: THREE.Group }> = [];

  for (const side of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.19, 0.93, 0);
    root.add(hip);
    addCapsule(hip, pantsMaterial, 0.155, 0.34, [0, -0.205, 0]);

    const knee = new THREE.Group();
    knee.position.set(0, -0.41, 0);
    hip.add(knee);
    addCapsule(knee, pantsMaterial, 0.12, 0.37, [0, -0.2, 0]);
    addRoundedBox(knee, soleMaterial, [0.29, 0.09, 0.4], 0.04, [0, -0.405, 0.08]);
    addRoundedBox(knee, shoeMaterial, [0.29, 0.14, 0.39], 0.065, [0, -0.365, 0.08]);

    legs.push({ hip, knee });
  }

  return legs;
}

function createBoyLegs(
  root: THREE.Group,
  pants: THREE.Material,
  pocket: THREE.Material,
  shoe: THREE.Material,
  sole: THREE.Material,
  lace: THREE.Material,
) {
  const legs: Array<{ hip: THREE.Group; knee: THREE.Group }> = [];

  for (const side of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.205, 0.93, 0);
    root.add(hip);

    // Loose straight trousers, with a soft silhouette and visible rear pocket.
    addCapsule(hip, pants, 0.163, 0.42, [0, -0.22, 0]);
    addRoundedBox(hip, pocket, [0.17, 0.145, 0.022], 0.018, [0, -0.145, -0.154]);
    addTube(
      hip,
      [
        new THREE.Vector3(-0.075, -0.22, -0.168),
        new THREE.Vector3(0, -0.235, -0.17),
        new THREE.Vector3(0.075, -0.22, -0.168),
      ],
      0.005,
      pants,
    );

    const knee = new THREE.Group();
    knee.position.set(0, -0.43, 0);
    hip.add(knee);
    addCapsule(knee, pants, 0.145, 0.43, [0, -0.205, 0]);

    // Small natural folds above the sneakers.
    addTube(
      knee,
      [
        new THREE.Vector3(-0.105, -0.39, 0.075),
        new THREE.Vector3(0, -0.365, 0.14),
        new THREE.Vector3(0.105, -0.39, 0.075),
      ],
      0.012,
      pants,
    );

    // Cream-white low-top sneakers with a distinct sole and laces.
    addRoundedBox(knee, sole, [0.31, 0.075, 0.445], 0.035, [0, -0.485, 0.105]);
    addRoundedBox(knee, shoe, [0.305, 0.155, 0.425], 0.065, [0, -0.405, 0.105]);
    addRoundedBox(knee, shoe, [0.16, 0.07, 0.18], 0.045, [0, -0.34, 0.045]);

    for (let laceIndex = 0; laceIndex < 4; laceIndex += 1) {
      const z = -0.015 + laceIndex * 0.047;
      addTube(
        knee,
        [
          new THREE.Vector3(-0.055, -0.322, z + 0.105),
          new THREE.Vector3(0, -0.312, z + 0.12),
          new THREE.Vector3(0.055, -0.322, z + 0.105),
        ],
        0.006,
        lace,
      );
    }

    legs.push({ hip, knee });
  }

  return legs;
}

function createBoy(root: THREE.Group) {
  const skin = makeMaterial("#d99b76", 0.9);
  const shirt = makeMaterial("#171719", 0.94);
  const shirtDetail = makeMaterial("#242427", 0.94);
  const pants = makeMaterial("#393a3e", 0.97);
  const rearPocket = makeMaterial("#454448", 0.97);
  const shoe = makeMaterial("#f4f0e9", 0.86);
  const sole = makeMaterial("#d6d0c8", 0.92);
  const lace = makeMaterial("#d4cec6", 0.9);

  const torso = new THREE.Group();
  torso.position.y = 1.35;
  root.add(torso);

  // Slightly loose black T-shirt with rounded shoulders and a small left chest pocket.
  addRoundedBox(torso, shirt, [0.81, 0.84, 0.43], 0.145, [0, 0, 0]);
  addRoundedBox(torso, shirtDetail, [0.17, 0.19, 0.022], 0.012, [0.205, 0.13, 0.22]);
  addTube(
    torso,
    [
      new THREE.Vector3(0.12, 0.225, 0.224),
      new THREE.Vector3(0.205, 0.225, 0.224),
      new THREE.Vector3(0.29, 0.225, 0.224),
    ],
    0.004,
    shirtDetail,
  );

  // Neck is mostly hidden by the collar, as in the video reference.
  addCapsule(root, skin, 0.075, 0.14, [0, 1.79, 0]);

  const head = new THREE.Group();
  head.position.set(0, 2.12, 0);
  root.add(head);
  createFace(head, skin, "#65432f", true, [0.27, 0.30, 0.255]);
  createHair(head);

  const arms = createBoyArms(torso, shirt, skin, shirtDetail);
  const legs = createBoyLegs(root, pants, rearPocket, shoe, sole, lace);

  return { torso, head, arms, legs };
}

function createGirl(root: THREE.Group) {
  const skin = makeMaterial("#e8b397");
  const blouse = makeMaterial("#fff8f0", 0.98);
  const stripe = makeMaterial("#d7b6a8", 0.96);
  const cuff = makeMaterial("#ead7ce", 0.96);
  const pants = makeMaterial("#a99a89", 0.96);
  const shoe = makeMaterial("#fff8ef", 0.82);
  const sole = makeMaterial("#ddd3c9", 0.92);
  const button = makeMaterial("#c9a68f", 0.55);

  const torso = new THREE.Group();
  torso.position.y = 1.33;
  root.add(torso);
  addRoundedBox(torso, blouse, [0.77, 0.81, 0.42], 0.14, [0, 0, 0]);

  for (let index = -5; index <= 5; index += 1) {
    const x = index * 0.061;
    addRoundedBox(torso, stripe, [0.012, 0.66, 0.012], 0.004, [x, -0.015, 0.214]);
    addRoundedBox(torso, stripe, [0.012, 0.66, 0.012], 0.004, [x, -0.015, -0.214]);
  }

  addRoundedBox(torso, cuff, [0.19, 0.12, 0.035], 0.014, [-0.105, 0.34, 0.215]);
  addRoundedBox(torso, cuff, [0.19, 0.12, 0.035], 0.014, [0.105, 0.34, 0.215]);
  addRoundedBox(torso, blouse, [0.055, 0.57, 0.025], 0.012, [0, -0.015, 0.225]);

  [-0.2, -0.06, 0.08, 0.22].forEach((y) => {
    addSphere(torso, button, [0, y, 0.244], [0.018, 0.018, 0.012]);
  });

  addSphere(root, skin, [0, 1.79, 0], [0.14, 0.17, 0.14]);
  const head = new THREE.Group();
  head.position.set(0, 2.12, 0);
  root.add(head);
  createHijab(head);
  createFace(head, skin, "#684633", false);

  const arms = createArms(torso, blouse, skin, cuff);
  const legs = createLegs(root, pants, shoe, sole);
  return { torso, head, arms, legs };
}

export function createAvatar(type: AvatarKind): AvatarRig {
  const root = new THREE.Group();
  root.name = "avatar-" + type;

  const parts = type === "girl" ? createGirl(root) : createBoy(root);
  let standingBlend = 0;

  return {
    root,

    update(time, delta, moving, standing) {
      const targetBlend = standing ? 1 : 0;
      standingBlend = THREE.MathUtils.damp(standingBlend, targetBlend, 5.5, delta);

      const gait = moving ? Math.sin(time * 8.5) : 0;
      const idle = Math.sin(time * 1.35);

      parts.torso.position.y = THREE.MathUtils.lerp(1.58, 1.35, standingBlend);
      parts.torso.rotation.x = THREE.MathUtils.lerp(0.035, 0, standingBlend);
      parts.head.position.y = THREE.MathUtils.lerp(2.37, 2.12, standingBlend);
      parts.head.rotation.z = moving ? Math.sin(time * 4.2) * 0.018 : idle * 0.009;

      parts.legs.forEach(({ hip, knee }, index) => {
        const side = index === 0 ? -1 : 1;
        hip.position.y = THREE.MathUtils.lerp(1.2, 0.93, standingBlend);
        hip.rotation.x =
          THREE.MathUtils.lerp(-Math.PI / 2, 0, standingBlend) +
          (moving ? gait * 0.48 * side : 0);
        knee.rotation.x =
          THREE.MathUtils.lerp(Math.PI / 2, 0, standingBlend) +
          (moving ? Math.max(0, -gait * side) * 0.55 : 0);
      });

      parts.arms.forEach((arm, index) => {
        const side = index === 0 ? -1 : 1;
        arm.rotation.x = moving ? -gait * 0.34 * side : idle * 0.008 * side;
        arm.rotation.z = side * -0.045;
      });

      root.position.y = moving ? Math.abs(gait) * 0.025 : idle * 0.004;
    },
  };
}
