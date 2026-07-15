import requests
import time
import os
from PIL import Image

SWARM = "http://127.0.0.1:7801"
OUTPUT_DIR = "Z:/KIDSITE/public/images/inline"
os.makedirs(OUTPUT_DIR, exist_ok=True)

sess = requests.post(f"{SWARM}/API/GetNewSession", json={}, timeout=10).json()
session_id = sess["session_id"]
print(f"Session: {session_id}")

NEG = ("text, letters, captions, title, logo, watermark, signature, frame, border, "
       "comic panels, collage, split screen, modern clothes, modern objects, cars, "
       "electricity, plastic objects, anime, manga, Disney style, Pixar style, "
       "3D render, CGI, glossy digital art, photorealistic photography, horror, "
       "gore, blood, wounds, frightening face, deformed anatomy, malformed hands, "
       "extra fingers, missing fingers, fused fingers, extra arms, extra legs, "
       "duplicate character, cloned face, multiple heads, crossed eyes, distorted face, "
       "unnatural pose, floating objects, cropped head, cropped hands, "
       "characters cut off by the frame, chaotic composition, empty background, "
       "oversaturated colors, neon colors, excessive glow, blurry, low resolution, "
       "pixelated, noisy, jpeg artifacts, nsfw, nude")

scenes = [
    ("kurochka-ryaba-p1", 1,
     "(Toon (style)), (gouache and watercolor children's book illustration), warm painterly brushstrokes, 4k\n\n"
     "(A kind old Russian grandfather with a white beard and a grandmother in a headscarf sitting in a cozy wooden izba) "
     "(a small fluffy red chicken with a bright red comb sitting on a bench beside them) "
     "(warm candlelight, wooden interior with carved window frames, children's fairy tale illustration)"),
    ("kurochka-ryaba-p2", 2,
     "(Toon (style)), (gouache and watercolor children's book illustration), warm painterly brushstrokes, 4k\n\n"
     "(A small fluffy red chicken proudly sitting on a nest) "
     "(a glowing golden egg with magical sparkles and warm golden light emanating from it) "
     "(barn interior with hay, warm tones, children's fairy tale illustration)"),
    ("kurochka-ryaba-p3", 3,
     "(Toon (style)), (gouache and watercolor children's book illustration), warm painterly brushstrokes, 4k\n\n"
     "(A small fluffy red chicken with a shocked expression) "
     "(a golden egg falling and breaking on a wooden floor, golden yolk spreading) "
     "(comedic moment, warm barn interior, children's fairy tale illustration)"),
    ("kurochka-ryaba-p4", 4,
     "(Toon (style)), (gouache and watercolor children's book illustration), warm painterly brushstrokes, 4k\n\n"
     "(A kind old Russian grandfather and grandmother crying together with tears streaming) "
     "(sitting in a cozy wooden izba, sad atmosphere) "
     "(broken golden egg pieces visible on the floor, muted warm colors, children's fairy tale illustration)"),
    ("kurochka-ryaba-p5", 5,
     "(Toon (style)), (gouache and watercolor children's book illustration), warm painterly brushstrokes, 4k\n\n"
     "(A small fluffy red chicken standing tall, looking determined and confident) "
     "(comforting a crying old couple, the grandfather and grandmother wiping their tears) "
     "(warm cozy Russian izba interior, warm colors, children's fairy tale illustration)"),
    ("kurochka-ryaba-p6", 6,
     "(Toon (style)), (gouache and watercolor children's book illustration), warm painterly brushstrokes, 4k\n\n"
     "(A small cute mouse with a long tail running past a white egg on a wooden floor) "
     "(the egg cracking and breaking) "
     "(confused old grandfather and grandmother in the background, comedic scene, children's fairy tale illustration)"),
    ("kurochka-ryaba-p7", 7,
     "(Toon (style)), (gouache and watercolor children's book illustration), warm painterly brushstrokes, 4k\n\n"
     "(A kind old Russian grandfather and grandmother crying again with tears) "
     "(a small fluffy red chicken standing tall and speaking to them with confidence) "
     "(cozy wooden izba interior, warm colors, children's fairy tale illustration)"),
    ("kurochka-ryaba-p8", 8,
     "(Toon (style)), (gouache and watercolor children's book illustration), warm painterly brushstrokes, 4k\n\n"
     "(A small fluffy red chicken proudly presenting a beautiful shiny egg to a happy old couple) "
     "(rainbow light around the egg, everyone smiling and joyful) "
     "(cozy Russian izba interior, bright warm colors, children's fairy tale illustration)"),
]

print(f"\n=== Generating {len(scenes)} inline images for Курочка Ряба ===\n")

for slug, para_idx, prompt in scenes:
    print(f"[{para_idx}/{len(scenes)}] {slug}...")

    payload = {
        "session_id": session_id,
        "images": 1,
        "prompt": prompt,
        "negativeprompt": NEG,
        "model": "flux2Klein9bFp8_fp8.safetensors",
        "width": 1024,
        "height": 768,
        "steps": 30,
        "cfgscale": 7.5,
        "seed": -1,
        "sampler": "euler_ancestral",
        "scheduler": "normal"
    }

    try:
        r = requests.post(f"{SWARM}/API/GenerateText2Image", json=payload, timeout=300)
        data = r.json()

        if "images" in data and len(data["images"]) > 0:
            img_path = data["images"][0]
            img_data = requests.get(f"{SWARM}/{img_path}", timeout=30).content

            png_path = os.path.join(OUTPUT_DIR, f"{slug}.png")
            with open(png_path, "wb") as f:
                f.write(img_data)

            img = Image.open(png_path)
            webp_path = os.path.join(OUTPUT_DIR, f"{slug}.webp")
            img.save(webp_path, "WEBP", quality=80, method=6)
            os.remove(png_path)

            webp_size = os.path.getsize(webp_path)
            print(f"  OK: {slug}.webp ({webp_size // 1024} KB)")
        else:
            print(f"  ERROR: {data}")
    except Exception as e:
        print(f"  EXCEPTION: {e}")

    time.sleep(1)

print("\n=== Done! ===")
