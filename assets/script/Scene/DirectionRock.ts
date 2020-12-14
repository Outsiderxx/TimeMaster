// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import TimeEffect from '../TimeEffect'
import JaggedMechanism from './JaggedMechanism'
import WeaponBody from '../Monster/WeaponBody'

export enum skillType {
    none = -1,
    accelerate,
    slowdown,
    rollback,
}

const {ccclass, property} = cc._decorator;

@ccclass
export default class DirectionRock extends TimeEffect {

    onLoad() {
        this.status = 'normal';
    }

    public accelerate() {
        this.shootRay(skillType.accelerate);
    }

    public slowdown() {
        this.shootRay(skillType.slowdown);
    }

    public rollback() {
        this.shootRay(skillType.rollback);
    }

    private shootRay(type: skillType) {
        const tempPoint: cc.Vec3 = this.node.parent.convertToWorldSpaceAR(this.node.position);
        let rayP1 = cc.v2(tempPoint.x, tempPoint.y);
        let rayP2;
        const angle = Math.round(this.node.angle);
        if(angle === 0) {
            rayP2 = cc.v2(tempPoint.x + 2000, tempPoint.y);
        } else if(angle === 90) {
            rayP2 = cc.v2(tempPoint.x, tempPoint.y + 1000);
        } else if(angle === 180) {
            rayP2 = cc.v2(tempPoint.x - 2000, tempPoint.y);
        } else if(angle === 270) {
            rayP2 = cc.v2(tempPoint.x, tempPoint.y - 1000);
        }
        const rayResults = cc.director.getPhysicsManager().rayCast(rayP1, rayP2, cc.RayCastType.AllClosest);
        for(let i = 0; i < rayResults.length; i++){
            const collider = rayResults[i].collider;
            if(collider.node.name === 'JaggedBody') {
                switch(type) {
                    case skillType.accelerate:
                        collider.node.parent.getComponent(JaggedMechanism).skillCaseFromDR(true);
                        collider.node.parent.getComponent(JaggedMechanism).accelerate();
                        collider.node.parent.getComponent(JaggedMechanism).skillCaseFromDR(false);
                        break;
                    case skillType.slowdown:
                        collider.node.parent.getComponent(JaggedMechanism).skillCaseFromDR(true);
                        collider.node.parent.getComponent(JaggedMechanism).slowdown();
                        collider.node.parent.getComponent(JaggedMechanism).skillCaseFromDR(false);
                        break;
                    case skillType.rollback:
                        collider.node.parent.getComponent(JaggedMechanism).skillCaseFromDR(true);
                        collider.node.parent.getComponent(JaggedMechanism).rollback();
                        collider.node.parent.getComponent(JaggedMechanism).skillCaseFromDR(false);
                        break;
                }
                break;
            } else if(collider.node.name === 'BossWeapon') {
                switch(type) {
                    case skillType.accelerate:
                        collider.node.children[0].getComponent(WeaponBody).accelerate();
                        break;
                    case skillType.slowdown:
                        collider.node.children[0].getComponent(WeaponBody).slowdown();
                        break;
                    case skillType.rollback:
                        collider.node.children[0].getComponent(WeaponBody).rollback();
                        break;
                }
                break;
            }
        }
    }

    public reset() {}
    
}
