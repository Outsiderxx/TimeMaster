import TimeEffect from '../TimeEffect';
import RangedMonster from '../Monster/RangedMonster';
import MeleeMonster from '../Monster/MeleeMonster';

const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneManager extends cc.Component {
    @property([TimeEffect])
    private mechanisms: TimeEffect[] = [];

    @property([cc.Node])
    private rangedMonsters: cc.Node[] = [];

    @property([cc.Node])
    private meleeMonsters: cc.Node[] = [];

    @property(cc.Prefab)
    private rangedMonsterPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    private meleeMonsterPrefab: cc.Prefab = null;

    private rangedMonsterPositions: cc.Vec2[] = [];
    private meleeMonsterPositions: cc.Vec2[] = [];

    onLoad() {
        this.rangedMonsterPositions = this.rangedMonsters.map((monster) => monster.getPosition());
        this.meleeMonsterPositions = this.meleeMonsters.map((monster) => monster.getPosition());
    }

    public reset() {
        this.node.active = true;
        this.mechanisms.forEach((mechanism) => mechanism.reset());

        // 清除剩餘怪物
        this.rangedMonsters.forEach((monster) => {
            if (monster.isValid) {
                monster.destroy();
            }
        });
        this.meleeMonsters.forEach((monster) => {
            if (monster.isValid) {
                monster.destroy();
            }
        });
        this.rangedMonsters.length = 0;
        this.meleeMonsters.length = 0;

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
    }
}
