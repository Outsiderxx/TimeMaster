import SettingPage from './SettingPage';

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainMenuController extends cc.Component {
    @property(cc.Button)
    private startBtn: cc.Button = null;

    @property(cc.Button)
    private settingBtn: cc.Button = null;

    @property(SettingPage)
    private settingPage: SettingPage = null;

    @property(cc.Button)
    private helpBtn: cc.Button = null;

    @property(cc.Node)
    private helpPage: cc.Node = null;

    @property(cc.Node)
    private closeHelpPageBtn: cc.Node = null;

    @property(cc.Button)
    private exitBtn: cc.Button = null;

    @property(cc.AudioClip)
    private buttonEffect: cc.AudioClip = null;

    onLoad() {
        this.startBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.active = false;
            this.node.emit('enterFirstScene');
            cc.audioEngine.playEffect(this.buttonEffect, false);
        });
        this.exitBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            cc.audioEngine.playEffect(this.buttonEffect, false);
            cc.game.end();
        });
        this.settingBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.settingPage.open();
            cc.audioEngine.playEffect(this.buttonEffect, false);
        });
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.helpPage.active = true;
            cc.audioEngine.playEffect(this.buttonEffect, false);
        });
        this.closeHelpPageBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.helpPage.active = false;
            cc.audioEngine.playEffect(this.buttonEffect, false);
        });
    }
}
