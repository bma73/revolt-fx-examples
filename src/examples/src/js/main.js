import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import * as PIXI from 'pixi.js';

import { FX } from 'revolt-fx';


import Aliens from "./aliens";
import EnergyShield from "./energy-shield";
import FairyDust from "./fairy-dust";
import FireArc from "./fire-arc";
import Fireworks from "./fireworks";
import Flamethrower from "./flamethrower";
import Intro from "./intro";
import Mines from "./mines";
import PlasmaGrenade from "./plasma-grenade";
import PlasmaVulcan from "./plasma-vulcan";
import Spaceships from "./spaceships";
import StoneSplash from "./stone-splash";
import Storm from "./storm";

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

class Main {
    width = 1200;
    height = 640;
    floorY = 590;

    app;
    index = 0;
    root;
    infoText;
    nextButton;
    prevButton;

    fx = new FX();

    containers = {
        back: new PIXI.Graphics(),
        gradient: new PIXI.Container(),
        nav: new PIXI.Container(),
        content: new PIXI.Container(),
        standard: new PIXI.Container(),
        particle: new PIXI.Container(),
        stats: new PIXI.Container(),
        floor: new PIXI.Graphics(),
        fader: new PIXI.Graphics()
    };

    constructor() {
        this.list = [
            new Intro(),
            new FireArc(),
            new FairyDust(),
            new Aliens(),
            new Mines(),
            new Fireworks(),
            new Flamethrower(),
            new EnergyShield(),
            new Storm(),
            new PlasmaGrenade(),
            new Spaceships(),
            new PlasmaVulcan(),
            new StoneSplash(),
        ];
        this.start();
    }

    async start() {

        this.app = new PIXI.Application();
        await this.app.init({ resizeTo: window });
        document.body.appendChild(this.app.canvas);
        this.root = new PIXI.Container();
        this.app.stage.addChild(this.root);

        await this.loadAssets();
        this.setupLayout();


        this.show(this.index);

        gsap.to(this.containers.fader, {
            duration: 0.3,
            pixi: { alpha: 0 },
            delay: 0,
            onComplete: () => {
                this.containers.fader.visible = false;

            }
        })

        this.app.ticker.add((ticker) => {
            //Update the RevoltFX instance
            this.fx.update(ticker.deltaTime);
            this.stats.text = 'Emitters ' + this.fx.emitterCount + ' / Particles ' + this.fx.particleCount + ' / ' + Math.round(this.app.ticker.FPS) + ' FPS';
        });

        const resize = () => {
            const w = window.innerWidth - 20;
            const ratio = this.width / this.height;

            const h2 = w / ratio;
            const scale = h2 / this.height;
            this.root.scale.set(scale);
            this.app.renderer.resize(w, h2);
        };

        window.addEventListener('resize', resize);

        resize();
    }

    async loadAssets() {
        PIXI.Assets.add({ alias: 'fx_settings', src: 'assets/default-bundle.json' });
        PIXI.Assets.add({ alias: 'fx_spritesheet', src: 'assets/revoltfx-spritesheet.json' });
        PIXI.Assets.add({ alias: 'example_spritesheet', src: 'assets/rfx-examples.json' });

        const data = await PIXI.Assets.load(['fx_settings', 'fx_spritesheet', 'example_spritesheet']);
        this.fx.initBundle(data.fx_settings);
        this.fx.maxParticles = 10000;
        this.fx.setFloorY(this.floorY);
    }

    setupLayout() {
        let containers = this.containers;
        this.root.addChild(containers.back);
        containers.content.addChild(containers.gradient);
        this.root.addChild(containers.content);
        containers.content.addChild(containers.standard);
        containers.content.addChild(containers.particle);
        this.root.addChild(containers.floor);
        this.root.addChild(containers.stats);
        this.root.addChild(containers.nav);
        this.root.addChild(containers.fader);

        containers.nav.visible = false;

        containers.back.rect(0, 0, this.width, this.height).fill(0x00000);
        containers.fader.rect(0, 0, this.width, this.height).fill(0x00000);
        containers.fader.interactive = true;

        containers.floor.rect(0, 0, this.width, this.height - this.floorY).fill(0x151515);
        containers.floor.visible = false;

        containers.floor.y = this.floorY;


        const fonts = ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'];

        const stats = this.stats = new PIXI.Text({ text: '', style: { fontFamily: fonts, fontWeight: 200, fontSize: 18, fill: 0x999999 } });
        stats.x = this.width - 20;
        stats.y = 20;
        stats.anchor.set(1, 0);
        containers.stats.addChild(stats);

        const info = this.infoText = new PIXI.Text({ text: '', style: { fontFamily: fonts, fontWeight: 300, fontSize: 36, fill: 0xffffff } });
        info.x = 20;
        info.y = 20;
        containers.stats.addChild(info);

        const back = PIXI.Sprite.from('gradient1');
        back.width = this.width;
        back.height = this.height;
        containers.gradient.addChild(back);

        this.nextButton = PIXI.Sprite.from('arrow');
        this.nextButton.interactive = true;
        this.nextButton.anchor.set(1);
        containers.nav.addChild(this.nextButton);
        this.nextButton.x = this.width - 20;
        this.nextButton.y = this.height - 20;
        this.nextButton.on('pointerup', () => this.next(1));

        this.prevButton = PIXI.Sprite.from('arrow');
        this.prevButton.interactive = true;
        this.prevButton.anchor.set(1);
        this.prevButton.scale.x = -1;
        containers.nav.addChild(this.prevButton);
        this.prevButton.x = 20;
        this.prevButton.y = this.height - 20;
        this.prevButton.on('pointerup', () => this.next(-1));
    }

    info(text) {
        this.infoText.text = text;
    }

    show(index) {
        const e = this.list[index];
        this.currentExample = e;
        e.start(this);
        this.info(e.info);
    }

    next(direction) {
        direction = direction || 1;

        const fader = this.containers.fader;
        fader.alpha = 0;
        fader.visible = true;

        gsap.to(fader, {
            duration: 0.3,
            pixi: { alpha: 1 },
            onComplete: () => {

                this.list[this.index].stop();

                if (direction == 1) {
                    this.index++;
                    if (this.index == this.list.length) {
                        this.index = 1;
                    }
                } else if (direction == -1) {
                    this.index--;
                    if (this.index == 0) {
                        this.index = this.list.length - 1;
                    }
                }
                this.show(this.index);


                gsap.to(fader, {
                    duration: 0.3,
                    pixi: { alpha: 0 },
                    onComplete: () => {
                        fader.visible = false;
                    }
                })
            }
        });
    }
}

new Main();
