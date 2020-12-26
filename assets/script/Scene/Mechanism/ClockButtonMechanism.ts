const { ccclass, property } = cc._decorator;

@ccclass
export default class ClockButtonMechanism extends cc.Component {
    @property(cc.SpriteFrame)
    private nonActivedSpriteFrame: cc.SpriteFrame = null;

    @property(cc.AudioClip)
    private buttonEffect: cc.AudioClip = null;

    public isActived: boolean = false;

    public active() {
        this.isActived = true;
        this.node.getComponent(cc.Animation).play();
        this.node.emit('active');
    }

    public reset() {
        this.node.getComponent(cc.Sprite).spriteFrame = this.nonActivedSpriteFrame;
        this.isActived = false;
    }

    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if (other.node.name === 'Player' && !this.isActived) {
            const id: number = cc.audioEngine.playEffect(this.buttonEffect, false);
            cc.audioEngine.setVolume(id, 1);
            this.active();
        }
    }
}
