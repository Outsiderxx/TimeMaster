const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingController extends cc.Component {
    @property(cc.ProgressBar)
    private progressBar: cc.ProgressBar = null;

    @property(cc.Label)
    private progressStatus: cc.Label = null;

    start() {
<<<<<<< HEAD
        cc.director.preloadScene('Game', this.onProgress.bind(this), this.onLoaded.bind(this));
=======
        cc.director.preloadScene(
            'Game',
            this.onProgress.bind(this),
            this.onLoaded.bind(this)
        );
>>>>>>> c4923516ab869143154832a5cc0222c321448c81
    }

    private onProgress(completeCount: number, totalCount: number) {
        this.progressBar.progress = completeCount / totalCount;
<<<<<<< HEAD
        this.progressStatus.string = `Loading ${((completeCount / totalCount) * 100).toFixed(0)}%`;
=======
        this.progressStatus.string = `Loading ${
            (completeCount / totalCount) * 100
        }%`;
>>>>>>> c4923516ab869143154832a5cc0222c321448c81
    }

    private onLoaded(err: Error) {
        if (err) {
            console.log(err.message);
        } else {
            this.progressBar.progress = 1;
            this.progressStatus.string = 'Loading 100%';
            cc.director.loadScene('Game');
        }
    }
}
