# Imagus Edge 135 右键菜单修复说明

## 问题描述

在 Edge 135 内核上，当在悬浮放大的图片上右键点击时：
- **错误行为**：直接弹出浏览器右键菜单，无法固定图片
- **期望行为**：先固定图片，然后再弹出右键菜单（如 Edge 127 版本）

## 问题原因

Edge 135 对事件处理机制进行了优化，`pdsp(e, false)` 函数中的 `e.stopImmediatePropagation()` 在某些情况下无法完全阻止右键菜单的弹出。

## 修复方案

### 修改位置
文件：`0.9.9.1_0/includes/content.js`
函数：`onContextMenu`

### 修复代码

在 `onContextMenu` 函数中，找到这段代码：

```javascript
else if(e.target===PVI.CNT)pdsp(e,false);
```

替换为：

```javascript
else if (e.target === PVI.CNT) {
    // 【修复点】针对 Edge 135 的兼容性处理
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // 如果图片已经显示，先固定图片
    if (PVI.state > 2 && !PVI.freeze) {
        PVI.freeze = true;
    }
    
    return false; // 额外保险，阻止事件冒泡
}
```

## 修复效果

修复后的行为：
1. 右键点击悬浮图片时，先固定图片（freeze 状态）
2. 完全阻止浏览器默认右键菜单的弹出
3. 图片保持固定状态，可以进行后续操作（缩放、旋转等）
4. 兼容 Edge 127 和 Edge 135 两个版本

## 应用修复

### 方法 1：手动修改（推荐）

1. 打开 `0.9.9.1_0/includes/content.js`
2. 搜索 `var onContextMenu=function(e){`
3. 找到 `else if(e.target===PVI.CNT)pdsp(e,false);` 这一行
4. 替换为上述修复代码
5. 保存文件
6. 重新加载扩展

### 方法 2：使用修复文件

1. 查看 `content-fixed.js` 文件中的完整 `onContextMenu` 函数
2. 复制整个函数
3. 替换原文件中的对应函数
4. 保存并重新加载扩展

## 测试验证

1. 在网页上悬停鼠标到图片链接
2. 等待悬浮预览图片出现
3. 在悬浮图片上右键点击
4. 验证：图片应该被固定，不应该弹出浏览器右键菜单
5. 再次右键点击，此时可以弹出菜单（如果需要）

## 技术细节

### 关键改进点

1. **多重阻止机制**：
   - `e.preventDefault()` - 阻止默认行为
   - `e.stopPropagation()` - 阻止事件冒泡
   - `e.stopImmediatePropagation()` - 阻止同一元素上的其他监听器
   - `return false` - 额外保险

2. **状态管理**：
   - 检查 `PVI.state > 2` 确保图片已加载
   - 设置 `PVI.freeze = true` 固定图片

3. **兼容性**：
   - 保持与旧版本的兼容性
   - 不影响其他功能（Ctrl+右键等）

## 相关配置

在扩展设置中，确保：
- **默认模式** > **点击鼠标右键时激活** 已启用
- **外观** > **图片弹出显示时的位置** 设置为 "根据鼠标指针置于弹出视图上"

## 注意事项

1. 修改后需要重新加载扩展才能生效
2. 如果使用压缩版本，需要重新压缩代码
3. 建议备份原文件再进行修改
4. 此修复不影响其他浏览器（Chrome、Firefox 等）

## 版本信息

- 原始版本：Imagus 0.9.9.1
- 修复日期：2025
- 适用浏览器：Edge 135+
- 向后兼容：Edge 127 及更早版本
