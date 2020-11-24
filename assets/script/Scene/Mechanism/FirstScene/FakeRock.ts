const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property
    private dropSpeed: number = 0;

    @property
    private initial_y: number = 0;

    @property
    private target_y: number = 0;

    public isDrop: boolean = false;
    private firstTime: boolean = true;
    private currentTween: cc.Tween = null;

    public reset() {
        this.currentTween?.stop();
        this.isDrop = false;
        this.firstTime = true;
        this.node.y = this.initial_y;
    }

    public rollback() {
        this.currentTween.stop();
        this.currentTween = cc.tween(this.node).to(this.dropSpeed, { y: this.initial_y }).start();
    }

    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if (other.node.group === 'default' && this.firstTime === true) {
            this.isDrop = true;
            this.firstTime = false;
            this.currentTween = cc.tween(this.node).to(this.dropSpeed, { y: this.target_y }).start();
        }
    }
}
