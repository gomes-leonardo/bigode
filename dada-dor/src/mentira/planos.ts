import type React from "react";
import { CAP1 } from "./cap1";
import { CAP2 } from "./cap2";
import { CAP3 } from "./cap3";
import { CAP4 } from "./cap4";
import { CAP5 } from "./cap5";
import { CAP6 } from "./cap6";
import { CAP7 } from "./cap7";
import { CAP8 } from "./cap8";

export const CAPS: Record<string, React.FC> = { ...CAP1, ...CAP2, ...CAP3, ...CAP4, ...CAP5, ...CAP6, ...CAP7, ...CAP8 };
