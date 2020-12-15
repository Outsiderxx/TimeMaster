import TimeEffect from '../TimeEffect';
import bossManager from './BossManager'

const { ccclass, property } = cc._decorator;

@ccclass
export default class BossFallenRock extends TimeEffect {
    @property
    private dropSpeed: number = 0;

    @property
    private intial_y: number = 0;

    @property
    private target_y: number = 0;

    @property
    private speed: number = 1;

    public boss: cc.Node = null;

    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if(other.node.name === 'BossWeapon') {
            this.node.destroy();
        }
    }

    onLoad() {
        this.status = 'original';
    }

    public rollback() {
            this.status = 'original';
            this.scheduleOnce(()=>{this.node.children[0].group = 'Damage';
                                   this.node.children[0].getComponent(cc.PhysicsBoxCollider).apply();}, 0.5);
            cc.tween(this.node)
            .to(this.dropSpeed*this.speed, { y: this.intial_y })
            .start();
        
    }

    public accelerate() {
        this.status = 'triggered';
        cc.tween(this.node)
        .to(this.dropSpeed, { y: this.target_y })
        .call(() => {
            this.node.children[0].group = 'default';
            this.node.children[0].getComponent(cc.PhysicsBoxCollider).apply();
        })
        .start();
    }

    public slowdown() {}

    public reset() {
        this.node.destroy();
    }
}
