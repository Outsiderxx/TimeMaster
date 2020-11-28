import MenuController from './Menu/MenuController';
import MainMenuController from './Menu/MainMenuController';
import TransitionController from './TransitionController';
import CameraController from './CameraController';
import PlayerManager from './Player/PlayerManager';
import SceneManager from './Scene/SceneManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameController extends cc.Component {
    @property(cc.Node)
    private gameStage: cc.Node = null;

    @property(MainMenuController)
    private mainMenu: MainMenuController = null;

    @property(MenuController)
    private menu: MenuController = null;

    @property(PlayerManager)
    private player: PlayerManager = null;

    @property(CameraController)
    private camera: CameraController = null;

    @property([cc.Node])
    private sceneNodes: cc.Node[] = [];

    @property(SceneManager)
    private currentScene: SceneManager = null;

    @property(TransitionController)
    private transition: TransitionController = null;

    private currentSceneIdx: number = 0;

    onLoad() {
        cc.game.setFrameRate(30);
        this.menu.node.on('back', () => {
            this.player.status = false;
            this.transferStage(0);
            this.mainMenu.node.active = true;
        });
        this.transition.node.on('back', (isWin: boolean) => {
            this.player.status = false;
            if (isWin) {
                this.transferStage(0);
                this.mainMenu.node.active = true;
            } else {
                this.transferStage(this.currentSceneIdx);
            }
        });
        this.player.node.on('dead', () => {
            this.transition.showGameResult(false);
        });
        this.player.node.on('success', () => {
            this.transition.showGameResult(true);
        });
        this.player.node.on('transfer', () => {
            this.transferStage(this.currentSceneIdx + 1);
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
        this.sceneNodes.forEach((scene, idx) => {
            if (idx !== 0) {
                scene.active = false;
            }
        });
        this.transition.transferStage(this.currentSceneIdx);
    }

    private transferStage(idx: number) {
        this.transition.transferStage(idx);
        if (idx === this.currentSceneIdx) {
            this.currentScene.reset();
        } else {
            this.camera.isUpdate = false;
            this.currentScene.node.active = false;
            this.currentScene = this.sceneNodes[idx].getComponent(SceneManager);
            this.currentScene.node.active = true;
            this.currentSceneIdx = idx;
        }
        this.player.reset(idx);
        this.camera.reset();
        if (this.currentSceneIdx === 2) {
            // TODO: 新增其他場景後需修改
            this.camera.finalSceneSetUp();
        } else {
            this.camera.normalSceneSetUp();
        }
    }
}
