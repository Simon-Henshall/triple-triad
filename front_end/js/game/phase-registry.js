import phases from "./phases.js";

const phaseControllers = {};

Object.keys(phases).forEach((phaseName) => {
  phaseControllers[phaseName] = null;
});


export { phaseControllers };
