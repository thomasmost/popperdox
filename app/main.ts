import publishedPackage from "popperdoxPublished";
import { SimulationVariant, simulate } from "./simulation";

export async function main(wasmPopperdox: typeof publishedPackage) {
  const { Universe, UniverseConfig, Identity } =
    (await (wasmPopperdox as any)) as typeof wasmPopperdox;
  const SimulationOne = document.getElementById("simulation-one");
  const SimulationTwo = document.getElementById("simulation-two");
  const SimulationThree = document.getElementById("simulation-three");

  simulate(
    SimulationOne,
    SimulationVariant.Basic,
    UniverseConfig,
    Universe,
    "simulation-one",
  );
  simulate(
    SimulationTwo,
    SimulationVariant.WithSwapping,
    UniverseConfig,
    Universe,
    "simulation-two",
  );
  simulate(
    SimulationThree,
    SimulationVariant.WithPoppersIntolerance,
    UniverseConfig,
    Universe,
    "simulation-three",
  );
}
