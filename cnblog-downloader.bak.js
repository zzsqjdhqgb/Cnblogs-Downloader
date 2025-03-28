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
        const blank_size = 4;
        const init_state = {
            double_br: true,
            in_pre: false,
            line_pre: ""
        }
        function PlaceHolder(text, num) {
            let len = text.length;
            return `${text}${" ".repeat(num - len)}`;
        }
        function AddLine(line, state) {
            return `${state.line_pre}${line}\n${state.double_br ? `${state.line_pre}\n` : ""}`;
        }
        const Handler = (() => {
            function h(element, state) {
                function getHeaderLevel(element) {
                    const tagName = element.tagName;
                    const match = tagName.match(/^H([1-6])$/);
                    return parseInt(match[1], 10);
                }
                const level = getHeaderLevel(element);
                return AddLine(`${"#".repeat(level)} ${HTMLElementHandler(element, state)}`, state);
            }
            function p(element, state) {
                return AddLine(HTMLElementHandler(element, state), state);
            }
            function a(element, state) {
                return `[${HTMLElementHandler(element, state)}](${element.href})`;
            }
            function img(element, state) {
                return `![${element.alt}](${element.src})`;
            }
            function s(element, state) {
                return `~~${HTMLElementHandler(element, state)}~~`;
            }
            function blockquote(element, state) {
                let new_state = { ...state };
                new_state.line_pre = PlaceHolder(">", blank_size);
                return res;
            }
            function strong(element, state) {
                return `**${HTMLElementHandler(element, state)}**`;
            }
            function em(element, state) {
                return `*${HTMLElementHandler(element, state)}*`;
            }
            function ol(element, state) {
                let res = "";
                let cnt = 1;
                element.childNodes.forEach((child) => {
                    if (child.tagName != "LI") {
                        if (child.nodeType != Node.TEXT_NODE || child.textContent.trim() != "") console.error("Not LI element found in OL element");
                        return;
                    }
                    let content = HTMLElementHandler(child, state);
                    let lines = content.split(/\r?\n/);
                    res += `${PlaceHolder(cnt.toString() + ".", blank_size)} ${lines[0]}\n`;
                    cnt++;
                    for (let i = 1; i < lines.length - 1; i++) {
                        res += `${PlaceHolder("", blank_size)} ${lines[i]}\n`;
                    }
                });
                // is this OK ? 
                res += "\n";
                return res;
            }
            function ul(element, state) {
                let res = "";
                element.childNodes.forEach((child) => {
                    if (child.tagName != "LI") {
                        if (child.nodeType != Node.TEXT_NODE || child.textContent.trim() != "") console.error("Not LI element found in UL element");
                        return;
                    }
                    let content = HTMLElementHandler(child, state);
                    let lines = content.split(/\r?\n/);
                    res += `${PlaceHolder("-", blank_size)} ${lines[0]}\n`;
                    for (let i = 1; i < lines.length - 1; i++) {
                        res += `${PlaceHolder("", blank_size)} ${lines[i]}\n`;
                    }
                });
                res += "\n";
                return res;
            }
            function code(element, state) {
                return `${'`'}${HTMLElementHandler(element, endl)}${'`'}`;
            }
            function br(element, state) {
                return endl;
            }
            function hr(element, state) {
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