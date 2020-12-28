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
            this.node.emit('status', this.status);
        });
        this.bridgeAnimation.on('finished', () => {
            this.status = this.bridgeAnimation.currentClip.name === 'breakingBridge' ? 'triggered' : 'original';
            this.node.emit('status', this.status);
        });
    }

    public rollback() {
        cc.audioEngine.playEffect(this.build, false);
        this.bridgeAnimation.play('unBreakingBridge');
    }

    public accelerate() {
        const id: number = cc.audioEngine.playEffect(this.break, false);
        cc.audioEngine.setVolume(id, 0.3);
        this.bridgeAnimation.play('breakingBridge');
    }

    public slowdown() {}

    public reset() {
        this.status = 'triggered';
        this.bridgeAnimation.node.setPosition(724, -200);
    }
}
