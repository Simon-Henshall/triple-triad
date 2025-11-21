import phases from "./phases.js";

const phaseControllers = {};

for (const phaseName of Object.keys(phases)) {
  phaseControllers[phaseName] = undefined;
}

export { phaseControllers };
