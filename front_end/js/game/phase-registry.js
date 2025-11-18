const phaseControllers = {};

import phases from '../phases';

Object.keys(phases).forEach(phaseName => {
  phaseControllers[phaseName] = null;
});

export default phaseControllers;