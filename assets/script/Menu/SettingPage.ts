const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Node)
    private mask: cc.Node = null;

    @property(cc.Node)
    private volumeToggle: cc.Node = null;

    @property(cc.Node)
    private closeBtn: cc.Node = null;

    @property(cc.AudioClip)
    private buttonEffect: cc.AudioClip = null;

    onLoad() {
        this.mask.on(cc.Node.EventType.TOUCH_END, () => this.close());
        this.volumeToggle.on('toggle', () => {
            if (cc.audioEngine.getMusicVolume() === 0) {
                cc.audioEngine.setMusicVolume(0.5);
                cc.audioEngine.setEffectsVolume(0.5);
                cc.audioEngine.playEffect(this.buttonEffect, false);
            } else {
                cc.audioEngine.setMusicVolume(0);
                cc.audioEngine.setEffectsVolume(0);
            }
        });
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => this.close());
        this.node.active = false;
        this.node.opacity = 255;
    }

    public open() {
        this.node.active = true;
        if (cc.audioEngine.getMusicVolume() === 0) {
            this.volumeToggle.getComponent(cc.Toggle).isChecked = true;
        } else {
            this.volumeToggle.getComponent(cc.Toggle).isChecked = false;
        }
    }

    private close() {
        this.node.active = false;
    }
}
