# karas-frame-animate
FrameAnimate component for karas.

---
karas帧动画组件。

[![NPM version](https://img.shields.io/npm/v/karas-frame-animate.svg)](https://npmjs.org/package/karas-frame-animate)

## Install
```
npm install karas
npm install karas-frame-animate
```

## Usage

```jsx
import FrameAnimate from 'karas-frame-animate';

karas.render(
  <canvas width="720" height="720">
    <FrameAnimate style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 200,
                    height: 200,
                    translateX: '-50%',
                    translateY: '-50%',
                  }}
                  list={[{
                    url: 'https://gw-office.alipayobjects.com/a/g/wealthprod/Karas/demo/7y/body.png', // 帧动画图片
                    row: 1, // 图片有几行
                    column: 9, // 图片有几列
                    number: 9, // 总帧数，默认${row} * ${column}，特殊情况下如多行最后一行数量不满传入自定义总数 
                  }]}
                  duration={500} // 整体动画时长
                  direction={'normal'} // 动画轮播方向，默认normal正向结束后从头开始，alternate会在正向结束后反向
                  playbackRate={1} // 播放速率
                  autoPlay={true} // 自动播放
    />
  </canvas>
);
```

### method
* pause() 暂停
* resume() 恢复
* play() 从头播放
* stop() 停止并回到第一帧
* pauseTo(n) 暂停到多少ms
* pauseToFrame(n) 暂停到第n帧

### get/set
* duration 播放时长，单位ms，默认`1000`
* playbackRate 播放速率，默认`1`
* direction 播放方向，传`alternate`为来回反复
* iterations 播放次数，超过次数停止，默认`Infinity`
* fill 动画开始前结束后是否停留，默认`both`，可选`forwards`、`backwards`、`none`

### event
* frame 每次刷新后触发

# License
[MIT License]
