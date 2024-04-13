import { gsap } from "gsap";
import * as PIXI from 'pixi.js';
import Random from "./random";


export default class EnergyShield {
    constructor() {
        this.info = 'Energy Shield - Click to fire';
    }

    start(main) {
        this.main = main

        const container = this.container = main.containers.standard;
        const content = this.content = new PIXI.Container();
        container.addChild(content);

        content.interactive = true;

        const centerX = main.width * 0.5;
        const centerY = main.height * 0.5;

        const back = PIXI.Sprite.from('fx-light01');
        back.tint = 0x015562;
        back.anchor.set(0.5);
        back.x = centerX;
        back.y = centerY;
        back.alpha = 0.4;
        back.scale.set(4);
        content.addChild(back);

        this.shots = [];
        this.guns = [];

        this.shield = new Shield(main.fx, this);
        content.addChild(this.shield);

        let count = 10;
        const step = 2 * Math.PI / count;
        let angle = 0;
        while (count--) {
            const gun = new Gun(main.fx, this, this.shield);
            content.addChild(gun);
            this.guns.push(gun);
            gun.x = centerX + Math.cos(angle) * 500;
            gun.y = centerY + Math.sin(angle) * 290;
            angle += step;
        }

        main.app.ticker.add(this.update, this);


        content.on('pointerdown', (e) => {

            const gun = this.guns[Random.integer(0, this.guns.length - 1)];
            gun.fire();

        });


    }

    update(d) {
        this.shield.update(d.deltaTime);

        let n = this.guns.length;
        while (n--) {
            this.guns[n].update(d.deltaTime);
        }

        n = this.shots.length;
        while (n--) {
            this.shots[n].update(d.deltaTime);
        }
    }

    stop() {
        const main = this.main;

        this.container.removeChild(this.content);
        main.containers.floor.visible = false;

        main.app.ticker.remove(this.update, this);

        main.fx.stopAllEffects();
    }
}

class Shield extends PIXI.Container {
    constructor(fx, base) {
        super();
        this.base = base;
        this.fx = fx;

        const logo = PIXI.Sprite.from('logo');
        logo.anchor.set(0.5);
        logo.scale.set(0.3);
        logo.alpha = 0.6;
        this.addChild(logo);

        const emitter = fx.getParticleEmitter('plasma-shield');
        emitter.init(this);

        this.baseX = base.main.width * 0.5;
        this.baseY = base.main.height * 0.5;
        this.mod = 0;
        this.radius = 150;
    }


    update() {
        this.x = this.baseX + Math.sin(this.mod++ * 0.005) * 90;
        this.y = this.baseY + Math.sin(this.mod++ * 0.009) * 60;
    };
    hit(shot) {
        const effect = this.fx.getEffectSequence('plasma-shield-hit');
        effect.init(this.base.container);
        effect.x = this.x;
        effect.y = this.y;
        effect.rotation = shot.rotation - Math.PI;
    };

}

class Gun extends PIXI.Sprite {
    constructor(fx, base, target) {
        super(PIXI.Texture.from('gun'));
        this.anchor.set(0.5);
        this.base = base;
        this.target = target;
        this.fx = fx;
    }

    fire() {
        this.update();
        const shot = new Shot(this.fx, this.base, this.rotation);
        this.base.content.addChild(shot);
        shot.x = this.x + Math.cos(this.rotation) * 20;
        shot.y = this.y + Math.sin(this.rotation) * 20;

        const light = this.fx.getEffectSequence('white-light');
        light.init(this.base.content, 0, true, 0.2);
        light.x = shot.x;
        light.y = shot.y;


    };

    update(dt) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        this.rotation = Math.atan2(dy, dx);
    };
}


class Shot extends PIXI.Sprite {
    constructor(fx, base, rotation) {

        super(PIXI.Texture.from('fx-light10'));

        this.shield = base.shield;
        this.shots = base.shots;

        this.shots.push(this);

        this.anchor.set(0.5, 0.5);
        this.rotation = rotation;

        this.dx = Math.cos(rotation);
        this.dy = Math.sin(rotation);

        this.blendMode = 'add';

        this.speed = 35;
        this.scale.set(0, 0.8);

        gsap.to(this, { duration: 0.1, pixi: { scaleX: -1 } });

        this.tint = 0xD702D8;
    }

    update(dt) {
        this.x += this.dx * this.speed * dt;
        this.y += this.dy * this.speed * dt;

        const dx = this.x - this.shield.x;
        const dy = this.y - this.shield.y;
        const r = this.shield.radius * this.shield.radius;

        if (dx * dx + dy * dy <= r) {
            this.shield.hit(this);
            this.dispose();
        }
    }

    dispose() {
        this.parent.removeChild(this);
        const index = this.shots.indexOf(this);
        if (index > -1) this.shots.splice(index, 1);
    }
}