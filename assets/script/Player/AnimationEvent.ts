import PlayerManager, { StateSet } from './PlayerManager';
const { ccclass, property } = cc._decorator;

@ccclass
export default class AnimationEvent extends cc.Component {
    @property(PlayerManager)
    private playerManager: PlayerManager = null;
    @property(cc.Animation)
    private playerAnimation: cc.Animation = null;
    @property(cc.Node)
    private effect: cc.Node = null;
    @property(cc.AudioClip)
    private accelAudio: cc.AudioClip = null;
    @property(cc.AudioClip)
    private slowAudio: cc.AudioClip = null;
    @property(cc.AudioClip)
    private rollBacklAudio: cc.AudioClip = null;
    @property(cc.AudioClip)
    private jumpAudio: cc.AudioClip = null;
    @property(cc.AudioClip)
    private walkAudio: cc.AudioClip = null;
    @property(cc.AudioClip)
    private hurtAudio: cc.AudioClip = null;
    @property(cc.AudioClip)
    private deathAudio: cc.AudioClip = null;

    private walkAudioID: number = -10;
    private jumpEffectID: number = null;
    private effectAnimation: cc.Animation = null;

    onLoad() {
        this.effectAnimation = this.effect.getComponent(cc.Animation);
        this.walkAudioID = -10;
    }
    public endHurt() {
        this.playerManager.playerState = StateSet.none;
        if (this.playerManager.GetIsClimbing()) {
            console.log('play');
            this.playerManager.resetClimbCount();
            this.playerAnimation.playAdditive('playerClimb');
            //console.log(this.playerAnimation.playAdditive("playerClimb"));
        }
        console.log('endHurt');
    }

    public endSkill() {
        this.playerManager.playerState = StateSet.none;
        console.log('endSkill');
    }

    public endJump() {
        this.playerManager.playerState = StateSet.none;
        console.log('endJump');
    }

    public afterAccelExpend() {
        console.log('accel');
        this.effectAnimation.play('accel');
    }

    public afterReverseExpend() {
        console.log('rollBack');
        this.effectAnimation.play('rollBack');
    }

    public afterSlowExpend() {
        console.log('slow');
        this.effectAnimation.play('slow');
    }
    public noneEffect() {
        this.effectAnimation.play();
    }

    public accelAudioPlay() {
        cc.audioEngine.playEffect(this.accelAudio, false);
    }

    public slowAudioPlay() {
        cc.audioEngine.playEffect(this.slowAudio, false);
    }

    public rollBackAudioPlay() {
        cc.audioEngine.playEffect(this.rollBacklAudio, false);
    }

    public walkAudioPlay() {
        //console.log("walkID =  ", this.walkAudioID);
        if (this.playerManager.status) {
            if (this.walkAudioID === -10) {
                this.walkAudioID = cc.audioEngine.playEffect(this.walkAudio, true);
                //console.log("walkID =  ", this.walkAudioID);
            } else if (cc.audioEngine.getState(this.walkAudioID) === cc.audioEngine.AudioState.PAUSED) {
                //console.log("resume walk audio");
                cc.audioEngine.resume(this.walkAudioID);
            }
        }
    }
    public walkAudioPause() {
        if (cc.audioEngine.getState(this.walkAudioID) === cc.audioEngine.AudioState.PLAYING) {
            //console.log("stop walk audio");
            cc.audioEngine.pause(this.walkAudioID);
        }
    }

    public hurtAudioPlay() {
        cc.audioEngine.playEffect(this.hurtAudio, false);
    }

    public deathAudioPlay() {
        cc.audioEngine.playEffect(this.deathAudio, false);
    }

    public jumpAudioPlay() {
        if (this.jumpEffectID === null || cc.audioEngine.getState(this.jumpEffectID) !== cc.audioEngine.AudioState.PLAYING) {
            this.jumpEffectID = cc.audioEngine.playEffect(this.jumpAudio, false);
        }
    }
}
