// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Animation)
    private monsterAnimation: cc.Animation = null;

    @property
    private jumpFroce: number = 0;

    private playerFounded: boolean = true;
    private jump: boolean = false;

    update (dt: number) {
        if(this.jump) {
            this.jump = false;
            this.playJumpAnimation();
            let lv = this.node.getComponent(cc.RigidBody).linearVelocity;
            lv.x = -this.jumpFroce;
            lv.y = this.jumpFroce;
            this.getComponent(cc.RigidBody).linearVelocity = lv;
        }
    }

    private onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (self.tag === 0 && other.node.name === 'VineBody') {
            this.jump = true;
        }
        if (self.tag === 1 &&　other.node.name === 'Deadline') {
            this.node.destroy();
        }
        if(self.tag === 2 && other.node.name === 'VineBody') {
            const rigidBody: cc.RigidBody = self.getComponent(cc.RigidBody);
            rigidBody.type = cc.RigidBodyType.Kinematic;
            rigidBody.linearVelocity = new cc.Vec2(0, 0);
        }
    }

    private onCollisionExit(other: cc.Collider, self: cc.Collider) {
        // 結束攀爬
        if (other.node.name === 'VineBody') {
            const rigidBody: cc.RigidBody = self.getComponent(cc.RigidBody);
            rigidBody.type = cc.RigidBodyType.Dynamic;
        }
    }

    private playJumpAnimation() {
        if(this.monsterAnimation.currentClip?.name !== 'monsterJump') {
            this.monsterAnimation.play('monsterJump');
        }
    }
}
