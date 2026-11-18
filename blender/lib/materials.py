"""Shaders toon por emissão: dois tons no máximo, sem especular, sem roughness, sem reflexo.

Como funciona: Diffuse -> Shader to RGB -> ColorRamp CONSTANTE (2 tons) -> Emission.
A saída é emissão (cor chapada, não sombreada de forma realista), mas o limiar da rampa
ainda "enxerga" a luz de contorno: onde a rim light menta bate forte, o tom vira o segundo tom.
"""
import bpy

from .paleta import PALETA, linear


def toon(nome, base, contorno="menta", limiar=0.22):
    """Material de 2 tons: `base` no corpo, `contorno` onde a luz de contorno bate."""
    mat = bpy.data.materials.get(nome) or bpy.data.materials.new(nome)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    dif = nt.nodes.new("ShaderNodeBsdfDiffuse")
    rgb = nt.nodes.new("ShaderNodeShaderToRGB")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    emi = nt.nodes.new("ShaderNodeEmission")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    ramp.color_ramp.interpolation = "CONSTANT"
    e = ramp.color_ramp.elements
    e[0].position, e[0].color = 0.0, linear(PALETA.get(base, base))
    e[1].position, e[1].color = limiar, linear(PALETA.get(contorno, contorno))
    nt.links.new(dif.outputs["BSDF"], rgb.inputs["Shader"])
    nt.links.new(rgb.outputs["Color"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], emi.inputs["Color"])
    nt.links.new(emi.outputs["Emission"], out.inputs["Surface"])
    return mat


def emissao(nome, cor, forca=1.0, alpha=1.0):
    """Emissão pura (arcos de luz do rosto, elementos que brilham). Alpha permite o mood `none`."""
    mat = bpy.data.materials.get(nome) or bpy.data.materials.new(nome)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    emi = nt.nodes.new("ShaderNodeEmission")
    transp = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    emi.inputs["Color"].default_value = linear(PALETA.get(cor, cor))
    emi.inputs["Strength"].default_value = forca
    mix.inputs["Fac"].default_value = alpha  # 0 = invisível, 1 = aceso
    nt.links.new(transp.outputs["BSDF"], mix.inputs[1])
    nt.links.new(emi.outputs["Emission"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    mat.surface_render_method = "BLENDED"
    return mat
