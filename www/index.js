import { Universe, Identity } from "wasm-popperdox";

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";

// interface Cell {
//   identity: Identity;
//   intolerance_x: number;
//   tolerance_x: number;
// }


const X_COLOR = "#334455";
const A_COLOR = "#aabbcc";

const generateIntolerantColor = (intolerance) => {
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
}

const generateTolerantColor = (tolerance) => {
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
}

// Construct the universe, and get its width and height.
const universe = Universe.new();
const width = universe.width();
const height = universe.height();

// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById("popperdox-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d');
// Import the WebAssembly memory at the top of the file.
import { memory } from "wasm-popperdox/wasm_popperdox_bg";

// ...

const getIndex = (row, column) => {
  return row * width + column;
};

const drawCells = () => {
  const rendered = universe.render();

  ctx.beginPath();


  const cellStrings = rendered.split(";");
  const cells = cellStrings.map(cellString => {
    const [identity, intolerance_x, tolerance_x] = cellString.split(",");
    return {
      identity: identity === "X" ? Identity.X : Identity.A,
      intolerance_x,
      tolerance_x
    };

  });
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);

      ctx.fillStyle = cells[idx].identity === Identity.X
        ? X_COLOR
        : (
          cells[idx].intolerance_x > 0 ? generateIntolerantColor(cells[idx].intolerance_x) : (
            cells[idx].tolerance_x > 0 ? generateTolerantColor(cells[idx].tolerance_x) : A_COLOR
          )
        );

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
};

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  // Horizontal lines.
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
};

const renderLoop = () => {
  debugger;
  universe.tick();

  drawGrid();
  drawCells();

  setTimeout(() => {
    requestAnimationFrame(renderLoop);
  }, 200)
};

drawGrid();
drawCells();

requestAnimationFrame(renderLoop);
