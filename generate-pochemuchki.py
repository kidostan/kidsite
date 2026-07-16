import requests
import time
import os
from PIL import Image

SWARM = "http://127.0.0.1:7801"
OUTPUT_DIR = "Z:/KIDSITE/public/images/pochemuchki"
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

stories = [
    ("pochemu-babochki-krasivye",
     "(Toon (style)), (gentle watercolor children's book illustration), warm painterly brushstrokes, 4k\n\n"
     "(A群 of colorful butterflies with iridescent wings fluttering over a sunny meadow) "
     "Bright blue morpho, orange monarch, yellow swallowtail, purple emperor. "
     "A little girl with a butterfly net stands in the grass, mouth open in wonder. "
     "Wildflowers — daisies, poppies, cornflowers. "
     "Golden morning sunlight, dewdrops on petals. "
     "Magical, joyful atmosphere, soft warm colors."),

    ("pochemu-belka-zapasayet-orekhi",
     "(Toon (style)), (cozy fairy tale watercolor illustration), warm gouache brushstrokes, 4k\n\n"
     "(A cute red squirrel with fluffy tail hiding acorns under an old oak tree) "
     "The squirrel stuffs nuts into a hollow in the tree trunk. "
     "A pile of acorns and hazelnuts on the ground nearby. "
     "Autumn forest with golden and orange leaves falling. "
     "Warm afternoon sunlight filtering through branches. "
     "Cozy, industrious atmosphere, warm autumn colors."),
]

print(f"\n=== Generating {len(stories)} pochemuchki covers ===\n")

for slug, prompt in stories:
    print(f"[{slug}] Generating...")

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
