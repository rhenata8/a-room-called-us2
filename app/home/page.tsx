
import LivingRoomScene from "@/components/home/LivingRoomScene";
import styles from "./living-room.module.css";

export const metadata = {
  title: "A Room Called Us | Our Living Room",
  description:
    "A little virtual living room made of our favorite colors and little moments.",
};

export default function HomePage() {
  return (
    <main className={styles.roomPage}>
      {/* Three.js scene */}
      <div className={styles.sceneLayer}>
        <LivingRoomScene />
      </div>

      {/* Soft lighting overlay */}
      <div
        className={styles.softVignette}
        aria-hidden="true"
      />

      {/* Header */}
      <header className={styles.topbar}>
        <span className={styles.brand}>
          A ROOM CALLED US
        </span>

        <span className={styles.established}>
          EST. 30 · 03
        </span>
      </header>

      {/* Room title */}
      <section className={styles.roomCaption}>
        <span className={styles.roomNumber}>
          ROOM NO. 01
        </span>

        <h1>the living room</h1>

        <p>A little place to slow down.</p>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>MADE OF LITTLE MOMENTS</span>

        <span className={styles.cursorHint}>
          MOVE YOUR CURSOR TO LOOK AROUND
        </span>

        <span>KEPT JUST FOR US ♡</span>
      </footer>
    </main>
  );
}
