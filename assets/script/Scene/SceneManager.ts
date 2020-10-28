import Mechanism from './Mechanism/Mechanism';

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property([Mechanism])
    private mechanisms: Mechanism[] = [];

    public reset() {
        this.mechanisms.forEach((mechanism) => mechanism.reset());
    }
}
