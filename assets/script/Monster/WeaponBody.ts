// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import TimeEffect from '../TimeEffect'
import BossWeapon from './BossWeapon'

const {ccclass, property} = cc._decorator;

@ccclass
export default class BossWeaponBody extends TimeEffect {

    onLoad() {
        this.status = 'normal';
    }

    public accelerate() {
        this.node.parent.getComponent(BossWeapon).accelerate();
    }
    
    public slowdown() {
        this.node.parent.getComponent(BossWeapon).slowdown();
    }

    public rollback() {
        this.node.parent.getComponent(BossWeapon).rollback();
    }

    public reset() {}
}
