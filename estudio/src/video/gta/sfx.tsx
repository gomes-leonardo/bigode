// Efeitos sonoros do vídeo dos códigos de GTA (em construção): teclas, materialização, silêncios, baque, HUD, cursor.
import React from "react";
import { BRANCO } from "./parte1";
/** quadros em que a tela fica em silêncio total (sem legenda) */
export const SILENCIO = (f: number) => f >= BRANCO.de && f < BRANCO.ate;
export const Efeitos: React.FC = () => null;
