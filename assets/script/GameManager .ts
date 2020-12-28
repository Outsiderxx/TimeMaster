import MenuController from './Menu/MenuController';
import MainMenuController from './Menu/MainMenuController';
import TransitionController from './TransitionController';
import CameraController from './CameraController';
import PlayerManager from './Player/PlayerManager';
import SceneManager from './Scene/SceneManager';
import NarratorManager from './Narrator/NarratorManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameController extends cc.Component {
    @property(MainMenuController)
    private mainMenu: MainMenuController = null;

    @property(MenuController)
    private menu: MenuController = null;

    @property(PlayerManager)
    private player: PlayerManager = null;

    @property(cc.Node)
    private boss: cc.Node = null;

    @property(CameraController)
    private camera: CameraController = null;

    @property([cc.Node])
    private sceneNodes: cc.Node[] = [];

    @property(SceneManager)
    private currentScene: SceneManager = null;

    @property(TransitionController)
    private transition: TransitionController = null;

    @property(NarratorManager)
    private narrator: NarratorManager = null;

    @property(cc.AudioClip)
    private bgmCave: cc.AudioClip = null;

    @property(cc.AudioClip)
    private bgmCastle: cc.AudioClip = null;

    @property(cc.AudioClip)
    private bgmBoss: cc.AudioClip = null;

    @property(cc.AudioClip)
    private bgmMainMenu: cc.AudioClip = null;

    @property
    private musicVolume: number = 0;

    @property
    private effectVolume: number = 0;

    private currentSceneIdx: number = 0;
    private transitionPromise: (value: any) => void = null;

    onLoad() {
        cc.game.setFrameRate(30);
        cc.audioEngine.setMusicVolume(this.musicVolume);
        cc.audioEngine.setEffectsVolume(this.effectVolume);
        this.mainMenu.node.on('enterFirstScene', () => {
            this.player.status = true;
            cc.audioEngine.playMusic(this.bgmCave, true);
        });
        this.menu.node.on('back', () => {
            this.player.status = false;
            this.transferStage(0, true);
            this.mainMenu.node.active = true;
        });
        this.transition.node.on('back', (isWin: boolean) => {
            this.player.status = false;
            if (isWin) {
                this.transferStage(0, true);
                this.mainMenu.node.active = true;
            } else {
                this.transferStage(this.currentSceneIdx);
            }
        });
        this.transition.node.on('transitionEnd', () => this.transitionPromise(''));
        this.transition.node.on('failTransitionDone', () => {
            this.player.resumeFromFail();
            this.camera.reset();
        });
        this.boss.on('dead', () => {
            this.player.node.emit('win');
            this.transition.showGameResult(true);
        });
        this.player.node.on('dead', () => {
            this.transition.showGameResult(false);
        });
        this.player.node.on('transfer', () => {
            this.transferStage(this.currentSceneIdx + 1);
        });
        this.player.node.on('failed', () => {
            this.transition.clockSceneFailTransition();
        });
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event: cc.Event.EventKeyboard) => {
            if (event.keyCode === cc.macro.KEY.tab && this.sceneNodes.length > this.currentSceneIdx + 1) {
                this.player.status = false;
                this.transferStage(this.currentSceneIdx + 1);
            }
        });
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event: cc.Event.EventKeyboard) => {
            if (event.keyCode === cc.macro.KEY.o) {
                this.player.status = false;
                this.transferStage(this.currentSceneIdx);
            }
        });
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event: cc.Event.EventKeyboard) => {
            if (event.keyCode === cc.macro.KEY.i) {
                this.player.status = false;
                this.transferStage(0);
            }
        });
    }

    start() {
        this.mainMenu.node.active = true;
        cc.audioEngine.playMusic(this.bgmMainMenu, true);
        this.sceneNodes.forEach((scene, idx) => {
            if (idx !== 0) {
                scene.active = false;
            }
        });
    }

    private async transferStage(idx: number, isBackToMainMenu: boolean = false) {
        const currentMusicVolume: number = cc.audioEngine.getMusicVolume();
        const currentEffectVolume: number = cc.audioEngine.getEffectsVolume();
        cc.audioEngine.stopMusic();
        console.log('transion mute');
        this.transition.openTransitionferStage();
        await new Promise((resolve) => (this.transitionPromise = resolve));
        this.currentScene.reset();
        if (idx !== this.currentSceneIdx) {
            this.camera.isUpdate = false;
            this.currentScene.node.active = false;
            this.currentScene = this.sceneNodes[idx].getComponent(SceneManager);
            this.currentScene.node.active = true;
            this.currentSceneIdx = idx;
        }
        this.player.reset(idx);
        this.camera.reset();
        this.narrator.reset();
        if (this.currentSceneIdx >= this.sceneNodes.length - 2) {
            this.camera.finalSceneSetUp();
        } else {
            this.camera.normalSceneSetUp();
        }
        this.transition.closeTransitionStage();
        if (this.currentSceneIdx === this.sceneNodes.length - 1) {
            cc.audioEngine.playMusic(this.bgmBoss, true);
        } else if (isBackToMainMenu) {
            cc.audioEngine.playMusic(this.bgmMainMenu, true);
        } else if (this.currentSceneIdx <= 2) {
            cc.audioEngine.playMusic(this.bgmCave, true);
        } else {
            const id: number = cc.audioEngine.playMusic(this.bgmCastle, true);
            cc.audioEngine.setVolume(id, 0.2);
        }
        if (this.currentSceneIdx === 2) {
            this.player.status = false;
            this.camera.isUpdate = false;
            await this.camera.sceneThreeCameraMovement();
            this.player.status = true;
            this.camera.isUpdate = true;
        } else if (this.currentSceneIdx === 3) {
            this.player.status = false;
            this.camera.isUpdate = false;
            await this.camera.sceneFourCameraMovement();
            this.player.status = true;
            this.narrator.enableClockSceneMessage();
            this.camera.isUpdate = true;
        }
    }
}
