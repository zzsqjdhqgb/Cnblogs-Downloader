// ==UserScript==
// @name         Cnblog Downloader
// @namespace    https://github.com/zzsqjdhqgb/
// @version      0.1.0
// @description  下载博客园的文章为 Markdown 文件，目前仅为功能不完整的临时版本
// @author       zzsqjdhqgb
// @match        https://www.cnblogs.com/*
// // @icon         https://www.google.com/s2/favicons?sz=64&domain=cnblogs.com
// @grant        none
// ==/UserScript==

(async () => {
    'use strict';
    async function GetDocument() {
        let url = window.location.href;
        // fetch for the main content
        let response = await fetch(url);
        let data = await response.text();
        let parser = new DOMParser();
        const main_doc = parser.parseFromString(data, "text/html");
        return main_doc;
    }
    async function PageAvailable() {
        let doc = await GetDocument();
        if (doc.querySelector("#cnblogs_post_body")) return true;
        return false;
    }
    function GenerateMarkdown(main_doc) {
        function tagFixer(doc) {
            function fix_endline() {
                // add endline to the end of each element
                let elements = doc.children;
                // merge with "\n" between each element
                for (let i = 0; i < elements.length; i++) {
                    let element = elements[i];
                    if (i != elements.length - 1) {
                        element.outerHTML += "\n";
                    }
                }
            }
            function fix_p() {
                // remove all <p> tags
                let ps = doc.querySelectorAll("p");
                for (let p of ps) {
                    p.outerHTML = p.innerHTML;
                }
            }
            function fix_span() {
                // need to fix: 
                //     <span class="math inline"> ->  $...$
                let spans = doc.querySelectorAll("span");
                for (let span of spans) {
                    if (span.classList.contains("math") && span.classList.contains("inline")) {
                        span.outerHTML = `$${span.textContent.slice(2, -2)}$`;
                    }
                }
            }
            function fix_div() {
                // need to fix: 
                //     <div class="math display"> ->  $$...$$
                let divs = doc.querySelectorAll("div");
                for (let div of divs) {
                    if (div.classList.contains("math") && div.classList.contains("display")) {
                        div.outerHTML = `$$\n${div.textContent.slice(2, -2)}\n$$`;
                    }
                }
            }
            function fix_code() {
                // need to fix: 
                //     <pre><code class="language-xxx"> -> ```xxx
                //     </code></pre> -> ```
                let pres = doc.querySelectorAll("pre");
                for (let pre of pres) {
                    let code = pre.querySelector("code");
                    if (code) {
                        let lang = code.classList[0].slice(9);
                        pre.outerHTML = `\`\`\`${lang}\n${code.textContent}\`\`\``;
                    }
                }
            }
            function fix_blockquote() {
                // need to fix:
                //     <blockquote> ...\n... -> ...\n\n...
                //     double every "\n" in <blockquote> to "\n\n"
                let blockquotes = doc.querySelectorAll("blockquote");
                for (let blockquote of blockquotes) {
                    blockquote.innerHTML = blockquote.innerHTML.replaceAll("\n", "\n\n");
                }
            }
    
            fix_endline();
            fix_p();
            fix_span();
            fix_div();
            fix_code();
            fix_blockquote();
        }
        let doc_info = {
            filename: "",
            file_content: ""
        };
        const post_doc = main_doc.querySelector("#topics > .post");
        console.debug(post_doc);

        // get post title
        const post_title = post_doc.querySelector(".postTitle > a > span").textContent;
        doc_info.filename = post_title + ".md";
        doc_info.file_content += `# ${post_title}\n\n`;

        // get post body
        const post_body = post_doc.querySelector("#cnblogs_post_body");
        console.debug(post_body);

        let fixed_post_body = post_body.cloneNode(true);

        // fix tags
        tagFixer(fixed_post_body);
        console.log(fixed_post_body);

        doc_info.file_content += fixed_post_body.innerHTML;
        console.log(doc_info.file_content);

        return doc_info;
    }

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
            const sheet = document.styleSheets[0];
            const rule = `${selector} { ${Object.entries(styles)
                .map(([k, v]) => `${k}:${v}`)
                .join(';')} }`;
            sheet.insertRule(rule, sheet.cssRules.length);
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

    if (await PageAvailable()) {
        InitUI();
    }
})();