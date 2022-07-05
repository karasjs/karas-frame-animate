import karas from 'karas';
import { version } from '../package.json';

class FrameAnimate extends karas.Component {
  componentDidMount() {
    let { list = [], duration = 1000, playbackRate = 1, autoPlay = true } = this.props;
    this.__playbackRate = playbackRate;
    this.__isPlay = autoPlay;
    if(list.length) {
      let count = 0, total = 0, len = 0, sr = this.shadowRoot;
      list.forEach(item => {
        let { row = 1, column = 1, number = row * column } = item;
        item.row = row;
        item.column = column;
        item.number = number;
        total += number;
        len++;
      });
      let per = duration / total;
      list.forEach(item => {
        item.begin = count;
        item.end = count += per * item.number;
      });
      this.__count = 0;
      sr.frameAnimate(diff => {
        if(!this.__isPlay) {
          return;
        }
        this.__count += diff * this.playbackRate;
        if(this.__count >= duration) {
          this.__count -= duration;
        }
        for(let i = 0; i < len; i++) {
          let item = list[i];
          if(this.__count >= item.begin && this.__count < item.end) {
            let percent = (this.__count - item.begin) / (item.end - item.begin);
            let per = 1 / item.number;
            let n = Math.floor(percent / per);
            if(n > item.number) {
              n = item.number - 1;
            }
            let x = n % item.column;
            let y = Math.floor(n / item.column);
            sr.updateStyle({
              backgroundImage: `url(${item.url})`,
              backgroundSize: `${item.column * 100}% ${item.row * 100}%`,
              backgroundPositionX: x * 100 / (item.column - 1) + '%',
              backgroundPositionY: y * 100 / (item.row - 1) + '%',
            }, () => {
              this.emit('frame');
            });
            break;
          }
        }
      });
    }
  }

  render() {
    return <div/>;
  }

  play() {
    this.__isPlay = true;
    this.__count = 0;
  }

  pause() {
    this.__isPlay = false;
  }

  resume() {
    this.__isPlay = true;
  }

  get playbackRate() {
    return this.__playbackRate || this.props.playbackRate || 1;
  }

  set playbackRate(v) {
    this.__playbackRate = parseFloat(v) || 1;
  }
}

FrameAnimate.version = version;

export default FrameAnimate;
