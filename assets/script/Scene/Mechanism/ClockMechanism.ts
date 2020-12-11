import TimeEffect from '../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ClockMechanism extends TimeEffect {
    @property(cc.Node)
    private hourHand: cc.Node = null;

    @property(cc.Node)
    private minuteHand: cc.Node = null;

    @property
    private secondPerCircle: number = 0;

    @property
    private isClockWise: boolean = true;

    @property
    private whichMethod: boolean = false;

    private hourHandTween: cc.Tween = null;
    private minuteHandTween: cc.Tween = null;

    private isMoving: boolean = false;

    onLoad() {
        this.status = 'normal';
        if (this.whichMethod) {
        } else {
            this.clockStart();
        }
    }

    public accelerate() {
        if (this.whichMethod) {
            if (this.isMoving && (this.hourHandTween as any)._finalAction._speed === 1) {
                (this.hourHandTween as any)._finalAction._speed = 5;
                (this.minuteHandTween as any)._finalAction._speed = 5;
            } else if (!this.isMoving) {
                this.isClockWise = true;
                this.clockStart(5);
            } else if (!this.isClockWise && this.isMoving && (this.hourHandTween as any)._finalAction._speed === 5) {
                this.clockStop();
            }
        } else {
            (this.hourHandTween as any)._finalAction._speed *= 3;
            (this.minuteHandTween as any)._finalAction._speed *= 3;
        }
    }

    public slowdown() {
        if (this.whichMethod) {
            if (this.isMoving && (this.hourHandTween as any)._finalAction._speed === 5) {
                (this.hourHandTween as any)._finalAction._speed = 1;
                (this.minuteHandTween as any)._finalAction._speed = 1;
            }
        } else {
            (this.hourHandTween as any)._finalAction._speed /= 3;
            (this.minuteHandTween as any)._finalAction._speed /= 3;
        }
    }

    public rollback() {
        if (this.whichMethod) {
            if (this.isClockWise && this.isMoving) {
                this.clockStop();
            } else if (!this.isMoving) {
                this.isClockWise = false;
                this.clockStart(5);
            }
        } else {
            const currentSpeed: number = (this.hourHandTween as any)._finalAction._speed;
            this.isClockWise = !this.isClockWise;
            this.clockStop();
            this.clockStart(currentSpeed);
        }
    }

    public reset() {
        this.clockStop();
        this.hourHand.angle = 0;
        this.minuteHand.angle = 0;
        if (this.whichMethod) {
        } else {
            this.clockStart();
        }
    }

    private clockStart(speed?: number) {
        this.isMoving = true;
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
        this.isMoving = false;
        this.hourHandTween.stop();
        this.minuteHandTween.stop();
    }
}
