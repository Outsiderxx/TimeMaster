import TimeEffect from '../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class NormalElevatorMechanism extends TimeEffect {
    @property([cc.Node])
    private chains: cc.Node[] = [];

    @property(cc.Vec2)
    private highPosition: cc.Vec2 = new cc.Vec2();

    @property(cc.Vec2)
    private lowPosition: cc.Vec2 = new cc.Vec2();

    @property(cc.Node)
    private testNode: cc.Node = null;

    @property
    private chainHighHeight: number = 0;

    @property
    private chainLowHeight: number = 0;

    @property
    private movingSecond: number = 0;

    @property
    private remainSecond: number = 0;

    private chainOneTween: cc.Tween = null;
    private chainTwoTween: cc.Tween = null;
    private elevatorTween: cc.Tween = null;

    private isMoving: boolean = false;

    onLoad() {
        this.chains[0].zIndex = -1;
        this.chains[1].zIndex = -1;
        this.testNode.on(cc.Node.EventType.TOUCH_END, () => this.elevatorTriggered());
    }

    public elevatorTriggered() {
        if (this.isMoving) {
            return;
        }
        this.reset();
        this.isMoving = true;
        this.elevatorTween = cc
            .tween(this.node)
            .delay(2)
            .to(this.movingSecond, { y: this.highPosition.y })
            .delay(this.remainSecond)
            .to(this.movingSecond, { y: this.lowPosition.y })
            .call(() => (this.isMoving = false))
            .start();
        this.chainOneTween = cc
            .tween(this.chains[0])
            .delay(2)
            .to(this.movingSecond, { height: this.chainHighHeight })
            .delay(this.remainSecond)
            .to(this.movingSecond, { height: this.chainLowHeight })
            .start();
        this.chainTwoTween = cc
            .tween(this.chains[1])
            .delay(2)
            .to(this.movingSecond, { height: this.chainHighHeight })
            .delay(this.remainSecond)
            .to(this.movingSecond, { height: this.chainLowHeight })
            .start();
    }

    // 為了能讓 sceneManager call reset 所以要繼承 TimeEffect
    public accelerate() {}
    public slowdown() {}
    public rollback() {}

    public reset() {
        this.chainOneTween?.stop();
        this.chainTwoTween?.stop();
        this.elevatorTween?.stop();
        this.node.setPosition(this.lowPosition);
        this.chains[0].height = this.chainLowHeight;
        this.chains[1].height = this.chainLowHeight;
        this.isMoving = false;
    }
}
