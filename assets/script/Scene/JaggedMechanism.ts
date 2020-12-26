// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import TimeEffect from '../TimeEffect';
import RigidBodyFollowParentNode from './RigidBodyFollowParentNode';

const {ccclass, property} = cc._decorator;

@ccclass
export default class JaggedMechanism extends TimeEffect {

    @property(cc.Node)
    private player: cc.Node = null;

    @property(cc.Prefab)
    private jaggedParticleSystem: cc.Prefab = null;

    @property
    private moveSpeed: number = 0;

    private currentTween: cc.Tween = null;
    private originalPos: cc.Vec2 = null;
    private lastAttackPos: cc.Vec2 = null;
    private attackMoveTime: number = 0;
    private returnMoveTime: number = 0;
    private returning: boolean = false;
    private rollbacking: boolean = false;
    private preparing: boolean = false;
    private timeEffectFromDR: boolean = false; //從指向石使用技能
    private isIdle: boolean = true;

    public skillCaseFromDR(status: boolean) {
        this.timeEffectFromDR = status;
    }

    onLoad() {
        this.status = 'normal';
        this.originalPos = this.node.getPosition();
    }

    public preAttack(offset: number, delayTime: number) {

        this.preparing = true;
        this.status = 'normal';

        let newParticleSystem = cc.instantiate(this.jaggedParticleSystem);
        newParticleSystem.getComponent(cc.ParticleSystem).life = 0.5 + delayTime;
        newParticleSystem.setPosition(0, 0);
        newParticleSystem.scale = this.node.scale;
        this.node.addChild(newParticleSystem);


        this.currentTween = cc
        .tween(this.node.children[0])
        .by(0.5 + delayTime, {angle: 720 * (1 + delayTime)}, { easing: 'sineIn'})
        .call(() => {this.startAttack(offset)})
        .start()
    }

    private startAttack(offset: number) {

        if(this.currentTween !== null) {
            this.currentTween.stop();
            this.unscheduleAllCallbacks();
        }

        const jaggedWorldPos: cc.Vec2 = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        const distanceX = this.player.x - this.player.parent.convertToNodeSpaceAR(jaggedWorldPos).x;
        const distanceY = this.player.y - this.player.parent.convertToNodeSpaceAR(jaggedWorldPos).y;

        this.preparing = false;
        this.isIdle = false;
        this.attackMoveTime = Math.sqrt(distanceX*distanceX + distanceY*distanceY) / this.moveSpeed;

        let timeOffset = 0;

        switch (this.status) {
            case 'normal':
                timeOffset = 1;
                break;
            case 'speedup':
                timeOffset = 0.3;
                break;
            case 'slowdown':
                timeOffset = 3;
                break;
            default:
                break;
        }

        this.currentTween = cc
            .tween(this.node)
            .parallel(cc.tween().to(this.attackMoveTime*timeOffset, { x: this.player.x + offset }), 
            cc.tween().to(this.attackMoveTime*timeOffset, { y: this.player.y }))
            .call(() => {this.schedule(this.returnToOriginalPos, 0.2, 0);})
            .start();
        (this.currentTween as any)._finalAction._speedMethod = true;
    }

    private returnToOriginalPos() {
        this.returning = true;
        this.lastAttackPos = this.node.getPosition();
        const distanceX = this.lastAttackPos.x - this.originalPos.x;
        const distanceY = this.lastAttackPos.y - this.originalPos.y;

        this.returnMoveTime = Math.sqrt(distanceX*distanceX + distanceY*distanceY) / this.moveSpeed;

        let timeOffset = 0;

        switch (this.status) {
            case 'normal':
                timeOffset = 1;
                break;
            case 'speedup':
                timeOffset = 0.3;
                break;
            case 'slowdown':
                timeOffset = 3;
                break;
            default:
                break;
        }
        
        this.currentTween = cc
            .tween(this.node)
            .parallel(cc.tween().to(this.returnMoveTime*timeOffset, { x: this.originalPos.x }), 
            cc.tween().to(this.returnMoveTime*timeOffset, { y: this.originalPos.y }))
            .call(() => {this.endAttack();})
            .start();
            (this.currentTween as any)._finalAction._speedMethod = true;
    }

    private endAttack() {
        this.status = 'normal';
        this.isIdle = true;
        this.returning = false;
        this.rollbacking = false;
        this.node.children[0].group = 'MonsterDamage';
        this.node.children[0].getComponent(cc.PhysicsBoxCollider).apply();
    }

    public accelerate() {
        if(!this.isIdle && this.timeEffectFromDR) {
            return;
        }
        this.changeMovement(false);
    }

    public slowdown() {
        if(!this.isIdle && this.timeEffectFromDR) {
            return;
        }
        this.changeMovement(true);
    }

    public rollback() {

        if(this.preparing) {
            return;
        }

        //攻擊過且已回到原本位置後被倒轉
        if (this.isIdle && this.lastAttackPos !== null) {
            this.node.children[0].group = 'Damage';
            this.node.children[0].getComponent(cc.PhysicsBoxCollider).apply();
            this.isIdle = false;
            this.rollbacking = true;

            const distanceX = this.lastAttackPos.x - this.originalPos.x;
            const distanceY = this.lastAttackPos.y - this.originalPos.y;

            this.attackMoveTime = Math.sqrt(distanceX*distanceX + distanceY*distanceY) / this.moveSpeed;

            this.currentTween = cc
            .tween(this.node)
            .parallel(cc.tween().to(this.attackMoveTime, { x: this.lastAttackPos.x }), 
            cc.tween().to(this.attackMoveTime, { y: this.lastAttackPos.y }))
            .call(() => {this.schedule(this.returnToOriginalPos, 0.2, 0);})
            .start();
            (this.currentTween as any)._finalAction._speedMethod = true;
        }else if(!this.timeEffectFromDR && !this.rollbacking) {
            this.node.children[0].group = 'Damage';
            this.node.children[0].getComponent(cc.PhysicsBoxCollider).apply();

            this.currentTween.stop();
            this.returnToOriginalPos();

        }
    }

    private changeMovement(slowdown: boolean, reset: boolean = false) {
        const time = this.returning ? this.returnMoveTime : this.attackMoveTime;
        switch (this.status) {
            case 'normal':
                (this.currentTween as any)._finalAction._speed = slowdown ? time / 3 : time * 3;
                this.status = slowdown ? 'slowdown' : 'speedup';
                break;
            case 'speedup':
                (this.currentTween as any)._finalAction._speed = slowdown ? time : time * 3;
                this.status = slowdown ? 'normal' : 'speedup';
                break;
            case 'slowdown':
                (this.currentTween as any)._finalAction._speed = slowdown ? time / 3 : time;
                this.status = slowdown ? 'slowdown' : 'normal';
                break;
            default:
                break;
        }
        if (reset) {
            (this.currentTween as any)._finalAction._speed = time;
            this.status = 'normal';
        }
    }

    public reset() {
        this.unscheduleAllCallbacks();
        this.isIdle = true;
        this.rollbacking = false;
        this.returning = false;
        this.lastAttackPos = null;
        if(this.currentTween !== null) {
            this.currentTween.stop();
        }
        this.node.children[0].group = 'MonsterDamage';
        this.node.children[0].getComponent(cc.PhysicsBoxCollider).apply();
        this.node.setPosition(this.originalPos);
    }

}
