import * as PIXI from 'pixi.js';
import { FX } from '../../../../../../revolt-fx';


async function start() {

    const app = new PIXI.Application();
    await app.init({ resizeTo: window });
    document.body.appendChild(app.canvas);

    app.stage.addChild(new PIXI.Text({ text: `PixiJS ${PIXI.VERSION}`, style: { fill: 0xffffff } }));

    // create an instance
    const fx = new FX();

    const rfxBundleSettings = 'assets/default-bundle.json';
    const rfxSpritesheet = 'assets/revoltfx-spritesheet.json';
    const additionalAssets = ['assets/rfx-examples.json'];

    const data = await fx.loadBundleFiles(rfxBundleSettings, rfxSpritesheet, null, additionalAssets);

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

