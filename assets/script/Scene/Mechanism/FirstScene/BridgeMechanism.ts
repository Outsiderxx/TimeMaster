import Mechanism from '../Mechanism';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BridgeMechanism extends Mechanism {
    @property(cc.Animation)
    private bridgeAnimation: cc.Animation = null;

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
        this.bridgeAnimation.play('unBreakingBridge');
    }

    public accelerate() {
        this.bridgeAnimation.play('breakingBridge');
    }

    public slowdown() {}

    public reset() {
        this.status = 'triggered';
        this.bridgeAnimation.node.setPosition(724, -200);
    }
}
