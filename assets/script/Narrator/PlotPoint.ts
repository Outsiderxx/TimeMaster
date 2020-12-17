const { ccclass, property } = cc._decorator;

@ccclass
export default class PlotPoint extends cc.Component {
    @property
    private text: string = null;

    private onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (other.node.name === 'Player') {
            this.node.emit('trigger', this.text);
        }
    }

    private onCollisionExit(other: cc.Collider, self: cc.Collider) {
        if (other.node.name === 'Player') {
            this.node.emit('untrigger');
        }
    }
}
