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
    // Add more language codes and names here
};

// --- Question Data (Grouped by Language) ---
// !!! IMPORTANT: ADD MANY MORE QUESTIONS HERE FOR A GOOD EXPERIENCE !!!
const allQuestions = {
    'es': [ // Spanish
        { q: "Which word means 'hello' in Spanish?", options: ["Adiós", "Hola", "Gracias", "Por favor"], correctIndex: 1, explanations: ["'Adiós': means 'Goodbye'.", "'Hola': means 'Hello'.", "'Gracias': means 'Thank you'.", "'Por favor': means 'Please'."] },
        { q: "What is 'goodbye' in Spanish?", options: ["Hola", "Adiós", "Sí", "No"], correctIndex: 1, explanations: ["'Hola': means 'Hello'.", "'Adiós': means 'Goodbye'.", "'Sí': means 'Yes'.", "'No': means 'No'."] },
        { q: "How do you say 'thank you' in Spanish?", options: ["De nada", "Por favor", "Gracias", "Lo siento"], correctIndex: 2, explanations: ["'De nada': means 'You're welcome'.", "'Por favor': means 'Please'.", "'Gracias': means 'Thank you'.", "'Lo siento': means 'I'm sorry'."] },
    ],
    'fr': [ // French
        { q: "What is 'cat' in French?", options: ["Chien", "Souris", "Chat", "Oiseau"], correctIndex: 2, explanations: ["'Chien': means 'Dog'.", "'Souris': means 'Mouse'.", "'Chat': means 'Cat'.", "'Oiseau': means 'Bird'."] },
        { q: "How do you say 'yes' in French?", options: ["Non", "Oui", "Merci", "Bonjour"], correctIndex: 1, explanations: ["'Non': means 'No'.", "'Oui': means 'Yes'.", "'Merci': means 'Thank you'.", "'Bonjour': means 'Hello'."] },
        { q: "What is 'please' in French (formal)?", options: ["S'il vous plaît", "Merci", "Excusez-moi", "Au revoir"], correctIndex: 0, explanations: ["'S'il vous plaît': means 'Please' (formal).", "'Merci': means 'Thank you'.", "'Excusez-moi': means 'Excuse me'.", "'Au revoir': means 'Goodbye'."] },
    ],
    'de': [ // German
        { q: "How do you say 'water' in German?", options: ["Brot", "Milch", "Kaffee", "Wasser"], correctIndex: 3, explanations: ["'Brot': means 'Bread'.", "'Milch': means 'Milk'.", "'Kaffee': means 'Coffee'.", "'Wasser': means 'Water'."] },
        { q: "What is 'good day' (hello) in German?", options: ["Guten Morgen", "Guten Tag", "Gute Nacht", "Auf Wiedersehen"], correctIndex: 1, explanations: ["'Guten Morgen': means 'Good morning'.", "'Guten Tag': means 'Good day' / 'Hello'.", "'Gute Nacht': means 'Good night'.", "'Auf Wiedersehen': means 'Goodbye'."] },
        { q: "How do you say 'no' in German?", options: ["Ja", "Danke", "Bitte", "Nein"], correctIndex: 3, explanations: ["'Ja': means 'Yes'.", "'Danke': means 'Thank you'.", "'Bitte': means 'Please' / 'You're welcome'.", "'Nein': means 'No'."] },
    ],
    'it': [ // Italian
        { q: "Which word means 'thank you' in Italian?", options: ["Prego", "Scusi", "Grazie", "Ciao"], correctIndex: 2, explanations: ["'Prego': means 'You're welcome'.", "'Scusi': means 'Excuse me'.", "'Grazie': means 'Thank you'.", "'Ciao': means 'Hello' / 'Goodbye'."] },
        { q: "What is 'good morning' in Italian?", options: ["Buonasera", "Buonanotte", "Buongiorno", "Arrivederci"], correctIndex: 2, explanations: ["'Buonasera': means 'Good evening'.", "'Buonanotte': means 'Good night'.", "'Buongiorno': means 'Good morning' / 'Good day'.", "'Arrivederci': means 'Goodbye'."] },
    ],
    'pt': [ // Portuguese
        { q: "How do you say 'hello' in Portuguese?", options: ["Adeus", "Obrigado", "Olá", "Sim"], correctIndex: 2, explanations: ["'Adeus': means 'Goodbye'.", "'Obrigado/a': means 'Thank you'.", "'Olá': means 'Hello'.", "'Sim': means 'Yes'."] },
        { q: "What is 'dog' in Portuguese?", options: ["Gato", "Cachorro", "Pássaro", "Rato"], correctIndex: 1, explanations: ["'Gato': means 'Cat'.", "'Cachorro': means 'Dog'.", "'Pássaro': means 'Bird'.", "'Rato': means 'Mouse'."] },
    ],
    'ja': [ // Japanese
        { q: "How do you say 'hello' (general) in Japanese?", options: ["Sayōnara", "Arigatō", "Konnichiwa", "Hai"], correctIndex: 2, explanations: ["'Sayōnara' (さようなら): means 'Goodbye'.", "'Arigatō' (ありがとう): means 'Thank you'.", "'Konnichiwa' (こんにちは): means 'Hello' / 'Good day'.", "'Hai' (はい): means 'Yes'."] },
        { q: "What is 'cat' in Japanese?", options: ["Inu", "Neko", "Tori", "Nezumi"], correctIndex: 1, explanations: ["'Inu' (犬): means 'Dog'.", "'Neko' (猫): means 'Cat'.", "'Tori' (鳥): means 'Bird'.", "'Nezumi' (鼠): means 'Mouse'."] },
    ]
};

