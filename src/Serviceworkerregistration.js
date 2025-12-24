export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register( `${import.meta.env.BASE_URL}service-worker.js`)
        .then((reg) => console.log("SW registered:", reg))
        .catch((err) => console.error("SW fail:", err));
    });
    if ("updatefound" in navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("updatefound", () => {
        const newWorker = navigator.serviceWorker.installing;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              console.log("New content is available; please refresh.");
            } else {
              console.log("Content is cached for offline use.");
            }
          }
        });
      });
    }
  }
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((reg) => reg.unregister());
  }
}
