const TurndownService = require('turndown').default;
const turndownPluginGfm = require('turndown-plugin-gfm');

const gfm = turndownPluginGfm.gfm;
const turndown = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    bulletListMarker: '-',
    hr: '---',
});
turndown.use(gfm);

turndown.addRule('cnblog_strikethrough', {
    filter: ['s'],
    replacement: (content) => `~~${content}~~`,
});
turndown.addRule('cnblog_inline_math', {
    filter: function (node) {
        // 匹配 div 且 class 包含 math display
        return node.nodeName === 'SPAN' &&
            node.classList.contains('math') && node.classList.contains('inline');
    },
    replacement: (content, node) => {
        // if (node.classList.contains('math') && node.classList.contains('inline')) {
        // return raw text 
        return `$${node.textContent.slice(2, -2)}$`;
        // }
        // return content;
    },
});
turndown.addRule('cnblog_block_math', {
    filter: function (node) {
        // 匹配 div 且 class 包含 math display
        return node.nodeName === 'DIV' &&
            node.classList.contains('math') && node.classList.contains('display');
    },
    replacement: (content, node) => {
        // if (node.classList.contains('math') && node.classList.contains('display')) {
        return `\n$$\n${node.textContent.slice(2, -2)}\n$$\n`;
        // }
        // return content;
    },
});

function GenerateMarkdown(main_doc) {
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

    const doc_txt = post_body.innerHTML;
    const markdown = turndown.turndown(doc_txt);

    doc_info.file_content += markdown;

    return doc_info;
}

export { GenerateMarkdown };