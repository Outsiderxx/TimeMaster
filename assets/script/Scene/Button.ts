import elevatorManager from './ElevatorManager';
const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Node)
    private elevator: cc.Node = null;

    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if (other.node.name === 'Player') {
            this.node.getComponent(cc.Animation).play();
            this.elevator.getComponent(elevatorManager).elevatorTriggered();
        }
    }
}
