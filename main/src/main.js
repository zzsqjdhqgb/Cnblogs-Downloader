(() => {
    const { PageAvailable } = require('./helper.js');
    if (!PageAvailable()) return;
    const { InitUI } = require('./ui.js');
    InitUI();
})();