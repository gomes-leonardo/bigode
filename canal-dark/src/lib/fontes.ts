import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { FONTE } from "../theme";

export const fontesCarregadas = Promise.all([
  loadFont({
    family: FONTE,
    url: staticFile("fonts/montserrat-latin-800-normal.woff2"),
    weight: "800",
  }),
  loadFont({
    family: FONTE,
    url: staticFile("fonts/montserrat-latin-900-normal.woff2"),
    weight: "900",
  }),
]);
