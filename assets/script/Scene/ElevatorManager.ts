// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    private isWorking: boolean = false;
    private animationState: cc.AnimationState = null;
    
    onLoad() {
        this.node.getComponent(cc.Animation).on('finished', this.elevatorControl, this);
    }

    public elevatorTriggered() {
        if(this.node.getComponent(cc.Animation).currentClip?.name !== 'elevatorDown' && this.isWorking === false) {
            this.animationState = this.node.getComponent(cc.Animation).play('elevatorDown');
            this.node.getComponent(cc.Animation).play('elevatorDown');
            this.isWorking = true;
        }
    }

    private elevatorControl() {
        if(this.node.getComponent(cc.Animation).currentClip?.name === 'elevatorDown') {
            this.animationState = this.node.getComponent(cc.Animation).play('elevatorStaying');
            this.node.getComponent(cc.Animation).play('elevatorStaying');
        }else if(this.node.getComponent(cc.Animation).currentClip?.name === 'elevatorStaying') {
            this.animationState = this.node.getComponent(cc.Animation).play('elevatorReturn');
            this.node.getComponent(cc.Animation).play('elevatorReturn');
        }else if(this.node.getComponent(cc.Animation).currentClip?.name === 'elevatorReturn') {
            this.isWorking = false;
            this.animationState = null;
        }   
    }

    private onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if(other.node.name === "EnergyRockSkillArea") {
            this.animationState.speed = 1/15;
        }
    }

    private onCollisionExit(other: cc.Collider, self: cc.Collider) {
        if(other.node.name === "EnergyRockSkillArea") {
            this.animationState.speed = 1;
        }
    }


    // update (dt) {}
}
