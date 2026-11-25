
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import LivingRoomScene from "./LivingRoomScene";
import type { AvatarKind } from "./Character3D";
import styles from "./living-room-experience.module.css";

type PositionUpdate = {
  x: number;
  z: number;
  rotation: number;
};

export default function LivingRoomExperience() {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [roomJoined, setRoomJoined] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [selectionError, setSelectionError] = useState("");
  const [busyCharacter, setBusyCharacter] =
    useState<AvatarKind | null>(null);

  const lastPositionSentAt = useRef(0);

  const joinRoom = useMutation(api.presence.joinRoom);
  const heartbeat = useMutation(api.presence.heartbeat);
  const selectCharacter = useMutation(api.characters.selectCharacter);
  const updatePosition = useMutation(api.movement.updatePosition);

  useEffect(() => {
    let id = window.sessionStorage.getItem("a-room-called-us-visitor");

    if (!id) {
      id =
        typeof window.crypto?.randomUUID === "function"
          ? window.crypto.randomUUID()
          : `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      window.sessionStorage.setItem("a-room-called-us-visitor", id);
    }

    setVisitorId(id);
  }, []);

  useEffect(() => {
    if (!visitorId) return;

    let cancelled = false;

    joinRoom({ visitorId })
      .then(() => {
        if (!cancelled) {
          setRoomJoined(true);
          setJoinError("");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setJoinError(
            error instanceof Error
              ? error.message
              : "The room could not be reached. Please refresh the page.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [visitorId, joinRoom]);

  useEffect(() => {
    if (!visitorId || !roomJoined) return;

    const timer = window.setInterval(() => {
      void heartbeat({ visitorId }).catch(() => {
        // A later heartbeat will retry if the connection briefly drops.
      });
    }, 5_000);

    return () => window.clearInterval(timer);
  }, [visitorId, roomJoined, heartbeat]);

  const visitorsResult = useQuery(
    api.presence.getRoomVisitors,
    roomJoined ? {} : "skip",
  );

  const savedCharacter = useQuery(
    api.characters.getMyCharacter,
    roomJoined && visitorId ? { visitorId } : "skip",
  );

  const visitors = visitorsResult ?? [];
  const ownVisitor = visitors.find(
    (visitor) => visitor.visitorId === visitorId,
  );

  const selectedCharacter =
    savedCharacter ?? ownVisitor?.character ?? null;

  const sendPosition = useCallback(
    (position: PositionUpdate) => {
      if (!visitorId) return;

      const now = Date.now();

      if (now - lastPositionSentAt.current < 90) return;

      lastPositionSentAt.current = now;

      void updatePosition({
        visitorId,
        x: position.x,
        z: position.z,
        rotation: position.rotation,
      }).catch(() => {
        // The local avatar keeps moving; the next position update retries.
      });
    },
    [visitorId, updatePosition],
  );

  const handleSelectCharacter = async (character: AvatarKind) => {
    if (!visitorId || busyCharacter) return;

    const occupied = visitors.some(
      (visitor) =>
        visitor.character === character &&
        visitor.visitorId !== visitorId,
    );

    if (occupied) {
      setSelectionError(
        "Someone is already using this character. Choose the other one.",
      );
      return;
    }

    setBusyCharacter(character);
    setSelectionError("");

    try {
      await selectCharacter({ visitorId, character });
    } catch (error) {
      setSelectionError(
        error instanceof Error
          ? error.message
          : "This character could not be selected. Please try again.",
      );
    } finally {
      setBusyCharacter(null);
    }
  };

  const isBoyOccupied = visitors.some(
    (visitor) =>
      visitor.character === "boy" &&
      visitor.visitorId !== visitorId,
  );

  const isGirlOccupied = visitors.some(
    (visitor) =>
      visitor.character === "girl" &&
      visitor.visitorId !== visitorId,
  );

  return (
    <main className={styles.experience}>
      <div className={styles.sceneLayer}>
        <LivingRoomScene
          visitorId={visitorId}
          selectedCharacter={selectedCharacter}
          visitors={visitors}
          onPositionChange={sendPosition}
        />
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

      {!selectedCharacter && (
        <section
          className={styles.selectionPanel}
          aria-label="Choose your character"
        >
          <span className={styles.panelKicker}>A LITTLE INTRODUCTION</span>
          <h2>Who will you be?</h2>
          <p className={styles.panelDescription}>
            Two seats, two little characters. Pick yours and come say hello.
          </p>

          {!roomJoined && (
            <p className={styles.connectionStatus}>
              {joinError || "Preparing your little room…"}
            </p>
          )}

          <div className={styles.characterChoices}>
            <button
              className={styles.characterChoice}
              type="button"
              disabled={!roomJoined || busyCharacter !== null || isBoyOccupied}
              onClick={() => void handleSelectCharacter("boy")}
            >
              <span className={`${styles.avatarIcon} ${styles.boyIcon}`}>
                <span className={styles.boyHair} />
                <span className={styles.boyFace} />
                <span className={styles.boyShirt} />
              </span>

              <span className={styles.characterName}>The boy</span>
              <span className={styles.characterDetail}>
                Black tee · round glasses
              </span>

              <span className={styles.choiceStatus}>
                {busyCharacter === "boy"
                  ? "Joining…"
                  : isBoyOccupied
                    ? "Already exploring"
                    : "Choose this one"}
              </span>
            </button>

            <button
              className={styles.characterChoice}
              type="button"
              disabled={!roomJoined || busyCharacter !== null || isGirlOccupied}
              onClick={() => void handleSelectCharacter("girl")}
            >
              <span className={`${styles.avatarIcon} ${styles.girlIcon}`}>
                <span className={styles.girlHijab} />
                <span className={styles.girlFace} />
                <span className={styles.girlShirt} />
              </span>

              <span className={styles.characterName}>The girl</span>
              <span className={styles.characterDetail}>
                Soft hijab · striped shirt
              </span>

              <span className={styles.choiceStatus}>
                {busyCharacter === "girl"
                  ? "Joining…"
                  : isGirlOccupied
                    ? "Already exploring"
                    : "Choose this one"}
              </span>
            </button>
          </div>

          {selectionError && (
            <p className={styles.selectionError} role="alert">
              {selectionError}
            </p>
          )}
        </section>
      )}

      {selectedCharacter && (
        <aside className={styles.controlPanel}>
          <span className={styles.panelKicker}>YOU ARE</span>
          <strong>
            {selectedCharacter === "boy" ? "The boy" : "The girl"}
          </strong>
          <span className={styles.controlHint}>
            WASD or arrow keys to walk
          </span>
          <span className={styles.controlHint}>
            Drag to look around · Scroll to zoom
          </span>
        </aside>
      )}

      <footer className={styles.footer}>
        <span>MADE OF LITTLE MOMENTS</span>
        <span className={styles.cursorHint}>
          {selectedCharacter
            ? "WALK A LITTLE, LOOK AROUND"
            : "PICK A CHARACTER TO BEGIN"}
        </span>
        <span>KEPT JUST FOR US ♡</span>
      </footer>
    </main>
  );
}
