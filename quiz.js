// linguatab-quizzer/quiz.js

console.log("--- QUIZ POPUP: quiz.js started ---");

// --- Elements ---
const questionTextElement = document.getElementById('question-text');
const optionsContainerElement = document.getElementById('options-container');
const feedbackTextElement = document.getElementById('feedback-text');
const explanationContainerElement = document.getElementById('explanation-container');
const explanationTextElement = document.getElementById('explanation-text');
const closeButton = document.getElementById('close-button');
const nextButton = document.getElementById('next-question-button');
const confettiCanvas = document.getElementById('confetti-canvas');
const settingsButton = document.getElementById('settings-button');
const settingsArea = document.getElementById('settings-area');
const quizContent = document.getElementById('quiz-content');
const languageOptionsContainer = document.getElementById('language-options');
const selectAllButton = document.getElementById('select-all-button');
const selectNoneButton = document.getElementById('select-none-button');
const saveSettingsButton = document.getElementById('save-settings-button');
const settingsFeedback = document.getElementById('settings-feedback');
const quizContainer = document.querySelector('.quiz-container'); // Get the scrollable container

// --- Language Definitions ---
const languageNames = {
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ja': 'Japanese'
    // Add more language codes and names here if you add more JSON files
};

// --- Global State ---
let loadedQuestionsData = {}; // Holds ALL questions loaded from JSON { es: [...], fr: [...] }
let currentQuestion = null;
let answered = false;
let sessionAvailableQuestions = []; // Questions for the current session based on selection
let selectedLanguages = []; // Holds codes like ['es', 'fr'] loaded from storage
const DEFAULT_LANGUAGES = Object.keys(languageNames); // Default to all available defined languages

// --- Confetti Initialization ---
// (Keep the existing confetti code here)
let myConfetti = null;
if (confettiCanvas && typeof confetti !== 'undefined') {
    try {
        myConfetti = confetti.create(confettiCanvas, {
            resize: true,
            useWorker: true
        });
        console.log("Confetti instance created.");
    } catch (e) {
        console.error("Error creating confetti instance:", e);
        myConfetti = null;
    }
} else {
    console.warn("Confetti canvas or library not found. Confetti disabled.");
}

