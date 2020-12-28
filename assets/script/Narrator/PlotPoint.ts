const { ccclass, property } = cc._decorator;

@ccclass
export default class PlotPoint extends cc.Component {
    private onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (other.node.name === 'Player') {
            this.node.emit('trigger');
        }
    }

    private onCollisionExit(other: cc.Collider, self: cc.Collider) {
        if (other.node.name === 'Player') {
            this.node.emit('untrigger');
        }
    }
}
