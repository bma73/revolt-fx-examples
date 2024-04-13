import { Quart, gsap } from "gsap";
import * as PIXI from 'pixi.js';
import Random from './random';

export default class PlasmaGrenade {
    constructor() {
        this.info = 'Plasma Grenades - Click to fire';
    }

    start(main) {
        this.main = main

        main.containers.floor.visible = true;

        var container = this.container = main.containers.standard;
        var content = this.content = new PIXI.Container();
        this.container.addChild(content);

        content.interactive = true;

        var back = PIXI.Sprite.from('gradient2');
        back.tint = 0x00C9FF;
        back.anchor.y = 1;
        back.width = main.width;
        back.height = main.height;
        back.y = main.floorY;
        back.alpha = 0.4;
        content.addChild(back);

        const rect = new PIXI.Rectangle();

        const fire = () => {
            var emitter = main.fx.getParticleEmitter('side-plasma-grenade');
            emitter.init(container);
            emitter.x = -10;
            emitter.y = main.height * 0.5;


            //Add callback for particle update signal with a rate of 3 
            emitter.on.particleUpdated.add((particle) => {

                //check if saucer has been hit
                const list = this.saucerList;
                for (let n = 0; n < list.length; n++) {
                    const saucer = list[n];

                    rect.x = saucer.x - 70;
                    rect.y = saucer.y - 50;
                    rect.width = 140;
                    rect.height = 50;

                    if (rect.contains(particle.x, particle.y)) {

                        //Saucer has been hit!
                        particle.stop();
                        saucer.explode();

                        //Play explosion effect
                        const explosion = main.fx.getEffectSequence('side-plasma-grenade-explosion');
                        explosion.init(this.content, 0, true, Random.float(0.9, 1.2));
                        explosion.x = particle.x;
                        explosion.y = particle.y;

                        const index = list.indexOf(saucer);
                        if (index > -1) {
                            this.saucerList.splice(index, 1);
                        }
                    }
                }
            }, null, 3);
        };

        content.on('pointerdown', (e) => {
            fire();
        });

        main.app.ticker.add(this.update, this);

        this.mod = 60;

        this.saucerList = [];
    }

    update(d) {
        if ((this.mod++) % 40 === 0 && Math.random() > 0.5 && this.saucerList.length < 8) {
            var saucer = new Saucer(this.main);
            this.content.addChild(saucer);
            this.saucerList.push(saucer);
        }

        var n = this.saucerList.length;
        while (n--) {
            this.saucerList[n].update(d.deltaTime);
        }
    }

    stop() {
        const main = this.main;
        this.saucerList = null;
        this.container.removeChild(this.content);
        main.containers.floor.visible = false;
        main.app.ticker.remove(this.update, this);
        main.fx.stopAllEffects();
    }
}

class Saucer extends PIXI.Sprite {
    constructor(main) {
        super(PIXI.Texture.from('saucer1'));
        this.main = main;
        this.anchor.set(0.5, 1);
        this.baseY = main.floorY - Random.float(10, 400);
        this.init();
    }
    init() {
        this.speed = Random.float(2, 3);
        this.x = this.main.width + this.width;
        this.mod = Math.random() * 200;
    }
    explode() {
        gsap.to(this, { duration: 0.2, pixi: { y: this.y - 100, alpha: 0, ease: Quart.easeOut } });
    }

    update(dt) {
        this.x -= this.speed * dt;
        this.y = this.baseY + Math.sin(this.mod++ * 0.06) * 10;
        if (this.x + this.width < 0) {
            this.init();
        }
    }
}


