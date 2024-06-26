import { gsap } from "gsap";
import * as PIXI from 'pixi.js';

export default class Intro {
    constructor() {
        this.info = '';
    }

    start(main) {
        this.main = main;

        const content = this.content = new PIXI.Container();
        const logo = PIXI.Sprite.from('logo');
        const glow = PIXI.Sprite.from('glow');

        main.containers.back.tint = 0;
        main.containers.gradient.alpha = 0.3;

        const emitter = main.fx.getParticleEmitter('plasma-corona');

        glow.scale.set(8);
        logo.anchor.set(0.5);
        glow.anchor.set(0.5);
        logo.alpha = 0.6;
        content.addChild(glow);
        content.addChild(logo);
        emitter.init(content, true, 1.9);
        glow.alpha = 0.4;

        content.x = main.width * 0.5;
        content.y = main.height * 0.5;

        content.alpha = 0;

        main.containers.content.addChild(content);


        gsap.to(content, { duration: 2, pixi: { alpha: 1 } });
        setTimeout(function () {
            main.next();
        }, 3000);
    }

    update() {
        const main = this.main;
        this.content.parent.removeChild(this.content);
        main.containers.stats.visible = true;
        main.containers.nav.visible = true;
        main.fx.stopAllEffects();
        main.containers.gradient.alpha = 1;
    }

    stop() {
        const main = this.main;
        this.content.parent.removeChild(this.content);
        main.containers.stats.visible = true;
        main.containers.nav.visible = true;
        main.fx.stopAllEffects();
        main.containers.gradient.alpha = 1;
        main.app.ticker.remove(this.update, this);
    }
}
