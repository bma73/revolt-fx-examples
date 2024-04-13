import { Elastic, gsap, Quart } from "gsap";
import * as PIXI from 'pixi.js';
import Random from './random';

export default class Aliens {
    constructor() {
        this.info = 'Defeat the aliens - Click to shoot';
    }

    start(main) {
        this.main = main

        main.containers.floor.visible = false;

        this.app = main.app;

        const container = this.container = main.containers.standard;
        const content = this.content = new PIXI.Container();

        this.container.addChild(content);

        content.interactive = true;

        const back = PIXI.Sprite.from('gradient2');
        back.tint = 0x6CFF00;
        back.anchor.y = 1;
        back.width = main.width;
        back.height = main.height;
        back.y = main.height;
        back.alpha = 0.2;
        content.addChild(back);

        const laser = this.laser = PIXI.Sprite.from('gun');
        laser.anchor.set(0.1, 0.5);
        laser.y = main.height * 0.5;
        content.addChild(laser);

        this.aliens = [];
        this.shots = [];


        content.on('pointerdown', (e) => {

            const local = e.getLocalPosition(content);
            laser.y = local.y;

            const shot = new Shot(main, content, this.aliens, this.shots);
            content.addChild(shot);
            shot.x = 20;
            shot.y = laser.y;
            this.shots.push(shot);
        });

        main.app.ticker.add((dt) => this.update(dt.deltaTime));

        this.mod = 60;

    }

    update(dt) {

        if ((this.mod++) % 40 === 0 && Math.random() > 0.5 && this.aliens.length < 8) {
            const alien = new Alien(this.main, this.container, this.aliens);
            this.content.addChild(alien);
            this.aliens.push(alien);
        }

        let n = this.shots.length;
        while (n--) {
            this.shots[n].update(dt);
        }

        n = this.aliens.length;
        while (n--) {
            this.aliens[n].update(dt);
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

class Alien extends PIXI.Container {
    constructor(main, beamContainer, aliens) {
        super();

        const alien = PIXI.Sprite.from('alien');
        alien.anchor.set(0.5, 0.5);
        this.addChild(alien);

        this.life = 5;
        this.main = main;
        this.fx = main.fx;
        this.aliens = aliens;

        let e = this.fx.getParticleEmitter('top-spaceship-engine', true, true);
        e.settings.particleSettings.tintStart = 0xD6FFD0;
        e.settings.particleSettings.tintEnd = 0x6CFF00;
        e.init(this, true, 0.5);
        e.y = 80;
        e.rotation = 94 * Math.PI / 180;

        e = main.fx.getParticleEmitter('top-spaceship-engine', true, true);
        e.init(this, true, 0.5);
        e.settings.particleSettings.tintStart = 0xD6FFD0;
        e.settings.particleSettings.tintEnd = 0x6CFF00;
        e.x = 35;
        e.y = 80;
        e.rotation = 73 * Math.PI / 180;

        this.beamContainer = beamContainer;

        this.init();
    }

    init() {
        this.speed = Random.float(1, 2);
        this.x = Random.float(this.main.width - 150, this.main.width - 50);
        this.baseY = Random.float(50, this.main.height - 50);
        this.mod = Math.random() * 200;

        const light = this.fx.getEffectSequence('white-light', true);
        light.settings.effects[0].tint = 0xffff00;
        light.init(this, 0, true, 2);


        const beam = this.fx.getParticleEmitter('side-teleporter-field');
        beam.init(this.beamContainer);
        beam.x = this.x;
        beam.y = this.baseY;

        gsap.to(this, { duration: 0.8, pixi: { scale: 1 }, ease: Elastic.easeOut });
        gsap.to(this, { duration: 0.6, pixi: { alpha: 1 } });
    }

    hit(shot) {
        // Clone the settings, to change the tint
        const emitter = this.fx.getParticleEmitter('side-blood-slash', true, true);

        emitter.settings.particleSettings.tintStart = 0x00ff00;
        emitter.settings.particleSettings.tintEnd = 0x30ff30;
        emitter.settings.particleSettings.spawn.onStart[0].settings.particleSettings.tintStart = 0x00ff00;
        emitter.settings.particleSettings.spawn.onStart[0].settings.particleSettings.tintEnd = 0x30ff30;

        emitter.init(this.beamContainer);
        emitter.x = this.x;
        emitter.y = shot.y;
        emitter.rotation = Math.PI;
        this.x += 8;

        if (--this.life == 0) {
            this.die();
        }
    }

    die() {
        // Clone the settings, to change the tint
        const emitter = this.fx.getParticleEmitter('side-blood-explosion', true, true);
        emitter.init(this.beamContainer, true, 1.1);
        emitter.x = this.x;
        emitter.y = this.y;

        emitter.settings.particleSettings.tintStart = 0x00ff00;
        emitter.settings.particleSettings.tintEnd = 0x30ff30;

        emitter.settings.particleSettings.spawn.onStart[0].settings.particleSettings.tintStart = 0x00ff00;
        emitter.settings.particleSettings.spawn.onStart[0].settings.particleSettings.tintEnd = 0x30ff30;
        emitter.settings.particleSettings.spawn.onStart[1].settings.particleSettings.tintStart = 0x00ff00;
        emitter.settings.particleSettings.spawn.onStart[1].settings.particleSettings.tintEnd = 0x30ff30;

        var index = this.aliens.indexOf(this);
        if (index > -1) this.aliens.splice(index, 1);

        gsap.to(this, {
            duration: 0.2,
            pixi: { y: this.y - 100, alpha: 0, ease: Quart.easeOut }, onComplete: () => {
                this.parent.removeChild(this);
            }
        });
    }

    update(dt) {
        this.x -= this.speed * dt;
        this.y = this.baseY + Math.sin(this.mod++ * 0.06) * 10;
        if (this.x + this.width < 0) {
            this.init();
        }
    }
}

class Shot extends PIXI.Sprite {


    constructor(main, content, aliens, shots) {
        super(PIXI.Texture.from('fx-light10'));
        this.anchor.set(0.5, 0.5);
        this.aliens = aliens;
        this.shots = shots;

        this.main = main;
        this.fx = main.fx;

        this.blendMode = 'add';

        this.speed = 35;
        this.scale.set(0, 0.8);

        gsap.to(this, { duration: 0.3, pixi: { scaleX: -1 } });

        this.tint = 0xFF3000;
    }

    update(dt) {
        this.x += this.speed * dt;
        if (this.x - this.width > this.main.width) {
            this.dispose();
            return;
        }

        const x = this.x;
        const y = this.y;
        let n = this.aliens.length;
        const rect = new PIXI.Rectangle();
        while (n--) {
            const alien = this.aliens[n];
            rect.x = alien.x - 20;
            rect.y = alien.y - alien.height * 0.5;
            rect.height = alien.height * 0.8;
            rect.width = 40;
            if (rect.contains(x, y)) {
                alien.hit(this);
                this.dispose();
                return;
            }
        }
    }

    dispose() {
        this.parent.removeChild(this);
        const index = this.shots.indexOf(this);
        if (index > -1) this.shots.splice(index, 1);
    }
}
