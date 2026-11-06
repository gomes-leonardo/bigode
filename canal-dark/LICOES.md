# Lições aprendidas — vídeo "11 de setembro" (v1 → v3)

O que deu errado e como foi resolvido, para os próximos vídeos.

## Ambiente
- **O navegador do Remotion não baixava** (`getaddrinfo ENOTFOUND remotion.media`). O download feito pelo Node não passava pelo proxy da sessão.
  Solução: `NODE_USE_ENV_PROXY=1 npx remotion browser ensure` (uma vez). Depois disso, o render usa o navegador oficial do Remotion.
- **O faster-whisper não baixava o modelo.** O Hugging Face serve os arquivos por `cas-server.xethub.hf.co` e `us.aws.cdn.hf.co`, que precisaram ser liberados no ambiente, além de `huggingface.co`.
- **O faster-whisper quebrava ao abrir o áudio** (`open() got an unexpected keyword argument 'metadata_errors'`): a versão do PyAV é incompatível.
  Solução: decodificar com ffmpeg para um array float32 de 16 kHz e passar o array ao `transcribe` (ver `scripts/transcrever.py` e `scripts/timestamps.py`).

## Áudio
- **A narração veio em 2 arquivos, não em 1 por bloco.** `scripts/dividir_blocos.py` corta no meio do silêncio entre blocos, usando os tempos de palavra do Whisper.
- **8 dos 9 blocos saíram mudos.** Com `-ss`/`-to` de saída no ffmpeg, o `afade` usava o tempo do arquivo original, e o fade-out caía antes do trecho.
  Solução: cortar com `atrim=a:b,asetpts=PTS-STARTPTS` dentro do filtro. **Sempre confira o `max_volume` de cada bloco.**
- **A saturação muda a loudness.** A primeira passada deu −14,9 LUFS em vez de −14. Agora o script ajusta o ganho em até 3 passadas.
- **O mix da v1 clipava** (−11,1 LUFS, pico +0,3 dBFS). A voz mono a −14 LUFS soa +3 LU quando vira estéreo, e o drone e os efeitos somam por cima.
  Solução: um ganho geral `MIX = 0.7` em todos os `<Audio>`. A v3 ficou em −14,2 LUFS, pico −2,0 dBFS.
  Para conferir: `ffmpeg -i out/X.mp4 -vn -af ebur128=peak=true -f null -`.
- **O Whisper erra palavras** ("pédio", "foi em míssil", "jatos de um poeira"). As correções ficam em `scripts/blocos_<video>.json` → `correcoes`. Revise a lista impressa pelo `timestamps.py` antes de renderizar.
- **O narrador pode mudar o texto do roteiro.** A legenda segue o que foi falado (Whisper), não o roteiro escrito.
- **Respiro:** com 9 blocos, +0,3 s em cada um passaria de 90 s. Os blocos já incluem metade da pausa natural de cada lado, então `respiro_s = 0` neste vídeo.

## SVG / animação
- **`clipPath` e `transform` no mesmo `<g>`: o recorte anda junto com o objeto.**
  Isso aconteceu no prédio que desaba (não "afundava" no chão) e no documento saindo da pasta (o papel aparecia cortado e solto).
  Regra: o `<g clipPath>` fica parado por fora; o `<g transform>` vai dentro dele.
- **Texto SVG dentro de caixa vazava** (CLASSIFIED, tradução do memorando). Use `textLength` + `lengthAdjust="spacingAndGlyphs"`, ou quebre em linhas menores.
- **Gradiente de sombra invertido.** A cena do gráfico ficou escura porque a sombra estava no gráfico, não no homem de terno. Confira a direção dos `stop` no still.
- **Ao subir o boneco, suba o chão junto.** Os pés ficaram "abaixo do chão" e entraram na legenda.

## Legenda
- **Mostrar só as palavras já faladas fazia a frase "pular"** (palavra solta à esquerda, depois centralizada).
  Estilo karaokê resolveu: a página inteira aparece a 32% de opacidade e cada palavra acende ao ser falada. O layout não muda.
- **A troca de página antecipada em 60 ms caía antes do corte** (o Whisper põe a 1ª palavra do bloco em 0 ms). A frase nova aparecia sobre a cena anterior. Agora a troca não antecipa.
- **Expressões destacadas não podem quebrar entre páginas** ("nenhum avião"): `paginar` mantém pares `destaque` juntos.

## Composição / clareza (vindo da revisão às cegas)
- **O espectador não sabe qual é o "terceiro prédio"** se ele muda de forma entre cenas. Use a mesma proporção e a etiqueta "PRÉDIO 7" nas duas cenas, com as torres ao fundo para situar.
- **Um quadro "vazio" depois de um colapso parece erro.** Pare o colapso em ~70%, deixe escombros e mantenha a nuvem de poeira acima da faixa da legenda.
- **Contraplongée muito forte parece "prédio torto".** Afinamento de 0,22 e rotação de ±1° leem melhor que 0,42 e ±2°.
- **Faixas proibidas:**
  - nada importante nos 250 px de baixo nem nos 150 px da direita (bonecos, gráfico, míssil entrando);
  - nada nos ~100 px do topo (rótulos subiam ali com o pan da câmera).
- **Zoom final + punch** pode estourar objetos largos para fora da tela. Na cena final, zoom de 1,08 basta.
- **Texto em inglês no documento precisa de tradução** visível e dentro do papel.

## Processo
- **Folha de contato com 1º/meio/último quadro por cena** (`scripts/stills.py`) antes de cada render completo pega a maioria dos erros em ~25 s.
- **A revisão às cegas** (subagente que só vê stills do MP4 final) achou problemas que eu não vi, porque eu sabia a história. Rodar duas rodadas, v1 e v2, valeu a pena.
- **O render completo leva ~4 min** (2.693 quadros, 4 núcleos). O MP4 sai com ~210 MB por causa do grão; para o celular, gere a cópia "-leve" (CRF 25, ~24 MB).
