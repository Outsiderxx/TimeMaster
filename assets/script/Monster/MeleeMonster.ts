import MeleeAttack from './MeleeAttack';
import BulletDamage from './BulletDamage';
import PlayerManager from '../Player/PlayerManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class MeleeMonster extends cc.Component {
    @property
    private moveSpeed: number = 0;

    @property
    private freezeTime = 0;

    @property(cc.Animation)
    private monsterAnimation: cc.Animation = null;

    @property(cc.Prefab)
    private monsterDeathAnimation: cc.Prefab = null;

    @property(cc.Prefab)
    private damageArea: cc.Prefab = null;

    private _moveDirection: boolean = true; // true: left, false: right
    private onTheGround: boolean = false;
    private playerFounded: boolean = false;
    private startAttack: boolean = false;
    private reachEdge: boolean = false;
    private player: cc.Node = null;

    update(dt: number) {
        this.reachEdgeCheck();
        this.onTheGroundCheck();
        if (this.monsterAnimation.currentClip?.name !== 'monsterAttack' && this.onTheGround) {
            // 追蹤模式 距離保持 250，碰到邊界停下來
            if (this.playerFounded) {
                if (!this.reachEdge) {
                    const worldPos: cc.Vec2 = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
                    const distance: number = this.player.x - this.player.parent.convertToNodeSpaceAR(worldPos).x;
                    const direction: boolean = distance < 0; // true: player在怪物右邊 false: player在怪物右邊
                    this.moveDirection = direction;
                    this.node.x += this.moveSpeed * dt * (direction ? -1 : 1);
                    this.playRunAnimation();
                } else {
                    this.playIdleAnimation();
                }
            } else {
                // 普通模式下，碰到邊界後往反方向走
                if (this.reachEdge) {
                    this.moveDirection = !this._moveDirection;
                    this.reachEdge = false;
                }
            }
        }
        if (!this.onTheGround) {
            this.playIdleAnimation();
        }
    }

    private set moveDirection(isLeft: boolean) {
        if (this._moveDirection !== isLeft) {
            this._moveDirection = isLeft;
            this.node.scaleX = this._moveDirection ? -1 : 1;
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
        } else if (self.tag === 1) {
            if (other.node.name === 'Deadline') {
                // 怪物掉落
                this.node.destroy();
            }
        } else if (self.tag === 2 && other.node.name === 'Player') {
            this.startAttack = true;
        }
    }

    private onCollisionExit(other: cc.Collider, self: cc.Collider) {
        // 碰撞區與玩家結束接觸後，關閉追蹤模式及停止攻擊
        if (self.tag === 0 && other.node.name === 'Player') {
            this.playerFounded = false;
        } else if (self.tag === 2 && other.node.name === 'Player') {
            this.unschedule(this.playAttackAnimation);
        }
    }

    public onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if (self.tag === 0 && other.node.group === 'Damage') {
            this.playDeathAnimation();
            this.node.destroy();
        }
    }

    private reachEdgeCheck() {
        const temp: cc.Vec3 = this.node.parent.convertToWorldSpaceAR(this.node.position);
        const offset = this._moveDirection ? -55 : 55;
        const p1: cc.Vec2 = cc.v2(temp.x + offset, temp.y - 50);
        const p2: cc.Vec2 = cc.v2(temp.x + offset, temp.y - 100);
        const rayResults = cc.director.getPhysicsManager().rayCast(p1, p2, cc.RayCastType.All);
        if (rayResults.length === 0) {
            this.reachEdge = true;
        } else {
            for (let i = 0; i < rayResults.length; i++) {
                let result: cc.PhysicsRayCastResult = rayResults[i];
                let collider: cc.PhysicsCollider = result.collider;
                if (collider.node.group === 'default') {
                    this.reachEdge = false;
                    break;
                }
                if (i === rayResults.length - 1) {
                    this.reachEdge = true;
                }
            }
        }
    }

    private onTheGroundCheck() {
        const temp: cc.Vec3 = this.node.parent.convertToWorldSpaceAR(this.node.position);
        const p1 = cc.v2(temp.x, temp.y - 50);
        const p2 = cc.v2(temp.x + 10, temp.y - 100);
        const rayResults = cc.director.getPhysicsManager().rayCast(p1, p2, cc.RayCastType.All);
        if (rayResults.length === 0) {
            this.onTheGround = false;
        } else {
            for (let i = 0; i < rayResults.length; i++) {
                let result: cc.PhysicsRayCastResult = rayResults[i];
                let collider: cc.PhysicsCollider = result.collider;
                if (collider.node.group === 'default') {
                    this.onTheGround = true;
                    break;
                }
                if (i === rayResults.length - 1) {
                    this.reachEdge = false;
                }
            }
        }
    }

    private playIdleAnimation() {
        if (this.monsterAnimation.currentClip?.name !== 'monsterIdle') {
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

    private playAttackAnimation() {
        this.monsterAnimation.play('monsterAttack');
        this.schedule(this.generateDamageArea, 0.5, 0);
    }

    private playDeathAnimation() {
        let anim = cc.instantiate(this.monsterDeathAnimation);
        anim.setPosition(this.node.getPosition());
        anim.scaleX = this.node.scaleX;
        this.node.parent.addChild(anim);
        anim.getComponent(cc.Animation).play('monsterDeath');
    }

    private generateDamageArea() {
        let newArea = cc.instantiate(this.damageArea);
        const offset = this._moveDirection ? -40 : 40;
        newArea.setPosition(this.node.x + offset, this.node.y);
        this.node.parent.addChild(newArea);
    }
}
