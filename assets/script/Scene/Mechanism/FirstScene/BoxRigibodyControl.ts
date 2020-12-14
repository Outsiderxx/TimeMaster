
const { ccclass, property } = cc._decorator;

@ccclass
export default class BoxRigibodyControl extends cc.Component {

    private rigidBody: cc.RigidBody = null;
    onLoad() {

        this.rigidBody = this.getComponent(cc.RigidBody);
    }

    private onCollisionEnter(other: cc.Collider, self: cc.Collider) {

        if (other.node.name === 'EnergyRockSkillArea') {
            console.log("enter slow");
            this.rigidBody.linearVelocity = cc.v2(this.rigidBody.linearVelocity.x / 3, this.rigidBody.linearVelocity.y / 3);
            this.rigidBody.angularVelocity = this.rigidBody.angularVelocity / 3;
            this.rigidBody.gravityScale = 0.2;
        }
    }

    private onCollisionExit(other: cc.Collider, self: cc.Collider) {
        if (other.node.name === 'EnergyRockSkillArea') {
            console.log("exit slow");
            this.rigidBody.linearVelocity = cc.v2(this.rigidBody.linearVelocity.x * 3, this.rigidBody.linearVelocity.y * 3);
            this.rigidBody.angularVelocity = this.rigidBody.angularVelocity * 3;
            this.rigidBody.gravityScale = 2;
        }
    }
}
