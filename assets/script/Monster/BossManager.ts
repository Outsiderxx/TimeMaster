// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import JaggedMechanism from '../Scene/JaggedMechanism';
import BossFallenRock from './BossFallenRock';
import TimeEffect from '../TimeEffect';
import BossWeapon from './BossWeapon';
import PlayerManager from '../Player/PlayerManager';

const { ccclass, property } = cc._decorator;

export enum currentPosition {
    none = -1,
    leftTop = 0,
    leftBottom = 1,
    middleTop = 2,
    middleBottom = 3,
    rightTop = 4,
    rightBottom = 5,
}

@ccclass
export default class Boss extends TimeEffect {
    @property(cc.Node)
    private player: cc.Node = null;

    @property(cc.ProgressBar)
    private HPDisplay: cc.ProgressBar = null;

    @property([cc.Node])
    private Jagged: cc.Node[] = [];

    @property([cc.Vec2])
    private bossPosition: cc.Vec3[] = new Array(6);

    @property(cc.Prefab)
    private fallenRockPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    private bossWeapon: cc.Prefab = null;

    @property(cc.Prefab)
    private axeParticleSystem: cc.Prefab = null;

    @property(cc.Prefab)
    private bossSprintParticleSystem: cc.Prefab = null;

    @property(cc.Animation)
    private bossAnimation: cc.Animation = null;

    @property(cc.AudioClip)
    private axeEffect: cc.AudioClip = null;

    @property(cc.AudioClip)
    private jaggedEffect: cc.AudioClip = null;

    @property(cc.AudioClip)
    private sprintEffectOne: cc.AudioClip = null;

    @property(cc.AudioClip)
    private sprintEffectTwo: cc.AudioClip = null;

    @property(cc.AudioClip)
    private deathEffect: cc.AudioClip = null;

    @property
    private active: boolean = false;

    @property
    private minMovePeriod: number = 0;

    @property
    private maxMovePeriod: number = 0;

    @property
    private minSkillPeriod: number = 0;

    @property
    private maxSkillPeriod: number = 0;

    @property
    private moveSpeed: number = 0;

    @property
    private bossHP: number = 0;

    @property
    private invincibleTime: number = 0;

    private currentHP: number = 0;
    private moveTimer: number = 0;
    private skillTimer: number = 0;
    private pickupWeaponTimer: number = 0;
    private nextMovePeriod: number = 0;
    private nextSkillPeriod: number = 0;
    private pickupWeaponPeriod: number = 0;
    private isInvincible: boolean = false;
    private weaponOnHand: boolean = true;
    private usingSpecialSkill: boolean = false;
    private weaponWaiting: boolean = false;
    private currentTween: cc.Tween = null;
    private position: currentPosition = currentPosition.middleBottom;
    private weapon: cc.Node = null;
    private fallenRock: cc.Node[] = new Array();
    private attackPosOffset: number[] = [20, 0, -20];

    public getWeapon() {
        this.weaponOnHand = true;
    }

    onLoad() {
        this.reset();
    }

    private playSkillAnimation() {
        if (this.bossAnimation.currentClip.name !== 'BossSkill') {
            this.bossAnimation.play('BossSkill');
        }
    }

    private playIdleAnimation() {
        if (this.bossAnimation.currentClip.name !== 'BossIdle') {
            this.bossAnimation.play();
        }
    }

    private playSprintAnimation() {
        if (this.bossAnimation.currentClip.name !== 'BossSprint') {
            this.bossAnimation.play('BossSprint');
        }
    }

    private playDeadAnimation() {
        if (this.bossAnimation.currentClip.name !== 'BossDead') {
            this.bossAnimation.play('BossDead');
        }
    }

