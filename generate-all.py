import requests
import os
import time
import json

SWARM = "http://127.0.0.1:7801"
OUTPUT_DIR = "Z:/KIDSITE/public/images"
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

# (slug, prompt, negative_add)
STORIES = [
    ("kolobok",
     "(Toon (style)), (gouache and watercolor children's book illustration), warm painterly brushstrokes, 4k\n\n"
     "(A small round golden bun with a cheerful smiling face, two dot eyes and a wide curved smile) "
     "rolling along a dirt path through a Russian birch forest. "
     "Behind: an old wooden izba with carved window frames. "
     "An elderly man and woman at the doorway watching. "
     "Wildflowers, red fly agaric mushrooms near a stump. "
     "Late morning, soft golden sunlight. Warm colors.",
     ""),

    ("repka",
     "(Toon (style)), (watercolor and gouache fairy tale illustration), soft textures, warm light, 4k\n\n"
     "(A huge golden turnip pulled halfway out of dark soil in a village garden). "
     "An old man pulls by green leaves, leaning back. "
     "Behind him: old woman holds his belt, girl holds her skirt, "
     "dog holds girl's dress, cat holds dog's tail, tiny mouse holds cat's tail. "
     "Diagonal chain of characters, all pulling with effort. "
     "Wooden fence, vegetable beds, izba in background. Bright sunny day.",
     ""),

    ("teremok",
     "(Toon (style)), (fairy tale book illustration, gouache and watercolor), warm colors, 4k\n\n"
     "(A small ornate wooden teremok on two large chicken legs in a forest clearing). "
     "Carved wooden walls, pointed roof, round windows with warm golden light. "
     "A small brown mouse stands on hind legs looking up at the door. "
     "Birch and pine trees, stream with small wooden bridge, wildflowers, mushrooms. "
     "Evening light, long soft shadows, fireflies.",
     ""),

    ("kurochka-ryaba",
     "(Toon (style)), (gentle watercolor children's book illustration), soft warm colors, 4k\n\n"
     "(A small fluffy hen with red comb sitting on a nest) "
     "with a shining golden egg. "
     "An old man and old woman look at the egg with wonder. "
     "Simple wooden izba interior, warm light. "
     "The golden egg glows softly. Cozy, tender atmosphere.",
     ""),

    ("gusi-lebedi",
     "(Toon (style)), (storybook illustration, gouache and watercolor), rich colors, 4k\n\n"
     "(A little girl Alenushka and her brother Vasily running through a magical forest) "
     "fleeing from white geese flying overhead. "
     "Dense green forest, sunlit clearing, winding path. "
     "A small izba with carved decorations visible in the distance. "
     "Dynamic movement, wind in the trees, dramatic light.",
     ""),

    ("masha-i-medved",
     "(Toon (style)), (warm fairy tale watercolor illustration), painterly style, 4k\n\n"
     "(A tiny girl Masha hiding inside a wooden bucket on a table) "
     "while a big brown bear looks around the izba confused. "
     "The bear scratches his head. Cozy izba interior withRussian stove. "
     "Playful, humorous atmosphere, warm lighting.",
     ""),

    ("volk-i-kozlyata",
     "(Toon (style)), (children's book watercolor illustration), soft brushstrokes, warm tones, 4k\n\n"
     "(A mother goat with seven little kids behind a wooden door) "
     "peeking through the keyhole at a grey wolf outside. "
     "The wolf knocks on the door with his paw. "
     "Village yard, birch trees, sunny day. Tense but playful mood.",
     ""),

    ("tri-medvedya",
     "(Toon (style)), (fairy tale gouache illustration), warm colors, soft light, 4k\n\n"
     "(A little girl Masha sitting at a small table with three bowls of porridge) "
     "in a cozy forest cabin. Three bears — papa, mama, and baby — "
     "peek through the doorway looking surprised. "
     "Three chairs, three beds. Warm cabin interior, forest visible through window.",
     ""),

    ("carevna-lyagushka",
     "(Toon (style)), (richly colored fairy tale illustration), gouache and watercolor, 4k\n\n"
     "(A green frog in a royal dress sitting at a banquet table) "
     "with Ivan Tsarevich. Grand medieval hall with candles and food. "
     "Other guests stare in amazement. "
     "Magical warm lighting, golden details.",
     ""),

    ("letuchiy-korabl",
     "(Toon (style)), (epic fairy tale watercolor illustration), dramatic colors, 4k\n\n"
     "(A wooden ship flying through a starry sky) "
     "with Ivan Tsarevich standing at the bow. "
     "Below: dark forest and rivers under moonlight. "
     "Magical glowing sails, wind in hair. Adventure, wonder.",
     ""),

    ("rybak-i-rybka",
     "(Toon (style)), (moody watercolor fairy tale illustration), blue and gold tones, 4k\n\n"
     "(An old fisherman standing at the edge of a blue sea) "
     "holding a golden fish in his hands. "
     "The fish speaks to him with glowing mouth. "
     "Waves, dramatic sky, sunset colors on horizon. "
     "Tender, magical moment.",
     ""),

    ("skazka-o-care-saltane",
     "(Toon (style)), (grand fairy tale illustration), gouache, rich colors, 4k\n\n"
     "(A magical island with a white-stone city and golden domes) "
     "rising from the sea. A beautiful swan-queen flies above. "
     "Ships approach the island. "
     "Sparkling water, dramatic sky, fairy-tale architecture.",
     ""),

    ("skazka-o-myortvoy-carevne",
     "(Toon (style)), (ethereal fairy tale illustration), soft watercolor, 4k\n\n"
     "(A beautiful sleeping princess in a glass coffin on a green hill) "
     "surrounded by seven grieving warriors in armor. "
     "Cherry blossoms falling, soft golden light. "
     "Bittersweet, magical atmosphere.",
     ""),

    ("skazka-o-zolotom-petushke",
     "(Toon (style)), (vibrant fairy tale illustration), gouache, warm colors, 4k\n\n"
     "(A shining golden rooster perched on top of a tall tower) "
     "crowing at dawn. Below: a medieval Russian city wakes up. "
     "Orange sunrise sky, red rooftops. "
     "Dramatic, heraldic composition.",
     ""),

    ("u-lukomorya-dub-zelenyy",
     "(Toon (style)), (magical fairy tale illustration), gouache, lush colors, 4k\n\n"
     "(A mighty green oak tree by the sea) "
     "with a golden chain wrapped around its trunk. "
     "A wise cat walks along the chain. "
     "Mermaids sit on branches, a witch's hut on chicken legs nearby. "
     "Magical night sky with stars, sea waves. Enchanting atmosphere.",
     ""),

    ("muha-cokotuha",
     "(Toon (style)), (bright cheerful children's book illustration), watercolor and gouache, vivid colors, whimsical, 4k\n\n"
     "(A tiny fly in a yellow polka-dot sundress) sits on a big green leaf in a sunny garden. "
     "(Big expressive eyes, small wings, happy smile, holding a tiny painted egg). "
     "A garden full of sunflowers, daisies, roses. "
     "(A friendly mouse in a waistcoat stands on a mushroom nearby, holding a tiny umbrella). "
     "Spider web between flower stems in the background. "
     "Dewdrops on petals, bright morning light. Playful, warm mood.",
     ""),

    ("moidodyr",
     "(Toon (style)), (funny children's book illustration), watercolor, bright colors, 4k\n\n"
     "(A little boy with a dirty face hiding under a bed) "
     "while an angry washstand with arms and legs chases him. "
     "The washstand has a faucet head and scrubbing brush hands. "
     "Bathroom with running water, soap bubbles everywhere. "
     "Humorous, lively scene.",
     ""),

    ("aybolit",
     "(Toon (style)), (warm children's book illustration), watercolor, soft colors, 4k\n\n"
     "(A kind doctor in a white coat with a stethoscope) "
     "bandaging the paw of a little hare in his cozy forest clinic. "
     "Other animals wait in line — a fox, a bear cub. "
     "Medical instruments, plants on windowsill. "
     "Warm, caring atmosphere.",
     ""),

    ("fedorino-gore",
     "(Toon (style)), (humorous fairy tale illustration), gouache, warm colors, 4k\n\n"
     "(A kitchen full of runaway dishes — plates, spoons, cups — marching out the door) "
     "while an old woman Fedora chases them in despair. "
     "The dishes have little legs and arms. "
     "Village house interior, chaotic, funny scene.",
     ""),

    ("tarakanische",     "(Toon (style)), (dramatic fairy tale illustration), gouache, bold colors, 4k\n\n"
     "(An enormous cockroach towering over tiny frightened animals — cat, dog, mouse) "
     "in a dark house. The cockroach is huge, wearing a crown. "
     "Animals cower in corners. "
     "Dark, dramatic lighting, but not scary for children.",
     ""),

    ("krokodil",     "(Toon (style)), (colorful children's book illustration), watercolor, bright, 4k\n\n"
     "(A big friendly green crocodile with children sitting on his wide back) "
     "swimming in a sunny river. "
     "Kids laughing, splashing water. "
     "Riverbank with willow trees, blue sky. "
     "Joyful, playful atmosphere.",
     ""),

    ("barmaley",     "(Toon (style)), (adventurous fairy tale illustration), gouache, vivid colors, 4k\n\n"
     "(A fearsome pirate with long beard and feathered hat on a black ship) "
     "surrounded by parrots and treasure. "
     "Dramatic ocean waves, stormy sky. "
     "Adventure atmosphere, not too scary.",
     ""),

    ("telefon",     "(Toon (style)), (playful children's book illustration), watercolor, bright colors, 4k\n\n"
     "(A little monkey in a polka-dot dress holding an old telephone receiver) "
     "surrounded by animal friends — bear, goat, rabbit, fox. "
     "Forest clearing, sunny day. "
     "Cheerful, musical atmosphere.",
     ""),

    ("gadkiy-utenok",     "(Toon (style)), (warm fairy tale watercolor illustration), soft brushstrokes, golden hour light, children's book art, 4k\n\n"
     "(A small grey fluffy duckling sits on the bank of a calm pond) "
     "staring at his reflection — (a beautiful white swan stares back at him from the water). "
     "Lily pads and white water lilies on the surface. "
     "Three elegant white swans glide in the background. "
     "Tall reeds, cattails, dragonflies, wildflowers along the shore. "
     "Amber sunset light reflecting on the water. Hopeful, bittersweet mood.",
     ""),

    ("princessa-na-goroshine",     "(Toon (style)), (elegant fairy tale illustration), watercolor, soft pastel colors, 4k\n\n"
     "(A beautiful princess sleeping on a tower of twenty mattresses) "
     "with a tiny green pea visible at the very bottom. "
     "Royal bedroom with silk curtains and golden details. "
     "Soft moonlight through the window. Magical, delicate.",
     ""),

    ("stoykiy-olovyannyy-soldatik",     "(Toon (style)), (delicate fairy tale illustration), watercolor, warm tones, 4k\n\n"
     "(A small tin soldier with one leg standing on a windowsill) "
     "gazing at a paper ballerina dancing on one toe nearby. "
     "City rooftops visible through the window. "
     "Evening light, candles, romantic atmosphere.",
     ""),

    ("krasnaya-shapochka",     "(Toon (style)), (storybook illustration, traditional gouache and watercolor), rich colors, soft textures, warm fairy-tale atmosphere, 4k\n\n"
     "(A little girl in a bright red hooded cape) walks along a sunlit forest path, "
     "(carrying a woven basket with pies). "
     "Rosy cheeks, curious eyes, innocent expression. "
     "Lush green birch and oak forest, golden sunlight through the canopy. "
     "Wildflowers — daisies, bluebells, red poppies — line the path. "
     "A curious rabbit peeks from behind mushrooms. "
     "Small cozy cottage with chimney smoke in the far distance. "
     "Warm, inviting, magical atmosphere.",
     ""),

    ("belosnezhka-i-sem-gnomov",     "(Toon (style)), (cozy fairy tale watercolor illustration), warm gouache brushstrokes, soft light, children's book art, 4k\n\n"
     "(A princess with snow-white skin and long black braids in a blue and yellow dress) "
     "sweeps the floor inside a tiny forest cottage. "
     "(Seven small chairs, seven tiny plates on a table, seven small beds in a row). "
     "Through the window: seven little gnomes with white beards and colorful pointed hats "
     "walk home along a forest path carrying pickaxes and lanterns. "
     "Pine forest, afternoon light, mushrooms and ferns. Cozy, cheerful mood.",
     ""),

    ("genzel-i-gretel",     "(Toon (style)), (enchanted fairy tale illustration), watercolor, vivid colors, 4k\n\n"
     "(A cottage made of gingerbread, candy, and chocolate in a dark forest) "
     "A boy and girl nibble at the candy walls. "
     "Colorful sweets, lollipops, frosting roof. "
     "Dark trees around but the cottage glows warmly. "
     "Magical, tempting atmosphere.",
     ""),

    ("rapuncel",     "(Toon (style)), (romantic fairy tale illustration), watercolor, golden tones, 4k\n\n"
     "(A girl with impossibly long golden hair streaming down from a tall stone tower) "
     "A prince at the base holds the hair like a rope. "
     "The tower is covered in ivy and wildflowers. "
     "Sunset sky, warm golden light. Magical, tender.",
     ""),

    ("rumpelshtilchen",     "(Toon (style)), (dramatic fairy tale illustration), gouache, bold colors, 4k\n\n"
     "(A tiny angry man with wild hair and pointy shoes) "
     "dancing around a campfire in a dark forest, "
     "shouting his name. "
     "Sparks flying, trees leaning in. Dramatic, magical atmosphere.",
     ""),

    ("zolushka",     "(Toon (style)), (magical fairy tale illustration), watercolor, sparkly golden tones, 4k\n\n"
     "(A beautiful girl in a shimmering blue ball gown dances with a prince) "
     "in a grand ballroom with chandeliers. "
     "A glass slipper lies on the marble stairs. "
     "Magic sparkles around them. Midnight clock visible. "
     "Romantic, enchanting atmosphere.",
     ""),

    ("spyaschaya-krasavica",     "(Toon (style)), (dreamy fairy tale illustration), soft watercolor, pink and gold tones, 4k\n\n"
     "(A beautiful princess sleeping peacefully on an ornate bed) "
     "surprised by roses and thorny vines growing around a medieval castle. "
     "A young prince kneels beside her. "
     "Soft golden light, dust motes floating. Romantic, magical.",
     ""),

    ("kot-v-sapogah",     "(Toon (style)), (children's fairy tale book illustration), gouache and watercolor, painterly brushstrokes, warm colors, 4k\n\n"
     "(AN ORANGE TABBY CAT WEARING TALL BROWN LEATHER BOOTS ON ALL FOUR PAWS) "
     "(BOOTS ARE THE MAIN FOCUS, clearly visible, detailed, prominent leather boots) "
     "(cat also wears a feathered cavalier hat and a wide leather belt with golden buckle) "
     "Cat carries a brown sack over one shoulder. "
     "(Cat stands proudly on a cobblestone path, one paw on hip, mischievous grin). "
     "Green countryside, golden wheat fields, distant castle on a hill. "
     "Bright sunny day, blue sky. "
     "NO HUMANS, NO PEOPLE, ONLY THE CAT.",
     ", no boots, naked paws, human, person, boy, man"),

    ("malchik-s-palchik",     "(Toon (style)), (tiny fairy tale illustration), watercolor, warm colors, 4k\n\n"
     "(An impossibly tiny boy the size of a thumb) standing on a giant flower petal, "
     "looking up at a normal-sized snail and mushroom nearby. "
     "The scale difference is dramatic. Garden with dewdrops, morning light. "
     "Whimsical, magical atmosphere.",
     ""),

    ("lisa-i-zayac",     "(Toon (style)), (russian folk tale illustration), gouache, earthy warm tones, 4k\n\n"
     "(A grey hare sitting proudly inside a cozy wooden hut) "
     "while a red fox stands outside the door looking angry. "
     "Simple village house, birch forest background. "
     "Humorous, folk atmosphere.",
     ""),

    ("kot-petuh-i-lisa",     "(Toon (style)), (humorous folk tale illustration), gouache, bright colors, 4k\n\n"
     "(A ginger cat with a stick chases a red fox through a forest) "
     "The fox carries a rooster in her mouth. "
     "Dynamic action scene, trees blurring past. "
     "Comedic, lively atmosphere.",
     ""),

    ("lyagushka-puteshestvennica",     "(Toon (style)), (whimsical fairy tale illustration), watercolor, vivid colors, 4k\n\n"
     "(A small green frog wearing a headscarf sits in a man's pocket) "
     "as he walks through a forest with a bear and wolf following. "
     "The frog points the way forward. "
     "Forest path, bright day. Adventurous, humorous.",
     ""),

    ("baba-yaga",     "(Toon (style)), (atmospheric fairy tale illustration), gouache, dark warm tones, 4k\n\n"
     "(A crooked old woman with bony legs in a mortar) "
     "flying over a dark forest, sweeping tracks with a broom. "
     "Below: a tiny izba on chicken legs with glowing windows. "
     "Full moon, dramatic clouds. Eerie but not terrifying.",
     ""),

    ("zhar-ptica",     "(Toon (style)), (luminous fairy tale illustration), watercolor, golden and blue tones, 4k\n\n"
     "(A radiant bird made of golden fire perched on a golden apple tree) "
     "Its feathers glow and shed sparks of light. "
     "A young man hides behind a bush watching in awe. "
     "Night garden, moonlight mixing with golden glow. Magical, breathtaking.",
     ""),

    ("alenkiy-cvetocek",     "(Toon (style)), (delicate fairy tale illustration), watercolor, soft pinks and greens, 4k\n\n"
     "(A beautiful girl emerging from a large red flower in a garden) "
     "An old man and woman look at her with wonder. "
     "Flowers blooming everywhere, butterflies, warm sunlight. "
     "Magical, tender moment of discovery.",
     ""),

    ("sivka-burka",     "(Toon (style)), (epic russian fairy tale illustration), gouache, bold colors, 4k\n\n"
     "(A magical horse with copper mane gallops through the air) "
     "with a young man on its back, chasing a golden apple across the sky. "
     "Clouds below, sun behind them. "
     "Dynamic, heroic, magical atmosphere.",
     ""),

    ("po-shchuchyu-veleniyu",     "(Toon (style)), (humorous fairy tale illustration), gouache, warm colors, 4k\n\n"
     "(A magical glowing pike fish speaking to a simple peasant man) "
     "at the edge of a river. "
     "The man holds the fish gently in his hands. "
     "River, reeds, sunset sky. Magical, gentle moment.",
     ""),

    ("snegurochka",     "(Toon (style)), (wistful fairy tale illustration), cool watercolor, blue and white tones, 4k\n\n"
     "(A delicate girl made of snow and ice) standing in a snowy forest, "
     "her body slightly transparent, glowing blue. "
     "Elderly couple watch from an izba doorway with concern. "
     "Winter wonderland, snowflakes, pale moonlight. Beautiful, bittersweet.",
     ""),

    ("kasha-iz-topora",     "(Toon (style)), (rustic fairy tale illustration), gouache, warm earthy tones, 4k\n\n"
     "(A soldier and a bear sitting at a table eating kasha from a huge pot) "
     "inside a cozy wooden izba. "
     "The soldier laughs, the bear eats greedily. "
     "Warm firelight, rustic interior. Comedic, friendly.",
     ""),

    ("kozla-dereza",     "(Toon (style)), (lively folk tale illustration), gouache, bright colors, 4k\n\n"
     "(A stubborn goat with big horns butting a wolf and a bear) "
     "sending them flying through the air. "
     "Forest clearing, chickens and dog watching in amazement. "
     "Comedic, energetic scene.",
     ""),

    ("zolotaya-antilopa",     "(Toon (style)), (glowing fairy tale illustration), watercolor, golden tones, 4k\n\n"
     "(A radiant golden antelope with shimmering horns) "
     "standing by a crystal-clear river in an enchanted forest. "
     "A young man reaches out to catch it. "
     "Magical sparkles, warm sunset, dreamlike atmosphere.",
     ""),

    ("umnaya-doca",     "(Toon (style)), (clever folk tale illustration), gouache, warm tones, 4k\n\n"
     "(A young peasant girl with clever eyes talks to a powerful old wizard) "
     "in a rustic kitchen. "
     "She stirs a pot of porridge while he looks confused. "
     "Warm domestic scene, humorous power dynamic.",
     ""),

    ("seraya-sheyka",     "(Toon (style)), (gentle folk tale illustration), watercolor, soft tones, 4k\n\n"
     "(A grey duckling transformation — half duck, half beautiful girl) "
     "emerging from a hollow tree trunk. "
     "A young man looks on in wonder. "
     "Forest clearing, magical light, flowers blooming. Tender, magical.",
     ""),

    ("vershki-i-coreski",     "(Toon (style)), (simple folk tale illustration), gouache, bright colors, 4k\n\n"
     "(A farmer holding a golden carrot with greens on top and roots below) "
     "arguing with a small green frog by a riverbank. "
     "River, reeds, sunny day. Humorous, simple charm.",
     ""),

    ("pop-i-balda",     "(Toon (style)), (humorous pushkin fairy tale illustration), gouache, vivid colors, 4k\n\n"
     "(A strong peasantBalda carrying a sack over his shoulder) "
     "walking past a nervous priest (pop) in front of a church. "
     "Village street, wooden houses. Comedic, folk atmosphere.",
     ""),

    ("bremenskie-muzykanty",     "(Toon (style)), (cheerful fairy tale illustration), watercolor, bright colors, 4k\n\n"
     "(Four animal musicians — donkey, dog, cat, rooster — playing instruments on a rooftop) "
     "at sunset. The donkey plays accordion, dog plays drums, cat plays fiddle, rooster sings. "
     "Medieval town below. Joyful, musical, triumphant.",
     ""),

    ("goluboy-schenok",     "(Toon (style)), (tender children's book illustration), watercolor, soft colors, 4k\n\n"
     "(A small blue puppy sitting in children's arms) "
     "being fed milk from a bottle. "
     "Three happy children surround the puppy in a cozy room. "
     "Warm, domestic, loving atmosphere.",
     ""),
]

