# Pendências

## Assets (pasta `assets/`)
Os que faltam são desenhados em código (versão vetorial no estilo do spec), por decisão sua: "faça via código o shape da Dadá".
Quando um PNG com o nome abaixo for colocado na pasta, `npm run sync` o detecta e ele substitui o desenho automaticamente.

- `personagens/dada-folha.png`: o arquivo atual é um **print de tela** do Flow (548x260, com o rótulo "Stylized character poses sheet" embaixo). Serve de referência visual, mas não como asset recortado. Exporte o PNG original da folha, com fundo transparente.
- Faltam todos os demais PNGs:
  - personagens: `mae-bracos-cruzados.png`, `medica-prancheta.png`, `figurante.png`, `dada-adulta-bike.png`
  - cenários: `rua.png`, `quarto-bebe.png`, `cozinha.png`, `consultorio.png`, `laboratorio.png`
  - conceituais: `rede-nervosa.png`, `neuronio.png`, `comporta-aceso.png`, `comporta-apagado.png`, `dna.png`, `raio-x-pe.png`, `olho.png`, `comprimido.png`, `xicara.png`, `panela.png`, `bicicleta.png`

## Texto e áudio
- Cena 20: o PDF escreve "islandes"; a legenda e a narração usam "islandês".
- Narração provisória (edge-tts, Antonio). Você vai regravar no ElevenLabs: depois disso, rodar `scripts/legendas.py` e recalcular `src/tempos.json`.
- Durações: o vídeo usa os tempos medidos (4:27), não os 4:58 do spec.
