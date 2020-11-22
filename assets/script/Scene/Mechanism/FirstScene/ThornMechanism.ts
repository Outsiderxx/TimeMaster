import TimeEffect from '../../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ThornMechanism extends TimeEffect {
    @property(cc.Animation)
    private vineAnimation: cc.Animation = null;
    @property(cc.Node)
    private thorn: cc.Node = null; 
    // TODO: need to add joint point at the root

    onLoad() {
        this.status = 'triggered';
        this.vineAnimation.on('play', () => {
            this.status = 'transforming';
        });
        this.vineAnimation.on('finished', () => {
            this.status = this.vineAnimation.currentClip.name === 'thornGrows' ? 'triggered' : 'original';
        });
    }


    public rollback() {
        this.vineAnimation.play('thornGrownback');
        let hurtCollider = this.thorn.getComponent(cc.PhysicsBoxCollider);
        hurtCollider.enabled = false;
    }

    public accelerate() {
        this.vineAnimation.play('thornGrows');
        let hurtCollider = this.thorn.getComponent(cc.PhysicsBoxCollider);
        hurtCollider.enabled = true;
    }

    public slowdown() {}

    public reset() {
        // const climbCollider: cc.BoxCollider = this.vineAnimation.getComponent(cc.BoxCollider);
        // const skillCollider: cc.BoxCollider = this.getComponent(cc.BoxCollider);
        this.status = 'triggered';
        let hurtCollider = this.thorn.getComponent(cc.PhysicsBoxCollider);
        hurtCollider.enabled = true;
        this.vineAnimation.play('thornGrownback');
        // climbCollider.size.height = this.vineAnimation.node.height;
        // climbCollider.offset.y = -this.vineAnimation.node.height / 2;
        // skillCollider.size.height = 300;
        // skillCollider.offset.y = -150;
    }
}
