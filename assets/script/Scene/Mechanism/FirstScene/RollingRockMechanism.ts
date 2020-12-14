import TimeEffect from '../../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class RollingRockMechanism extends TimeEffect {

    private rigidBody: cc.RigidBody = null;
    private path: cc.Vec2[] = new Array();
    private angle: number[] = new Array();
    private distances: number = 0;
    private parent: cc.Node = null;
    private initialPosition: cc.Vec3 = cc.v3();
    private rollingBack: boolean = false;
    private currentTween: cc.Tween = null;
    onLoad() {
        this.parent = this.node.parent;
        this.status = "normal";
        this.rigidBody = this.node.parent.getComponent(cc.RigidBody);
        this.path.push(cc.v2(this.parent.x, this.parent.y));
        this.angle.push(this.parent.angle);
        this.initialPosition = cc.v3(-54.271, 604.451, this.parent.position.z);
        this.currentTween = new cc.Tween();
    }
    update() {

        if (!this.rollingBack) {
            if (this.rigidBody.linearVelocity.x < 300 && this.rigidBody.linearVelocity.y > -200) {
                this.parent.group = "default";
            } else {
                this.parent.group = "Damage";
            }
            this.distances = Math.sqrt((Math.pow((this.parent.x - this.path[(this.path.length - 1)].x), 2)) + (Math.pow((this.parent.y - this.path[(this.path.length - 1)].y), 2)));
            if (this.distances >= 10) {

                this.path.push(cc.v2(this.parent.x, this.parent.y));
                this.angle.push(this.parent.angle);

            }
        }

    }

    private returnToOriginPos(index: number) {


        //index < 0代表已回到原本的開始記錄位置,可做後續處理
        if (index < 0) {

            this.currentTween.stop();
            this.status = 'normal';
            this.rigidBody.type = cc.RigidBodyType.Dynamic;
            this.rigidBody.linearVelocity = cc.v2(0, 0);
            this.parent.position = this.initialPosition;
            this.parent.angle = 0;
            this.path = new Array();
            this.angle = new Array();
            this.path.push(cc.v2(this.parent.x, this.parent.y));
            this.angle.push(this.parent.angle);
            this.rollingBack = false;
            return;
        }
        //按照紀錄的位置移動,每次完成移動後就把index - 1然後重新呼叫本function
        this.currentTween = cc.tween(this.parent)
            .parallel(
                cc.tween().to(0.04, { x: this.path[index].x }),
                cc.tween().to(0.04, { y: this.path[index].y }),
                cc.tween().to(0.04, { angle: this.angle[index] }))
            .call(() => { this.returnToOriginPos(index - 1) })
            .start();
    }

    public rollback() {

        this.status = 'original';
        this.parent.group = "default";
        this.rollingBack = true;
        this.returnToOriginPos(this.path.length - 1);

    }

    public accelerate() {

    }

    public slowdown() {
        this.rigidBody.linearVelocity = cc.v2(0, 0);
        //this.rigidBody.linearVelocity = cc.v2(this.rigidBody.linearVelocity.x / 5, this.rigidBody.linearVelocity.y / 5);
    }

    public reset() {

        this.currentTween.stop();
        this.status = 'normal';
        this.rigidBody.type = cc.RigidBodyType.Dynamic;
        this.rigidBody.linearVelocity = cc.v2(0, 0);
        this.parent.position = this.initialPosition;
        this.parent.angle = 0;
        this.path = new Array();
        this.angle = new Array();
        this.path.push(cc.v2(this.parent.x, this.parent.y));
        this.angle.push(this.parent.angle);
        this.rollingBack = false;
    }
}
