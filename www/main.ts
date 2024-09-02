import wasmPopperdox from "popperdox";
import { generateIntolerantColor, generateTolerantColor } from "./colorizer";

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const X_COLOR = "#334455";
const A_COLOR = "#aabbcc";

export async function main() {
  const { Universe, UniverseConfig, Identity } =
    (await (wasmPopperdox as any)) as typeof wasmPopperdox;
  // Construct the universe, and get its width and height.
  let config = UniverseConfig.new()
    .with_swapping()
    .with_intolerance_of_intolerance();
  const universe = Universe.new(config);
  const width = universe.width();
  const height = universe.height();

  // for playing/pausing
  let animationId: number | null = null;
  const isPaused = () => {
    return animationId === null;
  };
  const playPauseButton = document.getElementById("play-pause");
  const resetButton = document.getElementById("reset-btn");
  const animationIdDiv = document.getElementById("animation-id");
  const play = () => {
    playPauseButton.textContent = "⏸";
    renderLoop();
  };

  const pause = () => {
    playPauseButton.textContent = "▶";
    cancelAnimationFrame(animationId);
    animationId = null;
  };

  playPauseButton.addEventListener("click", (event) => {
    if (isPaused()) {
      play();
    } else {
      pause();
    }
  });
  resetButton.addEventListener("click", (event) => {
    universe.reset();
    if (isPaused()) {
      play();
      pause();
    }
  });

  // Give the canvas room for all of our cells and a 1px border
  // around each of them.
  const canvas = document.getElementById(
    "popperdox-canvas",
  ) as HTMLCanvasElement;
  canvas.height = (CELL_SIZE + 1) * height + 1;
  canvas.width = (CELL_SIZE + 1) * width + 1;

  const ctx = canvas.getContext("2d");

  const getIndex = (row: number, column: number) => {
    return row * width + column;
  };

  const drawCells = () => {
    const rendered = universe.render();

    ctx.beginPath();

    const cellStrings = rendered.split(";");
    const cells = cellStrings.map((cellString) => {
      const [identity, intolerance_x, tolerance_x] = cellString.split(",");
      return {
        identity: identity === "X" ? Identity.X : Identity.A,
        intolerance_x: parseInt(intolerance_x),
        tolerance_x: parseInt(tolerance_x),
      };
    });
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(row, col);

        ctx.fillStyle =
          cells[idx].identity === Identity.X
            ? X_COLOR
            : cells[idx].intolerance_x > 0
              ? generateIntolerantColor(cells[idx].intolerance_x)
              : cells[idx].tolerance_x > 0
                ? generateTolerantColor(cells[idx].tolerance_x)
                : A_COLOR;

        ctx.fillRect(
          col * (CELL_SIZE + 1) + 1,
          row * (CELL_SIZE + 1) + 1,
          CELL_SIZE,
          CELL_SIZE,
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
      ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
      ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
    }

    ctx.stroke();
  };

  const renderLoop = () => {
    //  debugger;
    universe.tick();

    drawGrid();
    drawCells();

    //  setTimeout(() => {
    animationId = requestAnimationFrame(renderLoop);
    animationIdDiv.innerText = "Generation: " + animationId.toString();
    //  }, 200)
  };

  drawGrid();
  drawCells();

  play();
}
