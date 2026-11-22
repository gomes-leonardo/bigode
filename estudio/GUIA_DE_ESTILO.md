# Guia de estilo do estúdio

Estúdio de animação 2D 100% em código: Remotion (React + SVG), 1920x1080, 30 fps.
Nada de imagem gerada por IA: personagens, cenários e objetos são SVG desenhados e parametrizados em código.
Todo o trabalho fica nesta pasta (`estudio/`). Cada fase para no fim e espera aprovação.

## Roteiro
- O texto do roteiro é sagrado: nenhuma fala é mudada, cortada ou reordenada.
- A encenação segue a descrição do roteiro. Qualquer acréscimo ou mudança de encenação é avisado antes da entrega, nunca escondido.
- Referência: o roteiro original fica salvo em `roteiros/`, palavra por palavra.

## Estilo geral
- Traço preto grosso: `#141414`, 7 px no contorno, 4 a 5 px nas linhas internas (dobras, bainhas).
- Sombra de papel: toda forma tem uma cópia `#D6D2CA` deslocada 5 px à direita e 6 px para baixo, atrás dela (componente `<Papel>`).
- Pele branca com contorno preto. Roupas em cores chapadas, cada cor com uma versão 25% mais escura para dobras e bainhas.
- Fundo creme `#EAE6DE` com granulado leve por cima (pontinhos pretos e brancos, opacidade de 3 a 7%).
- Nada pode parecer robô: sem membro reto com cotovelo de boneco, sem tronco quadrado, sem simetria perfeita, sem orelhas.

## Personagem (`src/components/Person.tsx`)
- Chão em y = 0, escala 1. Cabeça: elipse rx 84, ry 82, centro em y = -330, escala 0.92; reflexo da careca em arco cinza fino, 30%.
- Pescoço: trapézio branco de y = -270 a -236, largura de 34 a 38.
- Tronco em feijão: `M -24 -246 C -52 -244 -68 -232 -66 -206 C -64 -178 -58 -156 -54 -134 Q 0 -122 54 -134 C 58 -156 64 -178 66 -206 C 68 -232 52 -244 24 -246 Z`, gola em V suave branca e duas dobras curtas na cor escura.
- Cós da calça de y = -144 a -110, com costura central. Ombros em (±54, -224). Quadris em (±24, -112).
- Contrapposto: `hip` desnivela o quadril; o ombro inclina para o lado oposto (ombro = -hip × 1.4) e o tronco gira junto.
- Braços "mangueira": uma curva quadrática do ombro até o ALVO da mão, arqueada por `bend` (px, perpendicular ao meio do segmento). Pele com largura 20; nos primeiros 42% da curva, manga na cor da camiseta com largura 34 e linha de bainha. O braço afina até o pulso.
- Pernas: mesma técnica, do quadril até o pé, largura 38 na cor da calça, com vinco no joelho e barra.
- Tênis arredondado com bico, sola colorida e dois riscos de cadarço.
- Cada membro: stroke preto de (largura + 14) e por cima a cor, linecap round, sem emenda.
- A mão é posicionada por COORDENADA ALVO (`handL`, `handR`) e orientada pela tangente final da curva. Obrigatório: é o que faz ele pegar objetos com precisão.
- Mãos: `open` (luva: palma 19x16, polegar 7x11 inclinado, 3 riscos de dedo), `fist` (círculo r 17 com 3 curvas), `point` (punho com indicador em retângulo arredondado), `none` (mão no bolso, escondida).
- Sombra no chão: elipse preta 13% que encolhe quando ele sobe.
- Props: x, y, scale, expr, headTilt, lean, hip, handL, handR, bendL, bendR, gripL, gripR, footL, footR, kneeL, kneeR, lookAt, blink, outfit, propsBehind/propsFront.

## Rosto (`src/components/Face.tsx`)
- Sobrancelhas grossas (stroke 12, round) fazem a maior parte da atuação.
- Expressões: sigma (padrão), convencido, chocado, rindo, bravo, triste, olhar-lateral, nojo, neutro.
- Toda troca de expressão interpola os pontos (sobrancelha, pálpebra, boca) em 6 a 10 quadros. Nunca troca seca.
- Piscar automático a cada 3 a 5 s (2 quadros fechando, 3 abrindo). Os olhos viram para o `lookAt` 4 quadros antes da cabeça.

## Ações e manuseio de objetos (`src/rig/`, `src/objects/`)
- Ações: idle (respira, corpo 1.0 a 1.015, cabeça balança 1°), walk (pés por alvo, quadril sobe e desce, braços em contrafase), pocket, crossArms, shrug, point, wave, celebrate, scared, sit, fall, hug, lookAtPhone.
- Manuseio, sempre em 3 tempos:
  1. ALCANÇA: a mão `open` viaja até o ponto de pega por um arco, com antecipação de 3 quadros na direção contrária e spring com overshoot pequeno na chegada.
  2. PEGA: no quadro do contato vira `fist` e o punho é desenhado POR CIMA do objeto (a alça passa por baixo dos dedos). Squash de 2 quadros no punho.
  3. MOVE: o objeto vira filho da mão (posição e rotação). Braço e tronco acompanham o peso: objeto pesado = lean maior e movimento mais lento.
  - Soltar é o inverso: a mão abre e o objeto ganha gravidade ou fica apoiado onde caiu.
- Cada objeto tem um "ponto de pega" definido (alça da panela, asa da xícara, lateral do celular).

## Elenco
- O mesmo componente gera todos, só com parâmetros: hair (careca, curto, cacheado, coque, rabo, longo, laterais, bone), hairColor, glasses, mustache, beard, wide (1.0 a 1.25), scale (criança 0.62 com headScale 1.08), skirt, apron, coat. Ninguém tem orelha.
- Figurantes: combinação aleatória com semente fixa, scale 0.74, expressão neutra; só piscam e respiram.

## Cenários
- Componente em 3 camadas (fundo, meio, frente) para parallax, mesmo traço preto grosso com sombra de papel e cores chapadas suaves.
- Profundidade obrigatória: fundo com desfoque leve, luz direcional (polígono claro com baixa opacidade), vinheta e granulado.
- Cada cenário tem um `set.json` com ÂNCORAS (linha do chão, assento, tampo da mesa, boca do fogão, quina da cama, maca). O personagem é sempre posicionado por âncora, nunca por x,y solto, para nunca flutuar.

## Câmera, ritmo e regras dos vídeos
- Câmera: push-in lento (1.0 a 1.05 por cena), corte seco, zoom rápido de reação (1.0 a 1.15 em 6 quadros), parallax por camada.
- 3 a 4 eventos visuais a cada 8 s (pose, expressão, objeto ou câmera). Nenhum plano parado por mais de 3 s.
- Troca de plano só nas pausas da fala.
- Toda fala com verbo físico (bater, pisar, comer, pegar, cair) mostra o verbo na imagem.
