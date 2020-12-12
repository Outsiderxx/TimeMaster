import TimeEffect from '../../TimeEffect';
import AcceEnergeRock from '../AcceEnergeRock';
import VineMechanism from '../Mechanism/FirstScene/VineMechanism';
import ClockButtonMechanism from './ClockButtonMechanism';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ClockMechanism extends TimeEffect {
    @property(cc.Node)
    private hourHand: cc.Node = null;

    @property(cc.Node)
    private minuteHand: cc.Node = null;

    @property(cc.Node)
    private stair: cc.Node = null;

    @property(VineMechanism)
    private vine: VineMechanism = null;

    @property([ClockButtonMechanism])
    private clockButtons: ClockButtonMechanism[] = [];

    @property([cc.Node])
    private floors: cc.Node[] = [];

    @property([cc.Node])
    private directionStones: cc.Node[] = [];

    @property([AcceEnergeRock])
    private energeStones: AcceEnergeRock[] = [];

    @property
    private secondPerCircle: number = 0;

    @property
    private isClockWise: boolean = true;

    private hourHandTween: cc.Tween = null;
    private minuteHandTween: cc.Tween = null;
    private speedOptions: number[] = [1 / 243, 1, 100];
    private currentSpeedIdx: number = 1;
    private currentHour: number = 9;
    private currentMinute: number = 0;

    onLoad() {
        this.status = 'normal';
        this.clockButtons.forEach((button) => {
            button.node.on('active', () => {
                if (this.clockButtons.filter((button) => button.isActived === true).length === 3) {
                    // 開門
                }
            });
        });
        this.clockStart();
    }

    // update() {
    //     // Stair
    //     if (this.currentHour === 0 || this.currentHour === 3 || this.currentHour === 6 || this.currentHour === 9) {
    //         this.stair.active = true;
    //     } else {
    //         this.stair.active = false;
    //     }
    //     // Floor
    //     this.floors[0].active = this.currentMinute >= 0 && this.currentMinute <= 25;
    //     this.floors[4].active = this.currentMinute >= 0 && this.currentMinute <= 25;
    //     this.floors[3].active = this.currentMinute >= 36 && this.currentMinute <= 59;
    //     // Energe Stone
    //     switch (this.currentHour) {
    //         case 0:
    //             this.directionStones[0].angle = 90;
    //             break;
    //         case 1:
    //         case 2: {
    //             this.directionStones[0].angle = 60;
    //             if (this.floors[3].active === false && this.floors[4].active === false) {
    //                 // 藤蔓生長
    //                 this.vine.accelerate();
    //             }
    //             break;
    //         }
    //         case 3:
    //             this.directionStones[0].angle = 0;
    //             break;
    //         case 4:
    //         case 5:
    //             this.energeStones[0].accelerate(); // 右
    //             break;
    //         case 6:
    //             this.directionStones[0].angle = 270;
    //             break;
    //         case 7:
    //         case 8:
    //             this.energeStones[1].accelerate(); // 左
    //             break;
    //         case 9:
    //             this.directionStones[1]; // clock3 指向球
    //             break;
    //         case 10:
    //         case 11:
    //             this.directionStones[0].angle = 150;
    //             break;
    //         default:
    //             break;
    //     }
    // }

    public accelerate() {
        if (this.currentSpeedIdx !== 2) {
            this.currentSpeedIdx++;
            (this.hourHandTween as any)._finalAction._speed = this.speedOptions[this.currentSpeedIdx];
            (this.minuteHandTween as any)._finalAction._speed = this.speedOptions[this.currentSpeedIdx];
        }
    }

    public slowdown() {
        if (this.currentSpeedIdx !== 0) {
            this.currentSpeedIdx--;
            (this.hourHandTween as any)._finalAction._speed = this.speedOptions[this.currentSpeedIdx];
            (this.minuteHandTween as any)._finalAction._speed = this.speedOptions[this.currentSpeedIdx];
        }
    }

    public rollback() {
        this.isClockWise = !this.isClockWise;
        this.clockStop();
        this.clockStart(this.speedOptions[this.currentSpeedIdx]);
    }

    public reset() {
        this.clockStop();
        this.hourHand.angle = 0;
        this.minuteHand.angle = 0;
        this.clockStart();
    }

    private clockStart(speed?: number) {
        this.hourHandTween = cc
            .tween(this.hourHand)
            .by(this.secondPerCircle * 720, { angle: 360 * (this.isClockWise ? -1 : 1) })
            .repeatForever()
            .start();
        this.minuteHandTween = cc
            .tween(this.minuteHand)
            .by(this.secondPerCircle, { angle: 360 * (this.isClockWise ? -1 : 1) })
            .call(() => {
                if (this.isClockWise) {
                    this.currentMinute++;
                    if (this.currentMinute === 60) {
                        this.currentMinute = 0;
                        this.currentHour++;
                        if (this.currentHour === 12) {
                            this.currentHour = 0;
                        }
                    }
                } else {
                    this.currentMinute--;
                    if (this.currentMinute === -1) {
                        this.currentMinute = 59;
                        this.currentHour--;
                        if (this.currentHour === -1) {
                            this.currentHour = 11;
                        }
                    }
                }
                console.log(`${this.currentHour}:${this.currentMinute}`);
            })
            .union()
            .repeatForever()
            .start();
        (this.hourHandTween as any)._finalAction._speedMethod = true;
        (this.minuteHandTween as any)._finalAction._speedMethod = true;
        (this.hourHandTween as any)._finalAction._speed = speed ?? 1;
        (this.minuteHandTween as any)._finalAction._speed = speed ?? 1;
    }

    private clockStop() {
        this.hourHandTween.stop();
        this.minuteHandTween.stop();
    }
}
