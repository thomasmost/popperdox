mod utils;

use wasm_bindgen::prelude::*;
use web_sys::console::log;

use seeded_random::{Random,Seed};

extern crate web_sys;

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

#[wasm_bindgen]
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Identity {
    A,
    X
}


#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Cell {
    identity: Identity,
    intolerance_x: u8,
    tolerance_x: u8
}

#[wasm_bindgen]
pub struct Universe {
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
                    Identity::X => 'X'
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

    fn total_neighboring_intolerance(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }

                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_col = (column + delta_col) % self.width;
                let idx = self.get_index(neighbor_row, neighbor_col);
                count += self.cells[idx].intolerance_x;
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

        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);
                let cell = self.cells[idx];
                let neighboring_tolerance = self.total_neighboring_tolerance(row, col);
                let neighboring_intolerance = self.total_neighboring_intolerance(row, col);

                let next_cell = match (&cell.identity, neighboring_tolerance, neighboring_intolerance) {
                    // Rule 1: Any X cell will not be affected by tolerance or intolerance
                    (Identity::X, _tol, _int) => cell.clone(),
                    // Rule 2: Any A cell gets adjusted by tvirality and ivirality
                    (Identity::A, tol, int) => {
                        let mut new_tolerance = cell.tolerance_x;
                        let mut new_intolerance = cell.intolerance_x;
                          if (self.seeded_randomizer.u32() % 255) < (self.t_virality as u32) * (tol as u32) {
                            new_tolerance = new_tolerance.checked_add(1).unwrap_or(255);
                            new_intolerance = new_intolerance.checked_sub(1).unwrap_or(0);
                          }
                          if (self.seeded_randomizer.u32() % 255) < (self.i_virality as u32) * (int as u32) {
                            new_intolerance = new_intolerance.checked_add(1).unwrap_or(255);
                            new_tolerance = new_tolerance.checked_sub(1).unwrap_or(0);
                          }
                        Cell {
                            identity: cell.identity,
                            tolerance_x: new_tolerance,
                            intolerance_x: new_intolerance
                        }
                    }
                };

                next[idx] = next_cell;
            }
        }

        self.cells = next;
    }

    pub fn new() -> Universe {
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
                        tolerance_x: 0 
                    }
                }
                else if i % 5 == 0 || i % 11 == 0 {
                    Cell {
                        identity: Identity::A,
                        intolerance_x: 0,
                        tolerance_x: 1 
                    }
                }
                else if i % 13 == 0 || i % 17 == 0 {
                    Cell {
                        identity: Identity::A,
                        intolerance_x: 1,
                        tolerance_x: 0 
                    }
                } else {
                    Cell {
                        identity: Identity::A,
                        intolerance_x: 0,
                        tolerance_x: 0 
                    }
                }
            })
            .collect();


        let seed = 10;

        let seed1 = Seed::unsafe_new(seed);

        Universe {
            seeded_randomizer: Random::from_seed(seed1),
            i_virality: 2,
            t_virality: 1,
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

    pub fn cells(&self) -> *const Cell {
        self.cells.as_ptr()
    }

    pub fn render(&self) -> String {
        self.to_string()
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
