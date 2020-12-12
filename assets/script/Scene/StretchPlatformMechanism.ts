import TimeEffect from '../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class StretchPlatformMechanism extends TimeEffect {
    @property
    private initX: number = 0;

    @property
    private targetX: number = 0;

    private currentTween: cc.Tween = null;
    private currentSpeed: number = 1;
    private energeSpeed: number = 1;
    private distance: number = 0;
    private isMoving: boolean = false;
    private toRight: boolean = true;

    onLoad() {
        this.node.zIndex = -1;
        this.distance = this.targetX - this.initX;
    }

    public stretch() {
        this.currentTween?.stop();
        this.isMoving = true;
        this.toRight = true;
        this.currentTween = cc
            .tween(this.node)
            .to((2.5 * (this.targetX - this.node.x)) / this.distance, { x: this.targetX })
            .call(() => (this.isMoving = false))
            .start();
        (this.currentTween as any)._finalAction._speedMethod = true;
        (this.currentTween as any)._finalAction._speed = this.currentSpeed * this.energeSpeed;
    }

    public shrink() {
        this.currentTween?.stop();
        this.isMoving = true;
        this.toRight = false;
        this.currentTween = cc
            .tween(this.node)
            .to((2.5 * (this.node.x - this.initX)) / this.distance, { x: this.initX })
            .call(() => (this.isMoving = false))
            .start();
        (this.currentTween as any)._finalAction._speedMethod = true;
        (this.currentTween as any)._finalAction._speed = this.currentSpeed * this.energeSpeed;
    }

    public changeSpeed(speed: number) {
        this.currentSpeed = speed;
        if (this.isMoving) {
            (this.currentTween as any)._finalAction._speed = speed * this.energeSpeed;
        }
    }

    public changeDirection() {
        if (this.isMoving) {
            if (this.toRight) {
                this.shrink();
            } else {
                this.stretch();
            }
        }
    }

    public accelerate() {}

    public slowdown() {}

    public rollback() {}

    public reset() {
        this.currentTween?.stop();
        this.energeSpeed = 1;
        this.isMoving = false;
        this.toRight = true;
        this.node.x = this.initX;
    }

    private onCollisionEnter(other: cc.Collider) {
        if (other.node.name === 'EnergyRockSkillArea') {
            this.energeSpeed = 5;
            this.changeSpeed(this.currentSpeed);
        }
    }

    private onCollisionExit(other: cc.Collider) {
        if (other.node.name === 'EnergyRockSkillArea') {
            this.energeSpeed = 1;
            this.changeSpeed(this.currentSpeed);
        }
    }
}
