import MeleeAttack from './MeleeAttack';
import BulletDamage from './BulletDamage';
import PlayerManager from '../Player/PlayerManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class MeleeMonster extends cc.Component {
    @property(cc.Animation)
    private monsterAnimation: cc.Animation = null;

    @property(cc.Prefab)
    private monsterDeathAnimation: cc.Prefab = null;

    @property(cc.Prefab)
    private damageArea: cc.Prefab = null;

    @property(cc.AudioClip)
    private attackEffect: cc.AudioClip = null;

    @property(cc.AudioClip)
    private deathEffect: cc.AudioClip = null;

    @property
    private moveSpeed: number = 0;

    @property
    private freezeTime = 0;

    private _moveDirection: boolean = true; // true: left, false: right
    private onTheGround: boolean = false;
    private playerFounded: boolean = false;
    private startAttack: boolean = false;
    private reachEdge: boolean = false;
    private startAction: boolean = false;
    private player: cc.Node = null;

    update(dt: number) {
        this.reachEdgeCheck();
        this.onTheGroundCheck();
        if (!this.startAction) {
            this.playIdleAnimation();
            return;
        }
        if (this.startAttack && this.onTheGround) {
            this.playAttackAnimation();
            this.schedule(this.playAttackAnimation, this.freezeTime, cc.macro.REPEAT_FOREVER, 0);
        } else {
            this.unschedule(this.playAttackAnimation);
            if (this.monsterAnimation.currentClip?.name !== 'monsterAttack' && this.onTheGround) {
                // 追蹤模式 距離保持 250，碰到邊界停下來
                if (this.playerFounded) {
                    const worldPos: cc.Vec2 = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
                    const distance: number = this.player.x - this.player.parent.convertToNodeSpaceAR(worldPos).x;
                    const direction: boolean = distance < 0; // true: player在怪物右邊 false: player在怪物右邊
                    this.moveDirection = direction;
                    if (!this.reachEdge) {
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
                    this.node.x += this.moveSpeed * dt * (this._moveDirection ? -1 : 1);
                    this.playWalkAnimation();
                }
            }
            if (!this.onTheGround) {
                this.playIdleAnimation();
            }
        }
    }

    private set moveDirection(isLeft: boolean) {
        if (this._moveDirection !== isLeft) {
            this._moveDirection = isLeft;
            this.node.scaleX = this._moveDirection ? -0.7 : 0.7;
        }
    }

    onLoad() {
        this.monsterAnimation.on('finished', this.playIdleAnimation, this);
        this.startAction = false;
    }

    private onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (self.tag === 3 && other.node.name === 'Player') {
            if (!this.startAction) {
                this.startAction = true;
            }
        }
        // 偵測區接觸到玩家後，開啟追蹤模式以及開始攻擊
        if (self.tag === 0 && other.node.name === 'Player') {
            this.playerFounded = true;
            this.player = other.node;
        } else if (self.tag === 1) {
            if (other.node.name === 'Deadline') {
                // 怪物掉落
                cc.audioEngine.playEffect(this.deathEffect, false);
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
            this.startAttack = false;
        }
    }

    public onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if (self.tag === 0 && other.node.group === 'Damage') {
            this.playDeathAnimation();
            this.node.destroy();
        }
    }

    private reachEdgeCheck() {
        let offset = this._moveDirection ? -55 : 55;
        offset = offset * Math.abs(this.node.scaleX);

        const temp: cc.Vec3 = this.node.parent.convertToWorldSpaceAR(this.node.position);
        const edgeCheckP1: cc.Vec2 = cc.v2(temp.x + offset, temp.y);
        const edgeCheckP2: cc.Vec2 = cc.v2(temp.x + offset, temp.y - 110 * Math.abs(this.node.scaleX));

        const wallCheckTopP1: cc.Vec2 = cc.v2(temp.x, temp.y + 10 * Math.abs(this.node.scaleX));
        const wallCheckTopP2: cc.Vec2 = cc.v2(temp.x + offset * 1.2, temp.y + 10 * Math.abs(this.node.scaleX));
        const wallCheckMediumP1: cc.Vec2 = cc.v2(temp.x, temp.y - 40 * Math.abs(this.node.scaleX));
        const wallCheckMediumP2: cc.Vec2 = cc.v2(temp.x + offset * 1.2, temp.y - 40 * Math.abs(this.node.scaleX));
        const wallCheckBottomP1: cc.Vec2 = cc.v2(temp.x, temp.y - 85 * Math.abs(this.node.scaleX));
        const wallCheckBottomP2: cc.Vec2 = cc.v2(temp.x + offset * 1.2, temp.y - 85 * Math.abs(this.node.scaleX));

        const edgeRayResults = cc.director.getPhysicsManager().rayCast(edgeCheckP1, edgeCheckP2, cc.RayCastType.All);
        const wallTopRayResults = cc.director.getPhysicsManager().rayCast(wallCheckTopP1, wallCheckTopP2, cc.RayCastType.All);
        const wallMediumRayResults = cc.director.getPhysicsManager().rayCast(wallCheckMediumP1, wallCheckMediumP2, cc.RayCastType.All);
        const wallBottomRayResults = cc.director.getPhysicsManager().rayCast(wallCheckBottomP1, wallCheckBottomP2, cc.RayCastType.All);

        if (edgeRayResults.length === 0) {
            this.reachEdge = true;
        } else {
            for (let i = 0; i < edgeRayResults.length; i++) {
                let result: cc.PhysicsRayCastResult = edgeRayResults[i];
                let collider: cc.PhysicsCollider = result.collider;
                if (collider.node.group === 'default') {
                    this.reachEdge = false;
                    break;
                }
                if (i === edgeRayResults.length - 1) {
                    this.reachEdge = true;
                }
            }
        }
        if (!this.reachEdge && this.onTheGround) {
            for (let i = 0; i < wallTopRayResults.length; i++) {
                let result: cc.PhysicsRayCastResult = wallTopRayResults[i];
                let collider: cc.PhysicsCollider = result.collider;
                if (collider.node.group === 'default') {
                    this.reachEdge = true;
                    break;
                }
            }
            if (!this.reachEdge) {
                for (let i = 0; i < wallMediumRayResults.length; i++) {
                    let result: cc.PhysicsRayCastResult = wallMediumRayResults[i];
                    let collider: cc.PhysicsCollider = result.collider;
                    if (collider.node.group === 'default') {
                        this.reachEdge = true;
                        break;
                    }
                }
            }
            if (!this.reachEdge) {
                for (let i = 0; i < wallBottomRayResults.length; i++) {
                    let result: cc.PhysicsRayCastResult = wallBottomRayResults[i];
                    let collider: cc.PhysicsCollider = result.collider;
                    if (collider.node.group === 'default') {
                        this.reachEdge = true;
                        break;
                    }
                }
            }
        }
    }

    private onTheGroundCheck() {
        const temp: cc.Vec3 = this.node.parent.convertToWorldSpaceAR(this.node.position);
        const leftP1 = cc.v2(temp.x - 35 * Math.abs(this.node.scaleX), temp.y);
        const leftP2 = cc.v2(temp.x - 35 * Math.abs(this.node.scaleX), temp.y - 110 * Math.abs(this.node.scaleX));
        const rightP1 = cc.v2(temp.x + 35 * Math.abs(this.node.scaleX), temp.y);
        const rightP2 = cc.v2(temp.x + 35 * Math.abs(this.node.scaleX), temp.y - 110 * Math.abs(this.node.scaleX));
        const rayResultsLeft = cc.director.getPhysicsManager().rayCast(leftP1, leftP2, cc.RayCastType.All);
        const rayResultsRight = cc.director.getPhysicsManager().rayCast(rightP1, rightP2, cc.RayCastType.All);

        if (rayResultsLeft.length === 0 && rayResultsRight.length === 0) {
            this.onTheGround = false;
        } else {
            for (let i = 0; i < rayResultsLeft.length; i++) {
                let result: cc.PhysicsRayCastResult = rayResultsLeft[i];
                let collider: cc.PhysicsCollider = result.collider;
                if (collider.node.group === 'default') {
                    this.onTheGround = true;
                    break;
                }
            }
            if (this.onTheGround === false) {
                for (let i = 0; i < rayResultsRight.length; i++) {
                    let result: cc.PhysicsRayCastResult = rayResultsRight[i];
                    let collider: cc.PhysicsCollider = result.collider;
                    if (collider.node.group === 'default') {
                        this.onTheGround = true;
                        break;
                    }
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
        if (!this.player.getComponent(PlayerManager).status) {
            this.unschedule(this.playAttackAnimation);
            return;
        }
        if (this.monsterAnimation.currentClip?.name !== 'monsterAttack') {
            this.monsterAnimation.play('monsterAttack');
            this.schedule(this.generateDamageArea, 0.5, 0);
        }
    }

    private playDeathAnimation() {
        cc.audioEngine.playEffect(this.deathEffect, false);
        let anim = cc.instantiate(this.monsterDeathAnimation);
        anim.setPosition(this.node.getPosition());
        anim.scaleX = this.node.scaleX;
        this.node.parent.addChild(anim);
        anim.getComponent(cc.Animation).play('monsterDeath');
    }

    private generateDamageArea() {
        cc.audioEngine.playEffect(this.attackEffect, false);
        let newArea = cc.instantiate(this.damageArea);
        const offset = this._moveDirection ? -40 : 40;
        newArea.setPosition(this.node.x + offset, this.node.y);
        this.node.parent.addChild(newArea);
    }
}
