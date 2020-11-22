const { ccclass } = cc._decorator;

@ccclass
export default class CrossFloor extends cc.Component {
    private onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (other.node.name === 'Player') {
            this.node.emit('crossFloor');
        }
    }
}
