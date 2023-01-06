import karas from 'karas';
import { version } from '../package.json';

const {
  refresh: {
    level: {
      CACHE,
    },
    webgl: {
      drawTextureCache,
    },
  },
  math: {
    matrix: {
      calRectPoint,
    },
  },
  util: {
    isNil,
  },
  mode: {
    CANVAS,
    WEBGL,
  },
  inject,
} = karas;

function convertCoords2Gl(x, y, z, w, cx, cy, tz) {
  if(w && w !== 1) {
    x /= w;
    y /= w;
    z /= w;
  }
  if(x === cx) {
    x = 0;
  }
  else {
    x = (x - cx) / cx;
  }
  if(y === cy) {
    y = 0;
  }
  else {
    y = (cy - y) / cy;
  }
  if(tz) {
    z /= -tz;
  }
  if(w === 1) {
    return { x, y, z, w };
  }
  return { x: x * w, y: y * w, z: z * w, w };
}

class $ extends karas.Geom {
  constructor(tagName, props) {
    super(tagName, props);
    this.fill = props.fill;
    this.list = props.list;
  }
  render(renderMode, ctx, dx, dy) {
    let res = super.render(renderMode, ctx, dx, dy);
    if(res.break) {
      return res;
    }
    let root = this.__root;
    if(renderMode !== root.__renderMode) {
      return res;
    }
    let index = this.index, tx = this.tx, ty = this.ty, fill = this.fill, list = this.list;
    // 第一次需要查看fill，渲染第一帧
    if(index === undefined) {
      if(fill === 'both' || fill === 'backwards') {
        for(let i = 0, len = list.length; i < len; i++) {
          let item = list[i];
          // 防止空的
          if(item.number) {
            index = i;
            tx = 0;
            ty = 0;
            break;
          }
        }
      }
      else {
        return;
      }
    }
    this.lastIndex = index;
    let item = list[index];
    if(!item.loading) {
      item.loading = true;
      inject.measureImg(item.url, res => {
        if(res.success) {
          item.cache = res;
          if(index === this.lastIndex) {
            this.render(renderMode, ctx, dx, dy);
          }
        }
      });
    }
    let cache = item.cache;
    if(cache) {
      this.lastTx = tx;
      this.lastTy = ty;
      let w = cache.width / item.column, h = cache.height / item.row;
      let sx = tx * w, sy = ty * h;
      if(renderMode === CANVAS) {
        ctx.drawImage(item.cache.source, sx, sy, w, h, this.x, this.y, this.width, this.height);
        this.host.emit('frame');
      }
      else if(renderMode === WEBGL) {
        let gl = ctx;
        let env = this.env;
        let cx = env.width * 0.5, cy = env.height * 0.5;
        let texture = item.texture;
        if(!texture) {
          texture = item.texture = gl.createTexture();
          gl.activeTexture(gl['TEXTURE0']);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cache.source);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
        else {
          gl.activeTexture(gl['TEXTURE0']);
          gl.bindTexture(gl.TEXTURE_2D, texture);
        }
        if(texture) {
          gl.useProgram(gl.program);
          let m = this.matrixEvent, opacity = this.opacity;
          let { x1, y1, z1, w1, x2, y2, z2, w2, x3, y3, z3, w3, x4, y4, z4, w4 }
            = calRectPoint(this.x + dx, this.y + this.height + dy,
            this.x + this.width + dx, this.y + dy, m);
          let z = Math.max(Math.abs(z1), Math.abs(z2));
          z = Math.max(z, Math.abs(z3));
          z = Math.max(z, Math.abs(z4));
          if(z) {
            z = Math.max(z, Math.sqrt(cx * cx + cy * cy));
          }
          let t = convertCoords2Gl(x1, y1, z1, w1, cx, cy, z);
          x1 = t.x; y1 = t.y; z1 = t.z;
          t = convertCoords2Gl(x2, y2, z2, w2, cx, cy, z);
          x2 = t.x; y2 = t.y; z2 = t.z;
          t = convertCoords2Gl(x3, y3, z3, w3, cx, cy, z);
          x3 = t.x; y3 = t.y; z3 = t.z;
          t = convertCoords2Gl(x4, y4, z4, w4, cx, cy, z);
          x4 = t.x; y4 = t.y; z4 = t.z;
          let vtPoint = new Float32Array([
            x1, y1, z1, w1,
            x4, y4, z4, w4,
            x2, y2, z2, w2,
            x4, y4, z4, w4,
            x2, y2, z2, w2,
            x3, y3, z3, w3,
          ]);
          let tx1 = sx / cache.width, ty1 = (cache.height - sy - h) / cache.height;
          let tx2 = (sx + w) / cache.width, ty2 = (cache.height - sy) / cache.height;
          let vtTex = new Float32Array([
            tx1, ty1, tx1, ty2, tx2, ty1,
            tx1, ty2, tx2, ty1, tx2, ty2,
          ]);
          let vtOpacity = new Float32Array([
            opacity, opacity, opacity, opacity, opacity, opacity,
          ]);
          // 顶点buffer
          let pointBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, vtPoint, gl.STATIC_DRAW);
          let a_position = gl.getAttribLocation(gl.program, 'a_position');
          gl.vertexAttribPointer(a_position, 4, gl.FLOAT, false, 0, 0);
          gl.enableVertexAttribArray(a_position);
          // 纹理buffer
          let texBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, vtTex, gl.STATIC_DRAW);
          let a_texCoords = gl.getAttribLocation(gl.program, 'a_texCoords');
          gl.vertexAttribPointer(a_texCoords, 2, gl.FLOAT, false, 0, 0);
          gl.enableVertexAttribArray(a_texCoords);
          // opacity buffer
          let opacityBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, opacityBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, vtOpacity, gl.STATIC_DRAW);
          let a_opacity = gl.getAttribLocation(gl.program, 'a_opacity');
          gl.vertexAttribPointer(a_opacity, 1, gl.FLOAT, false, 0, 0);
          gl.enableVertexAttribArray(a_opacity);
          // 纹理单元
          let u_texture = gl.getUniformLocation(gl.program, 'u_texture');
          gl.uniform1i(u_texture, 0);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          gl.deleteBuffer(pointBuffer);
          gl.deleteBuffer(texBuffer);
          gl.deleteBuffer(opacityBuffer);
          gl.disableVertexAttribArray(a_position);
          gl.disableVertexAttribArray(a_texCoords);
          gl.disableVertexAttribArray(a_opacity);
          this.host.emit('frame');
        }
      }
    }
  }
}

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
    this.__timeCount = 0;
    let { list = [] } = this.props;
    if(list.length) {
      let count = 0, total = 0;
      list.forEach((item, i) => {
        let { row = 1, column = 1, number = row * column } = item;
        item.row = row;
        item.column = column;
        item.number = number;
        total += number;
        item.index = i;
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
      list.reverse();
    }
    this.list = list;
  }

  componentDidMount() {
    let { list = [], autoPlay = true } = this.props;
    if(list.length) {
      let fake = this.ref.fake, root = this.root;
      let cb = this.cb = diff => {
        let currentTime = this.__timeCount += diff * this.playbackRate;
        currentTime -= this.delay;
        if(currentTime < 0) {
          return;
        }
        let playCount = Math.floor(currentTime / this.duration);
        if(playCount >= this.iterations) {
          this.pause();
          let fill = this.fill;
          if(fill !== 'both' && fill !== 'forwards') {
            fake.index = undefined;
            root.__addUpdate(fake, [], CACHE, false, false, null, null);
            return;
          }
        }
        currentTime -= playCount * this.duration;
        let alternate = false;
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
              fake.index = i;
              fake.tx = x;
              fake.ty = y;
              root.__addUpdate(fake, [], CACHE, false, false, null, null);
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
              fake.index = i;
              fake.tx = x;
              fake.ty = y;
              root.__addUpdate(fake, [], CACHE, false, false, null, null);
              break;
            }
          }
        }
      };
      if(autoPlay) {
        fake.frameAnimate(cb);
      }
    }
  }

  render() {
    return <div>
      <$ ref="fake" style={{
        width: '100%',
        height: '100%',
      }} fill={this.fill} list={this.list} direction={this.direction}
         delay={this.delay} duration={this.duration} iterations={this.iterations}/>
    </div>;
  }

  play() {
    this.__timeCount = 0;
    this.pause();
    this.resume();
  }

  pause() {
    this.ref.fake.removeFrameAnimate(this.cb);
  }

  pauseTo(n = 0) {
    this.__timeCount = n;
    this.cb(0);
  }

  pauseToFrame(n = 0) {
    let { list = [] } = this.props;
    for(let i = 0, len = list.length; i < len; i++) {
      let item = list[i];
      let { row = 1, column = 1, number = row * column } = item;
      if(n < number) {
        this.__timeCount = item.begin + (item.end - item.begin) * n;
        let x = n % column;
        let y = Math.floor(n / column);
        let fake = this.ref.fake;
        if(fake.index !== i || fake.lastTx !== x || fake.lastTy !== y) {
          fake.index = fake.lastIndex = i;
          fake.tx = x;
          fake.ty = y;
          this.root.__addUpdate(fake, [], CACHE, false, false, null, null);
        }
        break;
      }
    }
  }

  stop() {
    this.pause();
    this.__timeCount = 0;
    let fake = this.ref.fake;
    fake.index = undefined;
    this.root.__addUpdate(fake, [], CACHE, false, false, null, null);
  }

  resume() {
    this.ref.fake.frameAnimate(this.cb);
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

  get list() {
    return this.__list;
  }

  set list(v) {
    this.__list = v;
  }
}

FrameAnimate.version = version;

export default FrameAnimate;