# Check which already exist (skip if modified today after 23:00 = already regenerated with flux)
import datetime
existing = set()
cutoff = datetime.datetime(2026, 7, 11, 23, 0, 0)
for f in os.listdir(OUTPUT_DIR):
    if f.endswith("_v3.webp"):
        fpath = os.path.join(OUTPUT_DIR, f)
        mtime = datetime.datetime.fromtimestamp(os.path.getmtime(fpath))
        if mtime > cutoff:
            existing.add(f.replace("_v3.webp", ""))

to_generate = [(s, p, n) for s, p, n in STORIES if s not in existing]
print(f"\nAlready have: {len(existing)} images")
print(f"Need to generate: {len(to_generate)} images\n")

for i, (slug, prompt, neg_add) in enumerate(to_generate):
    print(f"[{i+1}/{len(to_generate)}] {slug}...")

    payload = {
        "session_id": session_id,
        "images": 1,
        "prompt": prompt,
        "negativeprompt": NEG + neg_add,
        "model": "flux2Klein9bFp8_fp8.safetensors",
        "width": 1024,
        "height": 1024,
        "steps": 30,
        "cfgscale": 7.5,
        "seed": -1,
        "sampler": "euler_ancestral",
        "scheduler": "normal"
    }

    r = requests.post(f"{SWARM}/API/GenerateText2Image", json=payload, timeout=300)
    data = r.json()

    if "images" in data and len(data["images"]) > 0:
        img_path = data["images"][0]
        img_data = requests.get(f"{SWARM}/{img_path}", timeout=30).content

        # Save PNG first
        png_path = os.path.join(OUTPUT_DIR, f"{slug}_v3.png")
        with open(png_path, "wb") as f:
            f.write(img_data)

        # Convert to WebP
        from PIL import Image
        img = Image.open(png_path)
        webp_path = os.path.join(OUTPUT_DIR, f"{slug}_v3.webp")
        img.save(webp_path, "WEBP", quality=80, method=6)

        # Delete PNG
        os.remove(png_path)

        webp_size = os.path.getsize(webp_path)
        print(f"  OK: {slug}_v3.webp ({webp_size // 1024} KB)")
    else:
        print(f"  ERROR: {data}")

    time.sleep(1)

print("\nAll done!")
