import { main } from "./main";

import publishedPackage from "popperdoxPublished";
import localPackage from "popperdoxLocal";
const wasmPopperdox =
  process.env.NODE_ENV == "prod" ? publishedPackage : localPackage;

main(wasmPopperdox as any);
