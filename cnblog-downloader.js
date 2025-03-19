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

(async function() {
    'use strict';
    const Handler = (function() {
        return {
        }
    })();
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
    }
    async function GenerateMarkdown(main_doc) {
        let doc_info = {
            filename: "",
            file_content: ""
        };
        const post_doc = main_doc.querySelector("#topics > .post");
        console.debug(post_doc);
    }
    const main_doc = await GetDocument();
    GenerateMarkdown(main_doc);
})();