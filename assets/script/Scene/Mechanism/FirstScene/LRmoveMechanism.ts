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
        this.node.getComponent(cc.Animation).play('rockMoveRight');
        this.node.getComponent(cc.Animation).on('finished', this.elevatorControl, this);
    }

    private elevatorControl() {
        if(this.node.getComponent(cc.Animation).currentClip?.name === 'rockMoveRight') {
            this.animationState = this.node.getComponent(cc.Animation).play('rockMoveStayR');
            this.node.getComponent(cc.Animation).play('rockMoveStayR');
        }else if(this.node.getComponent(cc.Animation).currentClip?.name === 'rockMoveStayR') {
            this.animationState = this.node.getComponent(cc.Animation).play('rockMoveLeft');
            this.node.getComponent(cc.Animation).play('rockMoveLeft');
        }else if(this.node.getComponent(cc.Animation).currentClip?.name === 'rockMoveLeft') {
            this.animationState = this.node.getComponent(cc.Animation).play('rockMoveStayL');
            this.node.getComponent(cc.Animation).play('rockMoveStayL');
        }else if(this.node.getComponent(cc.Animation).currentClip?.name === 'rockMoveStayL'){
            this.animationState = this.node.getComponent(cc.Animation).play('rockMoveRight');
            this.node.getComponent(cc.Animation).play('rockMoveRight');
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