    private moveDecision() {
        switch (this.position) {
            case currentPosition.leftTop:
                do {
                    this.position = Math.floor(Math.random() * 6);
                } while (this.position === currentPosition.leftTop);
                break;

            case currentPosition.leftBottom:
                do {
                    this.position = Math.floor(Math.random() * 6);
                } while (this.position === currentPosition.leftBottom);
                break;

            case currentPosition.middleTop:
                do {
                    this.position = Math.floor(Math.random() * 6);
                } while (this.position === currentPosition.middleTop);
                break;

            case currentPosition.middleBottom:
                do {
                    this.position = Math.floor(Math.random() * 6);
                } while (this.position === currentPosition.middleBottom);
                break;

            case currentPosition.rightTop:
                do {
                    this.position = Math.floor(Math.random() * 6);
                } while (this.position === currentPosition.rightTop);
                break;

            case currentPosition.rightBottom:
                do {
                    this.position = Math.floor(Math.random() * 6);
                } while (this.position === currentPosition.rightBottom);
                break;
        }
        this.startMove(this.bossPosition[this.position]);
    }

    private startMove(nextPos: cc.Vec3) {
        if (this.currentTween !== null) {
            this.currentTween.stop();
        }

        const distanceX = this.player.x - nextPos.x;
        this.node.scaleX = distanceX < 0 ? 1 : -1;

        this.currentTween = cc
            .tween(this.node)
            .to(100 / this.moveSpeed, { position: nextPos }, { easing: 'quartOut' })
            .call(() => {
                this.isInvincible = false;
            })
            .start();
    }

    private useSkill() {
        const skillDecision = this.weaponOnHand ? Math.floor(Math.random() * 4) : Math.floor(Math.random() * 3);
        if (skillDecision === 0) {
            this.playSkillAnimation();
            cc.audioEngine.playEffect(this.jaggedEffect, false);
            const isDelay: boolean = Math.floor(Math.random() * 2) === 0 ? true : false;
            this.jaggedAttack(isDelay);
        } else if (skillDecision === 1) {
            cc.audioEngine.playEffect(this.sprintEffectOne, false);
            this.sprintModeOne();
        } else if (skillDecision === 2) {
            cc.audioEngine.playEffect(this.sprintEffectTwo, false);
            this.sprintModeTwo();
        } else {
            this.playSkillAnimation();
            cc.audioEngine.playEffect(this.axeEffect, false);
            this.throwWeapon();
        }
    }

    private jaggedAttack(isDelay: boolean = true) {
        const delayTime = isDelay ? Math.random() * 0.5 + 0.75 : 0;

        let jaggedIndex = Math.floor(Math.random() * 3);
        let offsetIndex = Math.floor(Math.random() * 3);
        this.Jagged[jaggedIndex].getComponent(JaggedMechanism).preAttack(this.attackPosOffset[offsetIndex], 0);
        offsetIndex = Math.floor(Math.random() * 3);
        jaggedIndex = (jaggedIndex + 1) % 3;
        this.Jagged[jaggedIndex].getComponent(JaggedMechanism).preAttack(this.attackPosOffset[offsetIndex], delayTime);

        this.scheduleOnce(this.playIdleAnimation, 1);
    }

    private sprintModeOne() {
        if (this.currentTween !== null) {
            this.currentTween.stop();
        }

        this.usingSpecialSkill = true;
        this.node.group = 'MonsterDamage';
        this.node.getComponent(cc.PhysicsBoxCollider).apply();
        const bossWorldPos: cc.Vec2 = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        this.node.scaleX = this.player.x - this.player.parent.convertToNodeSpaceAR(bossWorldPos).x < 0 ? 1 : -1;

        let newParticleSystem = cc.instantiate(this.bossSprintParticleSystem);
        this.node.addChild(newParticleSystem);

        const randX = Math.random() * this.node.parent.width - this.node.parent.width / 2;
        const randY = (Math.random() * this.node.parent.height) / 4 + this.node.parent.height / 4;

        const distanceX = this.player.x - randX;
        const distanceY = this.player.y - randY;
        const radian = Math.atan(distanceY / distanceX);
        let angle = (radian * 180) / Math.PI;

        const moveTime = Math.sqrt(distanceX * distanceX + distanceY * distanceY) / (this.moveSpeed * 7.5);

        this.currentTween = cc
            .tween(this.node)
            .parallel(cc.tween().to(1, { x: randX }), cc.tween().to(1, { y: randY }))
            .call(() => {
                this.node.scaleX = distanceX < 0 ? 1 : -1;
                this.node.angle = angle;
                this.playSprintAnimation();
            })
            .parallel(cc.tween().to(moveTime, { x: this.player.x }, { easing: 'sineIn' }), cc.tween().to(moveTime, { y: this.player.y }, { easing: 'sineIn' }))
            .call(() => {
                this.spawnFallenRock();
                this.schedule(this.endSpecialSkill, 0.2, 0);
            })
            .start();
    }

