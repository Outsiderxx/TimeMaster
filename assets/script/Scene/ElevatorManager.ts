import TimeEffect from '../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ElevatorManager extends TimeEffect {
    @property([cc.Node])
    private chains: cc.Node[] = [];

    @property(cc.Node)
    private test: cc.Node = null;

    private downAnimationState: cc.AnimationState = null;
    private upAnimationState: cc.AnimationState = null;
    private stayAnimationState: cc.AnimationState = null;
    private chainOneTween: cc.Tween = null;
    private chainTwoTween: cc.Tween = null;
    private currentSpeedRatio: number = 1;

    onLoad() {
        this.chains[0].zIndex = -1;
        this.chains[1].zIndex = -1;
        this.node.getComponent(cc.Animation).on('finished', this.elevatorControl, this);
        this.test.on(cc.Node.EventType.TOUCH_END, () => this.elevatorTriggered());
        this.downAnimationState = this.node.getComponent(cc.Animation).getAnimationState('elevatorDown');
        this.upAnimationState = this.node.getComponent(cc.Animation).getAnimationState('elevatorReturn');
        this.stayAnimationState = this.node.getComponent(cc.Animation).getAnimationState('elevatorStaying');
    }

    public elevatorTriggered() {
        this.reset();
        this.node.getComponent(cc.Animation).play('elevatorDown');
        this.chainOneTween = cc.tween(this.chains[0]).to(1, { y: 593 }).start();
        this.chainTwoTween = cc.tween(this.chains[1]).to(1, { y: 593 }).start();
        (this.chainOneTween as any)._finalAction._speedMethod = true;
        (this.chainTwoTween as any)._finalAction._speedMethod = true;
        this.onChangeSpeed('normal');
    }

    // 為了能讓 sceneManager call reset 所以要繼承 TimeEffect
    public accelerate() { }
    public slowdown() { }
    public rollback() { }

    public reset() {
        this.node.getComponent(cc.Animation).stop();
        this.chainOneTween?.stop();
        this.chainTwoTween?.stop();
        this.node.position.y = 235;
        this.chains[0].y = 830;
        this.chains[1].y = 830;
    }

    private elevatorControl() {
        if (this.node.getComponent(cc.Animation).currentClip?.name === 'elevatorDown') {
            // 電梯向下結束
            this.node.getComponent(cc.Animation).play('elevatorStaying');
            this.onChangeSpeed('specific');
        } else if (this.node.getComponent(cc.Animation).currentClip?.name === 'elevatorStaying') {
            // 電梯停留結束
            this.node.getComponent(cc.Animation).play('elevatorReturn');
            this.chainOneTween = cc.tween(this.chains[0]).to(1, { y: 830 }).start();
            this.chainTwoTween = cc.tween(this.chains[1]).to(1, { y: 830 }).start();
            (this.chainOneTween as any)._finalAction._speedMethod = true;
            (this.chainTwoTween as any)._finalAction._speedMethod = true;
            this.onChangeSpeed('set');
        } else if (this.node.getComponent(cc.Animation).currentClip?.name === 'elevatorReturn') {
            // 電梯向上結束
        }
    }

    private onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (other.node.name === 'EnergyRockSkillArea') {
            // 判斷當前能量球效果
            this.onChangeSpeed('slowdown');
        }
    }

    private onCollisionExit(other: cc.Collider, self: cc.Collider) {
        if (other.node.name === 'EnergyRockSkillArea') {
            this.onChangeSpeed('normal');
        }
    }

    private onChangeSpeed(speed: 'normal' | 'slowdown' | 'speedup' | 'set' | 'specific') {
        // set: 使用當前速率  specific: 使用特定速率但不保留 (for stayAnimation);
        let originSpeedRatio: number = null;
        switch (speed) {
            case 'normal':
                this.currentSpeedRatio = 1;
                break;
            case 'slowdown':
                this.currentSpeedRatio = 1 / 15;
                break;
            case 'speedup':
                this.currentSpeedRatio = 2;
                break;
            case 'set':
                break;
            case 'specific':
                originSpeedRatio = this.currentSpeedRatio;
                this.currentSpeedRatio = 1;
                break;
            default:
                break;
        }
        this.downAnimationState.speed = this.currentSpeedRatio;
        this.upAnimationState.speed = this.currentSpeedRatio;
        this.stayAnimationState.speed = this.currentSpeedRatio;
        (this.chainOneTween as any)._finalAction._speed = this.currentSpeedRatio;
        (this.chainTwoTween as any)._finalAction._speed = this.currentSpeedRatio;
        if (speed === 'specific') {
            this.currentSpeedRatio = originSpeedRatio;
        }
    }
}
