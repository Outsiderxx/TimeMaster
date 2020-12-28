import TimeEffect from '../../../TimeEffect';
import CannonContact from './CannonContact';

const { ccclass, property } = cc._decorator;

@ccclass
export default class CannonMechanism extends TimeEffect {
    @property(cc.Animation)
    private CannonBody: cc.Animation = null;
    @property(cc.Animation)
    private CannonMap: cc.Animation = null;
    @property(cc.AudioClip)
    private sound: cc.AudioClip = null;

    onLoad() {
        this.status = 'triggered';
        this.CannonBody.on('finished', () => {
            if (this.CannonBody.currentClip.name === 'CannonFlyOut') {
                cc.audioEngine.playEffect(this.sound, false);
                this.CannonMap.play('MapBreak');
            }
        });
    }

    public rollback() {
        this.status = 'original';
        this.CannonMap.play('MapBuild');
        cc.audioEngine.playEffect(this.sound, false);
        this.CannonBody.play('CannonFlyBack');
    }

    public accelerate() {
        this.status = 'triggered';
        this.CannonBody.play('CannonFlyOut');
    }

    public slowdown() {}

    public reset() {
        this.status = 'triggered';
        this.CannonMap.play('MapBreak');
        this.CannonBody.node.setPosition(1580, 180);
        this.CannonBody.getComponent(CannonContact).reset();
    }
}