// --- Utility Functions ---
// (Keep the existing shuffleArray function here)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- NEW: Function to Load Question Data from JSON ---
async function loadAllQuestionData() {
    console.log("Attempting to load question data from JSON files...");
    loadedQuestionsData = {}; // Reset
    const languagesToLoad = Object.keys(languageNames);
    let allLoadedSuccessfully = true;

    for (const langCode of languagesToLoad) {
        const filename = `data/questions_${langCode}.json`;
        const url = chrome.runtime.getURL(filename);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${filename}`);
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                loadedQuestionsData[langCode] = data;
                console.log(`Successfully loaded ${data.length} questions for ${langCode}`);
            } else {
                console.warn(`Invalid data format in ${filename}. Expected an array.`);
                loadedQuestionsData[langCode] = []; // Store empty array to avoid errors later
            }
        } catch (error) {
            console.error(`Failed to load or parse ${filename}:`, error);
            loadedQuestionsData[langCode] = []; // Ensure key exists but is empty
            allLoadedSuccessfully = false; // Track if any file failed
        }
    }
    console.log("Finished loading all question data.");
    return allLoadedSuccessfully;
}


// --- Storage Functions ---
// (Keep the existing loadSettings and saveSettings functions here)
async function loadSettings() {
    // Use try-catch for robustness against potential storage errors
    try {
        // Check if chrome.storage is available
        if (!chrome || !chrome.storage || !chrome.storage.local) {
            console.error("Chrome storage API not available.");
            selectedLanguages = [...DEFAULT_LANGUAGES]; // Fallback
            return;
        }
        const data = await chrome.storage.local.get(['selectedLanguages']);
        // Validate loaded data
        if (data.selectedLanguages && Array.isArray(data.selectedLanguages) && data.selectedLanguages.length > 0) {
            // Filter loaded languages to ensure they are still valid keys in our languageNames
            selectedLanguages = data.selectedLanguages.filter(langCode => languageNames.hasOwnProperty(langCode));
            // If filtering resulted in an empty array, revert to default
            if (selectedLanguages.length === 0) {
                console.warn("Saved languages are no longer valid or were empty, reverting to default.");
                selectedLanguages = [...DEFAULT_LANGUAGES];
                saveSettings(selectedLanguages).catch(err => console.error("Error saving default settings after validation:", err));
            }
        } else {
            // No valid settings saved, use default (all languages)
            console.log("No valid settings found, using default languages.");
            selectedLanguages = [...DEFAULT_LANGUAGES];
            saveSettings(selectedLanguages).catch(err => console.error("Error saving initial default settings:", err));
        }
        console.log("Settings loaded. Selected languages:", selectedLanguages);
    } catch (error) {
        console.error("Error loading settings:", error);
        selectedLanguages = [...DEFAULT_LANGUAGES]; // Fallback to default on error
    }
    // Always populate options after attempting to load
    populateLanguageOptions();
}

async function saveSettings(newSelection) {
    try {
        if (!chrome || !chrome.storage || !chrome.storage.local) {
            console.error("Chrome storage API not available for saving.");
            showSettingsMessage("Error: Cannot save settings.", "error");
            return false;
        }
        selectedLanguages = newSelection;
        await chrome.storage.local.set({ selectedLanguages: selectedLanguages });
        console.log("Settings saved:", selectedLanguages);
        sessionAvailableQuestions = []; // Reset the question pool for next load
        showSettingsMessage("Settings saved!", "success"); // Show success message
        return true; // Indicate success
    } catch (error) {
        console.error("Error saving settings:", error);
        showSettingsMessage("Error saving settings.", "error"); // Show error message
        return false; // Indicate failure
    }
}

// --- Settings UI Functions ---
// (Keep populateLanguageOptions, toggleSettingsView, showSettingsMessage functions here)
function populateLanguageOptions() {
    if (!languageOptionsContainer) return;
    languageOptionsContainer.innerHTML = '';
    Object.keys(languageNames).forEach(langCode => {
        const language = languageNames[langCode];
        const isChecked = selectedLanguages.includes(langCode);
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = langCode;
        checkbox.checked = isChecked;
        checkbox.id = `lang-${langCode}`;
        label.htmlFor = checkbox.id;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${language}`));
        languageOptionsContainer.appendChild(label);
    });
}

function toggleSettingsView(showSettings) {
    if (!settingsArea || !quizContent) return;
    if (showSettings) {
        settingsArea.style.display = 'block';
        quizContent.classList.add('hidden');
        settingsFeedback.textContent = "";
        settingsFeedback.className = 'settings-message';
    } else {
        settingsArea.style.display = 'none';
        quizContent.classList.remove('hidden');
    }
    if (quizContainer) quizContainer.scrollTop = 0;
}

function showSettingsMessage(message, type = "info") {
    if (!settingsFeedback) return;
    settingsFeedback.textContent = message;
    settingsFeedback.className = `settings-message ${type}`;
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            if (settingsFeedback.textContent === message) {
                settingsFeedback.textContent = "";
                settingsFeedback.className = 'settings-message';
            }
        }, 2500);
    }
}

// --- Quiz Logic Functions ---
// MODIFIED: buildQuestionPool now uses loadedQuestionsData
function buildQuestionPool() {
    let pool = [];
    // Ensure selectedLanguages has been loaded and is not empty
    if (!selectedLanguages || selectedLanguages.length === 0) {
        console.warn("No languages selected or loaded. Attempting to use default.");
        selectedLanguages = [...DEFAULT_LANGUAGES];
        populateLanguageOptions(); // Update UI
    }

    // Check if the main question data loaded correctly
    if (Object.keys(loadedQuestionsData).length === 0) {
        console.error("Major Error: No question data seems to have been loaded at all!");
        questionTextElement.textContent = "Error loading questions.";
        optionsContainerElement.innerHTML = '';
        feedbackTextElement.textContent = 'Could not load base question data. Please check console or reload.';
        feedbackTextElement.className = 'incorrect';
        explanationContainerElement.style.display = 'none';
        nextButton.style.display = 'none';
        return false; // Critical failure
    }


    selectedLanguages.forEach(langCode => {
        // Use the data loaded from JSON files
        if (loadedQuestionsData[langCode] && Array.isArray(loadedQuestionsData[langCode])) {
            // Add questions from the selected language, filtering for validity
            pool = pool.concat(loadedQuestionsData[langCode].filter(q =>
                typeof q === 'object' && q !== null && q.q && q.options && q.correctIndex !== undefined && q.explanations
            ));
        } else {
            // This might happen if a JSON file failed to load/parse
            console.warn(`No questions available or invalid data for selected language: ${langCode} (data might be missing or empty)`);
        }
    });

    // Check if the pool is genuinely empty AFTER filtering selections
    if (pool.length === 0) {
        console.error("Error: No valid questions available for the currently selected languages!");
        questionTextElement.textContent = "No questions available.";
        optionsContainerElement.innerHTML = '';
        feedbackTextElement.textContent = 'Select languages with available questions in Settings.';
        feedbackTextElement.className = 'incorrect';
        explanationContainerElement.style.display = 'none';
        nextButton.style.display = 'none';
        settingsButton.style.display = 'block';
        sessionAvailableQuestions = []; // Ensure pool is empty
        return false; // Indicate pool building failed for current selection
    }

    shuffleArray(pool);
    sessionAvailableQuestions = pool;
    console.log(`Built pool with ${sessionAvailableQuestions.length} questions for languages:`, selectedLanguages);
    return true; // Indicate success
}

