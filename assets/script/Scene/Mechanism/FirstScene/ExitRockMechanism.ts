import TimeEffect from '../../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExitRockMechanism extends TimeEffect {
    @property(cc.Animation)
    private exit: cc.Animation = null;
    @property(cc.AudioClip)
    private sound: cc.AudioClip = null;

    onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider){
        
        if (other.node.name === 'rollingRock') {
            this.getComponent(cc.PhysicsBoxCollider).enabled = false;
            cc.audioEngine.playEffect(this.sound,false); 
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

