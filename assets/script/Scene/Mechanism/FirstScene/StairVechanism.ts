import TimeEffect from '../../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class StairMechanism extends TimeEffect {
    @property(cc.Animation)
    private stairAnimation: cc.Animation = null;
    @property(cc.PhysicsPolygonCollider)
    private pCollider: cc.PhysicsPolygonCollider = null;
    @property(cc.PhysicsBoxCollider)
    private bCollider: cc.PhysicsPolygonCollider = null;
    @property(cc.AudioClip)
    private break: cc.AudioClip = null;
    @property(cc.AudioClip)
    private build: cc.AudioClip = null;

    onLoad() {
        this.status = 'triggered';
        this.pCollider.enabled = false;
        this.bCollider.enabled = true;
        this.stairAnimation.on('play', () => {
            this.status = 'transforming';
        });
        this.stairAnimation.on('finished', () => {
            if(this.stairAnimation.currentClip.name === 'StairBreak' ){
                this.status = 'triggered';
                this.pCollider.enabled = false;
                this.bCollider.enabled = true;
            }else{
                this.status = 'original';
                this.pCollider.enabled = true;
                this.bCollider.enabled = false;
            }
        });
    }

    public rollback() {
        cc.audioEngine.playEffect(this.build,false);
        this.stairAnimation.play('StairBuild');
    }

    public accelerate() {
        cc.audioEngine.playEffect(this.break,false);
        this.stairAnimation.play('StairBreak');
    }

    public slowdown() {}

    public reset() {
            this.status = 'triggered';
            this.stairAnimation.play('StairBreak');
        }
}

