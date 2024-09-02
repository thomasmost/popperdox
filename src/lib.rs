mod utils;

use wasm_bindgen::prelude::*;
// use web_sys::console::log;

use seeded_random::{Random, Seed};

extern crate web_sys;

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

enum IntoleranceOf {
    X,
    IntoleranceX,
}

#[wasm_bindgen]
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Identity {
    A,
    X,
}

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Cell {
    identity: Identity,
    intolerance_x: u8,
    tolerance_x: u8,
}

impl Cell {
    pub fn get_intolerance(&self, intolerance: &IntoleranceOf) -> u8 {
        match intolerance {
            IntoleranceOf::X => self.intolerance_x,
            IntoleranceOf::IntoleranceX => self.tolerance_x,
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Copy, Debug)]
pub struct UniverseConfig {
    enable_swapping: bool,
    enable_intolerance_of_intolerance: bool,
}

#[wasm_bindgen]
impl UniverseConfig {
    pub fn new() -> Self {
        UniverseConfig {
            enable_swapping: false,
            enable_intolerance_of_intolerance: false,
        }
    }
    pub fn with_swapping(&mut self) -> Self {
        self.enable_swapping = true;
        *self
    }
    pub fn with_intolerance_of_intolerance(&mut self) -> Self {
        self.enable_intolerance_of_intolerance = true;
        *self
    }
}

#[wasm_bindgen]
pub struct Universe {
    config: UniverseConfig,
    width: u32,
    height: u32,
    seeded_randomizer: Random,
    i_virality: u8,
    t_virality: u8,
    cells: Vec<Cell>,
}

use std::fmt;

impl fmt::Display for Universe {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        for line in self.cells.as_slice().chunks(self.width as usize) {
            for &cell in line {
                let ident = match cell.identity {
                    Identity::A => 'A',
                    Identity::X => 'X',
                };
                write!(f, "{},{},{};", ident, cell.intolerance_x, cell.tolerance_x)?;
            }
            write!(f, "\n")?;
        }
        Ok(())
    }
}

