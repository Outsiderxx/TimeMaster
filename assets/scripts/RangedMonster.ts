// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Game from "./Game"

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    private bullet: cc.Prefab = null

    @property
    private maxMoveSpeed: number = 0

    moveSpeed: number = 0
    left: boolean = false
    right: boolean = false
    playerFounded: boolean = false
    firstShoot: boolean = false

    private game: Game = null

    //newMonster.getComponent('RangedMonster').init(this)
    //用來記錄玩家資訊的 之後可能會用碰撞參數的contact去做
    public init(game:Game) {
        this.game = game
    }

    // LIFE-CYCLE CALLBACKS:

    public onBeginContact(contact, self, other) {
        //落地
        if(other.tag == 0 && self.tag == 4) {
            this.node.color = cc.color(0,0,255)
            this.startMoveing()
        }
        //不會自己跳下去(平台邊緣的碰撞點)
        if(other.tag == 1 && self.tag == 4) {
            if(this.playerFounded) {
                this.stopMove()
            }else {
                this.changeDirection()
            }
        }
        //偵測玩家
        if(other.tag == 2 && self.tag == 3) {
            this.playerFounded = true
        }
        //被倒帶的子彈攻擊
        if(other.tag == 9 && self.tag == 4) {
            this.node.destroy()
        }
    }

    public onEndContact(contact, self, other) {
        //離開偵測範圍
        if(other.tag == 2 && self.tag == 3) {
            this.playerFounded = false
            this.firstShoot = true
            this.node.color = cc.color(0,0,255)
            this.changeDirection()
        }
    }

    //開始移動(落地時)
    private startMoveing() {
        this.moveLeft()
    }

    //往左移動
    private moveLeft() {
        this.left = true
        this.right = false
        this.moveSpeed = -this.maxMoveSpeed
    }

    //往右移動
    private moveRight() {
        this.left = false
        this.right = true
        this.moveSpeed = this.maxMoveSpeed
    }

    //停止移動
    private stopMove() {
        this.left = false
        this.right = false
        this.moveSpeed = 0
    }

    //變換方向
    private changeDirection() {
        if(this.left) {
            this.moveRight()
        } else {
            this.moveLeft()
        }
    }

    //追逐玩家(250為offset 類似保持一定距離)
    private chasingPlayer() {
        if(this.game.player.x > this.node.x + 250) {
            this.moveRight()
        }else if(this.game.player.x < this.node.x - 250) {
            this.moveLeft()
        }else {
            this.stopMove()
        }
    }

    //射子彈
    private shootBullet() {
        let bullet = cc.instantiate(this.bullet)
        bullet.setPosition(this.node.x ,this.node.y)
        this.node.parent.addChild(bullet)
        //計算子彈要射擊的角度
        let distanceX = this.node.x - this.game.player.x
        let distanceY = this.node.y - this.game.player.y

        let radian = Math.atan(distanceY / distanceX)
        let angle = radian * 180 / Math.PI
        if(distanceX > 0) {
            angle += 180
        }
        //將子彈射擊(移動)速度和角度傳參數給子彈節點
        bullet.getComponent("bullet").setBulletParameter(350,angle)
    }

    onLoad () {
        this.moveSpeed = 0
        this.left = false
        this.right = false
        this.playerFounded = false
        this.firstShoot = true
    }

    start () {

    }

    update (dt) {
        this.node.x += this.moveSpeed * dt

        if(this.playerFounded) {
            this.chasingPlayer()
            //只在第一次偵測到玩家時射擊一發子彈 之後可再調整
            if(this.firstShoot) {
                this.firstShoot = false
                this.node.color = cc.color(255,0,255)
                this.shootBullet()
            }
        }
    }
}
