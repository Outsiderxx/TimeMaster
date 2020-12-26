import TimeEffect from '../../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BridgeMechanism extends TimeEffect {
    @property(cc.Animation)
    private bridgeAnimation: cc.Animation = null;
    @property(cc.AudioClip)
    private break: cc.AudioClip = null;
    @property(cc.AudioClip)
    private build: cc.AudioClip = null;

    onLoad() {
        this.status = 'triggered';
        this.bridgeAnimation.on('play', () => {
            this.status = 'transforming';
        });
        this.bridgeAnimation.on('finished', () => {
            this.status = this.bridgeAnimation.currentClip.name === 'breakingBridge' ? 'triggered' : 'original';
        });
    }

    public rollback() {
        cc.audioEngine.playEffect(this.build, false);
        this.bridgeAnimation.play('unBreakingBridge');
    }

    public accelerate() {
        cc.audioEngine.playEffect(this.break, false);
        this.bridgeAnimation.play('breakingBridge');
    }

    public slowdown() {}

    public reset() {
        this.status = 'triggered';
        this.bridgeAnimation.node.setPosition(724, -200);
    }
}
