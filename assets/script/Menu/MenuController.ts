const { ccclass, property } = cc._decorator;

@ccclass
export default class MenuController extends cc.Component {
    @property(cc.Button)
    private helpBtn: cc.Button = null;

    @property(cc.Node)
    private volumeToggle: cc.Node = null;

    @property(cc.Button)
    private backBtn: cc.Button = null;

    @property(cc.Node)
    private helpPanel: cc.Node = null;

    @property(cc.Node)
    private closeBtn: cc.Node = null;

    @property(cc.AudioClip)
    private buttonEffect: cc.AudioClip = null;

    private isOpen: boolean = false;

    onLoad() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event: cc.Event.EventKeyboard) => {
            if (event.keyCode === cc.macro.KEY.escape) {
                cc.audioEngine.playEffect(this.buttonEffect, false);
                if (this.isOpen) {
                    this.isOpen = false;
                    this.helpPanel.active = false;
                    this.node.active = false;
                    cc.director.resume();
                } else {
                    this.isOpen = true;
                    this.node.active = true;
                    if (cc.audioEngine.getMusicVolume() === 0) {
                        this.volumeToggle.getComponent(cc.Toggle).isChecked = true;
                    } else {
                        this.volumeToggle.getComponent(cc.Toggle).isChecked = false;
                    }
                    cc.director.pause();
                }
            }
        });
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.helpPanel.active = true;
            cc.audioEngine.playEffect(this.buttonEffect, false);
        });
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.helpPanel.active = false;
            cc.audioEngine.playEffect(this.buttonEffect, false);
        });
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
        this.backBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.active = false;
            this.helpPanel.active = false;
            this.isOpen = false;
            cc.director.resume();
            this.node.emit('back');
        });
        this.node.active = false;
        this.node.opacity = 255;
    }
}
