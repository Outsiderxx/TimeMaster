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

    @property([SceneManager])
    private scene: SceneManager[] = [];

    @property(TransitionController)
    private transition: TransitionController = null;

    private currentSceneIdx: number = 0;

    onLoad() {
        this.menu.node.on('back', () => {
            this.transferStage(0);
            this.mainMenu.node.active = true;
        });
        this.transition.node.on('back', () => {
            this.transferStage(0);
            this.mainMenu.node.active = true;
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
    }

    start() {
        this.mainMenu.node.active = true;
        this.scene.slice(1).forEach((each) => (each.node.active = false));
        this.transition.transferStage(this.currentSceneIdx);
    }

    private transferStage(idx: number) {
        this.scene[this.currentSceneIdx].node.active = false;
        this.transition.transferStage(idx);
        this.scene[idx].reset();
        this.player.reset(idx);
        this.camera.reset();
        this.currentSceneIdx = idx;
    }
}
