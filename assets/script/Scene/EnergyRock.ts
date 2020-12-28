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
    @property(cc.Sprite)
    private energyRock: cc.Sprite = null;

    private isOpen: boolean = false;

    onLoad() {
        this.status = 'normal';
    }

    public rollback() {}

    public accelerate() {}

    public slowdown() {
        if (this.isOpen) {
            this.reset();
            this.node.emit('status', 'normal');
        } else {
            this.isOpen = true;
            this.energyRock.enabled = true;
            this.energyRock.getComponent(cc.CircleCollider).radius = 196;
            this.node.emit('status', 'slowdown');
        }
    }

    public reset() {
        this.status = 'normal';
        this.isOpen = false;
        this.energyRock.enabled = false;
        this.energyRock.getComponent(cc.CircleCollider).radius = 0;
    }
}
