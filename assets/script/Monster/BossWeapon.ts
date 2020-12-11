// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import TimeEffect from '../TimeEffect'

const {ccclass, property} = cc._decorator;

export enum attackPath {
    none = -1,
    typeOne = 1,
    typeTwo = 2,
}

@ccclass
export default class BossWeaponManager extends TimeEffect {

    private attacking: boolean = false;
    private moveingTime: number = 0;
    private wayPoints: cc.Vec2[] = new Array()
    private attackTypeTwoApply: boolean = false;
    private xSpeed: number = 0;
    private xAcc: number = 0;

    public startAttack(lvx: number = 0, lvy: number = 0) {

        //讓update開始記錄移動狀態
        this.attacking = true;
        
        //可能需要將之前記錄過的狀態清掉
        //this.wayPoints.length = 0
        //moveingTime = 0

        const randNum: attackPath = Math.floor(Math.random() * 2) + 1;
        const rigidBody: cc.RigidBody = this.node.getComponent(cc.RigidBody);        
        switch(randNum) {
            case attackPath.typeOne:
                rigidBody.type = cc.RigidBodyType.Dynamic;
                rigidBody.linearVelocity = new cc.Vec2(lvx, lvy);
                break;
            
            case attackPath.typeTwo:
                rigidBody.type = cc.RigidBodyType.Dynamic;
                this.attackTypeTwoApply = true;
                this.xSpeed = 750;
                this.xAcc = -2000;
                break;
        }
        
    }
    
    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if(other.node.group === 'default' && other.node.name !== 'Player') {

            //關閉移動狀態的紀錄
            this.attacking = false;

            this.attackTypeTwoApply = false;
            const rigidBody: cc.RigidBody = this.node.getComponent(cc.RigidBody);
            rigidBody.linearVelocity = new cc.Vec2(0, 0);
            //直接在這裡調剛體Type會出不明錯誤
        }
    }

    //用遞迴來完成倒帶路徑, index是wayPoint的陣列位置
    private returnToOriginPos(index: number) {

        //index < 0代表已回到原本的開始記錄位置,可做後續處理
        if(index < 0) {
            //this.node.destroy();
            return;
        }

        //按照紀錄的位置移動,每次完成移動後就把index - 1然後重新呼叫本function
        cc.tween(this.node)
        .parallel(cc.tween().to(this.moveingTime / (this.wayPoints.length + 1), {x: this.wayPoints[index].x}),
                  cc.tween().to(this.moveingTime / (this.wayPoints.length + 1), {y: this.wayPoints[index].y}))
        .call(() => {this.returnToOriginPos(index - 1)})
        .start();
        
    }


    public accelerate() {}
    public slowdown() {}

    //被倒帶時從移動紀錄最後一個元素開始跑倒帶
    public rollback() {
        this.returnToOriginPos(this.wayPoints.length - 1);
    }

    public reset() {}

    update(dt: number) {
        //attacking = true時每幀(dt)紀錄位置和總移動時間,false時的改變剛體狀態是取代碰撞回調的不明錯誤
        if(this.attacking) {
            this.moveingTime += dt;
            this.wayPoints.push(this.node.getPosition());
        }else {
            const rigidBody: cc.RigidBody = this.node.getComponent(cc.RigidBody);
            rigidBody.type =cc.RigidBodyType.Static;
        }
        //不用管
        if(this.attackTypeTwoApply) {
            this.node.x += this.xSpeed * dt;
            if(this.node.x < -this.node.parent.width / 2) {
                this.attackTypeTwoApply = false;
                this.node.x = -this.node.parent.width / 2;
            }
            this.xSpeed += this.xAcc * dt;
        }
    }

}