    private sprintModeTwo() {
        if (this.currentTween !== null) {
            this.currentTween.stop();
        }

        this.usingSpecialSkill = true;
        this.node.group = 'MonsterDamage';
        this.node.getComponent(cc.PhysicsBoxCollider).apply();

        let newParticleSystem = cc.instantiate(this.bossSprintParticleSystem);
        newParticleSystem.getComponent(cc.ParticleSystem).startColor = cc.color(51, 240, 255);
        this.node.addChild(newParticleSystem);

        const bossWorldPos: cc.Vec2 = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        const distanceX = -350 - this.player.parent.convertToNodeSpaceAR(bossWorldPos).x;
        const distanceY = 150 - this.player.parent.convertToNodeSpaceAR(bossWorldPos).y;

        const moveTime = Math.sqrt(distanceX * distanceX + distanceY * distanceY) / (this.moveSpeed * 10);

        this.currentTween = cc
            .tween(this.node)
            .call(() => {
                this.playSkillAnimation();
            })
            .delay(1)
            .call(() => {
                this.playIdleAnimation();
            })
            .to(moveTime, { position: cc.v3(-350, 150, 0) }, { easing: 'sineOut' })
            .delay(0.2)
            .to(0.2, { position: cc.v3(-350, -200, 0) })
            .delay(0.2)
            .to(0.2, { position: cc.v3(0, 150, 0) }, { easing: 'sineOut' })
            .delay(0.2)
            .to(0.2, { position: cc.v3(0, -200, 0) })
            .delay(0.2)
            .to(0.2, { position: cc.v3(350, 150, 0) }, { easing: 'sineOut' })
            .delay(0.2)
            .to(0.2, { position: cc.v3(350, -200, 0) })
            .call(() => {
                this.spawnFallenRock();
                this.schedule(this.endSpecialSkill, 0.2, 0);
            })
            .start();
    }

    private endSpecialSkill() {
        this.node.group = 'Monster';
        this.node.getComponent(cc.PhysicsBoxCollider).apply();
        this.usingSpecialSkill = false;
        this.isInvincible = true;
        this.node.angle = 0;
        this.playIdleAnimation();
        this.moveDecision();
    }

    private spawnFallenRock() {
        if (this.fallenRock.length !== 0) {
            this.fallenRock[0].getComponent(BossFallenRock).reset();
            this.fallenRock[1].getComponent(BossFallenRock).reset();
            this.fallenRock.length = 0;
        }
        let newRock1 = cc.instantiate(this.fallenRockPrefab);
        let newRock2 = cc.instantiate(this.fallenRockPrefab);
        newRock1.setPosition(Math.random() * 640 - 640, 480);
        newRock2.setPosition(Math.random() * 640, 480);
        this.node.parent.addChild(newRock1);
        this.node.parent.addChild(newRock2);
        newRock1.getComponent(BossFallenRock).boss = this.node;
        newRock2.getComponent(BossFallenRock).boss = this.node;
        newRock1.getComponent(BossFallenRock).accelerate();
        newRock2.getComponent(BossFallenRock).accelerate();

        this.fallenRock.push(newRock1);
        this.fallenRock.push(newRock2);
    }

