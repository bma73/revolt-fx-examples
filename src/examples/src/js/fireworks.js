import * as PIXI from 'pixi.js';
import Random from './random';

export default class Fireworks {
    constructor() {
        this.info = 'Fireworks - Click to launch rocket';
    }

    start(main) {
        this.main = main

        const container = this.container = main.containers.standard;
        const content = this.content = new PIXI.Container();
        this.container.addChild(content);

        content.interactive = true;

        main.containers.floor.visible = true;

        const back = PIXI.Sprite.from('gradient2');
        back.tint = 0xBB0096;
        back.anchor.y = 1;
        back.width = main.width;
        back.height = main.height;
        back.y = main.floorY;
        back.alpha = 0.3;
        content.addChild(back);



        var createRocket = (x) => {
            const emitter = this.main.fx.getParticleEmitter('fireworks', true, true);

            emitter.settings.particleSettings.distanceMin = 700;
            emitter.settings.particleSettings.distanceMax = 800;
            emitter.x = x;
            emitter.y = this.main.floorY;
            emitter.rotation = -Math.PI * 0.5 + Random.float(-0.5, 0.5);

            emitter.init(container);
        };


        content.on('pointerdown', (e) => {
            const local = e.getLocalPosition(content);
            createRocket(local.x);
        });
    }

    update() {

    }

    stop() {
        const main = this.main;

        this.container.removeChild(this.content);
        main.containers.floor.visible = false;

        main.app.ticker.remove(this.update, this);

        main.fx.stopAllEffects();
    }
}

