export const generateRandomNumber = (min, max) =>
  (Math.random() * (max - min) + min).toFixed(0);
