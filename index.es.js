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

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}

var version = "0.4.0";

var FrameAnimate = /*#__PURE__*/function (_karas$Component) {
  _inherits(FrameAnimate, _karas$Component);

  function FrameAnimate(props) {
    var _this;

    _this = _karas$Component.call(this, props) || this;
    var _this$props = _this.props,
        _this$props$duration = _this$props.duration,
        duration = _this$props$duration === void 0 ? 1000 : _this$props$duration,
        direction = _this$props.direction,
        _this$props$delay = _this$props.delay,
        delay = _this$props$delay === void 0 ? 0 : _this$props$delay,
        _this$props$playbackR = _this$props.playbackRate,
        playbackRate = _this$props$playbackR === void 0 ? 1 : _this$props$playbackR,
        _this$props$iteration = _this$props.iterations,
        iterations = _this$props$iteration === void 0 ? Infinity : _this$props$iteration,
        _this$props$fill = _this$props.fill,
        fill = _this$props$fill === void 0 ? 'both' : _this$props$fill;
    _this.duration = duration;
    _this.direction = direction;
    _this.playbackRate = playbackRate;
    _this.iterations = iterations;
    _this.delay = delay;
    _this.fill = fill;
    return _this;
  }

  _createClass(FrameAnimate, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      var _this$props2 = this.props,
          _this$props2$list = _this$props2.list,
          list = _this$props2$list === void 0 ? [] : _this$props2$list,
          _this$props2$autoPlay = _this$props2.autoPlay,
          autoPlay = _this$props2$autoPlay === void 0 ? true : _this$props2$autoPlay;
      this.__isPlay = autoPlay;

      if (list.length) {
        var count = 0,
            total = 0,
            sr = this.shadowRoot;
        list.forEach(function (item) {
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
        }); // 计算每个所占时长

        var per = this.duration / total;
        list.forEach(function (item) {
          item.begin = count;
          item.end = count += per * item.number;
        }); // 反向也需要

        count = 0;
        list.reverse().forEach(function (item) {
          item.begin2 = count;
          item.end2 = count += per * item.number;
        }); // 帧动画部分

        var alternate = false;
        this.__timeCount = 0;
        sr.frameAnimate(function (diff) {
          if (!_this2.__isPlay) {
            return;
          }

          var currentTime = _this2.__timeCount += diff * _this2.playbackRate;
          currentTime -= _this2.delay;
          var playCount = 0;

          while (currentTime >= _this2.duration) {
            currentTime -= _this2.duration;
            playCount++;
          }

          if (playCount >= _this2.iterations) {
            _this2.__isPlay = false;

            if (_this2.fill !== 'both' && _this2.fill !== 'forwards') {
              sr.updateStyle({
                backgroundImage: null
              });
            }

            return;
          }

          if (_this2.direction === 'alternate') {
            alternate = playCount % 2 === 1;
          }

          if (alternate) {
            for (var i = 0; i < list.length; i++) {
              var item = list[i];

              if (currentTime >= item.begin2 && currentTime < item.end2) {
                var percent = (currentTime - item.begin2) / (item.end2 - item.begin2);

                var _per = 1 / item.number;

                var n = Math.floor(percent / _per);

                if (n > item.number) {
                  n = item.number - 1;
                }

                var x = n % item.column;
                var y = Math.floor(n / item.column);
                x = item.column - x - 1;
                sr.updateStyle({
                  backgroundImage: "url(".concat(item.url, ")"),
                  backgroundSize: "".concat(item.column * 100, "% ").concat(item.row * 100, "%"),
                  backgroundPositionX: x * 100 / (item.column - 1) + '%',
                  backgroundPositionY: y * 100 / (item.row - 1) + '%'
                }, function () {
                  _this2.emit('frame');
                });
                break;
              }
            }
          } else {
            for (var _i = 0; _i < list.length; _i++) {
              var _item = list[_i];

              if (currentTime >= _item.begin && currentTime < _item.end) {
                var _percent = (currentTime - _item.begin) / (_item.end - _item.begin);

                var _per2 = 1 / _item.number;

                var _n = Math.floor(_percent / _per2);

                if (_n > _item.number) {
                  _n = _item.number - 1;
                }

                var _x = _n % _item.column;

                var _y = Math.floor(_n / _item.column);

                sr.updateStyle({
                  backgroundImage: "url(".concat(_item.url, ")"),
                  backgroundSize: "".concat(_item.column * 100, "% ").concat(_item.row * 100, "%"),
                  backgroundPositionX: _x * 100 / (_item.column - 1) + '%',
                  backgroundPositionY: _y * 100 / (_item.row - 1) + '%'
                }, function () {
                  _this2.emit('frame');
                });
                break;
              }
            }
          }
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var fill = this.fill;

      if (fill === 'both' || fill === 'backwards') {
        var first = (this.props.list || [])[0];

        if (first) {
          var _first$row = first.row,
              row = _first$row === void 0 ? 1 : _first$row,
              _first$column = first.column,
              column = _first$column === void 0 ? 1 : _first$column;
          return karas.createElement("div", {
            style: {
              backgroundImage: "url(".concat(first.url, ")"),
              backgroundSize: "".concat(column * 100, "% ").concat(row * 100, "%"),
              backgroundPositionX: 0,
              backgroundPositionY: 0
            }
          });
        }
      }

      return karas.createElement("div", null);
    }
  }, {
    key: "play",
    value: function play() {
      this.__isPlay = true;
      this.__timeCount = 0;
    }
  }, {
    key: "pause",
    value: function pause() {
      this.__isPlay = false;
    }
  }, {
    key: "pauseTo",
    value: function pauseTo() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      this.__isPlay = false;
      var _this$props$list = this.props.list,
          list = _this$props$list === void 0 ? [] : _this$props$list;
      var count = 0;

      for (var i = 0, len = list.length; i < len; i++) {
        var item = list[i];
        var _item$row2 = item.row,
            row = _item$row2 === void 0 ? 1 : _item$row2,
            _item$column2 = item.column,
            column = _item$column2 === void 0 ? 1 : _item$column2,
            _item$number2 = item.number,
            number = _item$number2 === void 0 ? row * column : _item$number2;

        if (n < count + number) {
          n -= count;
          var x = n % column;
          var y = Math.floor(n / column);
          this.shadowRoot.updateStyle({
            backgroundImage: "url(".concat(item.url, ")"),
            backgroundSize: "".concat(column * 100, "% ").concat(row * 100, "%"),
            backgroundPositionX: x * 100 / (item.column - 1) + '%',
            backgroundPositionY: y * 100 / (item.row - 1) + '%'
          });
          break;
        }
      }
    }
  }, {
    key: "stop",
    value: function stop() {
      this.__isPlay = false;
      this.__timeCount = 0;
      var first = (this.props.list || [])[0];

      if (first) {
        var _first$row2 = first.row,
            row = _first$row2 === void 0 ? 1 : _first$row2,
            _first$column2 = first.column,
            column = _first$column2 === void 0 ? 1 : _first$column2;
        this.shadowRoot.updateStyle({
          backgroundImage: "url(".concat(first.url, ")"),
          backgroundSize: "".concat(column * 100, "% ").concat(row * 100, "%"),
          backgroundPositionX: 0,
          backgroundPositionY: 0
        });
      }
    }
  }, {
    key: "resume",
    value: function resume() {
      this.__isPlay = true;
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
  }]);

  return FrameAnimate;
}(karas.Component);

FrameAnimate.version = version;

export { FrameAnimate as default };
//# sourceMappingURL=index.es.js.map
