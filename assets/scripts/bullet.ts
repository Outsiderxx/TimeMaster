// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    private bulletXSpeed: number = 0
    private bulletYSpeed: number = 0
    private shootPosX: number = 0
    private shootPosY: number = 0
    private speedUpApply: boolean = false
    private slowDownApply: boolean = false
    private reverseApply: boolean = false

    //調整子彈射擊的速度(speed)和角度(angle)
    public setBulletParameter(speed: number, angle: number = this.node.angle) {
        this.node.angle = angle
        let radian: number = angle * Math.PI / 180
        this.bulletXSpeed = speed * Math.cos(radian)
        this.bulletYSpeed = speed * Math.sin(radian)
    }

    // LIFE-CYCLE CALLBACKS:

    //子彈加速(先寫死成兩倍)
    private speedUp() {
        let speedUpParameter = 2
        if(this.slowDownApply) {
            speedUpParameter *= 2
            this.slowDownApply = false
        }
        this.bulletXSpeed *= speedUpParameter
        this.bulletYSpeed *= speedUpParameter
        this.speedUpApply = true
    }

    //子彈減速(一樣寫死兩倍)
    private slowDown() {
        let slowDownParameter = 2
        if(this.speedUpApply) {
            slowDownParameter *= 2
            this.speedUpApply = false
        }
        this.bulletXSpeed /= slowDownParameter
        this.bulletYSpeed /= slowDownParameter
        this.slowDownApply = true
    }

    //子彈倒帶並更改tag(碰撞判定)為可攻擊到怪物 在回到射擊點後消失
    private reverse() {
        this.bulletXSpeed = -this.bulletXSpeed
        this.bulletYSpeed = -this.bulletYSpeed
        this.reverseApply = true
        this.node.getComponent(cc.PhysicsBoxCollider).tag = 9
    }

    public onBeginContact(contact, self, other) {
        //被加速
        if(other.tag == 6) {
            this.speedUp()
        }
        //被減速
        if(other.tag == 7) {
            this.slowDown()
        }
        //被倒帶
        if(other.tag == 8) {
            this.reverse()
        }
        //擊中玩家(沒被倒帶的情況下)
        if(other.tag == 2 && self.tag == 5) {
            this.node.destroy()
        }
        //擊中怪物(被倒帶後)
        if(other.tag == 4 && self.tag == 9) {
            this.node.destroy()
        }
    }

    onLoad () {
        this.bulletXSpeed = 0
        this.bulletYSpeed = 0
        this.shootPosX = this.node.x
        this.shootPosY = this.node.y
        this.speedUpApply = false
        this.slowDownApply = false
        this.reverseApply = false
    }

    start () {

    }

    update (dt) {
        this.node.x += this.bulletXSpeed * dt
        this.node.y += this.bulletYSpeed * dt
        //判斷是否出畫面 可能要再調整
        if(this.node.y >= this.node.parent.height/2 || this.node.y <= -this.node.parent.height/2 || this.node.x >= this.node.parent.width/2 || this.node.x <= - this.node.parent.width/2) {
            this.node.destroy()
        }
        //判斷是否已回到原射擊點
        if(this.reverseApply) {
            if(this.bulletXSpeed > 0 && this.node.x > this.shootPosX) {
                if(this.bulletYSpeed > 0 && this.node.y > this.shootPosY) {
                    this.node.destroy()
                }
                else if(this.node.y < this.shootPosY) {
                    this.node.destroy()
                }
            }
            else if(this.node.x < this.shootPosX){
                if(this.bulletYSpeed > 0 && this.node.y > this.shootPosY) {
                    this.node.destroy()
                }
                else if(this.node.y < this.shootPosY) {
                    this.node.destroy()
                }
            }
        }
    }
}
