import TimeEffect from '../../../TimeEffect';
import ThornMechanism from './ThornMechanism';

const { ccclass, property } = cc._decorator;

@ccclass
export default class CannonRock extends TimeEffect {
    @property(cc.Animation)
    private CannonBody: cc.Animation = null;
    @property(cc.Boolean)
    private rockStatus: boolean = false;
    @property(cc.Node)
    private rockSprite: cc.Node = null; 
    @property(cc.Animation)
    private RockBody: cc.Animation = null;
    onLoad() {
        this.status = 'original';
        this.rockSprite.active = false;
        this.CannonBody.on('finished', () => {
            if (this.CannonBody.currentClip.name === 'Explosion') {
                this.rockStatus = true;
                this.rockSprite.active = true;
            }else{
                this.rockStatus = false;
                this.rockSprite.active = false;
            }
        });
        this.RockBody.on('play', () => {
            this.RockBody.node.active = true;
        });
        this.RockBody.on('finished', () => {
            if (this.RockBody.currentClip.name === 'RockFallen') {
                this.RockBody.node.active = false;
            }
        });
    }
    public rollback() {
        if(this.rockStatus){
            this.status = 'original';
            this.RockBody.play('RockReturn');
        }
    }

    public accelerate() {
        if(this.rockStatus){
            this.status = 'triggered';
            this.RockBody.play('RockFallen');
        }
        
    }

    public slowdown() {}

    public reset() {
        this.status = 'triggered';
        this.rockStatus = true;
        this.rollback();
        this.rockStatus = false;
    }
}
