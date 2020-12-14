import TimeEffect from '../../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class CannonMechanism extends TimeEffect {
    @property(cc.Animation)
    private CannonBody: cc.Animation = null;
    @property(cc.Animation)
    private CannonMap: cc.Animation = null;
    // TODO: need to add joint point at the root

    onLoad() {
        this.status = 'triggered';
        this.CannonBody.on('finished', () => {
            if (this.CannonBody.currentClip.name === 'CannonFlyOut') {
                this.CannonMap.play('MapBreak');
            }
        });
    }
    
    public rollback() {
        this.status = 'original';
        this.CannonMap.play('MapBuild');
        this.CannonBody.play('CannonFlyBack');
    }

    public accelerate() {
        this.status = 'triggered';
        this.CannonBody.play('CannonFlyOut');
    }

    public slowdown() {}

    public reset() {
        this.status = 'triggered';
        this.accelerate();
    }
}
