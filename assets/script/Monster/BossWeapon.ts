// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import TimeEffect from '../TimeEffect'
import BossManager from './BossManager'

const {ccclass, property} = cc._decorator;

export enum attackPath {
    none = -1,
    typeOne = 1,
    typeTwo = 2,
    typeThree = 3,
}

@ccclass
export default class BossWeapon extends TimeEffect {

    @property(cc.Prefab) 
    private axeParticleSystem: cc.Prefab = null;

    private attacking: boolean = false;
    private wayPoints: cc.Vec2[] = new Array();
    private anglePoints: number[] = new Array();
    private attackType: attackPath = attackPath.none;
    private attackTypeThreeApply: boolean = false;
    private playerDirection: number = 1; // 1左邊, -1右邊
    private speedPara: number = 1;
    private xSpeed: number = 0;
    private ySpeed: number = 0;
    private xAcc: number = 0;
    private yAcc: number = 0;
    public Boss: cc.Node = null;
    public hitWall: boolean = false;
    public causeDamage: boolean = false;

    onLoad() {
        this.status = 'normal';
    }

    public startAttack(direction: boolean) {

        this.playerDirection = direction ? 1 : -1;

        this.attacking = true;

        this.attackType = Math.floor(Math.random() * 3) + 1;       
        switch(this.attackType) {
            case attackPath.typeOne:
                this.xSpeed = 1200 * this.playerDirection;
                this.ySpeed = 750;
                this.xAcc = -1600 * this.playerDirection;
                this.yAcc = -2000;
                break;
            
            case attackPath.typeTwo:
                this.xSpeed = 1000 * this.playerDirection;
                this.ySpeed = 0;
                this.xAcc = -2000 * this.playerDirection;
                this.yAcc = -300;
                break;

            case attackPath.typeThree:
                this.attackTypeThreeApply = true;
                this.xSpeed = 1200 * this.playerDirection;
                this.ySpeed = -750;
                this.xAcc = -2000 * this.playerDirection;
                this.yAcc = 1000;
                break;
        }
        
    }

    private stopMove() {
        this.node.group = 'default';
        this.node.getComponent(cc.PhysicsBoxCollider).apply();
        this.hitWall = true;
    }
    
    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if(other.node.group === 'default' && other.node.name !== 'Player') {
            this.stopMove();
        }
    }

    //用遞迴來完成倒帶路徑, index是wayPoint的陣列位置
    private returnToOriginPos(index: number) {

        //index < 0代表已回到原本的開始記錄位置,可做後續處理
        if(index < 0) {
            if(this.hitWall) {
                let newParticleSystem = cc.instantiate(this.axeParticleSystem);
                newParticleSystem.setPosition(this.node.x + 70, this.node.y);
                this.node.parent.addChild(newParticleSystem);
            }
            this.Boss.getComponent(BossManager).getWeapon();
            this.node.destroy();
            return;
        }

        //按照紀錄的位置移動,每次完成移動後就把index - 1然後重新呼叫本function
        cc.tween(this.node)
        .parallel(cc.tween().to(0.03, {x: this.wayPoints[index].x}),
                  cc.tween().to(0.03, {y: this.wayPoints[index].y}),
                  cc.tween().to(0.03, {angle: this.anglePoints[index]}))
        .call(() => {this.returnToOriginPos(index - 1)})
        .start();
        
    }


    public accelerate() {
        if(!this.hitWall) {
            this.changeSpeed(false);
        }
    }
    public slowdown() {
        if(!this.hitWall) {
            this.changeSpeed(true);
        }
    }

    private changeSpeed(slowdown: boolean, reset: boolean = false) {
        switch (this.status) {
            case 'normal':
                this.speedPara = slowdown ? 0.2 : 3;
                this.status = slowdown ? 'slowdown' : 'speedup';
                break;
            case 'speedup':
                this.speedPara = slowdown ? 1 : 3;
                this.status = slowdown ? 'normal' : 'speedup';
                break;
            case 'slowdown':
                this.speedPara = slowdown ? 0.2 : 1;
                this.status = slowdown ? 'slowdown' : 'normal';
                break;
            default:
                break;
        }
        if (reset) {
            this.speedPara = 1;
            this.status = 'normal';
        }
    }

    //被倒帶時從移動紀錄最後一個元素開始跑倒帶
    public rollback() {
        this.causeDamage = true;
        this.returnToOriginPos(this.wayPoints.length - 1);
    }

    public reset() {
        this.node.destroy();
    }

    update(dt: number) {
        //attacking = true時每幀(dt)紀錄位置和總移動時間,false時的改變剛體狀態是取代碰撞回調的不明錯誤
        if(this.attacking) {
            if(this.attackType === attackPath.typeOne) {
                if(this.yAcc < 0) {
                    this.yAcc += (55 * this.speedPara);
                }
                else {
                    this.yAcc = 0;
                }
            }
            if(this.attackType === attackPath.typeThree) {
                if(this.ySpeed > 0 && this.attackTypeThreeApply) {
                    this.attackTypeThreeApply = false;
                    const temp = this.yAcc;
                    this.yAcc /= (20 * this.speedPara);
                    this.schedule(() => {this.yAcc = temp}, 0.35, 0)
                }
            }
            this.wayPoints.push(this.node.getPosition());
            this.anglePoints.push(this.node.angle);
            this.node.x += this.xSpeed * dt * this.speedPara;
            this.node.y += this.ySpeed * dt * this.speedPara;
            this.node.angle += -720 * dt * this.speedPara;
            if(this.node.x < -this.node.parent.width / 2) {
                this.attacking = false;
                this.stopMove();
                this.node.x = -this.node.parent.width / 2;
            } else if(this.node.x > this.node.parent.width / 2) {
                this.attacking = false;
                this.stopMove();
                this.node.x = this.node.parent.width / 2;
            }
            if(this.node.y < -this.node.parent.height / 2) {
                this.attacking = false;
                this.stopMove();
                this.node.y = -this.node.parent.height / 2;
            } else if(this.node.y > this.node.parent.height / 2) {
                this.attacking = false;
                this.stopMove();
                this.node.y = this.node.parent.height / 2;
            }

            this.xSpeed += this.xAcc * dt * this.speedPara;
            this.ySpeed += this.yAcc * dt * this.speedPara;
        }
    }
}
