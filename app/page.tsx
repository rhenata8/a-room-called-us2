
"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";

type Stage = "idle" | "knocking" | "pin" | "opening";

const SECRET_PIN = "300330";

export default function EntrancePage() {
  const router = useRouter();

  const sceneRef = useRef<HTMLDivElement>(null);
  const doorShellRef = useRef<HTMLButtonElement>(null);
  const leftDoorRef = useRef<SVGGElement>(null);
  const rightDoorRef = useRef<SVGGElement>(null);
  const doorGlowRef = useRef<HTMLDivElement>(null);

  const [stage, setStage] = useState<Stage>("idle");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  // Initial entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".door-float",
        {
          autoAlpha: 0,
          y: 35,
          scale: 0.94,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 1.7,
          delay: 0.3,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".room-copy",
        {
          autoAlpha: 0,
          y: 18,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          delay: 1.1,
          ease: "power2.out",
        }
      );

      // Subtle idle movement
      gsap.to(".door-float", {
        y: -7,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2.2,
      });
    }, sceneRef);

    return () => ctx.revert();
  }, []);

  // Door knock sound using Web Audio API
  const playKnockSound = () => {
    try {
      const audio = new window.AudioContext();
      const start = audio.currentTime;

      [0, 0.19].forEach((delay) => {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();

        const time = start + delay;

        oscillator.type = "triangle";

        oscillator.frequency.setValueAtTime(120, time);
        oscillator.frequency.exponentialRampToValueAtTime(
          55,
          time + 0.11
        );

        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(
          0.22,
          time + 0.008
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          time + 0.14
        );

        oscillator.connect(gain);
        gain.connect(audio.destination);

        oscillator.start(time);
        oscillator.stop(time + 0.15);
      });

      window.setTimeout(() => {
        void audio.close();
      }, 800);
    } catch {
      // Sound is optional if the browser does not support it.
    }
  };

  // Click the door
  const handleKnock = () => {
    if (stage !== "idle" || !doorShellRef.current) return;

    setStage("knocking");

    playKnockSound();

    // Haptic feedback on supported devices
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([55, 35, 55]);
    }

    const door = doorShellRef.current;

    // Door vibration animation
    gsap.timeline({
      onComplete: () => {
        setStage("pin");
      },
    })
      .to(door, {
        x: -5,
        rotation: -0.5,
        duration: 0.055,
        ease: "power1.inOut",
      })
      .to(door, {
        x: 5,
        rotation: 0.5,
        duration: 0.055,
      })
      .to(door, {
        x: -4,
        rotation: -0.4,
        duration: 0.055,
      })
      .to(door, {
        x: 4,
        rotation: 0.4,
        duration: 0.055,
      })
      .to(door, {
        x: 0,
        rotation: 0,
        duration: 0.08,
      });
  };

  // Submit PIN
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (stage !== "pin") return;

    if (pin !== SECRET_PIN) {
      setError("Hmm... that's not our little secret. Try again.");
      setPin("");

      const card = sceneRef.current?.querySelector(".pin-card");

      if (card) {
        gsap.timeline()
          .to(card, { x: -7, duration: 0.06 })
          .to(card, { x: 7, duration: 0.06 })
          .to(card, { x: -5, duration: 0.06 })
          .to(card, { x: 0, duration: 0.06 });
      }

      return;
    }

    setError("");
    setStage("opening");

    const left = leftDoorRef.current;
    const right = rightDoorRef.current;

    if (!left || !right) return;

    // Open both door leaves in 3D
    gsap.timeline({
      onComplete: () => {
        router.push("/home");
      },
    })
      .to(
        doorGlowRef.current,
        {
          autoAlpha: 1,
          scale: 1.2,
          duration: 0.7,
          ease: "power2.out",
        },
        0
      )
      .to(
        left,
        {
          rotationY: -78,
          transformOrigin: "100% 50%",
          transformPerspective: 1200,
          duration: 1.3,
          ease: "power3.inOut",
        },
        0
      )
      .to(
        right,
        {
          rotationY: 78,
          transformOrigin: "0% 50%",
          transformPerspective: 1200,
          duration: 1.3,
          ease: "power3.inOut",
        },
        0
      )
      .to(
        ".door-float",
        {
          scale: 0.9,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power2.in",
        },
        0.7
      );
  };

  return (
    <div className="room-scene" ref={sceneRef}>
      {/* Background */}
      <div className="room-baseboard" />
      <div className="room-floor-line" />

      {/* Top navigation */}
      <header className="room-topbar">
        <span>A LITTLE PLACE FOR US</span>
        <span>EST. 30 · 03</span>
      </header>

      <main className="room-main">
        {/* Door section */}
        <div className="door-area">
          <div className="door-shadow" />

          <div className="door-glow" ref={doorGlowRef} />

          <div className="door-float">
            <button
              ref={doorShellRef}
              type="button"
              className="door-shell"
              onClick={handleKnock}
              disabled={stage !== "idle"}
              aria-label="Knock on the door"
            >
              <svg
                className="door-svg"
                viewBox="0 0 500 620"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="frameGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#BD668C" />
                    <stop offset="15%" stopColor="#F6B8D0" />
                    <stop offset="50%" stopColor="#FBE0EA" />
                    <stop offset="85%" stopColor="#ECA4C3" />
                    <stop offset="100%" stopColor="#B85E86" />
                  </linearGradient>

                  <linearGradient
                    id="leftDoorGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#D77FA6" />
                    <stop offset="30%" stopColor="#F9C6DC" />
                    <stop offset="100%" stopColor="#E995B8" />
                  </linearGradient>

                  <linearGradient
                    id="rightDoorGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#E995B8" />
                    <stop offset="70%" stopColor="#F9C6DC" />
                    <stop offset="100%" stopColor="#D77FA6" />
                  </linearGradient>

                  <linearGradient
                    id="panelGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#FBD9E6" />
                    <stop offset="50%" stopColor="#F4B9D0" />
                    <stop offset="100%" stopColor="#EFA9C4" />
                  </linearGradient>

                  <linearGradient
                    id="goldGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#9B5A23" />
                    <stop offset="25%" stopColor="#FFE5A0" />
                    <stop offset="50%" stopColor="#C58A35" />
                    <stop offset="75%" stopColor="#FFE9B1" />
                    <stop offset="100%" stopColor="#9A5A26" />
                  </linearGradient>

                  <filter id="frameShadow">
                    <feGaussianBlur stdDeviation="5" />
                  </filter>
                </defs>

                {/* Outer arch */}
                <path
                  d="M48 580 V232 C48 120 138 28 250 28 C362 28 452 120 452 232 V580 Z"
                  fill="#B85C84"
                  stroke="#F4BCD2"
                  strokeWidth="7"
                />

                <path
                  d="M65 572 V232 C65 131 149 49 250 49 C351 49 435 131 435 232 V572"
                  fill="url(#frameGradient)"
                  stroke="#FFE1EC"
                  strokeWidth="6"
                />

                <path
                  d="M78 570 V234 C78 141 157 63 250 63 C343 63 422 141 422 234 V570"
                  fill="none"
                  stroke="#D982A8"
                  strokeWidth="5"
                />

                {/* Side columns */}
                <g>
                  <path
                    d="M67 213 H98 V568 H67 Z"
                    fill="url(#frameGradient)"
                    stroke="#E88EB4"
                    strokeWidth="3"
                  />
                  <path
                    d="M74 229 V552 M91 229 V552"
                    stroke="#FFE1ED"
                    strokeWidth="3"
                  />

                  <path
                    d="M58 197 H107 V220 H58 Z"
                    fill="url(#frameGradient)"
                    stroke="#C76A92"
                    strokeWidth="3"
                  />

                  <path
                    d="M402 213 H433 V568 H402 Z"
                    fill="url(#frameGradient)"
                    stroke="#E88EB4"
                    strokeWidth="3"
                  />
                  <path
                    d="M409 229 V552 M426 229 V552"
                    stroke="#FFE1ED"
                    strokeWidth="3"
                  />

                  <path
                    d="M393 197 H442 V220 H393 Z"
                    fill="url(#frameGradient)"
                    stroke="#C76A92"
                    strokeWidth="3"
                  />

                  <path
                    d="M60 563 H104 V583 H60 Z"
                    fill="#D77FA6"
                  />
                  <path
                    d="M396 563 H440 V583 H396 Z"
                    fill="#D77FA6"
                  />
                </g>

                {/* Top decorative arch */}
                <path
                  d="M96 210 C96 119 165 59 250 59 C335 59 404 119 404 210"
                  fill="none"
                  stroke="#FFE2ED"
                  strokeWidth="5"
                />

                <path
                  d="M115 195 C115 126 173 78 250 78 C327 78 385 126 385 195"
                  fill="none"
                  stroke="#D981A7"
                  strokeWidth="3"
                />

                {/* Decorative top ornament */}
                <g fill="url(#frameGradient)" stroke="#C76B94" strokeWidth="2">
                  <ellipse cx="250" cy="39" rx="14" ry="17" />
                  <circle cx="226" cy="39" r="10" />
                  <circle cx="274" cy="39" r="10" />
                  <path
                    d="M212 42 C196 25 203 14 217 20 C225 25 221 34 212 34 C205 30 208 25 212 27"
                    fill="none"
                    stroke="#C76B94"
                    strokeWidth="4"
                  />
                  <path
                    d="M288 42 C304 25 297 14 283 20 C275 25 279 34 288 34 C295 30 292 25 288 27"
                    fill="none"
                    stroke="#C76B94"
                    strokeWidth="4"
                  />
                  <path
                    d="M236 52 Q250 63 264 52"
                    fill="none"
                    stroke="#C76B94"
                    strokeWidth="3"
                  />
                </g>

                {/* LEFT DOOR LEAF */}
                <g ref={leftDoorRef} className="door-leaf">
                  <path
                    d="M91 565 V237 C91 151 158 91 250 82 V565 Z"
                    fill="url(#leftDoorGradient)"
                    stroke="#B85C84"
                    strokeWidth="3"
                  />

                  <path
                    d="M101 557 V239 C101 160 164 103 241 94 V557"
                    fill="none"
                    stroke="#FFE0EC"
                    strokeWidth="4"
                  />

                  {/* Upper arched panel */}
                  <path
                    d="M121 220 V207 C121 158 162 121 222 111 V220 Z"
                    fill="url(#panelGradient)"
                    stroke="#C56B93"
                    strokeWidth="6"
                  />
                  <path
                    d="M130 212 V207 C130 164 168 132 213 123 V212 Z"
                    fill="none"
                    stroke="#FFE5EF"
                    strokeWidth="3"
                  />

                  {/* Middle panel */}
                  <rect
                    x="119"
                    y="247"
                    width="106"
                    height="130"
                    rx="2"
                    fill="#D980A7"
                    stroke="#B85C84"
                    strokeWidth="5"
                  />
                  <rect
                    x="127"
                    y="255"
                    width="90"
                    height="114"
                    fill="url(#panelGradient)"
                    stroke="#FFE0EC"
                    strokeWidth="4"
                  />
                  <rect
                    x="136"
                    y="264"
                    width="72"
                    height="96"
                    fill="none"
                    stroke="#F4B8D0"
                    strokeWidth="2"
                  />

                  {/* Bottom panel */}
                  <rect
                    x="119"
                    y="400"
                    width="106"
                    height="126"
                    fill="#D980A7"
                    stroke="#B85C84"
                    strokeWidth="5"
                  />
                  <rect
                    x="127"
                    y="408"
                    width="90"
                    height="110"
                    fill="url(#panelGradient)"
                    stroke="#FFE0EC"
                    strokeWidth="4"
                  />

                  {/* Gold handle left */}
                  <g>
                    <rect
                      x="232"
                      y="315"
                      width="12"
                      height="63"
                      rx="5"
                      fill="url(#goldGradient)"
                      stroke="#9F672B"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="238"
                      cy="327"
                      r="5"
                      fill="#FFE7AB"
                      stroke="#A36B2E"
                      strokeWidth="1"
                    />
                    <path
                      d="M238 338 Q225 350 238 361 Q251 350 238 338"
                      fill="url(#goldGradient)"
                      stroke="#A36B2E"
                      strokeWidth="1.5"
                    />
                  </g>
                </g>

                {/* RIGHT DOOR LEAF */}
                <g ref={rightDoorRef} className="door-leaf">
                  <path
                    d="M250 82 C342 91 409 151 409 237 V565 H250 Z"
                    fill="url(#rightDoorGradient)"
                    stroke="#B85C84"
                    strokeWidth="3"
                  />

                  <path
                    d="M259 94 C336 103 399 160 399 239 V557"
                    fill="none"
                    stroke="#FFE0EC"
                    strokeWidth="4"
                  />

                  {/* Upper arched panel */}
                  <path
                    d="M278 111 C338 121 379 158 379 207 V220 H278 Z"
                    fill="url(#panelGradient)"
                    stroke="#C56B93"
                    strokeWidth="6"
                  />
                  <path
                    d="M287 123 C332 132 370 164 370 207 V212 H287 Z"
                    fill="none"
                    stroke="#FFE5EF"
                    strokeWidth="3"
                  />

                  {/* Middle panel */}
                  <rect
                    x="275"
                    y="247"
                    width="106"
                    height="130"
                    rx="2"
                    fill="#D980A7"
                    stroke="#B85C84"
                    strokeWidth="5"
                  />
                  <rect
                    x="283"
                    y="255"
                    width="90"
                    height="114"
                    fill="url(#panelGradient)"
                    stroke="#FFE0EC"
                    strokeWidth="4"
                  />
                  <rect
                    x="292"
                    y="264"
                    width="72"
                    height="96"
                    fill="none"
                    stroke="#F4B8D0"
                    strokeWidth="2"
                  />

                  {/* Bottom panel */}
                  <rect
                    x="275"
                    y="400"
                    width="106"
                    height="126"
                    fill="#D980A7"
                    stroke="#B85C84"
                    strokeWidth="5"
                  />
                  <rect
                    x="283"
                    y="408"
                    width="90"
                    height="110"
                    fill="url(#panelGradient)"
                    stroke="#FFE0EC"
                    strokeWidth="4"
                  />

                  {/* Gold handle right */}
                  <g>
                    <rect
                      x="256"
                      y="315"
                      width="12"
                      height="63"
                      rx="5"
                      fill="url(#goldGradient)"
                      stroke="#9F672B"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="262"
                      cy="327"
                      r="5"
                      fill="#FFE7AB"
                      stroke="#A36B2E"
                      strokeWidth="1"
                    />
                    <path
                      d="M262 338 Q249 350 262 361 Q275 350 262 338"
                      fill="url(#goldGradient)"
                      stroke="#A36B2E"
                      strokeWidth="1.5"
                    />
                  </g>
                </g>

                {/* Center seam */}
                <path
                  d="M250 83 V565"
                  stroke="#A94F77"
                  strokeWidth="1.5"
                  opacity="0.65"
                />

                {/* Bottom door frame */}
                <path
                  d="M80 566 H420 V583 H80 Z"
                  fill="url(#frameGradient)"
                  stroke="#C76A92"
                  strokeWidth="3"
                />

                <path
                  d="M91 570 H409"
                  stroke="#FFE2EC"
                  strokeWidth="3"
                />

                {/* Side decorative details */}
                <g fill="url(#goldGradient)" stroke="#B87C3B">
                  <circle cx="83" cy="199" r="8" />
                  <circle cx="417" cy="199" r="8" />
                  <circle cx="83" cy="199" r="3" fill="#FFF0C6" />
                  <circle cx="417" cy="199" r="3" fill="#FFF0C6" />
                </g>
              </svg>
            </button>
          </div>
        </div>

        {/* Text section */}
        <section className="room-copy">
          <p className="room-kicker">
            A PLACE ONLY WE KNOW
          </p>

          <h1 className="room-title">
            A room called <em>us.</em>
          </h1>

          <p className="room-subtitle">
            Some doors lead somewhere.
            <br />
            This one leads to us.
          </p>

          {stage === "idle" && (
            <p className="tap-hint">
              <span className="hint-dot" />
              Tap the door to say hello
            </p>
          )}

          {stage === "knocking" && (
            <p className="tap-hint">
              Someone is listening...
            </p>
          )}

          {stage === "pin" && (
            <div className="pin-section">
              <div className="knock-copy">
                <p>Knock, knock.</p>
                <p>Who is there?</p>
              </div>

              <form
                className="pin-card"
                onSubmit={handleSubmit}
              >
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
                    onChange={(event) => {
                      setPin(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      );
                      setError("");
                    }}
                  />

                  <span className="pin-count">
                    {pin.length}/6
                  </span>
                </div>

                <button
                  className="unlock-button"
                  type="submit"
                  disabled={pin.length !== 6}
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

          {stage === "opening" && (
            <p className="tap-hint">
              The door is opening...
            </p>
          )}
        </section>
      </main>

      <footer className="room-footer">
        <span>MADE OF LITTLE MOMENTS</span>
        <span>KEPT JUST FOR US ♡</span>
      </footer>
    </div>
  );
}
