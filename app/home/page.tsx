import LivingRoomScene from "@/components/home/LivingRoomScene";
import styles from "./living-room.module.css";

export const metadata = {
  title: "A Room Called Us | Our Living Room",
  description:
    "A cheerful virtual living room filled with pink walls, playful vintage details, and little moments.",
};

export default function HomePage() {
  return (
    <main className={styles.roomPage}>
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

      <footer className={styles.footer}>
        <span>MADE OF LITTLE MOMENTS</span>
        <span className={styles.cursorHint}>DRAG TO LOOK AROUND • SCROLL TO ZOOM</span>
        <span>KEPT JUST FOR US ♡</span>
      </footer>
    </main>
  );
}