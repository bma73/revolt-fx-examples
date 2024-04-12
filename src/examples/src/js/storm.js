import * as PIXI from 'pixi.js';
import Random from './random';

export default class Storm {
    constructor() {
        this.info = 'Storm';
    }

    start(main) {
        this.main = main
        main.containers.floor.visible = true;

        this.fx = main.fx;

        const container = this.container = main.containers.standard;
        const content = this.content = new PIXI.Container();
        this.container.addChild(content);

        const back = PIXI.Sprite.from('gradient2');
        back.tint = 0x32231E;
        back.anchor.y = 1;
        back.width = main.width;
        back.height = 800;
        back.y = main.floorY;
        back.alpha = 0.9;
        content.addChild(back);

        const clouds = main.fx.getParticleEmitter('side-clouds');
        clouds.init(container);
        clouds.y = 50;

        const rain = main.fx.getParticleEmitter('side-rain', true, true);
        rain.settings.core.params.height = main.width * 1.2;
        rain.settings.spawnCountMin = 10;
        rain.settings.spawnCountMax = 20;
        rain.init(container);
        rain.x = main.width * 0.5;
        rain.y = 50;

        this.update();

        this.mod = 0;

        main.app.ticker.add(this.update, this);
    }

    update() {
        this.mod++;
        if (this.mod % 20 == 0 && Math.random() > 0.6) {
            var sequence = this.fx.getEffectSequence('white-light');
            sequence.init(this.container, 0, true, Random.float(2, 3));
            sequence.x = Random.float(10, this.main.width - 10);
            sequence.y = Random.float(-100, -50);
        }
        if (this.mod % 30 == 0 && Math.random() > 0.6) {
            var sequence = this.fx.getEffectSequence('side-lightning');
            sequence.init(this.container, 0, true, Random.float(1.5, 2.5));
            sequence.x = Random.float(10, this.main.width - 10);
            sequence.y = Random.float(10, 50);
        }
    }

    stop() {
        const main = this.main;

        this.container.removeChild(this.content);
        main.containers.floor.visible = false;

        main.fx.stopAllEffects();
    }
}