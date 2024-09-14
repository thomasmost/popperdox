<div align="center"><h1>Popperdox</h1>
A project inspired by and adapted from the Rust WASM Tutorial: Implementing <a target="_blank" rel="noreferrer" href="https://rustwasm.github.io/docs/book/game-of-life/introduction.html">Conway's Game of Life</a>
</div>

## 🚴 Usage

Notes on usage

### Build with `wasm-pack build`

```
wasm-pack build
```

### Test in Headless Browsers with `wasm-pack test`

```
wasm-pack test --headless --firefox
```

### Publish to NPM with `wasm-pack publish`

```
wasm-pack publish
```

## TODOs

- [ ] Copy explaining interation upon each Simulation
- [ ] Allow configuring number of starting X-cells, I-cells, and P-cells.
- [ ] Output current number of majority I, T, and P cells as stats
- [ ] (Maybe) Allow configuring size of board?
- [ ] (Maybe) Choose a random seed, and allow sharing a seed via query param?
