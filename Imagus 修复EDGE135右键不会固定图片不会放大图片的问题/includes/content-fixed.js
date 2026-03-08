// 修复后的 onContextMenu 函数 - 针对 Edge 135 兼容性
var onContextMenu = function(e) {
    // 如果没有记录鼠标按下，或者鼠标位置发生了移动
    if (!mdownstart || e.button !== 2 || PVI.md_x !== e.clientX || PVI.md_y !== e.clientY) {
        if (mdownstart) mdownstart = null;
        if (e.button === 2 && (!PVI.fireHide || PVI.state > 2) && 
            (Math.abs(PVI.md_x - e.clientX) > 5 || Math.abs(PVI.md_y - e.clientY) > 5) && 
            cfg.hz.actTrigger === "m2" && !cfg.hz.deactivate) {
            pdsp(e);
        }
        return;
    }
    
    var i;
    var elapsed = e.timeStamp - mdownstart >= 300;
    mdownstart = null;
    
    // 检查是否需要执行全屏缩放操作
    i = PVI.state > 2 && (elapsed && cfg.hz.fzOnPress === 2 || !elapsed && !PVI.fullZm && cfg.hz.fzOnPress === 1);
    
    if (i) {
        PVI.key_action({which: 13, shiftKey: PVI.fullZm ? true : e.shiftKey});
    } else if (i = PVI.state < 3 && PVI.SRC && PVI.SRC.m2 !== void 0) {
        if (elapsed) return;
        PVI.load(PVI.SRC.m2);
        PVI.SRC = void 0;
    } else if (elapsed && PVI.state > 2 && !PVI.fullZm && cfg.hz.fzOnPress === 1) {
        return;
    }
    
    // 关键修复：针对 Edge 135 的兼容性处理
    if (i) {
        pdsp(e); // 阻止默认行为和事件传播
    } else if (e.target === PVI.CNT) {
        // 【修复点】当右键点击悬浮图片容器时
        // 在 Edge 135 中需要更强制地阻止右键菜单
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // 如果图片已经显示，先固定图片（设置 freeze 状态）
        if (PVI.state > 2 && !PVI.freeze) {
            PVI.freeze = true;
        }
        
        // 延迟一帧后再允许右键菜单（如果需要的话）
        // 这样可以确保图片先被固定
        return false; // 额外保险，阻止事件冒泡
    } else if (e.ctrlKey && !elapsed && !e.shiftKey && !e.altKey && cfg.tls.opzoom && 
               PVI.state < 2 && (i = checkIMG(e.target) || checkBG(win.getComputedStyle(e.target).backgroundImage))) {
        PVI.TRG = PVI.nodeToReset = e.target;
        PVI.fireHide = true;
        PVI.x = e.clientX;
        PVI.y = e.clientY;
        PVI.set(Array.isArray(i) ? i[0] : i);
        pdsp(e);
    }
};
