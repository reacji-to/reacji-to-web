import { initializeReactions } from '@reacji/reaction-app';
import { runtime } from './browser-api.js';
import { discoverSamples } from './samples.js';
import { startShowcase } from './showcase.js';
let pauseShowcase = () => {};
const app = initializeReactions({ runtime, discover: discoverSamples, beforePlace: () => pauseShowcase() });
pauseShowcase = startShowcase(app);
