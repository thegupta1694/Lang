// linguatab-quizzer/background.js
// (Test version 2 - Removed openerTabId check for debugging - kept for stability)

chrome.tabs.onCreated.addListener((tab) => {
    // Log details including openerTabId to see what it is, even if we don't use it in the condition
    // console.log(`New tab created: ID=${tab.id}, Status=${tab.status}, URL=${tab.url}, PendingURL=${tab.pendingUrl}, OpenerID=${tab.openerTabId}`);

    // Condition now only checks if it's a blank/newtab page
    // This is the primary condition we are testing now
    if (tab.url === 'chrome://newtab/' || tab.pendingUrl === 'chrome://newtab/' || tab.url === 'about:blank' || tab.pendingUrl === 'about:blank') {

        // --- We are keeping the openerTabId check commented out for now ---
        /*
        if (tab.openerTabId) {
            console.log("New tab potentially opened from link (based on openerTabId), skipping quiz popup.");
            return; // If uncommented, prevents quiz if tab was opened by another tab
        }
        */
        // --- End of commented out check ---

        console.log("Condition met (blank/newtab URL), attempting to open quiz popup...");

        const popupOptions = {
            url: 'quiz.html', // Make sure quiz.html exists in the root folder
            type: 'popup',
            width: 500,      // Keep width consistent
            height: 580,     // Keep increased height (or adjust based on Option 2 preference)
            focused: true    // Try to make the popup focused
        };

        // Create the popup window
        chrome.windows.create(popupOptions, (newWindow) => {
            // Check for errors during window creation (important for debugging)
            if (chrome.runtime.lastError) {
                console.error("Error creating popup window:", chrome.runtime.lastError.message);
            } else {
                // console.log("Popup window created successfully:", newWindow); // Reduce console noise

                // --- Optional: Close the original blank new tab ---
                // Ensure this is UNCOMMENTED if you want the original blank tab to close
                setTimeout(() => {
                    // Check if the tab still exists before removing
                    chrome.tabs.get(tab.id, (existingTab) => {
                        if (existingTab && !chrome.runtime.lastError) {
                            chrome.tabs.remove(tab.id, () => {
                                if (chrome.runtime.lastError) {
                                    // Ignore errors like "no tab with id" if it was closed quickly
                                    if (!chrome.runtime.lastError.message.includes("No tab with id")) {
                                        console.error("Error removing original tab:", chrome.runtime.lastError.message);
                                    }
                                } else {
                                    // console.log("Original new tab removed."); // Reduce noise
                                }
                            });
                        } else {
                            // console.log("Original tab likely already closed or inaccessible."); // Reduce noise
                            // If error other than tab not found, log it
                            if (chrome.runtime.lastError && !chrome.runtime.lastError.message.includes("No tab with id")) {
                                console.error("Error checking original tab:", chrome.runtime.lastError.message);
                            }
                        }
                    });
                }, 150); // Delay to allow popup focus potentially
                // --- End of optional tab removal ---
            }
        });

    } else {
        // Log if the URL condition wasn't met - useful for debugging other new tab pages
        // console.log("Skipping popup: Tab URL/PendingURL doesn't match blank/newtab conditions.");
        // console.log(`--> URL: '${tab.url}', PendingURL: '${tab.pendingUrl}'`);
    }
});

// Listener for when the extension is first installed or updated
chrome.runtime.onInstalled.addListener((details) => {
    console.log(`LinguaTab Quizzer extension ${details.reason}.`);
    // Set default languages on first install
    if (details.reason === 'install') {
        // Define language keys based on available languages in quiz.js (or maintain this list)
        const languageKeys = ['es', 'fr', 'de', 'it', 'pt', 'ja']; // Match keys in languageNames/allQuestions
        chrome.storage.local.set({ selectedLanguages: languageKeys }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error setting default languages:", chrome.runtime.lastError.message);
            } else {
                console.log("Default languages set on install.");
            }
        });
    }
});

console.log("LinguaTab Quizzer background script loaded and listening.");
