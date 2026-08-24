/**
 * Shuffle an array using the Fisher-Yates algorithm
 * @template T
 * @param {T[]} array - Array to shuffle
 * @returns {T[]} - Shuffled array
 */
export function shuffle(array) {
  let counter = array.length,
    temporary,
    index;
  while (counter--) {
    index = Math.floor(Math.random() * counter);
    temporary = array[counter];
    array[counter] = array[index];
    array[index] = temporary;
  }
  return array;
}
