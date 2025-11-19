import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,  // This will trigger the SW registration immediately
});
