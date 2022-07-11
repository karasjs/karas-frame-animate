(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('karas')) :
  typeof define === 'function' && define.amd ? define(['karas'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.FrameAnimate = factory(global.karas));
})(this, (function (karas) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var karas__default = /*#__PURE__*/_interopDefaultLegacy(karas);

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

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

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  var version = "0.1.0";

  var FrameAnimate = /*#__PURE__*/function (_karas$Component) {
    _inherits(FrameAnimate, _karas$Component);

    var _super = _createSuper(FrameAnimate);

    function FrameAnimate(props) {
      var _this;

      _classCallCheck(this, FrameAnimate);

      _this = _super.call(this, props);
      var _this$props = _this.props,
          _this$props$duration = _this$props.duration,
          duration = _this$props$duration === void 0 ? 1000 : _this$props$duration,
          direction = _this$props.direction,
          _this$props$playbackR = _this$props.playbackRate,
          playbackRate = _this$props$playbackR === void 0 ? 1 : _this$props$playbackR,
          _this$props$iteration = _this$props.iterations,
          iterations = _this$props$iteration === void 0 ? Infinity : _this$props$iteration;
      _this.duration = duration;
      _this.direction = direction;
      _this.playbackRate = playbackRate;
      _this.iterations = iterations;
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

          var alternate = 1;
          this.__timeCount = 0;
          this.__playCount = 0;
          sr.frameAnimate(function (diff) {
            if (!_this2.__isPlay) {
              return;
            }

            _this2.__timeCount += diff * _this2.playbackRate;

            while (_this2.__timeCount >= _this2.duration) {
              _this2.__timeCount -= _this2.duration;
              _this2.__playCount++;

              if (_this2.direction === 'alternate') {
                alternate *= -1;
              }
            }

            if (_this2.__playCount >= _this2.iterations) {
              return;
            }

            if (alternate === -1) {
              for (var i = 0; i < list.length; i++) {
                var item = list[i];

                if (_this2.__timeCount >= item.begin2 && _this2.__timeCount < item.end2) {
                  var percent = (_this2.__timeCount - item.begin2) / (item.end2 - item.begin2);

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

                if (_this2.__timeCount >= _item.begin && _this2.__timeCount < _item.end) {
                  var _percent = (_this2.__timeCount - _item.begin) / (_item.end - _item.begin);

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
        return karas__default["default"].createElement("div", null);
      }
    }, {
      key: "play",
      value: function play() {
        this.__isPlay = true;
        this.__timeCount = 0;
        this.__playCount = 0;
      }
    }, {
      key: "pause",
      value: function pause() {
        this.__isPlay = false;
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
        this.__duration = parseInt(v) || 1000;
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
    }]);

    return FrameAnimate;
  }(karas__default["default"].Component);

  FrameAnimate.version = version;

  return FrameAnimate;

}));
//# sourceMappingURL=index.js.map
