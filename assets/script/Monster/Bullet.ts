import TimeEffect from '../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Bullet extends TimeEffect {
    private bulletXSpeed: number = 0;
    private bulletYSpeed: number = 0;
    private shootPosX: number = 0;
    private shootPosY: number = 0;
    private speedUpApply: boolean = false;
    private slowDownApply: boolean = false;

    @property(cc.Node)
    public damagePart: cc.Node = null;

    onLoad() {
        this.status = 'normal';
        this.shootPosX = this.node.x;
        this.shootPosY = this.node.y;
    }

    update(dt: number) {
        this.node.x += this.bulletXSpeed * dt;
        this.node.y += this.bulletYSpeed * dt;
        this.damagePart.x += this.bulletXSpeed * dt; // 節點在有RigidBody Component的情況下，Position、angle不會隨著 Parent改變
        this.damagePart.y += this.bulletYSpeed * dt;
    }

    //調整子彈射擊的速度(speed)和角度(angle)
    public setBulletParameter(speed: number, angle: number = this.node.angle) {
        let radian: number = (angle * Math.PI) / 180;
        this.node.angle = angle;
        this.damagePart.angle = angle;
        this.bulletXSpeed = speed * Math.cos(radian);
        this.bulletYSpeed = speed * Math.sin(radian);
    }

    //子彈加速(先寫死成兩倍)
    public accelerate() {
        let speedUpParameter: number = 2;
        if (this.slowDownApply) {
            speedUpParameter *= 2;
            this.slowDownApply = false;
        }
        this.bulletXSpeed *= speedUpParameter;
        this.bulletYSpeed *= speedUpParameter;
        this.speedUpApply = true;
    }

    //子彈減速(一樣寫死兩倍)
    public slowdown() {
        let slowDownParameter = 2;
        if (this.speedUpApply) {
            slowDownParameter *= 2;
            this.speedUpApply = false;
        }
        this.bulletXSpeed /= slowDownParameter;
        this.bulletYSpeed /= slowDownParameter;
        this.slowDownApply = true;
    }

    //子彈倒帶並更改tag(碰撞判定)為可攻擊到怪物 在回到射擊點後消失
    public rollback() {
        this.bulletXSpeed = -this.bulletXSpeed;
        this.bulletYSpeed = -this.bulletYSpeed;
        if (this.damagePart.group === 'Damage') {
            this.damagePart.group = 'MonsterDamage';
        } else {
            this.damagePart.group = 'Damage';
        }
        this.damagePart.getComponent(cc.PhysicsBoxCollider).apply();
    }

    public reset() {}
}
