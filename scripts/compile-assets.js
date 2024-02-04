import sharp from 'sharp';

/*
This is a helper to automatically make the left facing 
frames from a right only source spritesheet. This is because
reflecting is quite annoying to be honest
*/

const src = './assets/cowboy-raw.png';
const targetDir = './public/sprites/';

const FRAME_SIZE = 16;
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

const mirrorCowboy = async () => {
  const original = sharp(src);
  const meta = await original.metadata();
  const rows = meta.height / 16;
  const cols = meta.width / 16;

  // create a target from original and extend it
  const target = original.clone().extend({ bottom: meta.height, background: TRANSPARENT });

  const composites = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const top = row * FRAME_SIZE;
      const left = col * FRAME_SIZE;
      const spriteBuff = await original.clone().extract({ top, left, width: FRAME_SIZE, height: FRAME_SIZE }).flop().toBuffer();
      composites.push({ input: spriteBuff, left, top: top + meta.height });
    }
  }
  //TODO: write for each desired color
  await target.composite(composites).toFile(targetDir + 'cowboy.png');
};

mirrorCowboy();
