import { SkillSet } from './Player/PlayerManager';

const { ccclass } = cc._decorator;

@ccclass
export default abstract class TimeEffect extends cc.Component {
    protected status: 'original' | 'transforming' | 'triggered' | 'normal' | 'speedup' | 'slowdown' = 'original';
    public abstract rollback(): void;
    public abstract accelerate(): void;
    public abstract slowdown(): void;
    public abstract reset(): void;
    public checkStatus(toDo: SkillSet) {
        const { none, accelerate, slowdown, rollback } = SkillSet;
        switch (toDo) {
            case accelerate: {
                if (this.status === 'original' || this.status === 'normal' || this.status === 'slowdown') {
                    return true;
                }
                break;
            }
            case slowdown: {
                if (this.status === 'transforming' || this.status === 'normal' || this.status === 'speedup') {
                    return true;
                }
                break;
            }
            case rollback: {
                if (this.status === 'triggered' || this.status === 'normal' || this.status === 'speedup' || this.status === 'slowdown') {
                    return true;
                }
                break;
            }
        }
        return false;
    }
}