#[wasm_bindgen]
impl Universe {
    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    fn evaluate_intolerance_and_swap(
        &self,
        row: u32,
        column: u32,
        intolerance: IntoleranceOf,
    ) -> (u8, (u32, u32)) {
        let mut best_neighboring_intolerance = std::u8::MAX;
        let mut best_swap = (row, column);
        let mut count = 0;
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }

                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_col = (column + delta_col) % self.width;
                let idx = self.get_index(neighbor_row, neighbor_col);
                if self.cells[idx].get_intolerance(&intolerance) > 0 {
                    let opposing_row_delta = if delta_row == 0 {
                        0
                    } else if delta_row == self.height - 1 {
                        1
                    } else {
                        self.height - 1
                    };
                    let opposing_col_delta = if delta_col == 0 {
                        0
                    } else if delta_col == self.width - 1 {
                        1
                    } else {
                        self.width - 1
                    };
                    let opposing_neighbor_row = (row + opposing_row_delta) % self.height;
                    let opposing_neighbor_col = (column + opposing_col_delta) % self.width;
                    let opposing_neighbor_neighboring_intolerance = self
                        .total_neighboring_intolerance(
                            opposing_neighbor_row,
                            opposing_neighbor_col,
                            &intolerance,
                        );
                    if opposing_neighbor_neighboring_intolerance < best_neighboring_intolerance {
                        best_neighboring_intolerance = opposing_neighbor_neighboring_intolerance;
                        best_swap = (opposing_neighbor_row, opposing_neighbor_col);
                    }
                }
                count += self.cells[idx].get_intolerance(&intolerance);
            }
        }
        (count, best_swap)
    }

    fn total_neighboring_intolerance(
        &self,
        row: u32,
        column: u32,
        intolerance: &IntoleranceOf,
    ) -> u8 {
        let mut count = 0;
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }
                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_col = (column + delta_col) % self.width;
                let idx = self.get_index(neighbor_row, neighbor_col);
                count += self.cells[idx].get_intolerance(intolerance)
            }
        }
        count
    }

    fn total_neighboring_tolerance(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }

                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_col = (column + delta_col) % self.width;
                let idx = self.get_index(neighbor_row, neighbor_col);
                count += self.cells[idx].tolerance_x;
            }
        }
        count
    }

    pub fn tick(&mut self) {
        let mut next = self.cells.clone();

        // (row, col), (row, col)
        let mut swaps = Vec::<((u32, u32), (u32, u32))>::new();

        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);
                let cell = self.cells[idx];
                let neighboring_tolerance = self.total_neighboring_tolerance(row, col);
                let (neighboring_intolerance, best_swap) =
                    self.evaluate_intolerance_and_swap(row, col, IntoleranceOf::X);
                let (neighboring_intolerance_of_intolerance, best_swap_for_intolerant_cell) =
                    self.evaluate_intolerance_and_swap(row, col, IntoleranceOf::IntoleranceX);

                if &cell.identity == &Identity::X
                    && neighboring_intolerance > 0
                    && (best_swap.0 != row || best_swap.1 != col)
                {
                    swaps.push(((row, col), best_swap));
                }
                if self.config.enable_intolerance_of_intolerance {
                    if &cell.identity == &Identity::A
                        && cell.intolerance_x > 0
                        && neighboring_intolerance_of_intolerance > 0
                        && (best_swap_for_intolerant_cell.0 != row
                            || best_swap_for_intolerant_cell.1 != col)
                    {
                        swaps.push(((row, col), best_swap_for_intolerant_cell));
                    }
                }

                let next_cell = match (
                    &cell.identity,
                    neighboring_tolerance,
                    neighboring_intolerance,
                ) {
                    // Rule 1: Any X cell will not be affected by tolerance or intolerance
                    (Identity::X, _tol, _int) => cell.clone(),
                    // Rule 2: Any A cell gets adjusted by tvirality and ivirality
                    (Identity::A, tol, int) => {
                        let mut new_tolerance = cell.tolerance_x;
                        let mut new_intolerance = cell.intolerance_x;
                        if (self.seeded_randomizer.u32() % 255)
                            < (self.t_virality as u32) * (tol as u32)
                        {
                            new_tolerance = new_tolerance.checked_add(1).unwrap_or(255);
                            new_intolerance = new_intolerance.checked_sub(1).unwrap_or(0);
                        }
                        if (self.seeded_randomizer.u32() % 255)
                            < (self.i_virality as u32) * (int as u32)
                        {
                            new_intolerance = new_intolerance.checked_add(1).unwrap_or(255);
                            new_tolerance = new_tolerance.checked_sub(1).unwrap_or(0);
                        }
                        Cell {
                            identity: cell.identity,
                            tolerance_x: new_tolerance,
                            intolerance_x: new_intolerance,
                        }
                    }
                };

                next[idx] = next_cell;
            }
        }

        if self.config.enable_swapping {
            for swap in swaps {
                let (a, b) = swap;
                let idx_a = self.get_index(a.0, a.1);
                let idx_b = self.get_index(b.0, b.1);
                let idx_a_cell = next[idx_a];
                let idx_b_cell = next[idx_b];
                next[idx_a] = idx_b_cell;
                next[idx_b] = idx_a_cell;
            }
        }

        self.cells = next;
    }

    pub fn new(config: UniverseConfig) -> Universe {
        let width = 64;
        let height = 64;

        // let rng = Random::new();
        // let new_seed = rng.seed();
        // let random_u32 = rng.u32();

        // let random_string = rng.string(10);

        // log!("{}, {}", random_u32, random_string);

        let cells = (0..width * height)
            .map(|i| {
                if i % 23 == 0 {
                    Cell {
                        identity: Identity::X,
                        intolerance_x: 0,
                        tolerance_x: 0,
                    }
                } else if i % 5 == 0 || i % 11 == 0 {
                    Cell {
                        identity: Identity::A,
                        intolerance_x: 0,
                        tolerance_x: 1,
                    }
                } else if i % 17 == 0 {
                    Cell {
                        identity: Identity::A,
                        intolerance_x: 1,
                        tolerance_x: 0,
                    }
                } else {
                    Cell {
                        identity: Identity::A,
                        intolerance_x: 0,
                        tolerance_x: 0,
                    }
                }
            })
            .collect();

        let seed = 10;

        let seed1 = Seed::unsafe_new(seed);

        Universe {
            config,
            seeded_randomizer: Random::from_seed(seed1),
            i_virality: 2,
            t_virality: if config.enable_intolerance_of_intolerance {
                2
            } else {
                1
            },
            width,
            height,
            cells,
        }
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(self) -> Vec<Cell> {
        self.cells
    }

    pub fn render(&self) -> String {
        self.to_string()
    }
    pub fn reset(&mut self) -> () {
        log!("Reset requested");
        let new_universe = Universe::new(self.config.clone());
        self.cells = new_universe.cells();
    }

    // /// Set the width of the universe.
    // ///
    // /// Resets all cells to the dead state.
    // pub fn set_width(&mut self, width: u32) {
    //     self.width = width;
    //     self.cells = (0..width * self.height).map(|_i| Cell::Dead).collect();
    // }

    // /// Set the height of the universe.
    // ///
    // /// Resets all cells to the dead state.
    // pub fn set_height(&mut self, height: u32) {
    //     self.height = height;
    //     self.cells = (0..self.width * height).map(|_i| Cell::Dead).collect();
    // }
}

// impl Universe {
//     /// Get the dead and alive values of the entire universe.
//     pub fn get_cells(&self) -> &[Cell] {
//         &self.cells
//     }

//     /// Set cells to be alive in a universe by passing the row and column
//     /// of each cell as an array.
//     pub fn set_cells(&mut self, cells: &[(u32, u32)]) {
//         for (row, col) in cells.iter().cloned() {
//             let idx = self.get_index(row, col);
//             self.cells[idx] = Cell::Alive;
//         }
//     }

// }

// Copyright 2024 Thomas Constantine Moore

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
