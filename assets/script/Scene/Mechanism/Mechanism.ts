import { SkillSet } from '../../Player/PlayerManager';

const { ccclass } = cc._decorator;

@ccclass
export default abstract class Mechanism extends cc.Component {
    protected status: 'original' | 'transforming' | 'triggered' = 'original';
    public abstract rollback(): void;
    public abstract accelerate(): void;
    public abstract slowdown(): void;
    public abstract reset(): void;
    public checkStatus(toDo: SkillSet) {
        const { none, accelerate, slowdown, rollback } = SkillSet;
        switch (toDo) {
            case accelerate: {
                if (this.status === 'original') {
                    return true;
                }
                break;
            }
            case slowdown: {
                if (this.status === 'transforming') {
                    return true;
                }
                break;
            }
            case rollback: {
                if (this.status === 'triggered') {
                    return true;
                }
                break;
            }
        }
        return false;
    }
}
