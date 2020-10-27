// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    private attackSpeed: number = 0

    public setAttackParameter(directionLeft: boolean) {
        if(directionLeft) {
            this.node.angle = 15
            this.attackSpeed = 450
        }else {
            this.node.angle = -15
            this.attackSpeed = -450
        }
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.attackSpeed = 0
    }

    start () {

    }

    update (dt) {
        this.node.angle += this.attackSpeed * dt
        if(Math.abs(this.node.angle)>=150) {
            this.node.destroy()
        }
    }
}