    private throwWeapon() {
        if (this.currentTween !== null) {
            this.currentTween.stop();
        }

        this.usingSpecialSkill = true;
        this.weaponOnHand = false;

        this.pickupWeaponTimer = 0;
        this.pickupWeaponPeriod = Math.random() * 10 + 5;

        const posX = Math.random() * 200 - 100;
        const posY = Math.random() * 100;
        const bossWorldPos: cc.Vec2 = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        const distanceX = posX - this.player.parent.convertToNodeSpaceAR(bossWorldPos).x;
        const distanceY = posY - this.player.parent.convertToNodeSpaceAR(bossWorldPos).y;

        const moveTime = Math.sqrt(distanceX * distanceX + distanceY * distanceY) / (this.moveSpeed * 5);

        this.currentTween = cc
            .tween(this.node)
            .parallel(cc.tween().to(moveTime, { x: posX }, { easing: 'quartOut' }), cc.tween().to(moveTime, { y: posY }, { easing: 'quartOut' }))
            .call(() => {
                let newParticleSystem = cc.instantiate(this.axeParticleSystem);
                newParticleSystem.setPosition(90, 5);
                this.node.addChild(newParticleSystem);
                this.schedule(this.spawnWeapon, 1, 0);
            })
            .start();
    }

    private spawnWeapon() {
        let newWeapon = cc.instantiate(this.bossWeapon);
        newWeapon.setPosition(this.node.x + 70 * this.node.scaleX, this.node.y + 30);
        this.node.parent.addChild(newWeapon);
        this.weapon = newWeapon;
        const bossWorldPos: cc.Vec2 = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        const distanceX = this.player.x - this.player.parent.convertToNodeSpaceAR(bossWorldPos).x;
        const direction = distanceX > 0 ? false : true;
        newWeapon.getComponent(BossWeapon).Boss = this.node;
        newWeapon.getComponent(BossWeapon).startAttack(direction);
        this.weaponWaiting = true;
    }

