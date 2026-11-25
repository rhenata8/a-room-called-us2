
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
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 24, 18),
    material,
  );

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
    new THREE.TubeGeometry(curve, 20, radius, 8, false),
    material,
  );

  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function addCapsule(
  parent: THREE.Object3D,
  material: THREE.Material,
  radius: number,
  length: number,
  position: [number, number, number],
) {
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, length, 5, 12),
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
) {
  const eyeWhite = makeMaterial("#fffdfb", 0.45);
  const iris = makeMaterial(eyeColor, 0.4);
  const pupil = makeMaterial("#20191a", 0.3);
  const glint = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const eyebrow = makeMaterial("#4c3029");
  const nose = makeMaterial("#d9957d");
  const lips = makeMaterial("#a95759");

  addSphere(head, skin, [0, 0, 0.015], [0.325, 0.415, 0.31]);

  // Small ears make the head silhouette less spherical.
  addSphere(head, skin, [-0.315, -0.025, 0.015], [0.07, 0.105, 0.075]);
  addSphere(head, skin, [0.315, -0.025, 0.015], [0.07, 0.105, 0.075]);

  for (const side of [-1, 1]) {
    const x = side * 0.125;

    addSphere(head, eyeWhite, [x, 0.055, 0.294], [0.061, 0.079, 0.032]);
    addSphere(head, iris, [x, 0.05, 0.321], [0.036, 0.049, 0.018]);
    addSphere(head, pupil, [x, 0.05, 0.336], [0.02, 0.03, 0.012]);
    addSphere(head, glint, [x - 0.009, 0.068, 0.346], [0.009, 0.012, 0.006]);

    addTube(
      head,
      [
        new THREE.Vector3(x - 0.073, 0.17, 0.292),
        new THREE.Vector3(x, 0.188, 0.31),
        new THREE.Vector3(x + 0.073, 0.165, 0.292),
      ],
      0.012,
      eyebrow,
    );
  }

  addSphere(head, nose, [0, -0.045, 0.324], [0.035, 0.045, 0.035]);

  addTube(
    head,
    [
      new THREE.Vector3(-0.073, -0.16, 0.292),
      new THREE.Vector3(-0.035, -0.19, 0.316),
      new THREE.Vector3(0.035, -0.19, 0.316),
      new THREE.Vector3(0.073, -0.16, 0.292),
    ],
    0.012,
    lips,
  );

  if (withGlasses) {
    const frame = makeMaterial("#292b32", 0.34);
    const lens = new THREE.MeshPhysicalMaterial({
      color: "#dcecf4",
      transparent: true,
      opacity: 0.2,
      roughness: 0.12,
      metalness: 0.04,
      depthWrite: false,
    });

    for (const side of [-1, 1]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.112, 0.012, 8, 32),
        frame,
      );

      ring.position.set(side * 0.126, 0.055, 0.345);
      ring.castShadow = true;
      head.add(ring);

      const glass = new THREE.Mesh(
        new THREE.CircleGeometry(0.101, 32),
        lens,
      );

      glass.position.set(side * 0.126, 0.055, 0.342);
      head.add(glass);

      addTube(
        head,
        [
          new THREE.Vector3(side * 0.235, 0.06, 0.34),
          new THREE.Vector3(side * 0.29, 0.075, 0.29),
          new THREE.Vector3(side * 0.32, 0.04, 0.12),
        ],
        0.009,
        frame,
      );
    }

    addRoundedBox(
      head,
      frame,
      [0.075, 0.018, 0.018],
      0.008,
      [0, 0.06, 0.35],
    );
  }
}

function createHair(head: THREE.Group) {
  const hair = makeMaterial("#211a1c", 0.94);
  const hairHighlight = makeMaterial("#34272b", 0.9);

  addSphere(head, hair, [0, 0.245, -0.07], [0.365, 0.245, 0.32]);
  addSphere(head, hair, [-0.285, 0.12, -0.015], [0.105, 0.2, 0.2]);
  addSphere(head, hair, [0.285, 0.12, -0.015], [0.105, 0.2, 0.2]);

  const curls: Array<[number, number, number, number]> = [
    [-0.25, 0.28, 0.14, 0.12],
    [-0.14, 0.37, 0.13, 0.14],
    [0.0, 0.39, 0.13, 0.15],
    [0.15, 0.35, 0.12, 0.13],
    [0.27, 0.25, 0.1, 0.12],
    [-0.04, 0.3, 0.21, 0.11],
  ];

  curls.forEach(([x, y, z, size], index) => {
    addSphere(
      head,
      index % 2 === 0 ? hair : hairHighlight,
      [x, y, z],
      [size, size * 0.9, size],
    );
  });
}

