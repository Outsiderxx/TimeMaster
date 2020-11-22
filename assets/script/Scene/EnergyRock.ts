// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import TimeEffect from '../TimeEffect';
const {ccclass, property} = cc._decorator;

@ccclass
export default class EnergyRock extends TimeEffect {

    @property(cc.Animation)
    private energyRockAnimation: cc.Animation = null;

    onLoad() {
        this.status = 'normal';
    }

    public rollback() {}

    public accelerate() {}

    public slowdown() {
        this.status = 'triggered';
        this.energyRockAnimation.play('EnergyRockRecharged');
        this.energyRockAnimation.getComponent(cc.CircleCollider).radius = 196;
        // this.schedule(this.reset, 10, 0);
    }

    public reset() {
        this.status = 'normal';
        this.energyRockAnimation.play('EnergyRockEmpty');
        this.energyRockAnimation.getComponent(cc.CircleCollider).radius = 0;
    }

}
