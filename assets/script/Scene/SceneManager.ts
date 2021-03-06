import TimeEffect from '../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneManager extends cc.Component {
    @property([TimeEffect])
    private mechanisms: TimeEffect[] = [];

    @property(cc.Prefab)
    private rangedMonsterPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    private meleeMonsterPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    private climbMonsterPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    private specialMonsterPrefab: cc.Prefab = null;

    @property(cc.Vec2)
    private rangedMonsterPositions: cc.Vec2[] = [];

    @property(cc.Vec2)
    private meleeMonsterPositions: cc.Vec2[] = [];

    @property(cc.Vec2)
    private climbMonsterPositions: cc.Vec2[] = [];

    @property(cc.Vec2)
    private specialMonsterPositions: cc.Vec2[] = [];

    @property([cc.Vec2])
    private floorWidthEdgeOffset: cc.Vec2[] = []; // x: top, y: down

    @property([cc.Node])
    private floorDetected: cc.Node[] = [];

    @property(cc.Vec2)
    public initialCameraPosition: cc.Vec2 = null;

    private rangedMonsters: cc.Node[] = [];
    private meleeMonsters: cc.Node[] = [];
    private climbMonsters: cc.Node[] = [];
    private specialMonsters: cc.Node[] = [];
    private currentFloor: number = 0;

    onLoad() {
        this.floorDetected.forEach((node, idx) => {
            node.on('crossFloor', () => {
                this.currentFloor = idx;
            });
        });
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event: cc.Event.EventKeyboard) => {
            if (event.keyCode === cc.macro.KEY.z) {
                this.currentFloor = 0;
            }
        });
    }

    public getCurrentFloorEdgeOffset() {
        return this.floorWidthEdgeOffset[this.currentFloor];
    }

    public resetMonsterPosition() {
        this.rangedMonsters.forEach((monster, idx) => {
            monster.setPosition(this.rangedMonsterPositions[idx]);
        });
        this.meleeMonsters.forEach((monster, idx) => {
            monster.setPosition(this.meleeMonsterPositions[idx]);
        });
        this.specialMonsters.forEach((monster, idx) => {
            monster.setPosition(this.specialMonsterPositions[idx]);
        });
        this.climbMonsters.forEach((monster, idx) => {
            monster.setPosition(this.climbMonsterPositions[idx]);
        });
    }

    public reset() {
        this.node.active = true;
        this.currentFloor = 0;
        this.mechanisms.forEach((mechanism) => mechanism.reset());

        // 清除剩餘怪物
        this.rangedMonsters.forEach((monster) => {
            if (monster.isValid) {
                monster.removeFromParent();
                monster.destroy();
            }
        });
        this.meleeMonsters.forEach((monster) => {
            if (monster.isValid) {
                monster.removeFromParent();
                monster.destroy();
            }
        });
        this.climbMonsters.forEach((monster) => {
            if (monster.isValid) {
                monster.removeFromParent();
                monster.destroy();
            }
        });
        this.specialMonsters.forEach((monster) => {
            if (monster.isValid) {
                monster.removeFromParent();
                monster.destroy();
            }
        });
        this.rangedMonsters.length = 0;
        this.meleeMonsters.length = 0;
        this.climbMonsters.length = 0;
        this.specialMonsters.length = 0;

        // 依照怪物位置表生成怪物
        this.rangedMonsterPositions.forEach((position) => {
            const node: cc.Node = cc.instantiate(this.rangedMonsterPrefab);
            node.setPosition(position);
            this.rangedMonsters.push(node);
            this.node.addChild(node);
        });
        this.meleeMonsterPositions.forEach((position) => {
            const node: cc.Node = cc.instantiate(this.meleeMonsterPrefab);
            node.setPosition(position);
            this.meleeMonsters.push(node);
            this.node.addChild(node);
        });
        this.climbMonsterPositions.forEach((position) => {
            const node: cc.Node = cc.instantiate(this.climbMonsterPrefab);
            node.setPosition(position);
            this.climbMonsters.push(node);
            this.node.addChild(node);
        });
        this.specialMonsterPositions.forEach((position) => {
            const node: cc.Node = cc.instantiate(this.specialMonsterPrefab);
            node.setPosition(position);
            this.specialMonsters.push(node);
            this.node.addChild(node);
        });
    }
}
