import os
from PIL import Image

output_dir = r"e:\APP INVENTARIO\app restaurante\restaurante-web\google_play_assets"
os.makedirs(output_dir, exist_ok=True)

icon_path = r"C:\Users\carlos\.gemini\antigravity\brain\ff287c2a-88cf-4590-b8c8-a05e34971b12\zenvyra_app_icon_1776372164823.png"
sc1_path = r"C:\Users\carlos\.gemini\antigravity\brain\ff287c2a-88cf-4590-b8c8-a05e34971b12\smart_food_analysis_1776372180277.png"
sc2_path = r"C:\Users\carlos\.gemini\antigravity\brain\ff287c2a-88cf-4590-b8c8-a05e34971b12\custom_meal_plans_1776372196418.png"
sc3_path = r"C:\Users\carlos\.gemini\antigravity\brain\ff287c2a-88cf-4590-b8c8-a05e34971b12\safe_workout_routines_1776372210702.png"

print("Iniciando procesamiento de imágenes...")

try:
    with Image.open(icon_path) as img:
        icon = img.resize((512, 512), Image.Resampling.LANCZOS)
        icon.save(os.path.join(output_dir, "1_app_icon_512x512.png"))
    print("Icono procesado.")
except Exception as e:
    print(f"Error icono: {e}")

def create_screenshot(path, name):
    try:
        with Image.open(path) as img:
            w, h = img.size
            target_w = int(h * 9 / 16)
            left = (w - target_w) / 2
            right = left + target_w
            img_cropped = img.crop((left, 0, right, h))
            img_resized = img_cropped.resize((1080, 1920), Image.Resampling.LANCZOS)
            img_resized.save(os.path.join(output_dir, name))
            print(f"Captura {name} procesada.")
    except Exception as e:
        print(f"Error captura {name}: {e}")

create_screenshot(sc1_path, "2_screenshot_comida_1080x1920.png")
create_screenshot(sc2_path, "3_screenshot_planes_1080x1920.png")
create_screenshot(sc3_path, "4_screenshot_ejercicio_1080x1920.png")

try:
    with Image.open(sc2_path) as img:
        w, h = img.size
        target_h = int(w * 500 / 1024)
        top = (h - target_h) / 2
        bottom = top + target_h
        img_cropped = img.crop((0, top, w, bottom))
        img_resized = img_cropped.resize((1024, 500), Image.Resampling.LANCZOS)
        img_resized.save(os.path.join(output_dir, "5_feature_graphic_1024x500.png"))
        print("Feature Graphic procesado.")
except Exception as e:
    print(f"Error Feature Graphic: {e}")

print("Completado.")
