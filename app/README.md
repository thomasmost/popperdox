# Popperdox App

This is the deployed web application, which references the currently published version of 'popperdox' hosted by the npm package registry.

## Commands

- `pnpm redev` - Recompile the WASM package and start the webpack dev server
- `wasm-pack build` - Build the WASM package
- `wasm-pack publish` - Publish the WASM package to npm

## TODOs

- [ ] Copy explaining interation upon each Simulation
- [ ] Allow configuring number of starting X-cells, I-cells, and P-cells.
- [ ] Output current number of majority I, T, and P cells as stats
- [ ] (Maybe) Allow configuring size of board?
- [ ] (Maybe) Choose a random seed, and allow sharing a seed via query param?
