import karas from 'karas';

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get() {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get.bind();
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(arguments.length < 3 ? target : receiver);
      }

      return desc.value;
    };
  }

  return _get.apply(this, arguments);
}

var version = "0.5.3";

var _karas$refresh = karas.refresh,
    CACHE = _karas$refresh.level.CACHE;
    _karas$refresh.webgl.drawTextureCache;
    var calRectPoint = karas.math.matrix.calRectPoint;
    karas.util.isNil;
    var _karas$mode = karas.mode,
    CANVAS = _karas$mode.CANVAS,
    WEBGL = _karas$mode.WEBGL,
    inject = karas.inject;

function convertCoords2Gl(x, y, z, w, cx, cy, tz) {
  if (w && w !== 1) {
    x /= w;
    y /= w;
    z /= w;
  }

  if (x === cx) {
    x = 0;
  } else {
    x = (x - cx) / cx;
  }

  if (y === cy) {
    y = 0;
  } else {
    y = (cy - y) / cy;
  }

  if (tz) {
    z /= -tz;
  }

  if (w === 1) {
    return {
      x: x,
      y: y,
      z: z,
      w: w
    };
  }

  return {
    x: x * w,
    y: y * w,
    z: z * w,
    w: w
  };
}

var $ = /*#__PURE__*/function (_karas$Geom) {
  _inherits($, _karas$Geom);

  function $(tagName, props) {
    var _this;

    _this = _karas$Geom.call(this, tagName, props) || this;
    _this.fill = props.fill;
    _this.list = props.list;
    return _this;
  }

  _createClass($, [{
    key: "render",
    value: function render(renderMode, ctx, dx, dy) {
      var _this2 = this;

      var res = _get(_getPrototypeOf($.prototype), "render", this).call(this, renderMode, ctx, dx, dy);

      if (res["break"]) {
        return res;
      }

      var root = this.__root;

      if (renderMode !== root.__renderMode) {
        return res;
      }

      var index = this.index,
          tx = this.tx,
          ty = this.ty,
          fill = this.fill,
          list = this.list; // 第一次需要查看fill，渲染第一帧

      if (index === undefined) {
        if (fill === 'both' || fill === 'backwards') {
          for (var i = 0, len = list.length; i < len; i++) {
            var _item = list[i]; // 防止空的

            if (_item.number) {
              index = i;
              tx = 0;
              ty = 0;
              break;
            }
          }
        } else {
          return;
        }
      }

      this.lastIndex = index;
      var item = list[index];

      if (!item.loading) {
        item.loading = true;
        inject.measureImg(item.url, function (res) {
          if (res.success) {
            item.cache = res;

            if (index === _this2.lastIndex && !_this2.isDestroyed) {
              _this2.render(renderMode, ctx, dx, dy);
            }
          }
        });
      }

      var cache = item.cache;

      if (cache) {
        this.lastTx = tx;
        this.lastTy = ty;
        var w = cache.width / item.column,
            h = cache.height / item.row;
        var sx = tx * w,
            sy = ty * h;

        if (renderMode === CANVAS) {
          ctx.drawImage(item.cache.source, sx, sy, w, h, this.x, this.y, this.width, this.height);
          this.host.emit('frame');
        } else if (renderMode === WEBGL) {
          var gl = ctx;
          var env = this.env;
          var cx = env.width * 0.5,
              cy = env.height * 0.5;
          var texture = item.texture;

          if (!texture) {
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
          } else {
            gl.activeTexture(gl['TEXTURE0']);
            gl.bindTexture(gl.TEXTURE_2D, texture);
          }

          if (texture) {
            gl.useProgram(gl.program);
            var m = this.matrixEvent,
                opacity = this.opacity;

            var _calRectPoint = calRectPoint(this.x + dx, this.y + this.height + dy, this.x + this.width + dx, this.y + dy, m),
                x1 = _calRectPoint.x1,
                y1 = _calRectPoint.y1,
                z1 = _calRectPoint.z1,
                w1 = _calRectPoint.w1,
                x2 = _calRectPoint.x2,
                y2 = _calRectPoint.y2,
                z2 = _calRectPoint.z2,
                w2 = _calRectPoint.w2,
                x3 = _calRectPoint.x3,
                y3 = _calRectPoint.y3,
                z3 = _calRectPoint.z3,
                w3 = _calRectPoint.w3,
                x4 = _calRectPoint.x4,
                y4 = _calRectPoint.y4,
                z4 = _calRectPoint.z4,
                w4 = _calRectPoint.w4;

            var z = Math.max(Math.abs(z1), Math.abs(z2));
            z = Math.max(z, Math.abs(z3));
            z = Math.max(z, Math.abs(z4));

            if (z) {
              z = Math.max(z, Math.sqrt(cx * cx + cy * cy));
            }

            var t = convertCoords2Gl(x1, y1, z1, w1, cx, cy, z);
            x1 = t.x;
            y1 = t.y;
            z1 = t.z;
            t = convertCoords2Gl(x2, y2, z2, w2, cx, cy, z);
            x2 = t.x;
            y2 = t.y;
            z2 = t.z;
            t = convertCoords2Gl(x3, y3, z3, w3, cx, cy, z);
            x3 = t.x;
            y3 = t.y;
            z3 = t.z;
            t = convertCoords2Gl(x4, y4, z4, w4, cx, cy, z);
            x4 = t.x;
            y4 = t.y;
            z4 = t.z;
            var vtPoint = new Float32Array([x1, y1, z1, w1, x4, y4, z4, w4, x2, y2, z2, w2, x4, y4, z4, w4, x2, y2, z2, w2, x3, y3, z3, w3]);
            var tx1 = sx / cache.width,
                ty1 = (cache.height - sy - h) / cache.height;
            var tx2 = (sx + w) / cache.width,
                ty2 = (cache.height - sy) / cache.height;
            var vtTex = new Float32Array([tx1, ty1, tx1, ty2, tx2, ty1, tx1, ty2, tx2, ty1, tx2, ty2]);
            var vtOpacity = new Float32Array([opacity, opacity, opacity, opacity, opacity, opacity]); // 顶点buffer

            var pointBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vtPoint, gl.STATIC_DRAW);
            var a_position = gl.getAttribLocation(gl.program, 'a_position');
            gl.vertexAttribPointer(a_position, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_position); // 纹理buffer

            var texBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vtTex, gl.STATIC_DRAW);
            var a_texCoords = gl.getAttribLocation(gl.program, 'a_texCoords');
            gl.vertexAttribPointer(a_texCoords, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_texCoords); // opacity buffer

            var opacityBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, opacityBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vtOpacity, gl.STATIC_DRAW);
            var a_opacity = gl.getAttribLocation(gl.program, 'a_opacity');
            gl.vertexAttribPointer(a_opacity, 1, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_opacity); // 纹理单元

            var u_texture = gl.getUniformLocation(gl.program, 'u_texture');
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
  }]);

  return $;
}(karas.Geom);

var FrameAnimate = /*#__PURE__*/function (_karas$Component) {
  _inherits(FrameAnimate, _karas$Component);

  function FrameAnimate(props) {
    var _this3;

    _this3 = _karas$Component.call(this, props) || this;
    var _this3$props = _this3.props,
        _this3$props$duration = _this3$props.duration,
        duration = _this3$props$duration === void 0 ? 1000 : _this3$props$duration,
        direction = _this3$props.direction,
        _this3$props$delay = _this3$props.delay,
        delay = _this3$props$delay === void 0 ? 0 : _this3$props$delay,
        _this3$props$playback = _this3$props.playbackRate,
        playbackRate = _this3$props$playback === void 0 ? 1 : _this3$props$playback,
        _this3$props$iteratio = _this3$props.iterations,
        iterations = _this3$props$iteratio === void 0 ? Infinity : _this3$props$iteratio,
        _this3$props$fill = _this3$props.fill,
        fill = _this3$props$fill === void 0 ? 'both' : _this3$props$fill;
    _this3.duration = duration;
    _this3.direction = direction;
    _this3.playbackRate = playbackRate;
    _this3.iterations = iterations;
    _this3.delay = delay;
    _this3.fill = fill;
    _this3.__timeCount = 0;
    var _this3$props$list = _this3.props.list,
        list = _this3$props$list === void 0 ? [] : _this3$props$list;

    if (list.length) {
      var count = 0,
          total = 0;
      list.forEach(function (item, i) {
        var _item$row = item.row,
            row = _item$row === void 0 ? 1 : _item$row,
            _item$column = item.column,
            column = _item$column === void 0 ? 1 : _item$column,
            _item$number = item.number,
            number = _item$number === void 0 ? row * column : _item$number;
        item.row = row;
        item.column = column;
        item.number = number;
        total += number;
        item.index = i;
      }); // 计算每个所占时长

      var per = _this3.duration / total;
      list.forEach(function (item) {
        item.begin = count;
        item.end = count += per * item.number;
      }); // 反向也需要

      count = 0;
      list.reverse().forEach(function (item) {
        item.begin2 = count;
        item.end2 = count += per * item.number;
      });
      list.reverse();
    }

    _this3.list = list;
    return _this3;
  }

  _createClass(FrameAnimate, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this4 = this;

      var _this$props = this.props,
          _this$props$list = _this$props.list,
          list = _this$props$list === void 0 ? [] : _this$props$list,
          _this$props$autoPlay = _this$props.autoPlay,
          autoPlay = _this$props$autoPlay === void 0 ? true : _this$props$autoPlay;

      if (list.length) {
        var fake = this.ref.fake,
            root = this.root;

        var cb = this.cb = function (diff) {
          var currentTime = _this4.__timeCount += diff * _this4.playbackRate;
          currentTime -= _this4.delay;

          if (currentTime < 0) {
            return;
          }

          var playCount = Math.floor(currentTime / _this4.duration);

          if (playCount >= _this4.iterations) {
            _this4.pause();

            var fill = _this4.fill;

            if (fill !== 'both' && fill !== 'forwards') {
              fake.index = undefined;

              root.__addUpdate(fake, [], CACHE, false, false, null, null);

              return;
            }
          }

          currentTime -= playCount * _this4.duration;
          var alternate = false;

          if (_this4.direction === 'alternate') {
            alternate = playCount % 2 === 1;
          }

          if (alternate) {
            for (var i = 0; i < list.length; i++) {
              var item = list[i];

              if (currentTime >= item.begin2 && currentTime < item.end2) {
                var percent = (currentTime - item.begin2) / (item.end2 - item.begin2);
                var per = 1 / item.number;
                var n = Math.floor(percent / per);

                if (n > item.number) {
                  n = item.number - 1;
                }

                var x = n % item.column;
                var y = Math.floor(n / item.column);
                x = item.column - x - 1;
                y = item.row - y - 1;
                fake.index = i;
                fake.tx = x;
                fake.ty = y;

                root.__addUpdate(fake, [], CACHE, false, false, null, null);

                break;
              }
            }
          } else {
            for (var _i = 0; _i < list.length; _i++) {
              var _item2 = list[_i];

              if (currentTime >= _item2.begin && currentTime < _item2.end) {
                var _percent = (currentTime - _item2.begin) / (_item2.end - _item2.begin);

                var _per = 1 / _item2.number;

                var _n = Math.floor(_percent / _per);

                if (_n > _item2.number) {
                  _n = _item2.number - 1;
                }

                var _x = _n % _item2.column;

                var _y = Math.floor(_n / _item2.column);

                fake.index = _i;
                fake.tx = _x;
                fake.ty = _y;

                root.__addUpdate(fake, [], CACHE, false, false, null, null);

                break;
              }
            }
          }
        };

        if (autoPlay) {
          fake.frameAnimate(cb);
        }
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var _this$props$list2 = this.props.list,
          list = _this$props$list2 === void 0 ? [] : _this$props$list2;
      var root = this.__root,
          renderMode = root.__renderMode;

      if (renderMode === WEBGL) {
        list.forEach(function (item) {
          if (item.texture) {
            root.ctx.deleteTexture(item.texture);
          }
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      return karas.createElement("div", null, karas.createElement($, {
        ref: "fake",
        style: {
          width: '100%',
          height: '100%'
        },
        fill: this.fill,
        list: this.list,
        direction: this.direction,
        delay: this.delay,
        duration: this.duration,
        iterations: this.iterations
      }));
    }
  }, {
    key: "play",
    value: function play() {
      this.__timeCount = 0;
      this.pause();
      this.resume();
    }
  }, {
    key: "pause",
    value: function pause() {
      this.ref.fake.removeFrameAnimate(this.cb);
    }
  }, {
    key: "pauseTo",
    value: function pauseTo() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      this.__timeCount = n;
      this.cb(0);
    }
  }, {
    key: "pauseToFrame",
    value: function pauseToFrame() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var _this$props$list3 = this.props.list,
          list = _this$props$list3 === void 0 ? [] : _this$props$list3;

      for (var i = 0, len = list.length; i < len; i++) {
        var item = list[i];
        var _item$row2 = item.row,
            row = _item$row2 === void 0 ? 1 : _item$row2,
            _item$column2 = item.column,
            column = _item$column2 === void 0 ? 1 : _item$column2,
            _item$number2 = item.number,
            number = _item$number2 === void 0 ? row * column : _item$number2;

        if (n < number) {
          this.__timeCount = item.begin + (item.end - item.begin) * n;
          var x = n % column;
          var y = Math.floor(n / column);
          var fake = this.ref.fake;

          if (fake.index !== i || fake.lastTx !== x || fake.lastTy !== y) {
            fake.index = fake.lastIndex = i;
            fake.tx = x;
            fake.ty = y;

            this.root.__addUpdate(fake, [], CACHE, false, false, null, null);
          }

          break;
        }
      }
    }
  }, {
    key: "stop",
    value: function stop() {
      this.pause();
      this.__timeCount = 0;
      var fake = this.ref.fake;
      fake.index = undefined;

      this.root.__addUpdate(fake, [], CACHE, false, false, null, null);
    }
  }, {
    key: "resume",
    value: function resume() {
      this.ref.fake.frameAnimate(this.cb);
    }
  }, {
    key: "duration",
    get: function get() {
      return this.__duration;
    },
    set: function set(v) {
      v = parseFloat(v) || 1000;

      if (v <= 0) {
        v = 1;
      }

      this.__duration = v;
    }
  }, {
    key: "playbackRate",
    get: function get() {
      return this.__playbackRate;
    },
    set: function set(v) {
      v = parseFloat(v) || 1;

      if (v <= 0) {
        v = 1;
      }

      this.__playbackRate = v;
    }
  }, {
    key: "direction",
    get: function get() {
      return this.__direction;
    },
    set: function set(v) {
      this.__direction = v;
    }
  }, {
    key: "iterations",
    get: function get() {
      return this.__iterations;
    },
    set: function set(v) {
      if (v !== Infinity) {
        v = parseInt(v) || 1;
      }

      if (v <= 0) {
        v = 1;
      }

      this.__iterations = v;
    }
  }, {
    key: "delay",
    get: function get() {
      return this.__delay;
    },
    set: function set(v) {
      this.__delay = parseInt(v) || 0;
    }
  }, {
    key: "fill",
    get: function get() {
      return this.__fill;
    },
    set: function set(v) {
      this.__fill = v;
    }
  }, {
    key: "list",
    get: function get() {
      return this.__list;
    },
    set: function set(v) {
      this.__list = v;
    }
  }]);

  return FrameAnimate;
}(karas.Component);

FrameAnimate.version = version;

export { FrameAnimate as default };
//# sourceMappingURL=index.es.js.map
