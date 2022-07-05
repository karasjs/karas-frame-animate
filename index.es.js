import karas from 'karas';

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

var version = "0.0.1";

var FrameAnimate = /*#__PURE__*/function (_karas$Component) {
  _inherits(FrameAnimate, _karas$Component);

  var _super = _createSuper(FrameAnimate);

  function FrameAnimate() {
    _classCallCheck(this, FrameAnimate);

    return _super.apply(this, arguments);
  }

  _createClass(FrameAnimate, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this = this;

      var _this$props = this.props,
          _this$props$list = _this$props.list,
          list = _this$props$list === void 0 ? [] : _this$props$list,
          _this$props$duration = _this$props.duration,
          duration = _this$props$duration === void 0 ? 1000 : _this$props$duration,
          direction = _this$props.direction,
          _this$props$playbackR = _this$props.playbackRate,
          playbackRate = _this$props$playbackR === void 0 ? 1 : _this$props$playbackR,
          _this$props$autoPlay = _this$props.autoPlay,
          autoPlay = _this$props$autoPlay === void 0 ? true : _this$props$autoPlay;
      this.__playbackRate = playbackRate;
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

        var per = duration / total;
        list.forEach(function (item) {
          item.begin = count;
          item.end = count += per * item.number;
        }); // 反向也需要

        count = 0;
        list.reverse().forEach(function (item) {
          item.begin2 = count;
          item.end2 = count += per * item.number;
        }); // 帧动画部分

        var alternate = 1,
            first = true;
        this.__count = 0;
        sr.frameAnimate(function (diff) {
          if (!_this.__isPlay && !first) {
            return;
          }

          first = false;
          _this.__count += diff * _this.playbackRate;

          while (_this.__count >= duration) {
            _this.__count -= duration;

            if (direction === 'alternate') {
              alternate *= -1;
            }
          }

          if (alternate === -1) {
            for (var i = 0; i < list.length; i++) {
              var item = list[i];

              if (_this.__count >= item.begin2 && _this.__count < item.end2) {
                var percent = (_this.__count - item.begin2) / (item.end2 - item.begin2);

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
                  _this.emit('frame');
                });
                break;
              }
            }
          } else {
            for (var _i = 0; _i < list.length; _i++) {
              var _item = list[_i];

              if (_this.__count >= _item.begin && _this.__count < _item.end) {
                var _percent = (_this.__count - _item.begin) / (_item.end - _item.begin);

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
                  _this.emit('frame');
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
      return karas.createElement("div", null);
    }
  }, {
    key: "play",
    value: function play() {
      this.__isPlay = true;
      this.__count = 0;
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
    key: "playbackRate",
    get: function get() {
      return this.__playbackRate || this.props.playbackRate || 1;
    },
    set: function set(v) {
      this.__playbackRate = parseFloat(v) || 1;
    }
  }]);

  return FrameAnimate;
}(karas.Component);

FrameAnimate.version = version;

export { FrameAnimate as default };
//# sourceMappingURL=index.es.js.map
