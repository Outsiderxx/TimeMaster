const { ccclass, property } = cc._decorator;

@ccclass
export default class PlotPoint extends cc.Component {
    @property([cc.String])
    public sentences: string[] = [];

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
