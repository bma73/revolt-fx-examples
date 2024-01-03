import * as PIXI from 'pixi.js';
import { FX } from '../../../../../../revolt-fx/lib';

const app = new PIXI.Application({ resizeTo: window });
document.body.appendChild(app.view);

const container = new PIXI.Container();
const debug = new PIXI.Graphics();
app.stage.addChild(container);
app.stage.addChild(debug);

app.stage.addChild(new PIXI.Text(`PixiJS ${PIXI.VERSION}`, { fill: 0xffffff }));

async function start() {

    // create an instance
    const fx = new FX();

    PIXI.Assets.add({ alias: 'fx_settings', src: 'assets/default-bundle.json' });
    PIXI.Assets.add({ alias: 'fx_spritesheet', src: 'assets/revoltfx-spritesheet.json' });
    PIXI.Assets.add({ alias: 'example_spritesheet', src: 'assets/rfx-examples.json' });

    const data = await PIXI.Assets.load(['fx_settings', 'fx_spritesheet', 'example_spritesheet']);

    fx.initBundle(data.fx_settings);

    const emitter = fx.getParticleEmitter('top-stone-splash');
    emitter.init(container);
    emitter.x = window.innerWidth * 0.5;
    emitter.y = window.innerHeight * 0.5;

    //Register for a particle spawned signal (event)
    emitter.on.particleSpawned.add((particle) => {
        drawDot(particle.x, particle.y, 20, 0x00ff00);

        //Register for an update signal for that particle
        particle.on.updated.add((particle) => {
            drawDot(particle.x, particle.y, 5, 0x00ff00);
        });

        //Register for a died signal for that particle
        particle.on.died.add((particle) => {
            drawDot(particle.x, particle.y, 15, 0xff0000);
        });
    });

    emitter.on.completed.addOnce((emitter) => {
        console.log('Done');
    });

    app.ticker.add((ticker) => {
        //Update the RevoltFX instance
        fx.update(ticker.delta);
    });
}

function drawDot(x, y, size, color) {
    debug.beginFill(color, 0.2).drawCircle(x, y, size).endFill();
}

start();

