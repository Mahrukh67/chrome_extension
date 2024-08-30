chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.color) {
        console.log("Picked color:", request.color);
        chrome.storage.local.get('colors', (result) => {
            const colors = result.colors || [];
            if (!colors.includes(request.color)) {
                colors.push(request.color);
                chrome.storage.local.set({ colors });
            }
        });
    }
});
