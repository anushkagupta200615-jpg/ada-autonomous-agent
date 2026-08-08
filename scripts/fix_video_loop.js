/**
 * fix_video_loop.js
 * Replaces the complex fade-in/fade-out video logic with a simple CSS transition.
 * The `loop` attribute handles looping natively — no JS needed.
 */
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'client/src/pages/NewsFeed.jsx');
let code = fs.readFileSync(filePath, 'utf8');

// ── Remove unused refs ────────────────────────────────────────────────────────
code = code.replace(
  `  const videoRef = useRef(null);\r\n  const fadeRef = useRef(0);\r\n  const fadingOutRef = useRef(false);`,
  `  const videoRef = useRef(null);`
);

// ── Replace entire video useEffect with simple fade-in only version ──────────
const OLD_EFFECT = `  useEffect(() => {\r\n    const video = videoRef.current;\r\n    if (!video) return;\r\n\r\n    if (video.readyState >= 2) {\r\n      video.style.opacity = '1';\r\n    }\r\n\r\n    const fade = (target, duration, callback) => {\r\n      cancelAnimationFrame(fadeRef.current);\r\n      const startOpacity = parseFloat(video.style.opacity || getComputedStyle(video).opacity || '0');\r\n      let startTime = null;\r\n\r\n      const animate = (currentTime) => {\r\n        if (!startTime) startTime = currentTime;\r\n        const elapsed = currentTime - startTime;\r\n        const progress = Math.min(elapsed / duration, 1);\r\n        \r\n        video.style.opacity = (startOpacity + (target - startOpacity) * progress).toString();\r\n\r\n        if (progress < 1) {\r\n          fadeRef.current = requestAnimationFrame(animate);\r\n        } else if (callback) {\r\n          callback();\r\n        }\r\n      };\r\n      fadeRef.current = requestAnimationFrame(animate);\r\n    };\r\n\r\n    const handleLoadedData = () => {\r\n      video.play().catch(() => {});\r\n      fade(1, 500);\r\n    };\r\n\r\n    const handleTimeUpdate = () => {\r\n      if (fadingOutRef.current) return;\r\n      if (video.duration - video.currentTime <= 0.55) {\r\n        fadingOutRef.current = true;\r\n        fade(0, 500);\r\n      }\r\n    };\r\n\r\n    const handleEnded = () => {\r\n      video.style.opacity = '0';\r\n      setTimeout(() => {\r\n        video.currentTime = 0;\r\n        fadingOutRef.current = false;\r\n        video.play().catch(() => {});\r\n        fade(1, 500);\r\n      }, 100);\r\n    };\r\n\r\n    video.addEventListener('loadeddata', handleLoadedData);\r\n    video.addEventListener('timeupdate', handleTimeUpdate);\r\n    video.addEventListener('ended', handleEnded);\r\n    if (video.readyState >= 2) {\r\n      handleLoadedData();\r\n    }\r\n\r\n    return () => {\r\n      cancelAnimationFrame(fadeRef.current);\r\n      video.removeEventListener('loadeddata', handleLoadedData);\r\n      video.removeEventListener('timeupdate', handleTimeUpdate);\r\n      video.removeEventListener('ended', handleEnded);\r\n    };\r\n  }, []);`;

const NEW_EFFECT = `  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Fade in via CSS transition once video is loaded — loop is handled natively
    const onReady = () => {
      video.play().catch(() => {});
      requestAnimationFrame(() => { video.style.opacity = '1'; });
    };
    if (video.readyState >= 2) {
      onReady();
    } else {
      video.addEventListener('loadeddata', onReady, { once: true });
      return () => video.removeEventListener('loadeddata', onReady);
    }
  }, []);`;

if (code.includes(OLD_EFFECT)) {
  code = code.replace(OLD_EFFECT, NEW_EFFECT);
  console.log('✓ Replaced video useEffect');
} else {
  console.error('✗ Could not find old video useEffect — checking for CRLF variant...');
  process.exit(1);
}

// ── Fix video element: add CSS transition, keep opacity:0 initial ─────────────
code = code.replace(
  `        style={{ opacity: 0 }}\r\n        className="absolute inset-0 w-full h-full object-cover z-0"`,
  `        style={{ opacity: 0, transition: 'opacity 1.2s ease' }}\r\n        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"`
);

// Also handle if it was already fixed to 'fixed'
code = code.replace(
  `        style={{ opacity: 0 }}\r\n        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"`,
  `        style={{ opacity: 0, transition: 'opacity 1.2s ease' }}\r\n        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"`
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('✓ Done. Lines:', code.split('\n').length);
