const { ccclass, property } = cc._decorator;

@ccclass
export default class SpecialButton extends cc.Component {
    private animState: cc.AnimationState = null;
    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if (other.node.name === 'Player') {
            this.node.emit('triggered');
            if (!this.animState?.isPlaying) {
                this.animState = this.node.getComponent(cc.Animation).play();
            }
        }
    }
}
