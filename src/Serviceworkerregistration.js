export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/pwa/service-worker.js")
        .then((reg) => console.log("SW registered:", reg))
        .catch((err) => console.error("SW fail:", err));
    });
  }
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((reg) => reg.unregister());
  }
}