function createHijab(head: THREE.Group) {
  const scarf = makeMaterial("#e8d8d0", 0.96);
  const scarfLight = makeMaterial("#f4e9e2", 0.98);
  const scarfShade = makeMaterial("#d5c0b8", 0.98);

  // The back layer stays behind the face opening.
  addSphere(head, scarf, [0, 0.015, -0.1], [0.435, 0.55, 0.28]);

  // Soft fabric folds fall along both sides and over the shoulders.
  addSphere(head, scarfLight, [-0.29, -0.29, 0.04], [0.155, 0.43, 0.2]);
  addSphere(head, scarfLight, [0.29, -0.29, 0.04], [0.155, 0.43, 0.2]);
  addSphere(head, scarf, [0, -0.49, 0.04], [0.37, 0.2, 0.22]);

  // Fine edge around the face opening.
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
      addRoundedBox(
        arm,
        stripeMaterial,
        [0.245, 0.095, 0.255],
        0.025,
        [0, -0.36, 0],
      );
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

function createLegs(
  root: THREE.Group,
  pantsMaterial: THREE.Material,
  shoeMaterial: THREE.Material,
  soleMaterial: THREE.Material,
) {
  const legs: Array<{
    hip: THREE.Group;
    knee: THREE.Group;
  }> = [];

  for (const side of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.19, 0.93, 0);
    root.add(hip);

    addCapsule(hip, pantsMaterial, 0.155, 0.34, [0, -0.205, 0]);

    const knee = new THREE.Group();
    knee.position.set(0, -0.41, 0);
    hip.add(knee);

    addCapsule(knee, pantsMaterial, 0.12, 0.37, [0, -0.2, 0]);

    addRoundedBox(
      knee,
      soleMaterial,
      [0.29, 0.09, 0.4],
      0.04,
      [0, -0.405, 0.08],
    );

    addRoundedBox(
      knee,
      shoeMaterial,
      [0.29, 0.14, 0.39],
      0.065,
      [0, -0.365, 0.08],
    );

    legs.push({ hip, knee });
  }

  return legs;
}

function createBoy(root: THREE.Group) {
  const skin = makeMaterial("#d99b76");
  const shirt = makeMaterial("#191a1f", 0.92);
  const shirtDetail = makeMaterial("#303138", 0.9);
  const pants = makeMaterial("#44434a", 0.95);
  const shoe = makeMaterial("#f7f0e8", 0.82);
  const sole = makeMaterial("#d8d0c8", 0.9);

  const torso = new THREE.Group();
  torso.position.y = 1.33;
  root.add(torso);

  addRoundedBox(torso, shirt, [0.76, 0.79, 0.42], 0.14, [0, 0, 0]);

  // Small chest pocket, matching the reference black T-shirt.
  addRoundedBox(
    torso,
    shirtDetail,
    [0.17, 0.19, 0.025],
    0.009,
    [0.205, 0.13, 0.218],
  );

  addRoundedBox(
    torso,
    shirtDetail,
    [0.18, 0.018, 0.018],
    0.006,
    [0.205, 0.225, 0.235],
  );

  addSphere(root, skin, [0, 1.79, 0], [0.14, 0.17, 0.14]);

  const head = new THREE.Group();
  head.position.set(0, 2.12, 0);
  root.add(head);

  createFace(head, skin, "#604331", true);
  createHair(head);

  const arms = createArms(torso, shirt, skin);
  const legs = createLegs(root, pants, shoe, sole);

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

  // Fine vertical stripes on the front and back of the blouse.
  for (let index = -5; index <= 5; index += 1) {
    const x = index * 0.061;

    addRoundedBox(
      torso,
      stripe,
      [0.012, 0.66, 0.012],
      0.004,
      [x, -0.015, 0.214],
    );

    addRoundedBox(
      torso,
      stripe,
      [0.012, 0.66, 0.012],
      0.004,
      [x, -0.015, -0.214],
    );
  }

  // Collar, button placket and tiny buttons.
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

      standingBlend = THREE.MathUtils.damp(
        standingBlend,
        targetBlend,
        5.5,
        delta,
      );

      const gait = moving ? Math.sin(time * 8.5) : 0;
      const idle = Math.sin(time * 1.35);

      parts.torso.position.y = THREE.MathUtils.lerp(1.58, 1.33, standingBlend);
      parts.torso.rotation.x = THREE.MathUtils.lerp(0.035, 0, standingBlend);
      parts.head.position.y = THREE.MathUtils.lerp(2.37, 2.12, standingBlend);

      parts.head.rotation.z = moving
        ? Math.sin(time * 4.2) * 0.018
        : idle * 0.009;

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

        arm.rotation.x = moving
          ? -gait * 0.34 * side
          : idle * 0.008 * side;

        arm.rotation.z = side * -0.045;
      });

      root.position.y = moving ? Math.abs(gait) * 0.025 : idle * 0.004;
    },
  };
}