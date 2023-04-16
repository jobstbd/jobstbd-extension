
chrome.tabs.onUpdated.addListener(function
    (tabId, changeInfo, tab) {
    console.log(tab.url);
    if (tab.url.includes("https://jobstbd.com/")
        //|| tab.url.includes("http://localhost:3000/"
    ) {

        chrome.cookies.getAll({}, function (cookie) {
            console.log(cookie);
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