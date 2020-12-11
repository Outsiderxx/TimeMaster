import TimeEffect from '../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class RollbackMechanism extends TimeEffect {
    private isTracking: boolean = false;
    private path: cc.Vec2[] = [];
    private priviousPosition: cc.Vec2 = new cc.Vec2();
    private priviousAngle: number = 0;

    update() {
        if (this.isTracking) {
            if (this.node.position.x === this.priviousPosition.x && this.node.position.y === this.priviousPosition.y && this.node.angle === this.priviousAngle) {
                this.isTracking = false;
            }
        }
    }

    public accelerate() {}
    public slowdown() {}
    public rollback() {}

    public reset() {
        this.path.length = 0;
    }

    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {}
}
