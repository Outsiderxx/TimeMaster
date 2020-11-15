import TimeEffect from '../TimeEffect';
import SkillCast from './SkillCast';
import AnimationEvent from './AnimationEvent';
const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerManager extends cc.Component {
    @property(cc.Animation)
    private playerAnimation: cc.Animation = null;

    @property(cc.Node)
    private skillRange: cc.Node = null;

    @property(SkillCast)
    private userPointer: SkillCast = null;

    @property(cc.Node)
    private heartGroup: cc.Node = null;

    @property(AnimationEvent)
    private animationEvent: AnimationEvent = null;

    @property
    private healthPoint: number = 5;

    @property
    private moveAccel: number = 0;

    @property
    private jumpFroce: number = 0;

    @property
    private invincibleTime: number = 0;

    private input = {};
    private onTheGround: boolean = false;
    private speed: cc.Vec2 = cc.v2(0, 0);
    private currentUsingSkill: SkillSet = -1;
    private isClimbing: boolean = false;
    private isAlive: boolean = true;
    private isInvincible: boolean = false;
    private playerPosition: cc.Vec2[] = [new cc.Vec2(-517, -168)];
    private currentSceneIdx: number = null; // current scene idx
    public playerState: number = StateSet.none;

    public get status() {
        return this.isAlive;
    }

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
                this.reset();
            }
        });

        // 玩家點擊到機關並且在技能範圍內
        this.userPointer.node.on('skillHit', (target: cc.Collider) => {
            console.log('skill casted');
            const mechanism: TimeEffect = target.getComponent(TimeEffect);
            const { none, accelerate, slowdown, rollback } = SkillSet;
            if (this.currentUsingSkill !== none && mechanism.checkStatus(this.currentUsingSkill)) {
                this.finiteState(StateSet.useSkill);
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
            this.node.getComponent(cc.RigidBody).linearVelocity = new cc.Vec2(0, 0);
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
                    this.finiteState(StateSet.run);
                }
            } else {
                lv.x = 0;
                if (this.playerAnimation.currentClip?.name !== 'playerIdle') {
                    this.finiteState(StateSet.idle);
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
                        this.finiteState(StateSet.jump);
                        this.onTheGround = false;
                    }
                }
            }
            this.getComponent(cc.RigidBody).linearVelocity = lv;
        }
    }

    public reset(idx?: number) {
        if (idx !== undefined) {
            this.currentSceneIdx = idx;
        }
        if (this.currentSceneIdx === null) {
            this.currentSceneIdx = 0; // 如果沒有從主菜單進遊戲， currentSceneIdx 為 null，會導致錯誤
        }

        // status
        this.healthPoint = 5;
        this.updateHearts(this.healthPoint);

        // position
        this.node.setPosition(this.playerPosition[this.currentSceneIdx]);

        // movement
        this.getComponent(cc.RigidBody).linearVelocity = new cc.Vec2(0, 0);

        // direction
        this.node.scaleX = 0.5;

        // input
        this.input = {};

        // skill range
        this.skillRange.active = false;
        this.skillRange.children.forEach((node) => (node.active = false));

        //pointer
        this.userPointer.changeScene();
    }

    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        // 受到傷害
        if (self.tag === 0 && (other.node.group === 'Damage' || other.node.group === 'MonsterDamage') && !this.isInvincible) {
            if (this.healthPoint > 1) {
                this.finiteState(StateSet.hurt);
            }
            this.updateHearts(--this.healthPoint);
            this.beingInvincible();


        } else if (self.tag === 1) {
            // 碰地測試
            if (this.playerState != StateSet.idle && this.playerState != StateSet.run)
                this.animationEvent.endJump();
            this.onTheGround = true;
        }
    }

    private onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        // 攀爬
        if (other.node.name === 'VineBody') {
            // 避免觸發其他觸發器
            const rigidBody: cc.RigidBody = self.getComponent(cc.RigidBody);
            this.onTheGround = true;
            this.isClimbing = true;
            rigidBody.type = cc.RigidBodyType.Kinematic;
            rigidBody.linearVelocity = new cc.Vec2(0, 0);
        }
        // 角色死亡
        if (other.node.name === 'Deadline') {
            this.finiteState(StateSet.die);
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
        if (other.node.name === 'VineBody') {
            const rigidBody: cc.RigidBody = self.getComponent(cc.RigidBody);
            rigidBody.type = cc.RigidBodyType.Dynamic;
            this.onTheGround = false;
            this.isClimbing = false;
        }
    }

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
                this.finiteState(StateSet.die);
                this.node.emit('dead');
                this.isAlive = false;
            }
        }
    }

    private beingInvincible() {
        this.isInvincible = true;
        this.scheduleOnce(() => (this.isInvincible = false), this.invincibleTime);
    }


    private finiteState(nextState: number) {

        if (nextState == StateSet.hurt || nextState == StateSet.die) {
            this.StateChange(nextState);
            return;
        }
        if (nextState == StateSet.useSkill && !(this.playerState == StateSet.hurt || this.playerState == StateSet.die)) {
            this.StateChange(nextState);
            return;
        }
        if (nextState == StateSet.jump && !(this.playerState == StateSet.hurt || this.playerState == StateSet.die)) {
            this.StateChange(nextState);
            return;
        }
        if (nextState == StateSet.run && (this.playerState == StateSet.none || this.playerState == StateSet.idle)) {
            this.StateChange(nextState);
            return;
        }
        if (nextState == StateSet.idle && this.playerState == StateSet.none) {
            this.StateChange(nextState);
            return;
        }
    }

    private StateChange(state: number) {

        switch (state) {
            case StateSet.idle:
                this.playerAnimation.play("playerIdle");
                this.playerState = StateSet.idle;
                break;
            case StateSet.run:
                this.playerAnimation.play("playerRun");
                this.playerState = StateSet.run;
                break;
            case StateSet.jump:
                this.playerAnimation.play("playerJump");
                this.playerState = StateSet.jump;
                break;
            case StateSet.useSkill:
                this.playerAnimation.play("playerUseSkill");
                this.playerState = StateSet.useSkill;
                break;
            case StateSet.hurt:
                this.playerAnimation.play("playerHurt");
                this.playerState = StateSet.hurt;
                break;
            case StateSet.die:
                this.playerAnimation.play("playerDeath");
                console.log("die");
                this.playerState = StateSet.die;
                break;
        }
    }
}

export enum SkillSet {
    none = -1,
    accelerate,
    slowdown,
    rollback,
}

export enum StateSet {
    none = -1,
    idle,
    run,
    jump,
    useSkill,
    hurt,
    die,

}

