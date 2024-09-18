<div align="center"><h1>Popperdox</h1>
A project inspired by and adapted from the Rust WASM Tutorial: Implementing <a target="_blank" rel="noreferrer" href="https://rustwasm.github.io/docs/book/game-of-life/introduction.html">Conway's Game of Life</a>
</div>

## 🚴 Usage

Notes on usage

## Commands

- `pnpm redev` - Recompile the WASM package and start the webpack dev server
- `wasm-pack build` - Build the WASM package
- `wasm-pack publish` - Publish the WASM package to npm
- `wasm-pack test --headless --firefox` - Test in a headless browser

## TODOs

- [x] Copy explaining interation upon each Simulation
- [ ] Allow configuring number of starting X-cells, I-cells, and P-cells.
- [x] Output current number of majority I, T, and P cells as stats
- [x] Should X Cells spread tolerance to adjacent cells?
- [ ] (Maybe) Allow configuring size of board?
- [ ] (Maybe) Choose a random seed, and allow sharing a seed via query param?
