"""Configuração de render: EEVEE, film transparente, PNG RGBA, 1920x1080, 30 fps."""
import bpy


def configurar(saida, amostras=32, resolucao=(1920, 1080), percentual=100):
    s = bpy.context.scene
    s.render.engine = "BLENDER_EEVEE"
    s.render.resolution_x, s.render.resolution_y = resolucao
    s.render.resolution_percentage = percentual
    s.render.fps = 30
    s.render.film_transparent = True
    s.render.image_settings.file_format = "PNG"
    s.render.image_settings.color_mode = "RGBA"
    s.render.image_settings.color_depth = "8"
    s.view_settings.view_transform = "Standard"  # cores da paleta sem o "lavado" do AgX/Filmic
    s.eevee.taa_render_samples = amostras
    s.render.filepath = saida
    return s


def render_quadro(caminho):
    bpy.context.scene.render.filepath = caminho
    bpy.ops.render.render(write_still=True)
