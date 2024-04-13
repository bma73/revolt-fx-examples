import * as PIXI from 'pixi.js';
import { FX } from 'revolt-fx';


async function start() {

    const app = new PIXI.Application();
    await app.init({ resizeTo: window });
    document.body.appendChild(app.canvas);

    app.stage.addChild(new PIXI.Text({ text: `PixiJS ${PIXI.VERSION} RFX ${FX.version}`, style: { fill: 0xffffff } }));

    // create an instance
    const fx = new FX();

    PIXI.Assets.add({ alias: 'fx_settings', src: 'assets/default-bundle.json' });
    PIXI.Assets.add({ alias: 'fx_spritesheet', src: 'assets/revoltfx-spritesheet.json' });
    PIXI.Assets.add({ alias: 'example_spritesheet', src: 'assets/rfx-examples.json' });

    const data = await PIXI.Assets.load(['fx_settings', 'fx_spritesheet', 'example_spritesheet']);

    fx.initBundle(data.fx_settings);

    const content = new PIXI.Container();
    content.x = window.innerWidth * 0.5;
    content.y = window.innerHeight * 0.5;
    app.stage.addChild(content);

    const logo = PIXI.Sprite.from('logo');
    logo.anchor.set(0.5);
    logo.alpha = 0.6;
    content.addChild(logo);

    const emitter = fx.getParticleEmitter('plasma-corona');
    emitter.init(content, true, 1.9);

    app.ticker.add((ticker) => {
        //Update the RevoltFX instance
        fx.update(ticker.delta);
    });


}


start();

