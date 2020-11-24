// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Bullet from './Bullet';
import PlayerManager from '../Player/PlayerManager';

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    private bullet: cc.Prefab = null;

    @property(cc.Animation)
    private monsterAnimation: cc.Animation = null;

    @property(cc.Prefab)
    private monsterDeathAnimation: cc.Prefab = null;

    @property
    private jumpFroce: number = 0;

    private jump: boolean = false;
    private player: cc.Node = null; // 透過碰撞測試取得
    private jumpLocker: boolean = true;

    update (dt: number) {
        if(this.jump && this.jumpLocker) {
            this.jumpLocker = false;
            this.playJumpAnimation();
            let lv = this.node.getComponent(cc.RigidBody).linearVelocity;
            lv.x = this.jumpFroce;
            lv.y = this.jumpFroce;
            this.getComponent(cc.RigidBody).linearVelocity = lv;
        }
    }

    private onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (self.tag === 0 && other.node.name === 'Player') {
            this.jump = true;
            this.player = other.node;
            this.schedule(this.playShootAnimation, 3, cc.macro.REPEAT_FOREVER, 1);
        }
        if (self.tag === 1 &&　other.node.name === 'Deadline') {
            this.playDeathAnimation();
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
            this.unschedule(this.playShootAnimation);
            this.playIdleAnimation();
        }
    }

    private playIdleAnimation() {
        if (this.monsterAnimation.currentClip?.name !== 'monsterIdle') {
            this.monsterAnimation.play('monsterIdle');
        }
    }

    private playJumpAnimation() {
        if(this.monsterAnimation.currentClip?.name !== 'monsterJump') {
            this.monsterAnimation.play('monsterJump');
        }
    }

    private playShootAnimation() {  
        this.monsterAnimation.play('monsterShoot');
        this.schedule(this.shootBullet,0.5,0);
    }

    private playDeathAnimation() {
        let anim = cc.instantiate(this.monsterDeathAnimation);
        anim.setPosition(this.node.getPosition());
        anim.scaleX = this.node.scaleX;
        this.node.parent.addChild(anim);
        anim.getComponent(cc.Animation).play('monsterDeath');
    }

    private shootBullet() {
        if (!this.player.getComponent(PlayerManager).status) {
            this.unschedule(this.playShootAnimation);
            return;
        }
        const monsterWorldPos: cc.Vec2 = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        const bullet: cc.Node = cc.instantiate(this.bullet);
        const distanceX = this.player.parent.convertToNodeSpaceAR(monsterWorldPos).x - this.player.x;
        const distanceY = this.player.parent.convertToNodeSpaceAR(monsterWorldPos).y - this.player.y;

        bullet.setPosition(monsterWorldPos);
        this.node.parent.addChild(bullet);

        //計算子彈要射擊的角度
        const radian = Math.atan(distanceY / distanceX);
        let angle = (radian * 180) / Math.PI;
        if (distanceX > 0) {
            angle += 180;
        }
        //將子彈射擊(移動)速度和角度傳參數給子彈節點
        bullet.children[0].getComponent(Bullet).setBulletParameter(500, angle);
    }
}
