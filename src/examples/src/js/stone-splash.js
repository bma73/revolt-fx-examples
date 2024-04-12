import * as PIXI from 'pixi.js';

export default class StoneSplash {
    constructor() {
        this.info = 'Stone Splash - Click to throw some stones';
    }

    start(main) {
        this.main = main
        main.containers.floor.visible = true;

        this.app = main.app;

        const container = this.container = main.containers.standard;
        const content = this.content = new PIXI.Container();
        const shadows = this.shadows = new PIXI.Container();
        this.container.addChild(shadows);
        this.container.addChild(content);

        main.containers.floor.visible = false;

        content.interactive = true;

        main.containers.gradient.visible = false;
        main.containers.back.tint = 0x134949;

        const back = PIXI.Sprite.from('gradient2');
        back.tint = 0x565707;
        back.anchor.y = 1;
        back.width = main.width;
        back.height = main.height;
        back.y = main.height;
        back.alpha = 0.3;
        back.blendMode = 'add';
        content.addChild(back);

        const ocean = main.fx.getParticleEmitter('top-ocean-sub1', true, true);
        ocean.init(container);
        ocean.settings.particleSettings.alphaStartMin = 0.6;
        ocean.settings.particleSettings.alphaStartMax = 0.8;
        ocean.x = main.width * 0.4;
        ocean.y = main.height * 0.5;


        const throwStones = (x, y) => {

            const emitter = main.fx.getParticleEmitter('top-stone-splash');

            emitter.x = x;
            emitter.y = y;

            //Attach a shadow to each stone particle
            emitter.on.particleSpawned.add((particle) => {
                this.shadows.addChild(new Shadow(particle));
            });

            emitter.init(container);
        };

        content.on('pointerdown', (e) => {
            const local = e.getLocalPosition(content);
            throwStones(local.x, local.y);
        });
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

class Shadow extends PIXI.Sprite {
    constructor(particle) {
        super(PIXI.Texture.from('fx-dot'));
        this.tint = 0;
        this.alpha = 0.75;
        this.anchor.set(0.5, 0.5);

        //Register to particle update signals
        particle.on.updated.add((particle) => {
            const fac = Math.sin(particle.time * Math.PI * 1.1);

            this.x = particle.x + 35 * fac;
            this.y = particle.y + 35 * fac;

            const scale = 1.1 - (0.2 * fac);
            this.scale.set(scale, scale);
        });

        particle.on.died.addOnce((particle) => {
            this.parent.removeChild(this);
        });
    }
}