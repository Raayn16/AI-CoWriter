import React, { useState, useCallback, useRef } from 'react'; // <-- FIX: Removed unused 'useEffect'

// --- Helper Icons ---
const MagicWandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
        <path d="M15 4V2" />
        <path d="M15 10V8" />
        <path d="M10 15H8" />
        <path d="M20 15H18" />
        <path d="M12.5 5.5 10 3 7.5 5.5" />
        <path d="M5.5 7.5 3 10l2.5 2.5" />
        <path d="M18.5 7.5 21 10l-2.5 2.5" />
        <path d="m14 14 2.5 2.5a2.12 2.12 0 0 1-3 3L11 17" />
        <path d="m3 3 3 3" />
        <path d="M9 17 6.5 19.5" />
        <path d="m17 9 2.5-2.5" />
        <path d="M19.5 6.5 17 9" />
        <path d="m14 14-3-3" />
        <path d="m5 21 3-3" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const SystemIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M7 8h10" />
        <path d="M7 12h10" />
        <path d="M7 16h4" />
    </svg>
);


// --- Main App Component ---
export default function App() {
    // --- State Management ---
    const [systemPrompt, setSystemPrompt] = useState("You are a helpful screenwriting assistant. Continue the user's dialogue and action lines in a professional format.");
    const [userInput, setUserInput] = useState("");
    const [aiOutput, setAiOutput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    // useRef to hold the timeout ID for debouncing, preventing re-renders on every keystroke
    const debounceTimeout = useRef(null);
    // useRef to manage API calls and prevent race conditions
    const abortControllerRef = useRef(null);

    // --- API Call Logic ---
    const generateContent = useCallback(async (currentInput, isRegeneration = false) => {
        if (!currentInput && !isRegeneration) {
            setAiOutput("");
            return;
        }

        setIsGenerating(true);
        setError(null);

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;

        let requestPrompt = `${systemPrompt}\n\n---START OF USER INPUT---\n${currentInput}\n---END OF USER INPUT---\n\nContinue writing:`;
        if (isRegeneration) {
            requestPrompt = `${systemPrompt}\n\n---START OF USER INPUT---\n${currentInput}\n---END OF USER INPUT---\n\nRegenerate a different continuation:`;
        }

        try {
            // This is the new URL for our serverless function
            const apiUrl = '/.netlify/functions/generate'; 

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Send the prompt in the body
                body: JSON.stringify({ prompt: requestPrompt }),
                signal,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `Function error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content?.parts?.[0]?.text) {
                const newText = result.candidates[0].content.parts[0].text;
                setAiOutput(newText);
            } else {
                setAiOutput(isRegeneration ? aiOutput : "Sorry, I couldn't generate a response. Please try again.");
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
            } else {
                console.error("Error generating content:", error);
                setError("Failed to generate content. Please check your connection.");
                setAiOutput("");
            }
        } finally {
            setIsGenerating(false);
        }
    }, [systemPrompt, aiOutput]);
    
    // --- Event Handlers ---
    const handleUserInputChange = (e) => {
        const text = e.target.value;
        setUserInput(text);

        // Clear the previous debounce timeout
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        // Set a new timeout to call the API after 750ms of inactivity
        debounceTimeout.current = setTimeout(() => {
            if (text.trim() !== "") {
                generateContent(text);
            } else {
                setAiOutput(""); // Clear output if input is empty
            }
        }, 750);
    };

    const handleKeyDown = (e) => {
        // Check for Ctrl + Backspace to trigger regeneration
        if (e.ctrlKey && e.key === 'Backspace') {
            e.preventDefault(); // Prevent default browser behavior (e.g., deleting a word)
            
            if (!userInput.trim() || isGenerating) return;

            // Find the last sentence in the AI output.
            // A simple split by period, question mark, or exclamation mark.
            const sentences = aiOutput.match(/[^.!?]+[.!?]+/g) || [aiOutput];
            
            if (sentences.length > 1) {
                // Remove the last sentence
                const truncatedOutput = sentences.slice(0, -1).join(' ');
                setAiOutput(truncatedOutput + "..."); // Show user something is happening
            } else {
                // If only one sentence or less, clear the output
                setAiOutput("Regenerating...");
            }
            
            // Trigger a new generation immediately
            generateContent(userInput, true);
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans p-4 sm:p-6 lg:p-8 flex flex-col">
            <header className="mb-6 text-center">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    Real-Time AI Co-Writer
                </h1>
                <p className="text-gray-400 mt-2">Type in the user box, and the AI will co-write with you in real-time.</p>
            </header>

            <main className="flex-grow flex flex-col gap-6">
                {/* --- System Prompt Input --- */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
                    <label htmlFor="system-prompt" className="flex items-center text-lg font-semibold text-purple-300 mb-2">
                        <SystemIcon />
                        AI's Role / Instruction
                    </label>
                    <input
                        id="system-prompt"
                        type="text"
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                        placeholder="e.g., Translate English to Spanish"
                    />
                </div>

                {/* --- Main Writing Panes --- */}
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Input Pane */}
                    <div className="flex flex-col bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-blue-300 flex items-center">
                                <UserIcon />
                                Your Input
                            </h2>
                            <span className="text-sm text-gray-400">
                                Press <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">Ctrl</kbd> + <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">Backspace</kbd> to regenerate
                            </span>
                        </div>
                        <textarea
                            value={userInput}
                            onChange={handleUserInputChange}
                            onKeyDown={handleKeyDown}
                            className="flex-grow w-full bg-gray-800 text-gray-200 p-4 rounded-b-lg focus:outline-none resize-none text-lg leading-relaxed"
                            placeholder="Start writing here..."
                        />
                    </div>

                    {/* AI Output Pane */}
                    <div className="flex flex-col bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-pink-300 flex items-center">
                                <MagicWandIcon />
                                AI Output
                            </h2>
                            {isGenerating && (
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
                                    <span className="text-sm text-pink-400">Generating...</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-grow w-full bg-gray-800 text-gray-300 p-4 rounded-b-lg resize-none text-lg leading-relaxed overflow-y-auto">
                           {error ? <p className="text-red-400">{error}</p> : <p className="whitespace-pre-wrap">{aiOutput}</p>}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
