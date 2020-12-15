import TimeEffect from '../../TimeEffect';
import AcceEnergeRock from '../AcceEnergeRock';
import VineMechanism from '../Mechanism/FirstScene/VineMechanism';
import ClockButtonMechanism from './ClockButtonMechanism';
import StretchPlatformMechanism from '../StretchPlatformMechanism';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ClockMechanism extends TimeEffect {
    @property(cc.Node)
    public hourHand: cc.Node = null;

    @property(cc.Node)
    public minuteHand: cc.Node = null;

    @property(cc.Node)
    private stair: cc.Node = null;

    @property(cc.Label)
    private timeTxt: cc.Label = null;

    @property(cc.Node)
    private transferPoint: cc.Node = null;

    @property(VineMechanism)
    private vine: VineMechanism = null;

    @property([ClockButtonMechanism])
    private clockButtons: ClockButtonMechanism[] = [];

    @property([cc.Node])
    private floors: cc.Node[] = [];

    @property(cc.Node)
    private directionStone: cc.Node = null;

    @property
    private secondPerCircle: number = 0;

    @property
    private isClockWise: boolean = true;

    private hourHandTween: cc.Tween = null;
    private minuteHandTween: cc.Tween = null;
    private speedOptions: number[] = [1 / 243, 1, 5];
    private currentSpeedIdx: number = 1;
    private currentHour: number = 0;
    private currentMinute: number = 15;

    public reset() {
        // Clock
        this.clockStop();
        this.isClockWise = true;
        this.currentSpeedIdx = 1;
        this.currentHour = 0;
        this.currentMinute = 15;
        this.hourHand.angle = 180;
        this.minuteHand.angle = 0;
        this.clockStart();
        this.vine.reset();
        this.clockButtons.forEach((button) => button.reset());
        this.floors[1].getComponent(StretchPlatformMechanism).reset();
        this.floors[2].getComponent(StretchPlatformMechanism).reset();
        this.directionStone.angle = 180;
    }

    onLoad() {
        this.node.zIndex = -1;
        this.status = 'normal';
        this.clockButtons.forEach((button) => {
            button.node.on('active', () => {
                if (this.clockButtons.filter((button) => button.isActived === true).length === 3) {
                    this.transferPoint.name = 'TransferPoint';
                }
            });
        });
        this.directionStone.on('onClick', (skill: 'accelerate' | 'slowdown' | 'rollback') => this.onMultiFuncionDirectionStoneClick(skill));
        this.clockStart();
        this.transferPoint.name = 'UnActivedTransferPoint';
        this.node.emit('reset');
    }

    update() {
        // Stair
        if (this.currentHour === 0 || this.currentHour === 3 || this.currentHour === 6 || this.currentHour === 9) {
            this.stair.active = true;
        } else {
            this.stair.active = false;
        }
        // Floor
        this.floors[0].active = this.currentMinute >= 0 && this.currentMinute <= 25;
        this.floors[4].active = this.currentMinute >= 0 && this.currentMinute <= 25;
        this.floors[3].active = this.currentMinute >= 36 && this.currentMinute <= 59;
        // StretchFloore
        if ((this.currentMinute === 20 && this.isClockWise) || (this.currentMinute === 50 && !this.isClockWise)) {
            this.floors[1].getComponent(StretchPlatformMechanism).stretch();
            this.floors[2].getComponent(StretchPlatformMechanism).stretch();
        } else if ((this.currentMinute === 35 && this.isClockWise) || (this.currentMinute === 35 && !this.isClockWise)) {
            this.floors[1].getComponent(StretchPlatformMechanism).shrink();
            this.floors[2].getComponent(StretchPlatformMechanism).shrink();
        }
        // Energe Stone
        switch (this.currentHour) {
            case 0:
                this.directionStone.angle = 90;
                break;
            case 1:
            case 2: {
                this.directionStone.angle = 60;
                break;
            }
            case 3:
                this.directionStone.angle = 0;
                break;
            case 4:
            case 5:
                this.directionStone.angle = 330;
                break;
            case 6:
                this.directionStone.angle = 270;
                break;
            case 7:
            case 8:
                this.directionStone.angle = 210;
                break;
            case 9:
                this.directionStone.angle = 180;
                break;
            case 10:
            case 11:
                this.directionStone.angle = 150;
                break;
            default:
                break;
        }
    }

    public accelerate() {
        if (this.currentSpeedIdx !== 2) {
            this.currentSpeedIdx++;
            this.floors[1].getComponent(StretchPlatformMechanism).changeSpeed(this.speedOptions[this.currentSpeedIdx]);
            this.floors[2].getComponent(StretchPlatformMechanism).changeSpeed(this.speedOptions[this.currentSpeedIdx]);
            (this.hourHandTween as any)._finalAction._speed = this.speedOptions[this.currentSpeedIdx];
            (this.minuteHandTween as any)._finalAction._speed = this.speedOptions[this.currentSpeedIdx];
            this.floors[1].getComponent(StretchPlatformMechanism).changeSpeed(this.speedOptions[this.currentSpeedIdx]);
            this.floors[2].getComponent(StretchPlatformMechanism).changeSpeed(this.speedOptions[this.currentSpeedIdx]);
        }
    }

    public slowdown() {
        if (this.currentSpeedIdx !== 0) {
            this.currentSpeedIdx--;
            this.floors[1].getComponent(StretchPlatformMechanism).changeSpeed(this.speedOptions[this.currentSpeedIdx]);
            this.floors[2].getComponent(StretchPlatformMechanism).changeSpeed(this.speedOptions[this.currentSpeedIdx]);
            (this.hourHandTween as any)._finalAction._speed = this.speedOptions[this.currentSpeedIdx];
            (this.minuteHandTween as any)._finalAction._speed = this.speedOptions[this.currentSpeedIdx];
            this.floors[1].getComponent(StretchPlatformMechanism).changeSpeed(this.speedOptions[this.currentSpeedIdx]);
            this.floors[2].getComponent(StretchPlatformMechanism).changeSpeed(this.speedOptions[this.currentSpeedIdx]);
        }
    }

    public rollback() {
        this.isClockWise = !this.isClockWise;
        this.clockStop();
        this.clockStart(this.speedOptions[this.currentSpeedIdx]);
        this.floors[1].getComponent(StretchPlatformMechanism).changeDirection();
        this.floors[2].getComponent(StretchPlatformMechanism).changeDirection();
    }

    private clockStart(speed?: number) {
        this.hourHandTween = cc
            .tween(this.hourHand)
            .by(this.secondPerCircle * 12, { angle: 360 * (this.isClockWise ? -1 : 1) })
            .repeatForever()
            .start();
        this.minuteHandTween = cc
            .tween(this.minuteHand)
            .by(this.secondPerCircle / 60, { angle: 6 * (this.isClockWise ? -1 : 1) })
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
                this.timeTxt.string = `${this.currentHour >= 10 ? '' : '0'}${this.currentHour} : ${this.currentMinute >= 10 ? '' : '0'}${this.currentMinute}`;
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

    private onMultiFuncionDirectionStoneClick(skill: 'accelerate' | 'slowdown' | 'rollback') {
        switch (this.directionStone.angle) {
            case 60:
                if (this.floors[3].active === false && this.floors[4].active === false && skill === 'accelerate') {
                    this.vine.accelerate();
                }
                break;
            case 330:
                break;
            case 210:
                break;
            case 180:
                if (skill === 'accelerate') {
                    this.accelerate();
                } else if (skill === 'rollback') {
                    this.rollback();
                } else if (skill === 'slowdown') {
                    this.slowdown();
                }
                break;
            default:
                break;
        }
    }
}
