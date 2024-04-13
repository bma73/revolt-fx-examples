import * as PIXI from 'pixi.js';

export default class FireArc {
    constructor() {
        this.info = 'Fairy Dust';
    }

    start(main) {
        this.main = main

        var container = this.container = main.containers.standard;
        var content = this.content = new PIXI.Container();
        container.addChild(content);

        var back = PIXI.Sprite.from('gradient2');
        back.tint = 0xFF00BB;
        back.anchor.y = 1;
        back.width = main.width;
        back.height = 800;
        back.y = main.height;
        back.alpha = 0.1;
        content.addChild(back);

        var emitter = main.fx.getParticleEmitter('fairy-dust', true, true);
        emitter.settings.Min = 1;
        emitter.settings.spawnCountMax = 4;
        emitter.init(container, true, 1.1);
        emitter.x = main.width * 0.5;
        emitter.y = main.height * 0.5;
    }

    update() {

    }

    stop() {
        const main = this.main;

        this.container.removeChild(this.content);
        main.containers.floor.visible = false;
        main.fx.stopAllEffects();
    }
}
