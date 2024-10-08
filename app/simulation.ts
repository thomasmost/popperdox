import { Universe, UniverseConfig, Identity } from "popperdoxPublished";

import {
  generateIntolerantColor,
  generateTolerantColor,
  generateParadoxColor,
} from "./colorizer";
import { setViewLogic } from "./view";

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const X_COLOR = "#334455";
const A_COLOR = "#aabbcc";

export enum SimulationVariant {
  Basic = "Basic",
  WithSwapping = "WithSwapping",
  WithPoppersIntolerance = "WithPoppersIntolerance",
}

export async function simulate(
  container: HTMLElement,
  variant: SimulationVariant,
  iConfig: typeof UniverseConfig,
  iUniverse: typeof Universe,
  elementId: string,
) {
  // Construct the universe, and get its width and height.

  let config;
  switch (variant) {
    case SimulationVariant.Basic:
      config = iConfig.new();
      break;
    case SimulationVariant.WithSwapping:
      config = iConfig.new().with_swapping();
      break;
    case SimulationVariant.WithPoppersIntolerance:
      config = iConfig.new().with_swapping().with_intolerance_of_intolerance();
      break;
  }
  const universe = iUniverse.new(config);
  const width = universe.width();
  const height = universe.height();

  // for playing/pausing
  let animationId: number | null = null;
  let generationId: number = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  const isPaused = () => {
    return animationId === null;
  };
  const playPauseButton = container.getElementsByClassName("play-pause")[0];
  const fastForwardButton = container.getElementsByClassName("ffwd-btn")[0];
  const resetButton = container.getElementsByClassName("reset-btn")[0];
  const stepForwardButton = container.getElementsByClassName("step-fwd-btn")[0];
  const animationIdDiv = container.getElementsByClassName(
    "generation-id",
  )[0] as HTMLDivElement;
  const play = (throttled: boolean) => {
    playPauseButton.textContent = "⏸";
    stepForwardButton.setAttribute("disabled", "true");
    renderLoop(throttled);
  };

  setViewLogic(elementId, () => {
    if (isPaused()) {
      play(true);
    }
  });

  const pause = () => {
    playPauseButton.textContent = "▶";
    stepForwardButton.removeAttribute("disabled");
    cancelAnimationFrame(animationId);
    clearTimeout(timeoutId);
    animationId = null;
    timeoutId = null;
  };

  fastForwardButton.addEventListener("click", (event) => {
    if (timeoutId) {
      pause();
      play(false);
    } else {
      pause();
      play(true);
    }
  });

  stepForwardButton.addEventListener("click", (event) => {
    play(false);
    pause();
  });

  playPauseButton.addEventListener("click", (event) => {
    if (isPaused()) {
      play(true);
    } else {
      pause();
    }
  });
  resetButton.addEventListener("click", (event) => {
    universe.reset();
    generationId = 0;
    if (isPaused()) {
      play(false);
      pause();
    }
  });

  // Give the canvas room for all of our cells and a 1px border
  // around each of them.
  const canvas = container.getElementsByClassName(
    "popperdox-canvas",
  )[0] as HTMLCanvasElement;
  canvas.height = (CELL_SIZE + 1) * height + 1;
  canvas.width = (CELL_SIZE + 1) * width + 1;

  const ctx = canvas.getContext("2d");

  const getIndex = (row: number, column: number) => {
    return row * width + column;
  };

  const drawCells = () => {
    const rendered = universe.render();

    ctx.beginPath();

    let xCellCount = 0;
    let tCellCount = 0;
    let iCellCount = 0;
    let iiCellCount = 0;

    const cellStrings = rendered.split(";");
    const cells = cellStrings.map((cellString) => {
      const [
        identity,
        str_intolerance_x,
        str_tolerance_x,
        str_intolerance_of_intolerance,
      ] = cellString.split(",");

      const intolerance_x = parseInt(str_intolerance_x);
      const tolerance_x = parseInt(str_tolerance_x);
      const intolerance_of_intolerance = parseInt(
        str_intolerance_of_intolerance,
      );

      if (identity === "X") {
        xCellCount++;
      } else if (intolerance_x > 0) {
        iCellCount++;
      } else if (tolerance_x > 0 && tolerance_x > intolerance_of_intolerance) {
        tCellCount++;
      } else if (intolerance_of_intolerance > 0) {
        iiCellCount++;
      }

      return {
        identity: identity === "X" ? "X" : "A",
        intolerance_x,
        tolerance_x,
        intolerance_of_intolerance,
      };
    });
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(row, col);

        ctx.fillStyle =
          cells[idx].identity === "X"
            ? X_COLOR
            : cells[idx].intolerance_x > 0
              ? generateIntolerantColor(cells[idx].intolerance_x)
              : cells[idx].intolerance_of_intolerance > 0
                ? generateParadoxColor(cells[idx].intolerance_of_intolerance)
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

    const stats = {
      xCellCount,
      tCellCount,
      iCellCount,
      iiCellCount,
    };
    return stats;
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

  const renderStats = (stats: ReturnType<typeof drawCells>) => {
    const cellStatsDiv = container.getElementsByClassName(
      "cell-stats",
    )[0] as HTMLDivElement;

    cellStatsDiv.innerHTML = `
    <div class="expanded">
      <div>xCells: ${stats.xCellCount}</div>
      <div>tCells: ${stats.tCellCount}</div>
      <div>iCells: ${stats.iCellCount}</div>
      <div>iiCells: ${stats.iiCellCount}</div>
    </div>
    `;
  };

  const renderLoop = (throttled: boolean) => {
    //  debugger;
    universe.tick();

    drawGrid();
    const stats = drawCells();
    renderStats(stats);

    if (throttled) {
      timeoutId = setTimeout(() => {
        animationId = requestAnimationFrame(() => renderLoop(throttled));
        generationId++;
        animationIdDiv.innerText = "Generation: " + generationId.toString();
      }, 200);
    } else {
      animationId = requestAnimationFrame(() => renderLoop(throttled));
      generationId++;
      animationIdDiv.innerText = "Generation: " + generationId.toString();
    }
  };

  drawGrid();
  const stats = drawCells();
  renderStats(stats);

  // play(true);
}
