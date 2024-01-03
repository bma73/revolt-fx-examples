import * as PIXI from 'pixi.js';
import { FX, EffectSequenceComponentType } from '../../../../../../revolt-fx/lib';

async function start() {

    const app = new PIXI.Application();
    await app.init({ resizeTo: window });
    document.body.appendChild(app.canvas);

    app.stage.addChild(new PIXI.Text({ text: PIXI.VERSION, style: { fill: 0xffffff } }));

    const container = new PIXI.Container();
    const debug = new PIXI.Graphics();
    app.stage.addChild(container);
    app.stage.addChild(debug);

    // create an instance
    const fx = new FX();

    PIXI.Assets.add({ alias: 'fx_settings', src: 'assets/default-bundle.json' });
    PIXI.Assets.add({ alias: 'fx_spritesheet', src: 'assets/revoltfx-spritesheet.json' });
    PIXI.Assets.add({ alias: 'example_spritesheet', src: 'assets/rfx-examples.json' });

    const data = await PIXI.Assets.load(['fx_settings', 'fx_spritesheet', 'example_spritesheet']);

    fx.initBundle(data.fx_settings);

    const sequence = fx.getEffectSequence('side-gold-loot');
    sequence.init(container);
    sequence.x = window.innerWidth * 0.5;
    sequence.y = window.innerHeight * 0.5;

    sequence.on.effectSpawned.add((type, effect) => {
        if (type === EffectSequenceComponentType.Emitter && effect.name === 'side-gold-loot') {

            //Register for a particle spawned signal (event)
            effect.on.particleSpawned.add(function (particle) {
                drawDot(particle.x, particle.y, 20, 0x00ff00);

                //Register for an update signal for that particle
                particle.on.updated.add(function (particle) {
                    drawDot(particle.x, particle.y, 5, 0x00ff00);
                });

                //Register for a died signal for that particle
                particle.on.died.add(function (particle) {
                    drawDot(particle.x, particle.y, 15, 0xff0000);
                });
            });

            sequence.on.triggerActivated.add((triggerValue) => {
                console.log(triggerValue);
            });
        }
    });

    app.ticker.add((ticker) => {
        //Update the RevoltFX instance
        fx.update(ticker.delta);
    });

    function drawDot(x, y, size, color) {
        console.log('Draw dot', x, y, size, color);
        debug.circle(x, y, size);
    }
}

start();

