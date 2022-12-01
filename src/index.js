import karas from 'karas';
import { version } from '../package.json';

class FrameAnimate extends karas.Component {
  constructor(props) {
    super(props);
    let {
      duration = 1000,
      direction,
      delay = 0,
      playbackRate = 1,
      iterations = Infinity,
      fill = 'both',
    } = this.props;
    this.duration = duration;
    this.direction = direction;
    this.playbackRate = playbackRate;
    this.iterations = iterations;
    this.delay = delay;
    this.fill = fill;
  }

  componentDidMount() {
    let { list = [], autoPlay = true } = this.props;
    this.__isPlay = autoPlay;
    if(list.length) {
      let count = 0, total = 0, sr = this.shadowRoot;
      list.forEach(item => {
        let { row = 1, column = 1, number = row * column } = item;
        item.row = row;
        item.column = column;
        item.number = number;
        total += number;
      });
      // 计算每个所占时长
      let per = this.duration / total;
      list.forEach(item => {
        item.begin = count;
        item.end = count += per * item.number;
      });
      // 反向也需要
      count = 0;
      list.reverse().forEach(item => {
        item.begin2 = count;
        item.end2 = count += per * item.number;
      });
      // 帧动画部分
      let alternate = false;
      this.__timeCount = 0;
      sr.frameAnimate(diff => {
        if(!this.__isPlay) {
          return;
        }
        let currentTime = this.__timeCount += diff * this.playbackRate;
        currentTime -= this.delay;
        let playCount = 0;
        while(currentTime >= this.duration) {
          currentTime -= this.duration;
          playCount++;
        }
        if(playCount >= this.iterations) {
          this.__isPlay = false;
          if(this.fill !== 'both' && this.fill !== 'forwards') {
            sr.updateStyle({
              backgroundImage: null,
            });
          }
          return;
        }
        if(this.direction === 'alternate') {
          alternate = playCount % 2 === 1;
        }
        if(alternate) {
          for(let i = 0; i < list.length; i++) {
            let item = list[i];
            if(currentTime >= item.begin2 && currentTime < item.end2) {
              let percent = (currentTime - item.begin2) / (item.end2 - item.begin2);
              let per = 1 / item.number;
              let n = Math.floor(percent / per);
              if(n > item.number) {
                n = item.number - 1;
              }
              let x = n % item.column;
              let y = Math.floor(n / item.column);
              x = item.column - x - 1;
              y = item.row - y - 1;
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
        }
        else {
          for(let i = 0; i < list.length; i++) {
            let item = list[i];
            if(currentTime >= item.begin && currentTime < item.end) {
              let percent = (currentTime - item.begin) / (item.end - item.begin);
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
        }
      });
    }
  }

  render() {
    let fill = this.fill;
    if(fill === 'both' || fill === 'backwards') {
      let first = (this.props.list || [])[0];
      if(first) {
        let { row = 1, column = 1 } = first;
        return <div style={{
          backgroundImage: `url(${first.url})`,
          backgroundSize: `${column * 100}% ${row * 100}%`,
          backgroundPositionX: 0,
          backgroundPositionY: 0,
        }}/>;
      }
    }
    return <div/>;
  }

  play() {
    this.__isPlay = true;
    this.__timeCount = 0;
  }

  pause() {
    this.__isPlay = false;
  }

  pauseTo(n = 0) {
    this.__isPlay = false;
    let { list = [] } = this.props;
    let count = 0;
    for(let i = 0, len = list.length; i < len; i++) {
      let item = list[i];
      let { row = 1, column = 1, number = row * column } = item;
      if(n < count + number) {
        n -= count;
        let x = n % column;
        let y = Math.floor(n / column);
        this.shadowRoot.updateStyle({
          backgroundImage: `url(${item.url})`,
          backgroundSize: `${column * 100}% ${row * 100}%`,
          backgroundPositionX: x * 100 / (item.column - 1) + '%',
          backgroundPositionY: y * 100 / (item.row - 1) + '%',
        });
        break;
      }
    }
  }

  stop() {
    this.__isPlay = false;
    this.__timeCount = 0;
    let first = (this.props.list || [])[0];
    if(first) {
      let { row = 1, column = 1 } = first;
      this.shadowRoot.updateStyle({
        backgroundImage: `url(${first.url})`,
        backgroundSize: `${column * 100}% ${row * 100}%`,
        backgroundPositionX: 0,
        backgroundPositionY: 0,
      });
    }
  }

  resume() {
    this.__isPlay = true;
  }

  get duration() {
    return this.__duration;
  }

  set duration(v) {
    v = parseFloat(v) || 1000;
    if(v <= 0) {
      v = 1;
    }
    this.__duration = v;
  }

  get playbackRate() {
    return this.__playbackRate;
  }

  set playbackRate(v) {
    v = parseFloat(v) || 1;
    if(v <= 0) {
      v = 1;
    }
    this.__playbackRate = v;
  }

  get direction() {
    return this.__direction;
  }

  set direction(v) {
    this.__direction = v;
  }

  get iterations() {
    return this.__iterations;
  }

  set iterations(v) {
    if(v !== Infinity) {
      v = parseInt(v) || 1;
    }
    if(v <= 0) {
      v = 1;
    }
    this.__iterations = v;
  }

  get delay() {
    return this.__delay;
  }

  set delay(v) {
    this.__delay = parseInt(v) || 0;
  }

  get fill() {
    return this.__fill;
  }

  set fill(v) {
    this.__fill = v;
  }
}

FrameAnimate.version = version;

export default FrameAnimate;
