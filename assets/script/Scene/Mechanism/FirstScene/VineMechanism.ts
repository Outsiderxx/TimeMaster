import TimeEffect from '../../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class VineMechanism extends TimeEffect {
    @property(cc.Animation)
    private vineAnimation: cc.Animation = null;
    @property(cc.Boolean)
    private vineStatus: boolean = false;
    // TODO: need to add joint point at the root
    @property(cc.AudioClip)
    private sound: cc.AudioClip = null;

    onLoad() {
        this.status = this.vineStatus === true ? 'triggered' : 'original';
        this.vineAnimation.on('play', () => {
            this.status = 'transforming';
            this.node.emit('status', this.status);
        });
        this.vineAnimation.on('finished', () => {
            this.status = this.vineAnimation.currentClip.name === 'vineGrows' ? 'triggered' : 'original';
            this.node.emit('status', this.status);
            const climbCollider: cc.BoxCollider = this.vineAnimation.getComponent(cc.BoxCollider);
            const skillCollider: cc.BoxCollider = this.getComponent(cc.BoxCollider);
            climbCollider.size.height = this.vineAnimation.node.height;
            climbCollider.offset.y = -this.vineAnimation.node.height / 2;
            if (this.vineAnimation.currentClip.name === 'vineGrows') {
                skillCollider.size.height = this.vineAnimation.node.height * 0.8; //animation size's problem
                skillCollider.offset.y = -this.vineAnimation.node.height / 2;
            } else {
                skillCollider.size.height = 150;
                skillCollider.offset.y = -75;
            }
        });
    }

    public rollback() {
        cc.audioEngine.playEffect(this.sound, false);
        this.vineAnimation.play('vineGrownBack');
    }

    public accelerate() {
        cc.audioEngine.playEffect(this.sound, false);
        this.vineAnimation.play('vineGrows');
    }

    public slowdown() {}

    public reset() {
        if (this.vineStatus) {
            this.status = 'triggered';
            this.vineAnimation.play('vineGrows');
        } else {
            this.status = 'original';
            this.vineAnimation.play('vineGrownBack');
        }
    }
}
