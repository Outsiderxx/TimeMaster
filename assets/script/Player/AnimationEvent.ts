import PlayerManager, { StateSet } from './PlayerManager'
const { ccclass, property } = cc._decorator;

@ccclass
export default class AnimationEvent extends cc.Component {

    @property(PlayerManager)
    private playerManager: PlayerManager = null;
    @property(cc.Node)
    private effect: cc.Node = null;

    private effectAnimation: cc.Animation = null;
    onLoad() {
        this.effectAnimation = this.effect.getComponent(cc.Animation);
    }
    public endHurt() {
        this.playerManager.playerState = StateSet.none;
        console.log("endHurt");
    }

    public endSkill() {
        this.playerManager.playerState = StateSet.none;
        console.log("endSkill");
    }

    public endJump() {
        this.playerManager.playerState = StateSet.none;
        console.log("endJump");
    }

    public afterAccelExpend() {
        console.log("accel");
        this.effectAnimation.play("accel");

    }

    public afterReverseExpend() {
        console.log("rollBack");
        this.effectAnimation.play("rollBack");

    }

    public afterSlowExpend() {
        console.log("slow");
        this.effectAnimation.play("slow");

    }
    public noneEffect() {

        this.effectAnimation.play();

    }
}
