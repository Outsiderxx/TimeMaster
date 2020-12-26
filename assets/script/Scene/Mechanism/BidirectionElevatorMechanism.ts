import TimeEffect from '../../TimeEffect';
import SpecialButton from '../SpecialButton';

const { ccclass, property } = cc._decorator;

@ccclass
export default class NormalElevatorMechanism extends TimeEffect {
    @property(SpecialButton)
    private downBtn: SpecialButton = null;

    @property(SpecialButton)
    private upBtn: SpecialButton = null;

    @property(cc.AudioClip)
    private elevatorEffect: cc.AudioClip = null;

    @property([cc.Node])
    private chains: cc.Node[] = [];

    @property(cc.Vec2)
    private highPosition: cc.Vec2 = new cc.Vec2();

    @property(cc.Vec2)
    private lowPosition: cc.Vec2 = new cc.Vec2();

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
    private isInHighPosition: boolean = true;
    private effectID: number = null;

    onLoad() {
        this.chains[0].zIndex = -1;
        this.chains[1].zIndex = -1;
        this.downBtn.node.on('triggered', () => {
            if (this.isInHighPosition) {
                this.elevatorDownward();
            } else {
                this.elevatorUpward();
            }
        });
        this.upBtn.node.on('triggered', () => {
            if (this.isInHighPosition) {
                this.elevatorDownward();
            } else {
                this.elevatorUpward();
            }
        });
    }

    private elevatorUpward() {
        if (this.isMoving && !this.isInHighPosition) {
            return;
        }
        this.isMoving = true;
        this.elevatorTween = cc
            .tween(this.node)
            .delay(this.remainSecond)
            .call(() => {
                this.effectID = cc.audioEngine.playEffect(this.elevatorEffect, false);
            })
            .to(this.movingSecond, { y: this.highPosition.y })
            .call(() => {
                this.isMoving = false;
                this.isInHighPosition = true;
                cc.audioEngine.stopEffect(this.effectID);
            })
            .start();
        this.chainOneTween = cc.tween(this.chains[0]).delay(this.remainSecond).to(this.movingSecond, { height: this.chainHighHeight }).start();
        this.chainTwoTween = cc.tween(this.chains[1]).delay(this.remainSecond).to(this.movingSecond, { height: this.chainHighHeight }).start();
    }

    private elevatorDownward() {
        if (this.isMoving && this.isInHighPosition) {
            return;
        }
        this.isMoving = true;
        this.elevatorTween = cc
            .tween(this.node)
            .delay(this.remainSecond)
            .call(() => {
                this.effectID = cc.audioEngine.playEffect(this.elevatorEffect, false);
            })
            .to(this.movingSecond, { y: this.lowPosition.y })
            .call(() => {
                this.isMoving = false;
                this.isInHighPosition = false;
                cc.audioEngine.stopEffect(this.effectID);
            })
            .start();
        this.chainOneTween = cc.tween(this.chains[0]).delay(this.remainSecond).to(this.movingSecond, { height: this.chainLowHeight }).start();
        this.chainTwoTween = cc.tween(this.chains[1]).delay(this.remainSecond).to(this.movingSecond, { height: this.chainLowHeight }).start();
    }

    // 為了能讓 sceneManager call reset 所以要繼承 TimeEffect
    public accelerate() {}
    public slowdown() {}
    public rollback() {}

    public reset() {
        this.chainOneTween?.stop();
        this.chainTwoTween?.stop();
        this.elevatorTween?.stop();
        this.node.setPosition(this.highPosition);
        this.chains[0].height = this.chainHighHeight;
        this.chains[1].height = this.chainHighHeight;
        this.isMoving = false;
        cc.audioEngine.stopEffect(this.effectID);
    }
}
