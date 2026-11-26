"use client";

import dynamic from "next/dynamic";
import styles from "./living-room-experience.module.css";

const LivingRoomScene = dynamic(() => import("./LivingRoomScene"), {
  ssr: false,
  loading: () => (
    <div
      className="living-room-canvas"
      role="img"
      aria-label="Preparing the living room"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  ),
});

export default function LivingRoomExperience() {
  return (
    <main className={styles.experience}>
      <div className={styles.sceneLayer}>
        <LivingRoomScene />
      </div>

      <div className={styles.softVignette} aria-hidden="true" />

      <header className={styles.topbar}>
        <span className={styles.brand}>A ROOM CALLED US</span>
        <span className={styles.established}>EST. 30 · 03</span>
      </header>

      <section className={styles.roomCaption}>
        <span className={styles.roomNumber}>ROOM NO. 01</span>
        <h1>the living room</h1>
        <p>A cheerful little place to slow down.</p>
      </section>

      <aside className={styles.cameraHint} aria-label="Living room camera controls">
        <span className={styles.cameraHintLabel}>LOOK AROUND</span>
        <span>Drag to explore · Scroll to zoom</span>
      </aside>

      <footer className={styles.footer}>
        <span>MADE OF LITTLE MOMENTS</span>
        <span className={styles.cursorHint}>EXPLORE THE ROOM FROM THE FRONT</span>
        <span>KEPT JUST FOR US ♡</span>
      </footer>
    </main>
  );
}
