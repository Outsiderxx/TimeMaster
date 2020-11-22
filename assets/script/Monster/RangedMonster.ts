import Bullet from './Bullet';
import BulletDamage from './BulletDamage';
import PlayerManager from '../Player/PlayerManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class RangedMonster extends cc.Component {
    @property(cc.Prefab)
    private bullet: cc.Prefab = null;

    @property(cc.Prefab)
    private monsterDeathAnimation: cc.Prefab = null;

    @property(cc.Animation)
    private monsterAnimation: cc.Animation = null;

    @property
    private moveSpeed: number = 0;

    @property
    private attackDistance: number = 0;

    private moveDirection: boolean = true; // true: left, false: right
    private onTheGround: boolean = false;
    private playerFounded: boolean = false;
    private reachEdge: boolean = false;

    private player: cc.Node = null; // 透過碰撞測試取得

    update(dt: number) {
        this.onTheGroundCheck();
        if (this.monsterAnimation.currentClip?.name !== 'monsterShoot') {
        if (this.onTheGround) {
                this.reachEdgeCheck()
                // 追蹤模式 距離保持 250，碰到邊界停下來
                if (this.playerFounded) {
                    const rigidBody: cc.RigidBody = this.node.getComponent(cc.RigidBody);
                    rigidBody.type = cc.RigidBodyType.Kinematic;
                    if (!this.reachEdge) {
                        const monsterWorldPos: cc.Vec2 = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
                        const distance: number = this.player.x - this.player.parent.convertToNodeSpaceAR(monsterWorldPos).x;
                        if (Math.abs(distance) >= this.attackDistance) {
                            const direction: boolean = distance < 0; // true: player在怪物右邊 false: player在怪物右邊
                            this.moveDirection = direction;
                            this.node.x += this.moveSpeed * dt * (direction ? -1 : 1);
                            this.node.scaleX = direction ? -1 : 1;
                            this.playRunAnimation();
                        }
                        else {
                            this.playIdleAnimation();
                        }
                    }
                    else {
                        this.playIdleAnimation();
                    }
                } else {
                    // 普通模式下，碰到邊界後往反方向走
                    if (this.reachEdge) {
                        this.moveDirection = !this.moveDirection;
                        this.reachEdge = false;
                        this.node.scaleX = this.moveDirection ? -1 : 1;
                    }
                    this.node.x += this.moveSpeed * dt * (this.moveDirection ? -1 : 1);
                    this.playWalkAnimation();
                    const rigidBody: cc.RigidBody = this.node.getComponent(cc.RigidBody);
                    rigidBody.type = cc.RigidBodyType.Dynamic;
                }
            }else {
                this.playIdleAnimation();
                const rigidBody: cc.RigidBody = this.node.getComponent(cc.RigidBody);
                rigidBody.type = cc.RigidBodyType.Dynamic;
            }
        }
    }

    onLoad() {
        this.monsterAnimation.on('finished', this.playIdleAnimation, this);
    }

    private onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        // 偵測區接觸到玩家後，開啟追蹤模式以及開始攻擊
        if (self.tag === 0 && other.node.name === 'Player') {
            this.playerFounded = true;
            this.player = other.node;
            this.schedule(this.playShootAnimation, 3, cc.macro.REPEAT_FOREVER, 1);
        } else if (self.tag === 1) {
            if (other.node.name === 'Deadline') {
                // 怪物掉落
                this.node.destroy();
            }
        }
    }

    private onCollisionExit(other: cc.Collider, self: cc.Collider) {
        // 碰撞區與玩家結束接觸後，關閉追蹤模式及停止攻擊
        if (self.tag === 0 && other.node.name === 'Player') {
            this.playerFounded = false;
            this.unschedule(this.playShootAnimation);
        }
    }

    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if (self.tag === 0 && other.node.group === 'Damage') {
            this.playDeathAnimation();
            this.node.destroy();
        }
    }

    private reachEdgeCheck() {
        const temp: cc.Vec3 = this.node.parent.convertToWorldSpaceAR((this.node.position));
        const offset = this.moveDirection ? -55 : 55
        const p1: cc.Vec2 = cc.v2(temp.x + offset, temp.y - 50);
        const p2: cc.Vec2 = cc.v2(temp.x + offset, temp.y - 100);
        const rayResults = cc.director.getPhysicsManager().rayCast(p1,p2,cc.RayCastType.All);
        if(rayResults.length === 0) {
            this.reachEdge = true;
        }
        else {
            for(let i=0;i<rayResults.length;i++) {
                let result: cc.PhysicsRayCastResult = rayResults[i];
                let collider: cc.PhysicsCollider = result.collider;
                if(collider.node.group === 'default') {
                    this.reachEdge = false;
                    break;
                }
                if(i === rayResults.length - 1) {
                    this.reachEdge = true;
                }
            }
        }
       
    }

    private onTheGroundCheck() {
        const temp: cc.Vec3 = this.node.parent.convertToWorldSpaceAR((this.node.position));
        const leftP1 = cc.v2(temp.x - 35, temp.y);
        const leftP2 = cc.v2(temp.x - 35, temp.y - 100);
        const rightP1 = cc.v2(temp.x + 35, temp.y);
        const rightP2 = cc.v2(temp.x + 35, temp.y - 100);
        const rayResultsLeft = cc.director.getPhysicsManager().rayCast(leftP1,leftP2,cc.RayCastType.All);
        const rayResultsRight = cc.director.getPhysicsManager().rayCast(rightP1,rightP2,cc.RayCastType.All);

        if(rayResultsLeft.length === 0 && rayResultsRight.length === 0) {
            this.onTheGround = false;
        }
        else {
            for(let i = 0; i < rayResultsLeft.length; i++) {
                let result: cc.PhysicsRayCastResult = rayResultsLeft[i];
                let collider: cc.PhysicsCollider = result.collider;
                if(collider.node.group === 'default') {
                    this.onTheGround = true;
                    break;
                }
                if(i === rayResultsLeft.length - 1) {
                    this.reachEdge = false;
                }
            }
            if(this.onTheGround === false) {
                for(let i = 0; i < rayResultsRight.length; i++) {
                    let result: cc.PhysicsRayCastResult = rayResultsRight[i];
                    let collider: cc.PhysicsCollider = result.collider;
                    if(collider.node.group === 'default') {
                        this.onTheGround = true;
                        break;
                    }
                    if(i === rayResultsRight.length - 1) {
                        this.reachEdge = false;
                    }
                }
            }
        }
    }

    private playIdleAnimation() {
        if(this.monsterAnimation.currentClip?.name !== 'monsterIdle') {
            this.monsterAnimation.play('monsterIdle');
        }
    }

    private playWalkAnimation() {
        if (this.monsterAnimation.currentClip?.name !== 'monsterWalk') {
            this.monsterAnimation.play('monsterWalk');
        }
    }

    private playRunAnimation() {
        if (this.monsterAnimation.currentClip?.name !== 'monsterRun') {
            this.monsterAnimation.play('monsterRun');
        }
    }

    private playShootAnimation() {
        if(this.onTheGround) {   
            this.monsterAnimation.play('monsterShoot');
            this.schedule(this.shootBullet,0.5,0);
        }
    }

    private playDeathAnimation() {
        let anim = cc.instantiate(this.monsterDeathAnimation);
        anim.setPosition(this.node.getPosition());
        anim.scaleX = this.node.scaleX;
        this.node.parent.addChild(anim);
        anim.getComponent(cc.Animation).play('monsterDeath');
    }

    //射子彈
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
