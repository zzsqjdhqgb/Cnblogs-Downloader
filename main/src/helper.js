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
    window.mydebugvar = doc;
    if (doc.querySelector("#cnblogs_post_body")) return true;
    return false;
}

export { GetDocument, PageAvailable };