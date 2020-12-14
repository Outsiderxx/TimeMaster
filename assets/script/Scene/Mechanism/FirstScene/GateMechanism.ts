import TimeEffect from '../../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GateMechanism extends TimeEffect {


    private gateAnimation: cc.Animation = null;
    private boxColliderUp: cc.PhysicsBoxCollider = null;
    private boxColliderDown: cc.PhysicsBoxCollider = null;
    private gateStatus: "opened" | "closed" | "default" = "default";
    private forerUsedSkill: "accelerate" | "rollback" | "none" = "none";

    @property(cc.Boolean)
    isOpened: boolean = false;
    public buttonFirstTriggered = false;
    private initialized: boolean = false;
    private upClosedOffset: cc.Vec2 = cc.v2(0, 45.7);
    private upClosedSize: cc.Size = cc.size(61.4, 131.6);
    private upOpenedOffset: cc.Vec2 = cc.v2(0, 105.7);
    private upOpenedSize: cc.Size = cc.size(61.4, 11.7);
    private downClosedOffset: cc.Vec2 = cc.v2(0, -46.1);
    private downClosedSize: cc.Size = cc.size(61.4, 113.2);
    private downOpenedOffset: cc.Vec2 = cc.v2(0, -101.9);
    private downOpenedSize: cc.Size = cc.size(61.4, 1.7);
    onLoad() {
        this.status = "normal";
        this.gateAnimation = this.node.getComponent(cc.Animation);

        this.boxColliderUp = this.node.getChildByName("boxColliderUp").getComponent(cc.PhysicsBoxCollider);
        this.boxColliderDown = this.node.getChildByName("boxColliderDown").getComponent(cc.PhysicsBoxCollider);

        if (this.isOpened) {
            this.open();

        } else {
            this.close();

        }

        this.gateAnimation.on('play', () => {
            this.status = 'transforming';
        });
        this.gateAnimation.on('finished', () => {
            if (this.initialized)
                this.gateStatus = this.gateAnimation.currentClip.name === 'open' ? 'opened' : 'closed';
            else {
                this.initialized = true;
            }
            this.status = "normal";

        });
    }


    public buttonTrigger() {

        if (this.isOpened) {
            this.close();
        } else {
            this.open();
        }
    }

    private open() {

        this.gateAnimation.play("open");
        cc.tween(this.boxColliderUp)
            .to(0.8, { offset: this.upOpenedOffset, size: this.upOpenedSize })
            .call(() => { this.boxColliderUp.apply(); })
            .start()
        cc.tween(this.boxColliderDown)
            .to(0.8, { offset: this.downOpenedOffset, size: this.downOpenedSize })
            .call(() => { this.boxColliderDown.apply(); })
            .start()

        this.isOpened = true;
    }

    private close() {

        this.gateAnimation.play("close");
        cc.tween(this.boxColliderUp)
            .to(0.8, { offset: this.upClosedOffset, size: this.upClosedSize })
            .call(() => { this.boxColliderUp.apply(); })
            .start()
        cc.tween(this.boxColliderDown)
            .to(0.8, { offset: this.downClosedOffset, size: this.downClosedSize })
            .call(() => { this.boxColliderDown.apply(); })
            .start()

        this.isOpened = false;
    }

    public rollback() {
        if (this.gateStatus !== 'default') {
            if (this.forerUsedSkill === 'accelerate' || this.forerUsedSkill === 'none') {
                if (this.gateStatus === 'closed') {
                    this.open();
                    this.forerUsedSkill = 'rollback';
                } else if (this.gateStatus === 'opened') {
                    this.close();
                    this.forerUsedSkill = 'rollback';
                }
            }
        }

    }

    public accelerate() {
        if (this.gateStatus !== 'default') {
            if (this.forerUsedSkill === 'rollback') {
                if (this.gateStatus === 'closed') {
                    this.open();
                    this.forerUsedSkill = 'accelerate';
                } else if (this.gateStatus === 'opened') {
                    this.close();
                    this.forerUsedSkill = 'accelerate';
                }
            }
        }
    }

    public slowdown() { }

    public reset() {

    }
}
