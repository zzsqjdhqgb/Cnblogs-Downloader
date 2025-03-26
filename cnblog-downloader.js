// ==UserScript==
// @name         Cnblog Downloader
// @namespace    https://github.com/zzsqjdhqgb/
// @version      0.0.1
// @description  
// @author       Chanmao
// @match        https://www.cnblogs.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cnblogs.com
// @grant        none
// ==/UserScript==

(async () => {
    'use strict';
    function Placeholder(text, num) {
        let len = text.length;
        let res = text;
        for (let i = 0; i < num - len; i++) {
            res += " ";
        }
        return res;
    }

    async function GetDocument() {
        let url = window.location.href;
        // fetch for the main content
        let response = await fetch(url);
        let data = await response.text();
        let parser = new DOMParser();
        const main_doc = parser.parseFromString(data, "text/html");
        return main_doc;
    }
    function HTMLElementHandler(element, endl) {
        const blank_size = 4;
        const Handler = (() => {
            function h(element, endl) {
                function getHeaderLevel(element) {
                    const tagName = element.tagName;
                    // 匹配 H1 到 H6
                    const match = tagName.match(/^H([1-6])$/);
                    if (match) {
                        // 提取数字部分并转换为整数
                        return parseInt(match[1], 10);
                    }
                    return null; // 如果不是<h1>到<h6>，返回null
                }
                const level = getHeaderLevel(element);
                if (level) {
                    return `${"#".repeat(level)} ${HTMLElementHandler(element, endl)}${endl}`;
                }
            }
            function p(element, endl) {
                return `${HTMLElementHandler(element, endl)}${endl}`;
            }
            function a(element, endl) {
                return `[${HTMLElementHandler(element, endl)}](${element.href})`;
            }
            function img(element, endl) {
                return `![${element.alt}](${element.src})`;
            }
            function s(element, endl) {
                return `~~${HTMLElementHandler(element, endl)}~~`;
            }
            function blockquote(element, endl) {
                let content = HTMLElementHandler(element, endl);
                let lines = content.split(/\r?\n/);
                let res = "";
                for (let i = 0; i < lines.length - 2; i++) {
                    if (i) res += "\n";
                    res += Placeholder(">", blank_size) + lines[i];
                }
                res += endl;
                return res;
            }
            function strong(element, endl) {
                return `**${HTMLElementHandler(element, endl)}**`;
            }
            function em(element, endl) {
                return `*${HTMLElementHandler(element, endl)}*`;
            }
            function ol(element, endl) {
                let res = "";
                let cnt = 1;
                element.childNodes.forEach((child) => {
                    if (child.tagName != "LI") {
                        if (child.nodeType != Node.TEXT_NODE || child.textContent.trim() != "") console.error("Not LI element found in OL element");
                        return;
                    }
                    let content = HTMLElementHandler(child, "\n");
                    let lines = content.split(/\r?\n/);
                    res += `${Placeholder(cnt.toString() + ".", blank_size)} ${lines[0]}\n`;
                    cnt++;
                    for (let i = 1; i < lines.length - 1; i++) {
                        res += `${Placeholder("", blank_size)} ${lines[i]}\n`;
                    }
                });
                // is this OK ? 
                res += "\n";
                return res;
            }
            function ul(element, endl) {
                let res = "";
                element.childNodes.forEach((child) => {
                    if (child.tagName != "LI") {
                        if (child.nodeType != Node.TEXT_NODE || child.textContent.trim() != "") console.error("Not LI element found in UL element");
                        return;
                    }
                    let content = HTMLElementHandler(child, "\n");
                    let lines = content.split(/\r?\n/);
                    res += `${Placeholder("-", blank_size)} ${lines[0]}\n`;
                    for (let i = 1; i < lines.length - 1; i++) {
                        res += `${Placeholder("", blank_size)} ${lines[i]}\n`;
                    }
                });
                res += "\n";
                return res;
            }
            function code(element, endl) {
                return `${'`'}${HTMLElementHandler(element, endl)}${'`'}`;
            }
            function br(element, endl) {
                return endl;
            }
            function hr(element, endl) {
                if (element.className == "footnotes-sep") return "";
                return `---${endl}`;
            }

            return {
                "H1": h,
                "H2": h,
                "H3": h,
                "H4": h,
                "H5": h,
                "H6": h,
                "P": p,
                "A": a,
                "S": s,
                "BLOCKQUOTE": blockquote,
                "STRONG": strong,
                "EM": em,
                "BR": br,
                "HR": hr,
                "OL": ol,
                "UL": ul,
                "CODE": code,
                "IMG": img,
            }
        })();

        let res = "";

        element.childNodes.forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
                let text = child.textContent.replace(/\r?\n/g, "");
                res += text;
                // console.debug(text);
            } else {
                const handler = Handler[child.tagName];
                if (handler) {
                    res += handler(child, endl);
                } else {
                    console.error("No handler found for element", child);
                }
            }
        });

        return res;
        // develop here
    }
    async function GenerateMarkdown(main_doc) {
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
        console.log(post_body);

        doc_info.file_content += HTMLElementHandler(post_body, "\n\n");
        window.myvar = post_body
        console.log(doc_info.file_content);
    }
    const main_doc = await GetDocument();
    GenerateMarkdown(main_doc);
})();