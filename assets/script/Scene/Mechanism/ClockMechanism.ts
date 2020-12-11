import TimeEffect from '../../TimeEffect';
import ClockButtonMechanism from './ClockButtonMechanism';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ClockMechanism extends TimeEffect {
    @property(cc.Node)
    private hourHand: cc.Node = null;

    @property(cc.Node)
    private minuteHand: cc.Node = null;

    @property([ClockButtonMechanism])
    private clockButtons: ClockButtonMechanism[] = [];

    @property
    private secondPerCircle: number = 0;

    @property
    private isClockWise: boolean = true;

    private hourHandTween: cc.Tween = null;
    private minuteHandTween: cc.Tween = null;
    private speedOptions: number[] = [1 / 243, 1, 5];
    private currentSpeedIdx: number = 1;

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
            .by(this.secondPerCircle * 60, { angle: 360 * (this.isClockWise ? -1 : 1) })
            .repeatForever()
            .start();
        this.minuteHandTween = cc
            .tween(this.minuteHand)
            .by(this.secondPerCircle, { angle: 360 * (this.isClockWise ? -1 : 1) })
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
