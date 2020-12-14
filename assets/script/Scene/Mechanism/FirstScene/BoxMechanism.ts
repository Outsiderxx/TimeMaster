import TimeEffect from '../../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoxMechanism extends TimeEffect {

    private rigidBody: cc.RigidBody = null;
    private path: cc.Vec2[] = new Array();
    private angle: number[] = new Array();
    private distances: number = 0;
    private parent: cc.Node = null;

    private rollingBack: boolean = false;

    onLoad() {
        this.parent = this.node.parent;
        this.status = "normal";
        this.rigidBody = this.node.parent.getComponent(cc.RigidBody);
        this.path.push(cc.v2(this.parent.x, this.parent.y));
        this.angle.push(this.parent.angle);

    }
    update() {
        if (!this.rollingBack) {
            this.distances = Math.sqrt((Math.pow((this.parent.x - this.path[(this.path.length - 1)].x), 2)) + (Math.pow((this.parent.y - this.path[(this.path.length - 1)].y), 2)));
            //console.log(this.distances);
            if (this.distances >= 10) {

                this.path.push(cc.v2(this.parent.x, this.parent.y));
                this.angle.push(this.parent.angle);

                //console.log("pathL : ", this.path.length, "ANGL : ", this.angularVel.length);
            }
        }

    }

    private returnToOriginPos(index: number) {

        //index < 0代表已回到原本的開始記錄位置,可做後續處理
        if (index < 0) {
            //this.node.destroy();
            this.rigidBody.type = cc.RigidBodyType.Dynamic;
            this.rigidBody.linearVelocity = cc.v2(0, 0);
            this.path.splice(0, this.path.length);
            this.angle.splice(0, this.angle.length);
            this.path.push(cc.v2(this.parent.x, this.parent.y));
            this.angle.push(this.parent.angle);
            this.rollingBack = false;
            return;
        }
        //按照紀錄的位置移動,每次完成移動後就把index - 1然後重新呼叫本function
        cc.tween(this.parent)
            .parallel(
                cc.tween().to(0.03, { x: this.path[index].x }),
                cc.tween().to(0.03, { y: this.path[index].y }),
                cc.tween().to(0.03, { angle: this.angle[index] }))
            .call(() => { this.returnToOriginPos(index - 1) })
            .start();
    }

    public rollback() {
        this.rollingBack = true;
        this.returnToOriginPos(this.path.length - 1);

    }

    public accelerate() {

    }

    public slowdown() {

        console.log("sadfasdfasdfasdf");
        console.log(this.rigidBody.linearVelocity.x, this.rigidBody.linearVelocity.y);
        this.rigidBody.linearVelocity = cc.v2(0, 0);
        //this.rigidBody.linearVelocity = cc.v2(this.rigidBody.linearVelocity.x / 5, this.rigidBody.linearVelocity.y / 5);
        console.log(this.rigidBody.linearVelocity.x, this.rigidBody.linearVelocity.y);
    }

    public reset() {

    }
}