// (Keep loadQuestion, handleAnswer, showExplanations functions - they use the pool built above)
function loadQuestion() {
    answered = false;

    // Rebuild pool if empty
    if (sessionAvailableQuestions.length === 0) {
        console.log("Session pool empty, rebuilding...");
        if (!buildQuestionPool()) {
            console.log("Failed to build question pool. Stopping load.");
            // Error message should be visible from buildQuestionPool
            return;
        }
        if (sessionAvailableQuestions.length === 0) {
            // This case should be handled by the checks within buildQuestionPool
            console.error("Pool is still empty after rebuild attempt. Aborting.");
            return;
        }
    }

    // Get the next question
    currentQuestion = sessionAvailableQuestions.pop();

    // Clear previous state & Reset UI
    questionTextElement.textContent = currentQuestion.q;
    optionsContainerElement.innerHTML = ''; // Clear old buttons
    feedbackTextElement.textContent = '';
    feedbackTextElement.className = ''; // Clear feedback style
    explanationContainerElement.style.display = 'none';
    explanationTextElement.innerHTML = '';
    nextButton.style.display = 'none'; // Hide until answered
    settingsButton.style.display = 'block'; // Ensure settings button is visible

    if (quizContainer) quizContainer.scrollTop = 0;

    // Create and add option buttons
    currentQuestion.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.dataset.index = index;
        button.addEventListener('click', handleAnswer);
        optionsContainerElement.appendChild(button);
    });

    console.log("Question loaded:", currentQuestion.q);
    console.log(`Questions remaining in session pool: ${sessionAvailableQuestions.length}`);
}

