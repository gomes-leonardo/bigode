"""Paleta do brief (hex) e conversão para cor linear do Blender."""

PALETA = {
    "fundo": "#1A1333",
    "fundo2": "#241A4A",
    "menta": "#3FE0B0",
    "coral": "#FF6B5E",
    "rosa": "#F2719C",
    "amarelo": "#FFC94A",
    # derivadas: corpo do personagem (índigo bem escuro, nunca preto) e jaleco
    "indigo": "#1B1238",
    "branco": "#F4F1FA",
}


def linear(hexcor, alpha=1.0):
    """#RRGGBB (sRGB) -> RGBA linear, como o Blender espera nos materiais."""
    h = hexcor.lstrip("#")
    def canal(v):
        c = int(v, 16) / 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (canal(h[0:2]), canal(h[2:4]), canal(h[4:6]), alpha)
