import MeleeAttack from './MeleeAttack';
import BulletDamage from './BulletDamage';

const { ccclass, property } = cc._decorator;

@ccclass
export default class MeleeMonster extends cc.Component {
    @property
    private moveSpeed: number = 0;

    @property
    private freezeTime = 0;

    @property(MeleeAttack)
    private weapon: MeleeAttack = null;

    private _moveDirection: boolean = true; // true: left, false: right
    private onTheGround: boolean = false;
    private playerFounded: boolean = false;
    private reachEdge: boolean = false;
    private isAttacking: boolean = false;
    private player: cc.Node = null;

    update(dt: number) {
        if (!this.isAttacking && this.onTheGround) {
            // 追蹤模式 距離保持 250，碰到邊界停下來
            if (this.playerFounded) {
                if (!this.reachEdge) {
                    const worldPos: cc.Vec2 = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
                    const distance: number = this.player.x - this.player.parent.convertToNodeSpaceAR(worldPos).x;
                    const direction: boolean = distance < 0; // true: player在怪物右邊 false: player在怪物右邊
                    this.moveDirection = direction;
                    this.node.x += this.moveSpeed * dt * (direction ? -1 : 1);
                    this.weapon.node.x += this.moveSpeed * dt * (direction ? -1 : 1);
                }
            } else {
                // 普通模式下，碰到邊界後往反方向走
                if (this.reachEdge) {
                    this.moveDirection = !this._moveDirection;
                    this.reachEdge = false;
                }
                this.node.x += this.moveSpeed * dt * (this._moveDirection ? -1 : 1);
                this.weapon.node.x += this.moveSpeed * dt * (this._moveDirection ? -1 : 1);
            }
        }
    }

    private set moveDirection(isLeft: boolean) {
        if (this._moveDirection !== isLeft) {
            this._moveDirection = isLeft;
            this.node.scaleX = this._moveDirection ? 1 : -1;

            // 將 weapon當作子節點會有很多很奇怪的表現 所以把兩者分開
            this.weapon.node.scaleX = this._moveDirection ? 1 : -1;
            this.weapon.node.angle = this._moveDirection ? 45 : -45;
            this.weapon.node.x += this._moveDirection ? -90 : 90;
            this.weapon.getComponent(cc.PhysicsBoxCollider).apply();
        }
    }

    private onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        // 偵測區接觸到玩家後，開啟追蹤模式以及開始攻擊
        if (self.tag === 0 && other.node.name === 'Player') {
            this.node.color = cc.color(255, 0, 255);
            this.playerFounded = true;
            this.player = other.node;
        } else if (self.tag === 1) {
            if (other.node.name === 'Deadline') {
                // 怪物掉落
                this.node.parent.destroy();
            } else if (other.node.name === 'Edge') {
                // 平台邊緣偵測點 - 碰撞到時若沒有在追蹤玩家則改變行進方向 // TODO: 增加場景或機關對邊界檢查點的控制
                this.reachEdge = true;
            }
        } else if (self.tag === 2 && other.node.name === 'Player') {
            if (!this.isAttacking) {
                this.isAttacking = true;
                this.schedule(this.attack, this.freezeTime, cc.macro.REPEAT_FOREVER, 0);
            }
        }
    }

    private onCollisionExit(other: cc.Collider, self: cc.Collider) {
        // 碰撞區與玩家結束接觸後，關閉追蹤模式及停止攻擊
        if (self.tag === 0 && other.node.name === 'Player') {
            this.node.color = cc.color(0, 0, 255);
            this.playerFounded = false;
        } else if (self.tag === 1 && other.node.name === 'Edge') {
            this.reachEdge = false;
        } else if (self.tag === 2 && other.node.name === 'Player') {
            if (this.isAttacking) {
                this.isAttacking = false;
                this.unschedule(this.attack);
            }
        }
    }

    public onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if (self.tag === 1) {
            this.onTheGround = true;
        } else if (self.tag === 0 && other.node.group === 'Damage') {
            this.node.parent.destroy();
        }
    }

    // TODO 解決碰地偵測提早結束的問題，player也有相同狀況
    // private onEndContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
    //     if (self.tag === 1) {
    //         this.onTheGround = false;
    //     }
    // }

    private attack() {
        this.weapon.attack();
    }
}
