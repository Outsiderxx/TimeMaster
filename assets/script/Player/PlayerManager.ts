import Mechanism from '../Scene/Mechanism/Mechanism';
import SkillCast from './SkillCast';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerManager extends cc.Component {
    @property
    private healthPoint: number = 5;

    @property(cc.Animation)
    private playerAnimation: cc.Animation = null;

    @property
    private moveAccel: number = 0;

    @property
    private jumpFroce: number = 0;

    @property(cc.Node)
    private heartGroup: cc.Node = null;

    @property(cc.Node)
    private skillRange: cc.Node = null;

    @property(cc.Node)
    private userPointer: cc.Node = null;

    private input = {};
    private onTheGround: boolean = false;
    private speed: cc.Vec2 = cc.v2(0, 0);
    private currentUsingSkill: SkillSet = -1;
    private isClimbing: boolean = false;
    private isAlive: boolean = true;

    onLoad() {
        // 技能切換
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event: cc.Event.EventKeyboard) => {
            if ((event.keyCode === cc.macro.KEY.q || event.keyCode === cc.macro.KEY.e || event.keyCode === cc.macro.KEY.r) && !this.input[event.keyCode]) {
                this.toggleSkill(event.keyCode, true);
            }
            this.input[event.keyCode] = true;
        });
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, (event: cc.Event.EventKeyboard) => {
            this.input[event.keyCode] = false;
            if (event.keyCode === cc.macro.KEY.q || event.keyCode === cc.macro.KEY.e || event.keyCode === cc.macro.KEY.r) {
                this.toggleSkill(event.keyCode, false);
            }
        });

        // debug用 重置角色位置狀態
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event: cc.Event.EventKeyboard) => {
            this.input[event.keyCode] = true;
            if (event.keyCode === cc.macro.KEY.escape) {
                this.reset(new cc.Vec2(-517, -168));
            }
        });

        // 玩家點擊到機關並且在技能範圍內
        this.userPointer.on('skillHit', (target: cc.Collider) => {
            console.log('skill casted');
            const mechanism: Mechanism = target.getComponent(Mechanism);
            const { none, accelerate, slowdown, rollback } = SkillSet;
            if (this.currentUsingSkill !== none && mechanism.checkStatus(this.currentUsingSkill)) {
                switch (this.currentUsingSkill) {
                    case accelerate:
                        console.log(`Accelerate ${target.name}`);
                        mechanism.accelerate();
                        break;
                    case slowdown:
                        console.log(`Slowdown ${target.name}`);
                        mechanism.slowdown();
                        break;
                    case rollback:
                        console.log(`Rollback ${target.name}`);
                        mechanism.rollback();
                        break;
                }
            }
        });
    }

    update(dt: number) {
        if (!this.isAlive) {
            return;
        }
        if (this.onTheGround) {
            let lv = this.node.getComponent(cc.RigidBody).linearVelocity;
            //左右移動
            if (this.input[cc.macro.KEY.a]) {
                this.speed.x = -1;
                this.node.scaleX = -0.5;
            } else if (this.input[cc.macro.KEY.d]) {
                this.speed.x = 1;
                this.node.scaleX = 0.5;
            } else {
                this.speed.x = 0;
            }

            if (this.speed.x) {
                lv.x = this.speed.x * this.moveAccel;
                if (this.playerAnimation.currentClip?.name !== 'playerRun') {
                    this.playerAnimation.play('playerRun');
                }
            } else {
                lv.x = 0;
                if (this.playerAnimation.currentClip?.name !== 'playerIdle') {
                    this.playerAnimation.play('playerIdle');
                }
            }

            if (this.isClimbing) {
                // 攀爬
                if (this.input[cc.macro.KEY.w]) {
                    lv.y = this.moveAccel;
                } else if (this.input[cc.macro.KEY.s]) {
                    lv.y = -this.moveAccel;
                } else {
                    lv.y = 0;
                }
            } else {
                //跳躍
                if (this.input[cc.macro.KEY.space]) {
                    if (this.onTheGround) {
                        lv.y = this.jumpFroce;
                        this.onTheGround = false;
                    }
                }
            }
            this.getComponent(cc.RigidBody).linearVelocity = lv;
        }
    }

    public reset(position: cc.Vec2) {
        // status
        this.healthPoint = 5;
        this.updateHearts(this.healthPoint);

        // position
        this.node.setPosition(position);

        // movement
        this.getComponent(cc.RigidBody).linearVelocity = new cc.Vec2(0, 0);

        // direction
        this.node.scaleX = 0.5;

        // input
        this.input = {};

        // skill range
        this.skillRange.active = false;
        this.skillRange.children.forEach((node) => (node.active = false));
    }

    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        //碰地判斷
        if (self.tag == 2) {
            this.onTheGround = true;
        }
        // 受到傷害
        else if (other.node.group === 'Damage') {
            this.updateHearts(--this.healthPoint);
        }
    }

    private onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        // 攀爬
        if (self.tag === 1) {
            const rigidBody: cc.RigidBody = self.getComponent(cc.RigidBody);
            this.onTheGround = true;
            this.isClimbing = true;
            rigidBody.type = cc.RigidBodyType.Kinematic;
            rigidBody.linearVelocity = new cc.Vec2(0, 0);
        }
        // 角色死亡
        if (other.node.name === 'Deadline') {
            this.updateHearts(0);
        }
        // 通關
        else if (other.node.name === 'Endpoint') {
            this.node.emit('success');
            this.isAlive = false;
        }
    }

    private onCollisionExit(other: cc.Collider, self: cc.Collider) {
        // 結束攀爬
        if (self.tag === 1) {
            const rigidBody: cc.RigidBody = self.getComponent(cc.RigidBody);
            rigidBody.type = cc.RigidBodyType.Dynamic;
            this.onTheGround = false;
            this.isClimbing = false;
        }
    }

    // 要在地面才能跳躍
    // private onEndContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
    //     if (self.tag == 2) {
    //         this.onTheGround = false;
    //     }
    // }

    // player stauts change ???
    // private attitudeSet(originFaceDirection: number, ToBeFaceDirection: number) {
    //     //從靜止到移動
    //     if (originFaceDirection == 0 && ToBeFaceDirection == -1) {
    //         this.node.scaleX = -0.5;
    //         this.faceDirection = -1;
    //     } else if (originFaceDirection == 0 && ToBeFaceDirection == 1) {
    //         this.node.scaleX = 0.5;
    //         this.faceDirection = 1;
    //     }
    //     //更換移動方向 左到右 & 右到左
    //     else if (originFaceDirection == 1 && ToBeFaceDirection == -1) {
    //         this.speed.x = -300;
    //         this.node.scaleX = -0.5;
    //         this.faceDirection = -1;
    //     } else if (originFaceDirection == -1 && ToBeFaceDirection == 1) {
    //         this.speed.x = 300;
    //         this.node.scaleX = 0.5;
    //         this.faceDirection = 1;
    //     }
    // }

    // show skill range
    private toggleSkill(keyCode: number, isOpen: boolean) {
        if (!this.isAlive) {
            return;
        }
        const { none, accelerate, slowdown, rollback } = SkillSet;
        let skillIndex: number = none;
        switch (keyCode) {
            case cc.macro.KEY.q:
                skillIndex = accelerate;
                break;
            case cc.macro.KEY.e:
                skillIndex = slowdown;
                break;
            case cc.macro.KEY.r:
                skillIndex = rollback;
                break;
        }
        this.skillRange.children.forEach((area, idx) => {
            if (idx === skillIndex) {
                area.active = isOpen;
                if (isOpen) {
                    this.currentUsingSkill = idx;
                }
            } else {
                area.active = false;
            }
        });
        this.skillRange.active = this.skillRange.children.some((area) => area.active);
        if (!this.skillRange.active) {
            this.currentUsingSkill = SkillSet.none;
        }
    }

    // update health points and display it
    private updateHearts(num: number) {
        if (num === 5) {
            this.isAlive = true;
            this.heartGroup.children.forEach((node) => (node.getComponentInChildren(cc.Toggle).isChecked = true));
        } else {
            this.heartGroup.children.slice(num).forEach((node) => (node.getComponentInChildren(cc.Toggle).isChecked = false));
            if (num === 0) {
                this.node.emit('dead');
                this.isAlive = false;
            }
        }
    }
}

export enum SkillSet {
    none = -1,
    accelerate,
    slowdown,
    rollback,
}
