import TimeEffect from '../TimeEffect';
import elevatorManager from './ElevatorManager';
import gateManager from './Mechanism/FirstScene/GateMechanism';
const { ccclass, property } = cc._decorator;

@ccclass
export default class Button extends TimeEffect {
    @property([cc.Node])
    private target: cc.Node[] = [];

    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if (other.node.name === 'Player') {
            for (let i = 0; i < this.target.length; i++) {
                if (this.target[i].name === 'Elevator') {
                    this.node.getComponent(cc.Animation).play('clickBtn');
                    this.target[i].getComponent(elevatorManager).elevatorTriggered();
                }
                if (this.target[i].name === 'Gate' && !this.target[i].getComponent(gateManager).buttonFirstTriggered) {
                    this.node.getComponent(cc.Animation).play('gateBtn');
                    this.target[i].getComponent(gateManager).buttonTrigger();
                }
            }
        }
    }


    public accelerate() { }

    public slowdown() { }

    public rollback() { }

    public reset() {

        this.node.getComponent(cc.Animation).play('clickBtn');
    }

}
