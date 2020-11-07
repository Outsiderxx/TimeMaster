import Bullet from './Bullet';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BulletDamage extends cc.Component {
    @property(Bullet)
    public bullect: Bullet = null;
    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        this.node.parent.destroy();
    }
}
