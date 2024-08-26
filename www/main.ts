import wasmPopperdox from "wasm-popperdox";
import { generateIntolerantColor, generateTolerantColor } from "./colorizer";

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const X_COLOR = "#334455";
const A_COLOR = "#aabbcc";

export async function main() {
 const {Universe, Identity} = (await (wasmPopperdox as any)) as typeof wasmPopperdox;
 // Construct the universe, and get its width and height.
 const universe = Universe.new();
 const width = universe.width();
 const height = universe.height();
 
 // Give the canvas room for all of our cells and a 1px border
 // around each of them.
 const canvas = document.getElementById("popperdox-canvas") as HTMLCanvasElement;
 canvas.height = (CELL_SIZE + 1) * height + 1;
 canvas.width = (CELL_SIZE + 1) * width + 1;
 
 const ctx = canvas.getContext('2d');
 // Import the WebAssembly memory at the top of the file.
 // import { memory } from "wasm-popperdox/wasm_popperdox_bg";
 
 // ...
 
 const getIndex = (row: number, column: number) => {
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
       intolerance_x: parseInt(intolerance_x),
       tolerance_x: parseInt(tolerance_x),
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
   
}
