import TimeEffect from '../../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExitRockMechanism extends TimeEffect {
    @property(cc.Animation)
    private exit: cc.Animation = null;

    onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider){
        
        if (other.node.name === 'rollingRock') {
            this.getComponent(cc.PhysicsBoxCollider).enabled = false;
            this.exit.play('rockBreak');
        }
    }
    //============================================
    public rollback() {}

    public accelerate() {}
    public slowdown() {}
    
    public reset() {
        this.exit.play('rockBuild');
        this.getComponent(cc.PhysicsBoxCollider).enabled = true;
    }
}

