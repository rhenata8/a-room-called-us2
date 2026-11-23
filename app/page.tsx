"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import EntranceScene from "@/components/entrance/EntranceScene";

type Stage =
  | "idle"
  | "knocking"
  | "opening"
  | "pin"
  | "entering";

const SECRET_PIN = "300330";

export default function EntrancePage() {
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("idle");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleStageChange = useCallback((nextStage: Stage) => {
    setStage((prev) => {
      if (prev === nextStage) return prev;
      return nextStage;
    });
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (stage !== "pin") return;

    if (pin !== SECRET_PIN) {
      setError("PIN-nya belum tepat, coba lagi ya.");
      setPin("");
      return;
    }

    setError("");
    setStage("entering");

    window.setTimeout(() => {
      router.push("/home");
    }, 900);
  };

  return (
    <div className={`room-scene ${stage === "entering" ? "is-entering" : ""}`}>
      <div className="room-baseboard" />
      <div className="room-floor-line" />

      <header className="room-topbar">
        <span>A LITTLE PLACE FOR US</span>
        <span>EST. 30 · 03</span>
      </header>

      <main className="room-main">
        <div className="door-stage">
          <div className="wall-sconce wall-sconce-left" aria-hidden="true">
            <span className="sconce-backplate" />
            <span className="sconce-arm" />
            <span className="sconce-cup" />
            <span className="sconce-flame" />
          </div>

          <div className="wall-sconce wall-sconce-right" aria-hidden="true">
            <span className="sconce-backplate" />
            <span className="sconce-arm" />
            <span className="sconce-cup" />
            <span className="sconce-flame" />
          </div>

          <div className="door-shadow" />

          <EntranceScene
            stage={stage}
            onStageChange={handleStageChange}
          />

          {(stage === "pin" || stage === "entering") && (
            <div className="pin-overlay">
              <form className="pin-card" onSubmit={handleSubmit}>
                <label htmlFor="secret-pin">
                  A little secret to get inside
                </label>

                <div className="pin-input-wrap">
                  <input
                    id="secret-pin"
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={6}
                    placeholder="Enter 6-digit PIN"
                    value={pin}
                    autoFocus
                    disabled={stage === "entering"}
                    onChange={(event) => {
                      setPin(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      );
                      setError("");
                    }}
                  />
                  <span className="pin-count">{pin.length}/6</span>
                </div>

                <button
                  className="unlock-button"
                  type="submit"
                  disabled={pin.length !== 6 || stage === "entering"}
                >
                  Unlock the door
                  <span>↗</span>
                </button>

                {error && (
                  <p className="pin-error" role="alert">
                    {error}
                  </p>
                )}
              </form>
            </div>
          )}
        </div>
      </main>

      <footer className="room-footer">
        <span>MADE OF LITTLE MOMENTS</span>
        <span>KEPT JUST FOR US ♡</span>
      </footer>
    </div>
  );
}
