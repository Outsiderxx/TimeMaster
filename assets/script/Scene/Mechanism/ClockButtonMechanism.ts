import TimeEffect from '../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ClockButtonMechanism extends TimeEffect {
    public isActived: boolean = false;

    public active() {
        this.isActived = true;
        this.node.getComponent(cc.Animation).play('buttonActive');
        this.node.emit('active');
    }

    public accelerate() {}
    public rollback() {}
    public slowdown() {}

    public reset() {
        this.node.getComponent(cc.Animation).play('buttonDisable');
        this.isActived = false;
    }

    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        this.active();
    }
}
