import * as PIXI from 'pixi.js';

export default class PlasmaVulcan {
    constructor() {
        this.info = 'Plasma Vulcan';
    }

    start(main) {
        this.main = main
        main.containers.floor.visible = true;

        const container = this.container = main.containers.standard;
        const content = this.content = new PIXI.Container();
        container.addChild(content);

        const back = PIXI.Sprite.from('gradient2');
        back.tint = 0x0088B0;
        back.anchor.y = 1;
        back.width = main.width;
        back.height = 300;
        back.y = main.floorY;
        back.alpha = 0.6;
        content.addChild(back);

        const vulcan1 = PIXI.Sprite.from('vulcan');
        vulcan1.anchor.set(0.5, 1);
        vulcan1.scale.set(0.8, 1);
        vulcan1.x = 400;
        vulcan1.y = main.floorY;
        content.addChild(vulcan1);


        const vulcan2 = PIXI.Sprite.from('vulcan');
        vulcan2.anchor.set(0.5, 1);
        vulcan2.x = 700;
        vulcan2.y = main.floorY;
        vulcan2.scale.set(0.8, 1.2);
        content.addChild(vulcan2);


        const emitter1 = main.fx.getParticleEmitter('side-plasma-vulcan');
        emitter1.init(container);
        emitter1.x = vulcan1.x;
        emitter1.y = main.floorY - vulcan1.height + 30;


        const emitter2 = main.fx.getParticleEmitter('side-plasma-vulcan');
        emitter2.init(container, true, 1.1);
        emitter2.x = vulcan2.x;
        emitter2.y = main.floorY - vulcan2.height + 30;
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

