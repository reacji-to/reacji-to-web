import { initializeReactions } from '@reacji/reaction-app';
import { runtime } from './browser-api.js';
import { destinations } from './destinations.js';
import { discoverSamples } from './samples.js';
import { startShowcase } from './showcase.js';
let pauseShowcase = () => {};
const app = initializeReactions({ runtime, destinations, discover: discoverSamples, beforePlace: () => pauseShowcase() });
pauseShowcase = startShowcase(app);
