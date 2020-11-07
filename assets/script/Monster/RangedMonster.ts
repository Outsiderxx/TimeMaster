import Bullet from './Bullet';
import BulletDamage from './BulletDamage';
import PlayerManager from '../Player/PlayerManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class RangedMonster extends cc.Component {
    @property(cc.Prefab)
    private bullet: cc.Prefab = null;

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
        if (this.onTheGround) {
            // 追蹤模式 距離保持 250，碰到邊界停下來
            if (this.playerFounded) {
                if (!this.reachEdge) {
                    const distance: number = this.player.x - this.node.x;
                    if (Math.abs(distance) >= this.attackDistance) {
                        const direction: boolean = distance < 0; // true: player在怪物右邊 false: player在怪物右邊
                        this.moveDirection = direction;
                        this.node.x += this.moveSpeed * dt * (direction ? -1 : 1);
                    }
                }
            } else {
                // 普通模式下，碰到邊界後往反方向走
                if (this.reachEdge) {
                    this.moveDirection = !this.moveDirection;
                    this.reachEdge = false;
                }
                this.node.x += this.moveSpeed * dt * (this.moveDirection ? -1 : 1);
            }
        }
    }

    private onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        // 偵測區接觸到玩家後，開啟追蹤模式以及開始攻擊
        if (self.tag === 0 && other.node.name === 'Player') {
            this.node.color = cc.color(255, 0, 255);
            this.playerFounded = true;
            this.player = other.node;
            this.schedule(this.shootBullet, 3, cc.macro.REPEAT_FOREVER, 1);
        } else if (self.tag === 1) {
            if (other.node.name === 'Deadline') {
                // 怪物掉落
                this.node.destroy();
            } else if (other.node.name === 'Edge') {
                // 平台邊緣偵測點 - 碰撞到時若沒有在追蹤玩家則改變行進方向 // TODO: 增加場景或機關對邊界檢查點的控制
                this.reachEdge = true;
            }
        }
    }

    private onCollisionExit(other: cc.Collider, self: cc.Collider) {
        // 碰撞區與玩家結束接觸後，關閉追蹤模式及停止攻擊
        if (self.tag === 0 && other.node.name === 'Player') {
            this.node.color = cc.color(0, 0, 255);
            this.playerFounded = false;
            this.unschedule(this.shootBullet);
        } else if (self.tag === 1 && other.node.name === 'Edge') {
            this.reachEdge = false;
        }
    }

    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if (self.tag === 1) {
            this.onTheGround = true;
        } else if (self.tag === 0 && other.node.group === 'Damage') {
            this.node.destroy();
        }
    }

    // TODO 解決碰地偵測提早結束的問題，player也有相同狀況
    // private onEndContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
    //     if (self.tag === 1) {
    //         this.onTheGround = false;
    //     }
    // }

    //射子彈
    private shootBullet() {
        if (!this.player.getComponent(PlayerManager).status) {
            this.unschedule(this.shootBullet);
            return;
        }
        const monsterWorldPos: cc.Vec2 = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        const bullet: cc.Node = cc.instantiate(this.bullet);
        const distanceX = this.player.parent.convertToNodeSpaceAR(monsterWorldPos).x - this.player.x;
        const distanceY = this.player.parent.convertToNodeSpaceAR(monsterWorldPos).y - this.player.y;

        const bulletPosX: number = distanceX > 0 ? -0 : 75;
        bullet.setPosition(bulletPosX, 0);
        this.node.addChild(bullet);

        const bulletWorldPos: cc.Vec2 = this.node.convertToWorldSpaceAR(bullet.getPosition());
        const bulletDistanceX: number = this.player.parent.convertToNodeSpaceAR(bulletWorldPos).x - this.player.x;

        //計算子彈要射擊的角度
        const radian = Math.atan(distanceY / bulletDistanceX);
        let angle = (radian * 180) / Math.PI;
        if (distanceX > 0) {
            angle += 180;
        }
        //將子彈射擊(移動)速度和角度傳參數給子彈節點
        bullet.children[0].getComponent(Bullet).setBulletParameter(350, angle);
    }
}
