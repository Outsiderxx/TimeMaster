import TimeEffect from '../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class SilkMechanism extends TimeEffect {
    @property(cc.Animation)
    private silkAnimation: cc.Animation = null;
    @property(cc.Boolean)
    private silkStatus: boolean = false;
    @property(cc.AudioClip)
    private skilkEffect: cc.AudioClip = null;

    onLoad() {
        this.status = this.silkStatus === true ? 'triggered' : 'original';
        this.silkAnimation.on('play', () => {
            this.status = 'transforming';
        });
        this.silkAnimation.on('finished', () => {
            this.status = this.silkAnimation.currentClip.name === 'silkGrows' ? 'triggered' : 'original';
            const climbCollider: cc.BoxCollider = this.silkAnimation.getComponent(cc.BoxCollider);
            const skillCollider: cc.BoxCollider = this.getComponent(cc.BoxCollider);
            if (this.silkAnimation.currentClip.name === 'silkGrows') {
                skillCollider.size.height = 596;
                skillCollider.offset.y = -302;
                climbCollider.size.height = 437;
                climbCollider.offset.y = -41;
            } else {
                skillCollider.size.height = 215;
                skillCollider.offset.y = -112;
                climbCollider.size.height = 155;
                climbCollider.offset.y = 100;
            }
        });
    }

    public rollback() {
        cc.audioEngine.playEffect(this.skilkEffect, false);
        this.silkAnimation.play('silkGrownBack');
    }

    public accelerate() {
        cc.audioEngine.playEffect(this.skilkEffect, false);
        this.silkAnimation.play('silkGrows');
    }

    public slowdown() {}

    public reset() {
        if (this.silkStatus) {
            this.status = 'triggered';
            this.silkAnimation.play('silkGrows');
        } else {
            this.status = 'original';
            this.silkAnimation.play('silkGrownBack');
        }
    }
}
