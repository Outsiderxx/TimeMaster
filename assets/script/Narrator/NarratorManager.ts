import PlotPoint from './PlotPoint';
import BridgeMechanism from '../Scene/Mechanism/FirstScene/BridgeMechanism';
import VineMechanism from '../Scene/Mechanism/FirstScene/VineMechanism';
import UpDownRockMoveMechanism from '../Scene/Mechanism/FirstScene/UpDownMoveRockMechanism';
import Player from '../Player/PlayerManager';

const { ccclass, property } = cc._decorator;

type StatusType = 'original' | 'transforming' | 'triggered' | 'normal' | 'speedup' | 'slowdown';
@ccclass
export default class NarratorManaget extends cc.Component {
    @property(cc.Label)
    private text: cc.Label = null;

    @property([PlotPoint])
    private plotPoints: PlotPoint[] = [];

    @property(BridgeMechanism)
    private bridge: BridgeMechanism = null;

    @property(VineMechanism)
    private vine: VineMechanism = null;

    @property(UpDownRockMoveMechanism)
    private rock: UpDownRockMoveMechanism = null;

    @property(cc.Node)
    private energyRock: cc.Node = null;

    @property(cc.Node)
    private directionStone: cc.Node = null;

    @property(Player)
    private player: Player = null;

    @property(cc.Node)
    private mask: cc.Node = null;

    @property(cc.Node)
    private background: cc.Node = null;

    @property(cc.Node)
    private lightSection: cc.Node = null;

    @property([cc.Vec2])
    private lightSectionPositions: cc.Vec2[] = [];

    @property([cc.Vec2])
    private lightSectionSizes: cc.Vec2[] = [];

    @property([cc.Vec2])
    private maskPositoins: cc.Vec2[] = [];

    @property
    private initY: number = 0;

    @property
    private targetY: number = 0;

    private firstRangedMonster: cc.Node = null;
    private currentTween: cc.Tween = null;
    private hasDisplayedHint: boolean[] = [false, false, false];

    private readonly messageContents: string[] = [
        '按下"A"或"D"鍵進行移動， 空白鍵跳躍。',
        '前方的木橋已經斷裂了， 如果能夠讓斷橋回到完好無缺的時候...\n按下「R」 鍵， 並在技能範圍內點選斷橋， 來施放時間倒轉。',
        '噢! 不好了， 怪物出現了! 只能先撤退回去!',
        '對了! 如果讓木橋再次斷裂， 就能使怪物墜落深淵!\n按下「Q」 鍵， 並在技能範圍內點選木橋， 來施放時間加速。',
        '藤蔓還沒完全生長， 太短了...\n按下「Q」 鍵， 並在技能範圍內點選藤蔓， 來施放時間加速。',
        '這樣就能夠攀爬了!\n跳到藤蔓上並且按下"W"或"S"鍵攀爬。',
        '這個石塊的移動速度未免也太快了! 要如何才能順利地跳上去?\n按下「E」 鍵，並在技能範圍內點選移動的石塊， 來施放時間緩滯。',
        '石頭上有「裂痕」， 看起來快要掉落了，\n使用「時間加速」 讓石頭提前掉落吧!',
        '附近似乎沒有能傷害怪物的物體， 只好利用怪物的攻擊反擊!',
        '儲存石! 能夠「儲存」 時間能量，並「散發」 出來!',
        '投射石! 能夠將時間能量「投射」 至遠方!',
        '這個區域的機關似乎與時間有所關聯!',
    ];

    onLoad() {
        this.plotPoints.forEach((point, idx) => {
            point.node.on('trigger', () => {
                this.onPlotPointTrigger(idx);
            });
            point.node.on('untrigger', () => {
                this.onPlotPointUntrigger(idx);
            });
        });
        this.bridge.node.on('status', (status: StatusType) => {
            if (status === 'triggered') {
                this.plotPoints[3].node.active = false;
                this.plotPoints[2].node.active = false;
            } else if (status === 'original') {
                this.plotPoints[1].node.active = false;
            }
        });
        this.vine.node.on('status', (status: StatusType) => {
            if (status === 'triggered') {
                this.plotPoints[4].node.active = false;
                this.plotPoints[5].node.active = true;
            } else if (status === 'original') {
                this.plotPoints[4].node.active = true;
                this.plotPoints[5].node.active = false;
            }
        });
        this.rock.node.on('status', (status: StatusType) => {
            this.plotPoints[6].node.active = status !== 'slowdown';
        });
        this.energyRock.on('status', (status: StatusType) => {
            this.plotPoints[9].node.active = status !== 'slowdown';
        });
        this.directionStone.on('status', (status: StatusType) => {
            this.plotPoints[10].node.active = status !== 'slowdown';
        });
        this.firstRangedMonster = cc.find('Canvas/GameStage/Scene2/Ranged Monster');
        this.firstRangedMonster.on('dead', this.onRangedMonsterDead, this);
        this.mask.on(cc.Node.EventType.TOUCH_END, () => {
            this.close();
        });
    }

    public reset() {
        this.firstRangedMonster.off('dead', this.onRangedMonsterDead, this);
        this.firstRangedMonster = cc.find('Canvas/GameStage/Scene2/Ranged Monster');
        this.firstRangedMonster.on('dead', this.onRangedMonsterDead, this);
        this.currentTween.stop();
        this.background.y = this.initY;
        this.plotPoints.forEach((point) => (point.node.active = true));
        this.plotPoints[3].node.active = false;
        this.plotPoints[11].node.active = false;
        this.hasDisplayedHint[0] = false;
        this.hasDisplayedHint[1] = false;
        this.hasDisplayedHint[2] = false;
    }

    public enableClockSceneMessage() {
        this.plotPoints[11].node.active = true;
    }

    private onRangedMonsterDead() {
        this.plotPoints[8].node.active = false;
    }

    private onPlotPointTrigger(idx: number) {
        this.text.string = this.messageContents[idx];
        switch (idx) {
            case 1:
                this.pauseForHint(0);
                break;
            case 4:
                this.pauseForHint(1);
                break;
            case 6:
                this.pauseForHint(2);
                break;
            case 2:
                this.plotPoints[3].node.active = true;
                //this.pauseForHint(idx);
                break;
            default:
                break;
        }
        this.currentTween?.stop();
        this.currentTween = cc.tween(this.background).to(0.5, { y: this.targetY }, cc.easeBackOut()).start();
    }

    private onPlotPointUntrigger(idx: number) {
        switch (idx) {
            case 0:
                this.plotPoints[0].node.active = false;
                break;
            default:
                break;
        }
        this.currentTween?.stop();
        this.currentTween = cc.tween(this.background).to(0.5, { y: this.initY }).start();
    }

    private pauseForHint(idx: number) {
        if (!this.hasDisplayedHint[idx]) {
            this.hasDisplayedHint[idx] = true;
            this.lightSection.active = true;
            this.player.onHintPause();
            this.scheduleOnce(() => {
                this.player.status = true;
                this.lightSection.active = false;
            }, 3);
            this.lightSection.setPosition(this.lightSectionPositions[idx]);
            this.lightSection.setContentSize(this.lightSectionSizes[idx].x, this.lightSectionSizes[idx].y);
            this.mask.setPosition(this.maskPositoins[idx]);
        }
    }

    private close() {
        if (cc.director.isPaused) {
            cc.director.resume();
        }
    }
}
