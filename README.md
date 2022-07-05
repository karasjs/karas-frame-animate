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

### get/set
* playbackRate 播放速率

### event
* frame 每次刷新后触发

# License
[MIT License]
