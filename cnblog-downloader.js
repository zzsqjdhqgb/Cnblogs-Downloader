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
    async function GetDocument() {
        let url = window.location.href;
        // fetch for the main content
        let response = await fetch(url);
        let data = await response.text();
        let parser = new DOMParser();
        const main_doc = parser.parseFromString(data, "text/html");
        return main_doc;
    }
    function HTMLElementHandler(element) {
        const Handler = (() => {
            function h(element) {
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
                    return `${"#".repeat(level)} ${HTMLElementHandler(element)}\n`;
                }
            }
            function p(element) {
                return `${HTMLElementHandler(element)}\n`;
            }
            return {
                "H1": h,
                "H2": h,
                "H3": h,
                "H4": h,
                "H5": h,
                "H6": h,
                "P": p,
            }
        })();
        
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
        doc_info.file_content += `# ${post_title}\n`;

        // get post body
        const post_body = post_doc.querySelector("#cnblogs_post_body");
        console.debug(post_body);

        doc_info.file_content += HTMLElementHandler(post_body);
    }
    const main_doc = await GetDocument();
    GenerateMarkdown(main_doc);
})();