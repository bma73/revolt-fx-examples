import * as PIXI from 'pixi.js';
import Random from './random';

export default class Flamethrower {
    constructor() {
        this.info = 'Flamethrower - Press to fire';
    }


    start(main) {
        this.main = main
        this.app = main.app;

        main.containers.floor.visible = false;

        const container = this.container = main.containers.standard;
        const content = this.content = new PIXI.Container();
        this.container.addChild(content);

        content.interactive = true;


        const back = PIXI.Sprite.from('fx-light01');
        back.tint = 0xFF3000;
        back.anchor.set(0.5);
        back.x = main.width * 0.5;
        back.y = main.height * 0.5;
        back.alpha = 0.2;
        back.scale.set(4);
        content.addChild(back);

        this.obstacles = [];

        let n = 10;
        while (n--) {
            var obstacle = new Obstacle(main);
            content.addChild(obstacle);
            this.obstacles.push(obstacle);
        }

        this.weapon = PIXI.Sprite.from('gun');
        content.addChild(this.weapon);
        this.weapon.anchor.set(0.5, 0.5);
        this.weapon.x = main.width * 0.5;
        this.weapon.y = main.height * 0.5;

        //Clone emitter to settings to update values
        this.emitter = main.fx.getParticleEmitter('top-flamethrower', true, true);
        this.emitter.init(container);
        this.emitter.settings.spawnCountMin = 10;
        this.emitter.settings.spawnCountMax = 30;
        this.emitter.x = main.width * 0.5;
        this.emitter.y = main.height * 0.5;
        this.emitter.target = this.weapon;

        //Check if particle hits obstacle - every 3rd frame
        this.emitter.on.particleSpawned.add((particle) => {
            particle.on.updated.add((particle) => {
                let n = this.obstacles.length;
                while (n--) {
                    const obstacle = this.obstacles[n];
                    const dx = obstacle.x - particle.x;
                    const dy = obstacle.y - particle.y;
                    if (dx * dx + dy * dy <= (obstacle.radius * obstacle.radius) * 0.9) {
                        particle.stop();
                    }
                }
            }, null, 3);
        });

        this.emitter.paused = true;


        const lookAt = (e) => {
            const local = e.getLocalPosition(content);
            const dx = local.x - this.weapon.x;
            const dy = local.y - this.weapon.y;

            this.weapon.rotation = Math.atan2(dy, dx);
        };

        content.on('pointerdown', (e) => {
            lookAt(e);
            this.emitter.paused = false;
        });

        content.on('pointerup', (e) => {
            this.emitter.paused = true;
        });

        content.on('pointermove', (e) => {
            lookAt(e);
        });


        this.mod = 60;
    }

    update() {

    }

    stop() {
        const main = this.main;

        this.container.removeChild(this.content);
        main.containers.floor.visible = false;

        main.app.ticker.remove(this.update, this);

        this.obstacles = null;

        main.fx.stopAllEffects();
    }
}


class Obstacle extends PIXI.Graphics {
    constructor(main) {
        super();
        this.radius = Random.float(30, 50);
        this.circle(0, 0, this.radius).fill(0x0a0a0a);

        const angle = Random.float(0, 2 * Math.PI);
        const dist = Random.float(140, 250);
        this.x = main.width * 0.5 + Math.cos(angle) * dist;
        this.y = main.height * 0.5 + Math.sin(angle) * dist;
    }


}
