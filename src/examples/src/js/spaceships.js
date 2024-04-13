import * as PIXI from 'pixi.js';
import Random from './random';

export default class Spaceships {
    constructor() {
        this.info = 'Spaceships - Click to launch one';
    }

    start(main) {
        this.main = main
        main.containers.floor.visible = true;

        main.containers.floor.visible = false;
        main.containers.gradient.visible = false;
        main.containers.back.tint = 0x0a0a0a;

        this.app = main.app;

        const container = this.container = main.containers.standard;
        const content = this.content = new PIXI.Container();
        const shipsContainer = new PIXI.Container();
        const shipsBottomContainer = new PIXI.Container();
        const stars = new PIXI.Container();
        this.container.addChild(content);

        var back = PIXI.Sprite.from('gradient2');
        back.tint = 0x00C9FF;
        back.anchor.y = 1;
        back.width = main.width;
        back.height = main.height;
        back.y = main.height;
        back.alpha = 0.1;
        content.addChild(back);


        content.addChild(stars);
        content.addChild(shipsBottomContainer);
        content.addChild(shipsContainer);

        content.interactive = true;


        const starfield = main.fx.getParticleEmitter('top-starfield');
        starfield.init(stars, true, 2);
        starfield.x = main.width;
        starfield.y = main.height * 0.5;

        const spaceship = new BigSpaceship(main);
        shipsContainer.addChild(spaceship);

        this.ships = [spaceship];

        main.app.ticker.add(this.update, this);

        content.on('pointerdown', (e) => {
            this.ships.push(new Spaceship(main, shipsContainer, shipsBottomContainer));
            this.ships.push(new Spaceship(main, shipsContainer, shipsBottomContainer));
        });

    }

    update(d) {
        let n = this.ships.length;
        while (n--) {
            const ship = this.ships[n];
            ship.update(d.deltaTime);
            if (ship.x > this.main.width + 200) {
                ship.dispose();
                const index = this.ships.indexOf(ship);
                if (index > -1) this.ships.splice(index, 1);
            }
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

class BigSpaceship extends PIXI.Container {
    constructor(main) {
        super();

        const ship = PIXI.Sprite.from('big-spaceship');
        ship.anchor.set(0.5, 0.5);

        this.addChild(ship);

        this.x = this.startX = main.width * 0.6;
        this.y = this.startY = main.height * 0.5;

        const emitter = main.fx.getParticleEmitter('top-big-spaceship-engine');
        emitter.init(this);
        emitter.x = -30;

        this.mod = 0;
    }

    update(dt) {
        const d = Math.sin(this.mod++ * 0.01);
        this.y = this.startY + d * 60;
    }
}

class Spaceship extends PIXI.Container {
    constructor(main, topContainer, bottomContainer) {
        super();

        const ship = PIXI.Sprite.from('spaceship');
        ship.anchor.set(0.5, 0.5);

        this.addChild(ship);

        const emitter = this.emitter = main.fx.getParticleEmitter('top-spaceship-engine');

        if (Math.random() > 0.5) {
            //Add ship on top
            topContainer.addChild(this);
            this.scaleFac = 1.5;
            emitter.init(topContainer, true, this.scaleFac * Random.float(0.8, 1.1));
        } else {
            //Add ship at bottom
            bottomContainer.addChildAt(this, 0);
            this.scaleFac = 0.5;
            emitter.init(bottomContainer, true, this.scaleFac * Random.float(0.8, 1.1));
        }

        this.scale.set(this.scaleFac, this.scaleFac);
        this.speed = Random.float(3, 8) * this.scaleFac;

        emitter.target = this;
        emitter.targetOffset = -50 * this.scaleFac;

        this.x = -50;
        this.y = Random.float(main.height * 0.05, main.height * 0.95);

        this.rotation = Random.float(0.3, -0.3);
        this.dx = Math.cos(this.rotation);
        this.dy = Math.sin(this.rotation);
    }



    update(dt) {
        this.x += this.dx * this.speed * dt;
        this.y += this.dy * this.speed * dt;
    }
    dispose() {
        this.emitter.stop(false);
    }
}
