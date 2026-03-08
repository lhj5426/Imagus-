# Edge 135 右键菜单修复说明

## 问题描述
在 Microsoft Edge 135 版本中，Imagus Reborn 扩展的右键功能失效：
- 在悬浮放大的图片上右键点击时，无法固定图片
- 图片不会进入全尺寸模式
- 无法使用鼠标滚轮缩放图片

在 Edge 127 版本中工作正常。

## 根本原因
Edge 135 改变了事件处理机制：
- 右键点击时，`mousedown` 事件不再触发
- 直接触发 `contextmenu` 事件
- 导致 `mdownstart`、`PVI.md_x`、`PVI.md_y` 变量未被设置

## 修复方案

### 1. 修改 `onMouseDown` 函数
在提前返回的判断中排除右键点击：
```javascript
if (PVI.fireHide && PVI.state < 3 && !shouldFreeze && !isRightButton) {
    // 添加了 && !isRightButton 条件
    PVI.m_over({ relatedTarget: PVI.TRG });
    if (!PVI.freeze || PVI.lastScrollTRG) PVI.freeze = 1;
    return;
}
```

### 2. 修改 `onContextMenu` 函数
在函数开头添加 Edge 135 兼容代码：
```javascript
// Edge 135 fix: mousedown event may not fire for right-click, so set mdownstart here if needed
if (!mdownstart && e.button === 2 && PVI.state > 2) {
    mdownstart = e.timeStamp - 100;
    PVI.md_x = e.clientX;
    PVI.md_y = e.clientY;
}
```

### 3. 允许全尺寸模式下弹出右键菜单
修改阻止右键菜单的条件：
```javascript
// Allow context menu in fullZoom mode
if (!PVI.fullZm && e.target === PVI.CNT) {
    pdsp(e, false);
}
```

## 修复效果
- ✅ 第一次右键：图片固定并进入全尺寸模式
- ✅ 鼠标滚轮：可以缩放图片
- ✅ 第二次右键：弹出浏览器右键菜单
- ✅ 兼容 Edge 127 和 Edge 135

## 版本信息
- 修复版本：2026.3.8
- 修复日期：2026年3月8日
- 修复文件：`content/content.js`