// --- Global State ---
let currentQuestion = null;
let answered = false;
let sessionAvailableQuestions = []; // Questions for the current session based on selection
let selectedLanguages = []; // Holds codes like ['es', 'fr'] loaded from storage
const DEFAULT_LANGUAGES = Object.keys(languageNames); // Default to all available

// --- Confetti Initialization ---
let myConfetti = null;
if (confettiCanvas && typeof confetti !== 'undefined') {
    myConfetti = confetti.create(confettiCanvas, {
        resize: true,
        useWorker: true
    });
    console.log("Confetti instance created.");
} else {
    console.error("Confetti canvas or library not found. Confetti disabled.");
}

// --- Utility Functions ---
// Simple Fisher-Yates (Durstenfeld) shuffle
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// --- Storage Functions ---
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
            // Filter loaded languages to ensure they are still valid keys in our data
            selectedLanguages = data.selectedLanguages.filter(langCode => languageNames.hasOwnProperty(langCode));
            // If filtering resulted in an empty array, revert to default
            if (selectedLanguages.length === 0) {
                console.warn("Saved languages are no longer valid, reverting to default.");
                selectedLanguages = [...DEFAULT_LANGUAGES];
                await saveSettings(selectedLanguages); // Save the valid default back
            }
        } else {
            // No valid settings saved, use default (all languages)
            console.log("No valid settings found, using default languages.");
            selectedLanguages = [...DEFAULT_LANGUAGES];
            await saveSettings(selectedLanguages); // Save the default settings back
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
function populateLanguageOptions() {
    if (!languageOptionsContainer) return; // Guard against element not found
    languageOptionsContainer.innerHTML = ''; // Clear existing
    Object.keys(languageNames).forEach(langCode => {
        const language = languageNames[langCode];
        // Check against the globally loaded selectedLanguages array
        const isChecked = selectedLanguages.includes(langCode);

        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = langCode;
        checkbox.checked = isChecked;
        checkbox.id = `lang-${langCode}`;

        label.htmlFor = checkbox.id;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${language}`)); // Add space

        languageOptionsContainer.appendChild(label);
    });
}

function toggleSettingsView(showSettings) {
    if (!settingsArea || !quizContent) return; // Guard clause
    if (showSettings) {
        settingsArea.style.display = 'block';
        quizContent.classList.add('hidden'); // Hide quiz content div
        settingsFeedback.textContent = ""; // Clear any previous feedback
        settingsFeedback.className = 'settings-message'; // Reset feedback class
    } else {
        settingsArea.style.display = 'none';
        quizContent.classList.remove('hidden'); // Show quiz content div
    }
}

function showSettingsMessage(message, type = "info") { // type can be 'info', 'success', 'error', 'warning'
    if (!settingsFeedback) return;
    settingsFeedback.textContent = message;
    settingsFeedback.className = `settings-message ${type}`; // Apply class for styling
    // Clear message after a delay, only if it's not a persistent error/warning?
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            if (settingsFeedback.textContent === message) { // Only clear if message hasn't changed
                settingsFeedback.textContent = "";
                settingsFeedback.className = 'settings-message';
            }
        }, 2500);
    }
}


// --- Quiz Logic Functions ---
function buildQuestionPool() {
    let pool = [];
    // Ensure selectedLanguages has been loaded and is not empty
    if (!selectedLanguages || selectedLanguages.length === 0) {
        console.warn("No languages selected or loaded. Attempting to use default.");
        selectedLanguages = [...DEFAULT_LANGUAGES];
        populateLanguageOptions(); // Update UI checkboxes if defaults were used
    }

    selectedLanguages.forEach(langCode => {
        if (allQuestions[langCode] && Array.isArray(allQuestions[langCode])) {
            // Add questions from the selected language, ensuring they are valid objects
            pool = pool.concat(allQuestions[langCode].filter(q => typeof q === 'object' && q !== null));
        } else {
            console.warn(`No questions found or invalid data for selected language: ${langCode}`);
        }
    });

    // Check if the pool is genuinely empty after filtering selections
    if (pool.length === 0) {
        console.error("Error: No questions available for the selected languages!");
        questionTextElement.textContent = "No questions available. Please check Settings and select languages with questions.";
        optionsContainerElement.innerHTML = '';
        feedbackTextElement.textContent = '';
        explanationContainerElement.style.display = 'none';
        nextButton.style.display = 'none';
        sessionAvailableQuestions = []; // Ensure pool is empty
        return false; // Indicate pool building failed
    }

    shuffleArray(pool);
    sessionAvailableQuestions = pool;
    console.log(`Built pool with ${sessionAvailableQuestions.length} questions for languages:`, selectedLanguages);
    return true; // Indicate success
}

function loadQuestion() {
    answered = false;

    // Rebuild pool if empty
    if (sessionAvailableQuestions.length === 0) {
        console.log("Session pool empty, rebuilding...");
        if (!buildQuestionPool()) {
            console.log("Failed to build question pool. Stopping.");
            return; // Stop if pool building failed
        }
        // Double-check if the pool is *still* empty after rebuild attempt
        if (sessionAvailableQuestions.length === 0) {
            console.error("Pool is still empty after rebuild. Check question data and selections.");
            // Display error message from buildQuestionPool should already be visible
            return;
        }
    }

    // Get the next question
    currentQuestion = sessionAvailableQuestions.pop();

    // Clear previous state
    questionTextElement.textContent = currentQuestion.q;
    optionsContainerElement.innerHTML = '';
    feedbackTextElement.textContent = '';
    feedbackTextElement.className = '';
    explanationContainerElement.style.display = 'none';
    explanationTextElement.innerHTML = '';
    nextButton.style.display = 'none';

    // Reset scroll position of the container
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
            const defaults = { spread: 55, particleCount: 70, origin: { y: 0.6 } };
            myConfetti({ ...defaults, angle: 60, origin: { x: 0 } });
            myConfetti({ ...defaults, angle: 120, origin: { x: 1 } });
        }

    } else {
        feedbackTextElement.textContent = `Incorrect. The answer was: ${currentQuestion.options[currentQuestion.correctIndex]}`;
        feedbackTextElement.className = 'incorrect';
        selectedButton.classList.add('wrong-answer');
        allButtons.forEach(button => {
            if (parseInt(button.dataset.index, 10) === currentQuestion.correctIndex) {
                button.classList.add('correct-answer');
            }
        });
        console.log("Incorrect answer chosen");
    }

    showExplanations();
    nextButton.style.display = 'inline-block';

    // Scroll down slightly to ensure explanations/button are visible if needed
    setTimeout(() => {
        if (quizContainer) {
            // Only scroll if content is actually taller than the view
            if (quizContainer.scrollHeight > quizContainer.clientHeight) {
                quizContainer.scrollTo({ top: quizContainer.scrollHeight, behavior: 'smooth' });
            }
        }
    }, 100);
}

function showExplanations() {
    explanationTextElement.innerHTML = ''; // Clear previous explanations
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
    });
}

if (selectNoneButton) {
    selectNoneButton.addEventListener('click', () => {
        languageOptionsContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    });
}

if (saveSettingsButton) {
    saveSettingsButton.addEventListener('click', async () => {
        const newlySelectedLanguages = [];
        languageOptionsContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            newlySelectedLanguages.push(cb.value);
        });

        if (newlySelectedLanguages.length === 0) {
            showSettingsMessage("Please select at least one language.", "warning"); // Use warning class
            return;
        }

        const saved = await saveSettings(newlySelectedLanguages);
        if (saved) {
            // Wait a tiny bit for message to show before hiding/reloading
            setTimeout(() => {
                toggleSettingsView(false); // Hide settings on successful save
                loadQuestion(); // Load a new question based on new settings
            }, 200); // Small delay
        }
    });
}

// --- Initial Load Sequence ---
async function initializeQuiz() {
    // Ensure elements exist before proceeding
    if (!quizContent || !settingsArea) {
        console.error("Core UI elements not found on initialization.");
        return;
    }
    toggleSettingsView(false); // Ensure quiz is visible initially by default
    await loadSettings(); // Wait for settings to load from storage
    loadQuestion();       // Then load the first question based on loaded settings
    console.log("--- QUIZ POPUP: Initialized ---");
}

// Use DOMContentLoaded to ensure HTML is parsed, although 'defer' helps
document.addEventListener('DOMContentLoaded', initializeQuiz);