    private pickupWeapon() {
        if (this.weapon === null || this.weapon.getComponent(BossWeapon).rollbacking) {
            return;
        }
        this.usingSpecialSkill = true;
        this.node.group = 'MonsterDamage';
        this.node.getComponent(cc.PhysicsBoxCollider).apply();

        let newParticleSystem = cc.instantiate(this.bossSprintParticleSystem);
        newParticleSystem.getComponent(cc.ParticleSystem).startColor = cc.color(251, 240, 255);
        this.node.addChild(newParticleSystem);

        const bossWorldPos: cc.Vec2 = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        const distanceX = this.weapon.x - this.player.parent.convertToNodeSpaceAR(bossWorldPos).x;
        const distanceY = this.weapon.y - this.player.parent.convertToNodeSpaceAR(bossWorldPos).y;

        const moveTime = Math.sqrt(distanceX * distanceX + distanceY * distanceY) / (this.moveSpeed * 15);

        this.currentTween = cc
            .tween(this.node)
            .delay(1)
            .parallel(cc.tween().to(moveTime, { x: this.weapon.x }), cc.tween().to(moveTime, { y: this.weapon.y }))
            .call(() => {
                this.weapon.destroy();
                this.getWeapon();
                this.scheduleOnce(this.endSpecialSkill, 0.2);
            })
            .start();
    }

    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if (!this.isInvincible) {
            if (other.node.group === 'Damage') {
                this.currentHP -= 10;
                this.HPCheck(this.currentHP);
                this.node.children[0].color = cc.color(255, 0, 0);
                this.beingInvincible();
            }
            if (this.weapon !== null) {
                if (other.node.name === 'BossWeapon' && this.weapon.getComponent(BossWeapon).causeDamage) {
                    this.currentHP -= 10;
                    this.HPCheck(this.currentHP);
                    this.node.children[0].color = cc.color(255, 0, 0);
                    this.beingInvincible();
                }
            }
        }
    }

    private HPCheck(HP: number) {
        if (HP <= 0) {
            cc.audioEngine.playEffect(this.deathEffect, false);
            this.playDeadAnimation();
            this.unscheduleAllCallbacks();
            this.scheduleOnce(() => (this.node.active = false), 1);
            this.scheduleOnce(() => this.node.emit('dead'), 1);
        }
        this.HPDisplay.progress = HP / this.bossHP;
    }

    private beingInvincible() {
        this.isInvincible = true;
        this.scheduleOnce(this.postInvincible, this.invincibleTime);
    }

    private postInvincible() {
        this.scheduleOnce(() => {
            this.isInvincible = false;
        }, 0.5);
        this.node.children[0].color = cc.color(255, 255, 255);
        if (!this.usingSpecialSkill) {
            this.moveTimer = 0;
            this.nextMovePeriod = Math.random() * this.minMovePeriod + (this.maxMovePeriod - this.minMovePeriod);
            this.moveDecision();
        }
    }

    public accelerate() {}
    public slowdown() {}
    public rollback() {}

    public reset() {
        this.node.active = true;
        this.unscheduleAllCallbacks();
        if (this.weapon !== null) {
            this.weapon.destroy();
        }
        if (this.currentTween !== null) {
            this.currentTween.stop();
        }
        if (this.fallenRock.length !== 0) {
            this.fallenRock[0].getComponent(BossFallenRock).reset();
            this.fallenRock[1].getComponent(BossFallenRock).reset();
            this.fallenRock.length = 0;
        }

        this.isInvincible = false;
        this.weaponOnHand = true;
        this.usingSpecialSkill = false;
        this.weaponWaiting = false;

        this.currentHP = this.bossHP;

        this.moveTimer = 0;
        this.skillTimer = 0;
        this.pickupWeaponTimer = 0;
        this.nextMovePeriod = Math.random() * (this.maxMovePeriod - this.minMovePeriod) + this.minMovePeriod;
        this.nextSkillPeriod = Math.random() * (this.maxSkillPeriod - this.minSkillPeriod) + this.minMovePeriod;
        this.pickupWeaponPeriod = 1;
        this.bossAnimation.play();
        this.HPDisplay.progress = 1;
        this.position = currentPosition.middleBottom;
        this.node.setPosition(this.bossPosition[this.position]);
        this.node.scaleX = 1;
        this.node.angle = 0;
    }

    update(dt) {
        if (this.weaponWaiting) {
            if (this.weaponOnHand) {
                this.weaponWaiting = false;
                this.moveTimer = 0;
                this.endSpecialSkill();
            }
            if (!this.weapon.isValid || this.weapon.getComponent(BossWeapon).hitWall) {
                this.weaponWaiting = false;
                this.moveTimer = 0;
                this.endSpecialSkill();
            }
        }

        if (this.usingSpecialSkill || !this.player.getComponent(PlayerManager).status || this.currentHP <= 0) {
            this.moveTimer = 0;
            this.skillTimer = 0;
        }
        if (this.active && !this.usingSpecialSkill) {
            this.moveTimer += dt;
            this.skillTimer += dt;
            if (!this.weaponOnHand) {
                this.pickupWeaponTimer += dt;
            }
        }
        if (this.moveTimer >= this.nextMovePeriod) {
            this.moveTimer = 0;
            this.nextMovePeriod = Math.random() * (this.maxMovePeriod - this.minMovePeriod) + this.minMovePeriod;
            this.nextSkillPeriod += 1;
            this.pickupWeaponPeriod += 1;
            if (this.player.x !== -450 && !this.weaponWaiting) {
                this.moveDecision();
            }
        }
        if (this.skillTimer >= this.nextSkillPeriod) {
            this.skillTimer = 0;
            this.nextSkillPeriod = Math.random() * (this.maxSkillPeriod - this.minSkillPeriod) + this.minMovePeriod;
            this.nextMovePeriod += 1;
            this.pickupWeaponPeriod += 1;
            if (this.player.x !== -450 && !this.weaponWaiting) {
                this.useSkill();
            }
        }
        if (this.pickupWeaponTimer >= this.pickupWeaponPeriod) {
            this.pickupWeaponTimer = 0;
            this.pickupWeaponPeriod = 100;
            this.nextMovePeriod += 1;
            this.nextSkillPeriod += 1;
            this.pickupWeapon();
        }
    }
}
