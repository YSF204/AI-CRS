import React, { useEffect, useMemo, useRef, useState } from "react";
import { animate, stagger } from "motion";

export default function AnimatedList({
  items = [],
  showGradients = false,
  enableArrowNavigation = false,
  displayScrollbar = false,
  renderItem,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const viewportRef = useRef(null);
  const itemRefs = useRef([]);

  const normalizedItems = useMemo(
    () => (Array.isArray(items) ? items : []),
    [items],
  );

  useEffect(() => {
    if (!enableArrowNavigation) return undefined;

    const handleKeyDown = (event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();

      setActiveIndex((current) => {
        const nextIndex =
          event.key === "ArrowDown"
            ? Math.min(current + 1, normalizedItems.length - 1)
            : Math.max(current - 1, 0);
        return nextIndex;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableArrowNavigation, normalizedItems.length]);

  useEffect(() => {
    const element = itemRefs.current[activeIndex];
    if (element && viewportRef.current) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeIndex]);

  useEffect(() => {
    if (!viewportRef.current) return;
    const nodes = viewportRef.current.querySelectorAll(".animated-list-item");
    animate(
      nodes,
      { opacity: [0, 1], y: [16, 0] },
      { duration: 0.35, easing: "ease-out", delay: stagger(0.04) },
    );
  }, [normalizedItems]);

  return (
    <div
      className={`animated-list ${showGradients ? "with-gradients" : ""} ${
        displayScrollbar ? "with-scrollbar" : ""
      }`}
    >
      <div className="animated-list-viewport" ref={viewportRef}>
        {normalizedItems.map((item, index) => (
          <div
            key={item.id || item._id || item.email || index}
            className={`animated-list-item ${index === activeIndex ? "active" : ""}`}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
          >
            {renderItem ? (
              renderItem(item, index, index === activeIndex)
            ) : (
              <div className="animated-list-default-item">
                <span>{String(item)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {showGradients && (
        <>
          <div className="animated-list-gradient top" />
          <div className="animated-list-gradient bottom" />
        </>
      )}
    </div>
  );
}
