import React, { useEffect, useRef, useState } from 'react';

/*
 * AnimatedIconsBackground
 *
 * Affiche un nuage d'abeilles jaunes qui se déplacent en arrière‑plan.
 * Les abeilles dérivent, rebondissent sur les bords et se repoussent
 * quand le curseur les frôle.  Le tableau positionsRef est
 * automatiquement ajusté si le nombre d’abeilles (iconsList) change.
 */
export default function AnimatedIconsBackground() {
  // 50 abeilles servies depuis le dossier public
  const iconsList = Array.from({ length: 50 }, () => '/bee.png');

  const containerRef = useRef<HTMLDivElement | null>(null);
  // positionsRef conserve la position et la vitesse de chaque abeille
  const positionsRef = useRef(
    iconsList.map(() => ({
      x: Math.random() * 300,
      y: Math.random() * 200,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
    }))
  );
  // état factice pour déclencher les re‑rendus
  const [, setFrame] = useState(0);

  // Synchronise positionsRef avec iconsList pour éviter un index undefined
  if (positionsRef.current.length !== iconsList.length) {
    const current = positionsRef.current;
    if (current.length < iconsList.length) {
      const addCount = iconsList.length - current.length;
      const additional = Array.from({ length: addCount }, () => ({
        x: Math.random() * 300,
        y: Math.random() * 200,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
      }));
      positionsRef.current = current.concat(additional);
    } else {
      positionsRef.current = current.slice(0, iconsList.length);
    }
  }

  // Animation continue : déplacement, rebonds et friction
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let width = container.offsetWidth;
    let height = container.offsetHeight;
    const updateDims = () => {
      width = container.offsetWidth;
      height = container.offsetHeight;
    };
    window.addEventListener('resize', updateDims);
    let animId: number;
    const animate = () => {
	  // Met à jour dynamiquement les dimensions du conteneur
	  if (container) {
	    width = container.offsetWidth;
	    height = container.offsetHeight;
	  }
	  positionsRef.current.forEach((pos) => {
	    pos.x += pos.vx;
	    pos.y += pos.vy;
	    const size = 24;
	    // rebonds …
	    if (pos.x < 0) { pos.x = 0; pos.vx *= -1; }
	    else if (pos.x > width - size) { pos.x = width - size; pos.vx *= -1; }
	    if (pos.y < 0) { pos.y = 0; pos.vy *= -1; }
	    else if (pos.y > height - size) { pos.y = height - size; pos.vy *= -1; }
	    // friction et vitesse minimale …
	  });
	  setFrame((f) => f + 1);
	  animId = requestAnimationFrame(animate);
	};
    animId = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', updateDims);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Répulsion quand la souris est proche
  const handleMouseMove = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    positionsRef.current.forEach((pos) => {
      const dx = pos.x + 12 - mouseX;
      const dy = pos.y + 12 - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const threshold = 120;
      if (dist < threshold && dist > 0) {
        const repulse = (threshold - dist) / threshold;
        const forceMult = 2.5;
        pos.vx += (dx / dist) * repulse * forceMult;
        pos.vy += (dy / dist) * repulse * forceMult;
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-auto z-0 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {iconsList.map((src, idx) => {
        const pos = positionsRef.current[idx];
        return (
          <img
            key={idx}
            src={src}
            alt="abeille"
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              width: '24px',
              height: '24px',
              opacity: 0.22,
              // filtre jaune clair
              filter:
                'invert(77%) sepia(17%) saturate(3000%) hue-rotate(15deg) brightness(95%) contrast(92%)',
              pointerEvents: 'none',
            }}
            className="select-none"
          />
        );
      })}
    </div>
  );
}
