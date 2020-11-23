// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import TimeEffect from '../TimeEffect';
const { ccclass, property } = cc._decorator;

@ccclass
export default class EnergyRock extends TimeEffect {
    @property(cc.Animation)
    private energyRockAnimation: cc.Animation = null;

    private isOpen: boolean = false;

    onLoad() {
        this.status = 'normal';
    }

    public rollback() {}

    public accelerate() {}

    public slowdown() {
        if (this.isOpen) {
            this.reset();
        } else {
            this.isOpen = true;
            this.energyRockAnimation.play('EnergyRockRecharged');
            this.energyRockAnimation.getComponent(cc.CircleCollider).radius = 196;
        }
    }

    public reset() {
        this.isOpen = false;
        this.energyRockAnimation.play('EnergyRockEmpty');
        this.energyRockAnimation.getComponent(cc.CircleCollider).radius = 0;
    }
}
