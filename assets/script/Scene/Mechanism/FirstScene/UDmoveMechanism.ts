// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class LRmoveMechanism extends cc.Component {

    private animationState: cc.AnimationState = null;
    
    onLoad() {
        this.node.getComponent(cc.Animation).play('rockMoveUp');
        this.node.getComponent(cc.Animation).on('finished', this.elevatorControl, this);
    }

    private elevatorControl() {
        if(this.node.getComponent(cc.Animation).currentClip?.name === 'rockMoveUp') {
            this.animationState = this.node.getComponent(cc.Animation).play('rockMoveDown');
            this.node.getComponent(cc.Animation).play('rockMoveDown');
        }else if(this.node.getComponent(cc.Animation).currentClip?.name === 'rockMoveDown') {
            this.animationState = this.node.getComponent(cc.Animation).play('rockMoveUp');
            this.node.getComponent(cc.Animation).play('rockMoveUp');
        }
    }

    private onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if(other.node.name === "EnergyRockSkillArea") {
            this.animationState.speed = 0.25;
        }
    }

    private onCollisionExit(other: cc.Collider, self: cc.Collider) {
        if(other.node.name === "EnergyRockSkillArea") {
            this.animationState.speed = 1;
        }
    }


    // update (dt) {}
}
