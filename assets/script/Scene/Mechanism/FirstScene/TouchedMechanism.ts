import TimeEffect from '../../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TouchedMechanism extends TimeEffect {
    @property
    private dropSpeed: number = 0;
    @property
    private intial_y: number = 0;
    @property
    private target_y: number = 0;

    onLoad(){
        this.node.y = this.intial_y;
    }
    onCollisionEnter(self: cc.PhysicsBoxCollider, other: cc.PhysicsBoxCollider) {
        
        if (other.node.group === 'default') {
            cc.tween(this.node)
            .to(this.dropSpeed, { y: this.target_y })
            .start();
        }
    }
    //============================================
    public rollback() {}

    public accelerate() {}

    public slowdown() {}
    
    public reset() {
        this.node.y = this.intial_y;
    }
}

