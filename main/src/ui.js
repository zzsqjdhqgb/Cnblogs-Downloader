const GetDocument = require('./helper.js').GetDocument;
const GenerateMarkdown = require('./markdown.js').GenerateMarkdown;

function InitUI() {
    // 创建容器
    const floatContainer = document.createElement('div');
    floatContainer.id = 'float-container';

    // 容器样式
    Object.assign(floatContainer.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: '9999',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px'
    });

    // 创建主按钮
    const mainButton = createButton('导出选项', '#4CAF50');

    // 创建菜单容器
    const menu = createMenu();
    menu.id = 'menu';
    const menuContainer = document.createElement('div');

    menuContainer.appendChild(menu);
    floatContainer.appendChild(menuContainer);
    menuContainer.id = 'float-menu';
    menuContainer.style.display = 'none';

    // 组合元素
    // floatContainer.appendChild(menu);
    floatContainer.appendChild(mainButton);
    document.body.appendChild(floatContainer);


    function addDynamicRule(selector, styles) {
        // 寻找一个我们自己创建的、用于动态添加规则的 <style> 元素
        let styleSheet = document.getElementById('dynamic-styles');

        // 如果这个 <style> 元素不存在，就创建一个
        if (!styleSheet) {
            styleSheet = document.createElement('style');
            styleSheet.id = 'dynamic-styles'; // 给它一个ID，方便下次查找
            // WebKit需要先将 <style> 元素添加到DOM中才能访问sheet属性
            document.head.appendChild(styleSheet);
        }

        // 获取该 <style> 元素对应的 CSSStyleSheet 对象
        const sheet = styleSheet.sheet;

        // 将样式对象转换为CSS规则字符串
        // 例如： { color: 'red', 'font-size': '16px' } -> "color:red;font-size:16px"
        const rule = `${selector} { ${Object.entries(styles)
            .map(([key, value]) => {
                // 将驼峰式CSS属性（如 fontSize）转换为连字符格式（font-size）
                const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
                return `${cssKey}: ${value}`;
            })
            .join(';')} }`;

        // 尝试将规则插入到样式表的末尾
        try {
            // 使用 sheet.cssRules.length 可以确保新规则添加到最后
            sheet.insertRule(rule, sheet.cssRules.length);
        } catch (e) {
            console.error("无法插入CSS规则: ", e);
        }
    }

    // 使用示例
    addDynamicRule('#float-container:hover > #float-menu', {
        display: 'block',
        opacity: '1'
    });
    addDynamicRule('#float-menu', {
        display: 'hidden',
        opacity: '0',
        transition: 'opacity 0.2s ease'
    });
    let timeout;
    // 交互逻辑
    floatContainer.addEventListener('mouseenter', () => {
        clearTimeout(timeout);
        menuContainer.style.display = '';
    });

    floatContainer.addEventListener('mouseleave', () => {
        timeout = setInterval(() => {
            menuContainer.style.display = 'none';
        }, 250);
    });

    // 创建菜单按钮
    ['下载为.md', '复制到剪贴板'].forEach((text, index) => {
        const btn = createButton(text, index ? '#2196F3' : '#9C27B0');
        btn.addEventListener('click', index ? handleCopy : handleDownload);
        menu.appendChild(btn);
    });

    // 样式工具函数
    function createButton(text, color) {
        const btn = document.createElement('button');
        Object.assign(btn.style, {
            padding: '10px 20px',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            backgroundColor: color,
            whiteSpace: 'nowrap'
        });
        btn.textContent = text;
        return btn;
    }

    function createMenu() {
        const menu = document.createElement('div');
        Object.assign(menu.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            transition: 'opacity 0.2s ease'
        });
        return menu;
    }

    // 功能处理函数
    async function handleDownload() {
        const main_doc = await GetDocument();
        const doc_markdown = GenerateMarkdown(main_doc);
        // download
        const blob = new Blob([doc_markdown.file_content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = doc_markdown.filename;
        a.click();
    }

    async function handleCopy() {
        const main_doc = await GetDocument();
        const doc_markdown = GenerateMarkdown(main_doc);
        // 示例复制逻辑
        const content = doc_markdown.file_content;
        try {
            await navigator.clipboard.writeText(content);
            alert('已复制到剪贴板');
        } catch (err) {
            alert('复制失败，请手动复制');
        }
    }
}

// export
export { InitUI }