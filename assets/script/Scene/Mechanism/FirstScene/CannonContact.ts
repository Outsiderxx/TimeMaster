const { ccclass, property } = cc._decorator;

@ccclass
export default class CannonContact extends cc.Component {
    @property(cc.Animation)
    private CannonAnimation: cc.Animation = null;
    @property(cc.AudioClip)
    private sound: cc.AudioClip = null;

    private isHit: boolean = false;

    onLoad() {
        this.CannonAnimation.on('play', () => {
            this.node.active = true;
            if (this.CannonAnimation.currentClip.name === 'Explosion') {
                this.node.group = 'Skill';
            } else {
                this.node.group = 'Damage';
            }
        });
        this.CannonAnimation.on('finished', () => {
            if (this.CannonAnimation.currentClip.name === 'Explosion') {
                this.node.group = 'Damage';
            } else {
                this.node.group = 'Skill';
            }
            if (this.isHit) {
                this.node.active = false;
            }
        });
    }

    onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if (other.node.group === 'default' || other.node.group === 'Monster') {
            cc.audioEngine.playEffect(this.sound, false);
            this.CannonAnimation.play('Explosion');
            if (other.node.group === 'Monster') {
                this.isHit = true;
            } else {
                this.isHit = false;
            }
        }
    }

    public reset() {
        this.isHit = false;
    }
}
