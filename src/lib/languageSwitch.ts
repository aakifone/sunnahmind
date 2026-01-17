export async function switchLanguageWithTransition(
  nextLang: string,
  applyLanguage: (lang: string) => void,
) {
  const anyDoc = document as Document & {
    startViewTransition?: (callback: () => void) => void;
  };

  if (typeof anyDoc.startViewTransition === "function") {
    anyDoc.startViewTransition(() => {
      applyLanguage(nextLang);
    });
  } else {
    applyOverlayTransition(() => applyLanguage(nextLang));
  }
}

function applyOverlayTransition(apply: () => void) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.backdropFilter = "blur(10px)";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 180ms ease";
  overlay.style.zIndex = "9999";
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
    window.setTimeout(() => {
      apply();
      overlay.style.opacity = "0";
      window.setTimeout(() => overlay.remove(), 180);
    }, 180);
  });
}
