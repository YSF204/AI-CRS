import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import "./MagicBento.css";

const DEFAULT_GLOW_COLOR = "132, 0, 255";

const createRipple = (container, x, y, glowColor) => {
  const maxDistance = Math.max(
    x,
    y,
    container.clientWidth - x,
    container.clientHeight - y,
  );
  const ripple = document.createElement("div");
  ripple.className = "particle-ripple";
  ripple.style.cssText = `
    left: ${x - maxDistance}px;
    top: ${y - maxDistance}px;
    width: ${maxDistance * 2}px;
    height: ${maxDistance * 2}px;
    --ripple-color: ${glowColor};
  `;

  container.appendChild(ripple);
  gsap.fromTo(
    ripple,
    { scale: 0, opacity: 0.55 },
    {
      scale: 1,
      opacity: 0,
      duration: 0.9,
      ease: "power2.out",
      onComplete: () => ripple.remove(),
    },
  );
};

const ParticleCard = ({
  children,
  className = "",
  style,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = false,
  enableTilt = false,
  enableMagnetism = false,
  disableAnimations = false,
}) => {
  const cardRef = useRef(null);

  const handleMouseMove = useCallback(
    (event) => {
      const card = cardRef.current;
      if (!card || disableAnimations) return;

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const relativeX = (x / rect.width) * 100;
      const relativeY = (y / rect.height) * 100;
      const distanceX = (x - centerX) / centerX;
      const distanceY = (y - centerY) / centerY;

      card.style.setProperty("--glow-x", `${relativeX}%`);
      card.style.setProperty("--glow-y", `${relativeY}%`);
      card.style.setProperty("--glow-intensity", "1");

      if (enableTilt) {
        gsap.to(card, {
          rotateX: distanceY * -8,
          rotateY: distanceX * 8,
          duration: 0.2,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }

      if (enableMagnetism) {
        gsap.to(card, {
          x: distanceX * 8,
          y: distanceY * 8,
          duration: 0.2,
          ease: "power2.out",
        });
      }
    },
    [disableAnimations, enableMagnetism, enableTilt],
  );

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card || disableAnimations) return;

    card.style.setProperty("--glow-intensity", "0");
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      x: 0,
      y: 0,
      duration: 0.35,
      ease: "power2.out",
    });
  }, [disableAnimations]);

  const handleClick = useCallback(
    (event) => {
      if (!clickEffect || disableAnimations) return;
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      createRipple(card, x, y, glowColor);
    },
    [clickEffect, disableAnimations, glowColor],
  );

  useEffect(() => {
    const card = cardRef.current;
    if (!card || disableAnimations) return;

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);
    card.addEventListener("click", handleClick);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
      card.removeEventListener("click", handleClick);
      gsap.killTweensOf(card);
    };
  }, [disableAnimations, handleClick, handleMouseLeave, handleMouseMove]);

  return (
    <div
      ref={cardRef}
      className={`magic-bento-card ${className}`}
      style={{ ...style, ["--glow-color"]: glowColor }}
    >
      {children}
    </div>
  );
};

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
};

export default function MagicBento({
  children,
  textAutoHide = true,
  enableSpotlight = false,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = 400,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = false,
  enableMagnetism = false,
  className = "",
  style = {},
}) {
  const isMobile = useMobileDetection();
  const shouldDisable = disableAnimations || isMobile;

  return (
    <div className={`magic-bento-wrapper ${className}`} style={style}>
      <ParticleCard
        glowColor={glowColor}
        clickEffect={clickEffect}
        enableTilt={enableTilt}
        enableMagnetism={enableMagnetism}
        disableAnimations={shouldDisable}
      >
        <div
          className={
            textAutoHide
              ? "magic-bento-content magic-bento-text-autohide"
              : "magic-bento-content"
          }
        >
          {children}
        </div>
      </ParticleCard>
      {enableBorderGlow && <div className="magic-bento-border-glow" />}
      {enableSpotlight && (
        <div
          className="magic-bento-spotlight"
          style={{ width: spotlightRadius * 2, height: spotlightRadius * 2 }}
        />
      )}
    </div>
  );
}
