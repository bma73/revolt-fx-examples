import { Bounce, gsap } from "gsap";
import * as PIXI from 'pixi.js';

import { EffectSequenceComponentType } from 'revolt-fx';
import Random from './random';

export default class Mines {
    constructor() {
        this.info = 'Mines - Click them...';
    }

    start(main) {
        this.main = main

        main.containers.floor.visible = false;

        this.container = main.containers.standard;

        this.renderTexture = PIXI.RenderTexture.create({ width: main.width, height: main.height });
        this.decals = new PIXI.Sprite(this.renderTexture);
        this.decals.blendMode = 'multiply';

        var content = this.content = new PIXI.Container();
        this.container.addChild(content);
        content.interactive = true;
        content.interactiveChildren = true;

        content.addChild(this.decals);

        content.interactive = true;


        const back = PIXI.Sprite.from('fx-light01');
        back.tint = 0x31BE2F;
        back.anchor.set(0.5);
        back.x = main.width * 0.5;
        back.y = main.height * 0.5;
        back.alpha = 0.1;
        back.scale.set(4);
        content.addChild(back);


        this.decal = PIXI.Sprite.from('explosion-decal');
        this.decal.anchor.set(0.5);


        this.shakeStrength = 0;

        Mine.count = 0;

        this.mines = [];

        var n = 20;
        while (n--) {
            const mine = new Mine(this, main.fx);
            this.mines.push(mine);
            content.addChild(mine);
        }

        main.app.ticker.add(this.update, this);

        this.mod = 0;

    }

    update() {
        if (Mine.count < 30 && ++this.mod % 40 == 0 && Math.random() > 0.2) {
            const mine = new Mine(this, this.main.fx);
            this.mines.push(mine);
            this.content.addChild(mine);
        }

        if (this.shakeStrength != 0) {
            this.container.x = Random.float(5, 10) * Random.sign();
            this.container.y = Random.float(5, 10) * Random.sign();
        }
    }
    stop() {
        const main = this.main;

        this.container.removeChild(this.content);
        main.containers.floor.visible = false;

        main.app.ticker.remove(this.update, this);

        main.fx.stopAllEffects();

        this.obstacles = null;

        this.container.x = this.container.y = 0;
        this.renderTexture.destroy(true);
        this.renderTexture = null;

    }

    resize() {
        this.content.hitArea = new PIXI.Rectangle(0, 0, this.app.renderer.width, this.app.renderer.height);
    }

    addDecal(x, y, scale) {
        if (this.renderTexture) {
            this.decal.x = x;
            this.decal.y = y;
            this.decal.scale.set(scale * 0.8);
            this.decal.rotation = Random.float(0, 6.18);
            this.decal.alpha = Random.float(0.6, 0.8);
            this.main.app.renderer.render({ container: this.decal, target: this.renderTexture, clear: false });
        }
    }

    shake() {

        this.shakeStrength += Random.float(5, 10) * Random.sign();

        gsap.killTweensOf(this);
        gsap.to(this, {
            duration: Random.float(0.4, 0.7),
            shakeStrength: 0, onComplete: () => {
                this.container.x = this.container.y = 0;
            }
        });
    }
}

class Mine extends PIXI.Sprite {
    constructor(main, fx) {
        super(PIXI.Texture.from('mine'))
        this.scaleFac = Random.float(0.8, 1.2);
        this.anchor.set(0.5);
        this.radius = 30 * this.scaleFac;
        this.x = Random.float(100, main.main.width - 100);
        this.y = Random.float(100, main.main.height - 100);
        this.scale.set(0);
        gsap.to(this, { duration: 0.5, pixi: { scale: this.scaleFac }, ease: Bounce.easeOut, delay: Random.float(0, 0.3) });

        Mine.count++;

        this.main = main;
        this.fx = fx;

        this.interactive = true;


        this.on('pointerdown', () => {
            this.explode();
        })
    }

    checkMines(x, y, radius) {
        const mines = this.main.mines;
        let n = mines.length;
        while (n--) {
            const mine = mines[n];
            if (!mine || mine === this || mine.isExploded) continue;
            const dx = mine.x - x;
            const dy = mine.y - y;
            const r = mine.radius + radius;
            if (dx * dx + dy * dy <= r * r) {
                mine.explode();
            }
        }
    }

    explode() {
        const sequence = this.fx.getEffectSequence('top-big-explosion');
        sequence.init(this.main.container, 0, true, this.scaleFac);
        sequence.x = this.x;
        sequence.y = this.y;

        if (this.parent) this.parent.removeChild(this);
        this.main.shake();
        Mine.count--;

        this.main.addDecal(this.x, this.y, this.scaleFac);

        const i = this.main.mines.indexOf(this);
        if (i > -1) this.main.mines.splice(i, 1);

        this.checkMines(this.x, this.y, 60);

        //Chain reaction!
        //listen to spawned effects events
        sequence.on.effectSpawned.add((type, effect) => {
            if (type == EffectSequenceComponentType.Emitter && effect.name == 'top-big-explosion-sub3') {
                effect.on.particleDied.addOnce((particle) => {
                    this.main.addDecal(particle.x, particle.y, Random.float(0.3, 0.5));
                    this.checkMines(particle.x, particle.y, 30);
                });
            }
        });

        return sequence;
    };


}