function handleAnswer(event) {
    if (answered) return;
    answered = true;

    const selectedButton = event.target;
    const selectedIndex = parseInt(selectedButton.dataset.index, 10);

    const allButtons = optionsContainerElement.querySelectorAll('button');
    allButtons.forEach(button => button.disabled = true);

    if (selectedIndex === currentQuestion.correctIndex) {
        feedbackTextElement.textContent = "Correct!";
        feedbackTextElement.className = 'correct';
        selectedButton.classList.add('correct-answer');
        console.log("Correct answer chosen - triggering confetti!");

        if (myConfetti) {
            try {
                const rect = selectedButton.getBoundingClientRect();
                const originX = (rect.left + rect.right) / 2 / window.innerWidth;
                const originY = (rect.top + rect.bottom) / 2 / window.innerHeight;
                myConfetti({ particleCount: 80, spread: 70, origin: { x: originX, y: originY }, angle: 90, startVelocity: 30, scalar: 0.9 });
            } catch (e) {
                console.error("Error triggering confetti:", e);
            }
        }

    } else {
        feedbackTextElement.textContent = `Incorrect. The answer was: ${currentQuestion.options[currentQuestion.correctIndex]}`;
        feedbackTextElement.className = 'incorrect';
        selectedButton.classList.add('wrong-answer');
        allButtons.forEach(button => {
            if (parseInt(button.dataset.index, 10) === currentQuestion.correctIndex) {
                button.classList.add('correct-answer');
                button.style.opacity = '1';
            }
        });
        console.log("Incorrect answer chosen");
    }

    showExplanations();
    nextButton.style.display = 'inline-block';

    setTimeout(() => {
        if (quizContainer && quizContainer.scrollHeight > quizContainer.clientHeight) {
            const buttonRect = nextButton.getBoundingClientRect();
            const containerRect = quizContainer.getBoundingClientRect();
            if (buttonRect.bottom > containerRect.bottom || buttonRect.top < containerRect.top) {
                nextButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, 100);
}

function showExplanations() {
    explanationTextElement.innerHTML = '';
    if (!currentQuestion || !currentQuestion.explanations) return;

    currentQuestion.explanations.forEach((explanation, index) => {
        const p = document.createElement('p');
        const parts = explanation.split(':');
        const wordPart = parts[0] ? parts[0].trim() : '';
        const meaningPart = parts.length > 1 ? parts.slice(1).join(':').trim() : '';
        p.innerHTML = `<strong>${wordPart}:</strong> ${meaningPart}`;
        if (index === currentQuestion.correctIndex) {
            p.classList.add('correct-explanation');
        }
        explanationTextElement.appendChild(p);
    });
    explanationContainerElement.style.display = 'block';
}


// --- Event Listeners ---
// (Keep existing listeners for close, next, settings, select all/none, save)
if (closeButton) {
    closeButton.addEventListener('click', () => {
        console.log("--- QUIZ POPUP: Closing window via button ---");
        window.close();
    });
}

if (nextButton) {
    nextButton.addEventListener('click', loadQuestion);
}

if (settingsButton) {
    settingsButton.addEventListener('click', () => {
        const isSettingsVisible = settingsArea.style.display === 'block';
        toggleSettingsView(!isSettingsVisible);
    });
}

if (selectAllButton) {
    selectAllButton.addEventListener('click', () => {
        languageOptionsContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
        showSettingsMessage("All languages selected.", "info");
    });
}

if (selectNoneButton) {
    selectNoneButton.addEventListener('click', () => {
        languageOptionsContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        showSettingsMessage("No languages selected. Remember to select at least one before saving.", "warning");
    });
}

if (saveSettingsButton) {
    saveSettingsButton.addEventListener('click', async () => {
        const newlySelectedLanguages = [];
        languageOptionsContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            newlySelectedLanguages.push(cb.value);
        });

        if (newlySelectedLanguages.length === 0) {
            showSettingsMessage("Please select at least one language.", "warning");
            return;
        }

        const saved = await saveSettings(newlySelectedLanguages);

        if (saved) {
            setTimeout(() => {
                toggleSettingsView(false);
                loadQuestion(); // Will rebuild pool with new selection from existing loaded data
            }, 300);
        }
    });
}

// --- Initial Load Sequence ---
// MODIFIED: Now loads JSON data first
async function initializeQuiz() {
    console.log("--- QUIZ POPUP: Initializing ---");
    if (!quizContent || !settingsArea || !languageOptionsContainer || !questionTextElement || !optionsContainerElement || !feedbackTextElement) {
        console.error("Core UI elements not found on initialization. Quiz cannot start.");
        document.body.innerHTML = '<p style="color: red; padding: 20px;">Error: Could not initialize quiz UI. Please try reloading the extension.</p>';
        return;
    }

    toggleSettingsView(false); // Show quiz view by default

    // 1. Load all question data from JSON files first
    const dataLoaded = await loadAllQuestionData();

    // 2. Load user settings (selected languages)
    await loadSettings(); // Populates selectedLanguages & UI checkboxes

    // 3. Load the first question (buildQuestionPool will use loaded data and settings)
    if (dataLoaded) { // Only attempt to load if base data fetch seemed okay
        loadQuestion();
    } else {
        // If data loading failed critically, show an error (buildQuestionPool might show more specific)
        console.error("Initialization failed because base question data could not be loaded.");
        feedbackTextElement.textContent = 'Error: Could not load questions. Try reloading.';
        feedbackTextElement.className = 'incorrect';
    }

    console.log("--- QUIZ POPUP: Initialized ---");
}

// Use DOMContentLoaded to ensure HTML is parsed
document.addEventListener('DOMContentLoaded', initializeQuiz);
