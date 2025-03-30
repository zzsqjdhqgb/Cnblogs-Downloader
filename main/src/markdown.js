const TurndownService = require('turndown').default;
// console.log(TurndownService);
const turndown = new TurndownService();

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