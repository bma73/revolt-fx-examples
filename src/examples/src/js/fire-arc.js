import * as PIXI from 'pixi.js';

export default class FireArc {
    constructor() {
        this.info = 'Fire Arc';
    }

    start(main) {
        this.main = main
        main.containers.floor.visible = true;

        const container = this.container = main.containers.standard;
        const content = this.content = new PIXI.Container();
        this.container.addChild(content);

        const back = PIXI.Sprite.from('gradient2');
        back.tint = 0xB03A00;
        back.anchor.y = 1;
        back.width = main.width;
        back.height = 500;
        back.y = main.floorY;
        back.alpha = 0.6;
        content.addChild(back);

        const emitter = this.emitter = main.fx.getParticleEmitter('fire-arc', true, true);

        this.emitter.settings.autoRotation = false;
        emitter.init(container);
        this.update();

        this.mod = 0;
        this.angle = 0;

        main.app.ticker.add(this.update, this);
    }

    update() {
        this.mod++;
        this.angle += 0.004;
        this.emitter.x = this.main.width * 0.5 + Math.cos(this.angle) * 300;
        this.emitter.y = this.main.height * 0.5 + Math.sin(this.angle * 2) * 200;
        this.emitter.rotation = Math.sin(this.angle) * 20;
    }

    stop() {
        const main = this.main;

        this.container.removeChild(this.content);
        main.containers.floor.visible = false;

        main.app.ticker.remove(this.update, this);

        main.fx.stopAllEffects();
    }
}