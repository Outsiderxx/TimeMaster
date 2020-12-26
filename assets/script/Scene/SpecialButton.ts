const { ccclass, property } = cc._decorator;

@ccclass
export default class SpecialButton extends cc.Component {
    @property(cc.AudioClip)
    private buttonEffect: cc.AudioClip = null;

    private animState: cc.AnimationState = null;
    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if (other.node.name === 'Player') {
            this.node.emit('triggered');
            if (!this.animState?.isPlaying) {
                const id: number = cc.audioEngine.playEffect(this.buttonEffect, false);
                cc.audioEngine.setVolume(id, 1);
                this.animState = this.node.getComponent(cc.Animation).play();
            }
        }
    }
}
