import TimeEffect from '../../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class UpDownMoveRockMechanism extends TimeEffect {
    @property
    private movingSpeed: number = 0;

    @property(cc.Sprite)
    private platform: cc.Sprite = null;

    private currentTween: cc.Tween = null;

    onLoad() {
        this.currentTween = cc
            .tween(this.platform.node)
            .repeatForever(cc.tween().to(this.movingSpeed, { y: 300 }).to(this.movingSpeed, { y: 0 }))
            .start();
        (this.currentTween as any)._finalAction._speedMethod = true;
        this.status = 'normal';
    }

    public accelerate() {
        this.changeMovingSpeed(false);
    }

    public slowdown() {
        this.changeMovingSpeed(true);
    }

    public rollback() {}

    public reset() {
        this.changeMovingSpeed(true, true);
    }

    private changeMovingSpeed(slowdown: boolean, reset: boolean = false) {
        switch (this.status) {
            case 'normal':
                (this.currentTween as any)._finalAction._speed = slowdown ? 0.3 : 3;
                this.status = slowdown ? 'slowdown' : 'speedup';
                break;
            case 'speedup':
                (this.currentTween as any)._finalAction._speed = slowdown ? 1 : 3;
                this.status = slowdown ? 'normal' : 'speedup';
                break;
            case 'slowdown':
                (this.currentTween as any)._finalAction._speed = slowdown ? 0.3 : 1;
                this.status = slowdown ? 'slowdown' : 'normal';
                break;
            default:
                break;
        }
        if (reset) {
            (this.currentTween as any)._finalAction._speed = 1;
            this.status = 'normal';
        }
    }
}
