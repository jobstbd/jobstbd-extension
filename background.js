
chrome.tabs.onUpdated.addListener(function
    (tabId, changeInfo, tab) {
    if (tab.url.includes("https://jobstbd.com/")) {
        chrome.cookies.getAll({}, function (cookie) {

            allCookieInfo = "";
            for (i = 0; i < cookie.length; i++) {
                if (cookie[i].name.includes('next-auth.session-token')) {
                    allCookieInfo = cookie[i].value;
                }
            }
            chrome.storage.local.set({ 'token': allCookieInfo })

        });
    }
});