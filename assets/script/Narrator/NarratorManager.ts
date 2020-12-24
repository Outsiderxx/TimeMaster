import PlotPoint from './PlotPoint';

const { ccclass, property } = cc._decorator;

@ccclass
export default class NarratorManaget extends cc.Component {
    @property([cc.Label])
    private texts: cc.Label[] = [];

    @property([PlotPoint])
    private plotPoints: PlotPoint[] = [];

    onLoad() {
        this.plotPoints.forEach((point) => {
            point.node.on('trigger', () => {
                point.sentences.forEach((sentence, idx) => {
                    if (idx <= 1) {
                        this.texts[idx].string = sentence;
                        this.texts[idx].node.active = true;
                    }
                });
            });
            point.node.on('untrigger', () => {
                this.texts.forEach((text) => (text.node.active = false));
            });
        });
    }
}
