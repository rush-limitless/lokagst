import type { getBauxActifs } from "./index";

export type BailComplet = Awaited<ReturnType<typeof getBauxActifs>>[number];
