(async () => {
    const { PageAvailable, GetDocument } = require('./helper.js');
    if (!await PageAvailable()) return;
    const doc = await GetDocument();
    console.debug(doc);
    const { InitUI } = require('./ui.js');
    InitUI();
})();