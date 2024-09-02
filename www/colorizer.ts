export const generateIntolerantColor = (intolerance: number) => {
  if (intolerance <= 0) {
    return null;
  }
  if (intolerance <= 1) {
    return "#ffaaaa";
  }
  if (intolerance <= 2) {
    return "#ff9999";
  }
  if (intolerance <= 3) {
    return "#ff8888";
  }
  if (intolerance <= 4) {
    return "#ff7777";
  }
  if (intolerance <= 5) {
    return "#ff6666";
  }
  if (intolerance <= 6) {
    return "#ff5555";
  }
  if (intolerance <= 7) {
    return "#ff4444";
  }
  if (intolerance <= 8) {
    return "#ff3333";
  }
  if (intolerance <= 9) {
    return "#ff2222";
  }
  return "#ff0000";
};

export const generateTolerantColor = (tolerance: number) => {
  if (tolerance <= 0) {
    return null;
  }
  if (tolerance <= 1) {
    return "#aaffaa";
  }
  if (tolerance <= 2) {
    return "#99ff99";
  }
  if (tolerance <= 3) {
    return "#88ff88";
  }
  if (tolerance <= 4) {
    return "#77ff77";
  }
  if (tolerance <= 5) {
    return "#66ff66";
  }
  if (tolerance <= 6) {
    return "#55ff55";
  }
  if (tolerance <= 7) {
    return "#44ff44";
  }
  if (tolerance <= 8) {
    return "#33ff33";
  }
  if (tolerance <= 9) {
    return "#22ff22";
  }
  return "#00ff00";
};

export const generateParadoxColor = (intolerance_of_intolerance: number) => {
  if (intolerance_of_intolerance <= 0) {
    return null;
  }
  if (intolerance_of_intolerance <= 1) {
    return "#aaffff";
  }
  if (intolerance_of_intolerance <= 2) {
    return "#99ffff";
  }
  if (intolerance_of_intolerance <= 3) {
    return "#88ffff";
  }
  if (intolerance_of_intolerance <= 4) {
    return "#77ffff";
  }
  if (intolerance_of_intolerance <= 5) {
    return "#66ffff";
  }
  if (intolerance_of_intolerance <= 6) {
    return "#55ffff";
  }
  if (intolerance_of_intolerance <= 7) {
    return "#44ffff";
  }
  if (intolerance_of_intolerance <= 8) {
    return "#33ffff";
  }
  if (intolerance_of_intolerance <= 9) {
    return "#22ffff";
  }
  return "#00ffff";
};
