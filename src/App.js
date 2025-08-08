// import React, { useState, useCallback, useRef } from 'react';

// // --- Helper Icons ---
// const MagicWandIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
//         <path d="M15 4V2" /><path d="M15 10V8" /><path d="M10 15H8" /><path d="M20 15H18" /><path d="M12.5 5.5 10 3 7.5 5.5" /><path d="M5.5 7.5 3 10l2.5 2.5" /><path d="M18.5 7.5 21 10l-2.5 2.5" /><path d="m14 14 2.5 2.5a2.12 2.12 0 0 1-3 3L11 17" /><path d="m3 3 3 3" /><path d="M9 17 6.5 19.5" /><path d="m17 9 2.5-2.5" /><path d="M19.5 6.5 17 9" /><path d="m14 14-3-3" /><path d="m5 21 3-3" />
//     </svg>
// );
// const UserIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
//         <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
//     </svg>
// );
// const SystemIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
//         <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 8h10" /><path d="M7 12h10" /><path d="M7 16h4" />
//     </svg>
// );

// // --- Main App Component ---
// export default function App() {
//     // --- State Management ---
//     const [systemPrompt, setSystemPrompt] = useState("You are a helpful screenwriting assistant. Continue the user's dialogue and action lines in a professional format.");
//     const [userInput, setUserInput] = useState("");
//     const [aiOutput, setAiOutput] = useState("");
//     const [isGenerating, setIsGenerating] = useState(false);
//     const [error, setError] = useState(null);
//     const debounceTimeout = useRef(null);
//     const abortControllerRef = useRef(null);

//     // --- API Call Logic ---
//     const generateContent = useCallback(async (currentInput, isRegeneration = false) => {
//         if (!currentInput && !isRegeneration) {
//             setAiOutput("");
//             return;
//         }
//         setIsGenerating(true);
//         setError(null);
//         if (abortControllerRef.current) {
//             abortControllerRef.current.abort();
//         }
//         abortControllerRef.current = new AbortController();
//         const { signal } = abortControllerRef.current;

//         // The user prompt is just the current input
//         const user_prompt = isRegeneration 
//             ? `${currentInput}\n\n---\nRegenerate a different continuation:`
//             : currentInput;

//         try {
//             const apiUrl = '/.netlify/functions/generate';
//             const response = await fetch(apiUrl, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ 
//                     system_prompt: systemPrompt, 
//                     user_prompt: user_prompt 
//                 }),
//                 signal,
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.error?.message || `Function error! status: ${response.status}`);
//             }

//             const result = await response.json();

//             // **FIX:** Updated to parse the Together AI response structure
//             if (result.choices && result.choices.length > 0 && result.choices[0].message?.content) {
//                 const newText = result.choices[0].message.content;
//                 setAiOutput(newText);
//             } else {
//                 setAiOutput("Sorry, I couldn't generate a response. Please try again.");
//             }
//         } catch (error) {
//             if (error.name === 'AbortError') {
//                 console.log('Fetch aborted');
//             } else {
//                 console.error("Error generating content:", error);
//                 setError("Failed to generate content. Please check your connection.");
//                 setAiOutput("");
//             }
//         } finally {
//             setIsGenerating(false);
//         }
//     }, [systemPrompt]); // Removed aiOutput from dependencies

//     // --- Event Handlers ---
//     const handleUserInputChange = (e) => {
//         const text = e.target.value;
//         setUserInput(text);
//         if (debounceTimeout.current) {
//             clearTimeout(debounceTimeout.current);
//         }
//         debounceTimeout.current = setTimeout(() => {
//             if (text.trim() !== "") {
//                 generateContent(text);
//             } else {
//                 setAiOutput("");
//             }
//         }, 750);
//     };

//     const handleKeyDown = (e) => {
//         if (e.ctrlKey && e.key === 'Backspace') {
//             e.preventDefault();
//             if (!userInput.trim() || isGenerating) return;
//             setAiOutput("Regenerating...");
//             generateContent(userInput, true);
//         }
//     };

//     return (
//         <div className="bg-gray-900 text-white min-h-screen font-sans p-4 sm:p-6 lg:p-8 flex flex-col">
//             <header className="mb-6 text-center">
//                 <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
//                     Real-Time AI Co-Writer
//                 </h1>
//                 <p className="text-gray-400 mt-2">Powered by Together.ai Llama 3.1</p>
//             </header>
//             <main className="flex-grow flex flex-col gap-6">
//                 <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
//                     <label htmlFor="system-prompt" className="flex items-center text-lg font-semibold text-purple-300 mb-2">
//                         <SystemIcon />
//                         AI's Role / Instruction
//                     </label>
//                     <input
//                         id="system-prompt"
//                         type="text"
//                         value={systemPrompt}
//                         onChange={(e) => setSystemPrompt(e.target.value)}
//                         className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
//                         placeholder="e.g., Translate English to Spanish"
//                     />
//                 </div>
//                 <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
//                     <div className="flex flex-col bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
//                         <div className="p-4 border-b border-gray-700 flex items-center justify-between">
//                             <h2 className="text-xl font-semibold text-blue-300 flex items-center">
//                                 <UserIcon />
//                                 Your Input
//                             </h2>
//                             <span className="text-sm text-gray-400">
//                                 <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">Ctrl</kbd> + <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">Backspace</kbd> to regenerate
//                             </span>
//                         </div>
//                         <textarea
//                             value={userInput}
//                             onChange={handleUserInputChange}
//                             onKeyDown={handleKeyDown}
//                             className="flex-grow w-full bg-gray-800 text-gray-200 p-4 rounded-b-lg focus:outline-none resize-none text-lg leading-relaxed"
//                             placeholder="Start writing here..."
//                         />
//                     </div>
//                     <div className="flex flex-col bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
//                         <div className="p-4 border-b border-gray-700 flex items-center justify-between">
//                             <h2 className="text-xl font-semibold text-pink-300 flex items-center">
//                                 <MagicWandIcon />
//                                 AI Output
//                             </h2>
//                             {isGenerating && (
//                                 <div className="flex items-center space-x-2">
//                                     <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
//                                     <span className="text-sm text-pink-400">Generating...</span>
//                                 </div>
//                             )}
//                         </div>
//                         <div className="flex-grow w-full bg-gray-800 text-gray-300 p-4 rounded-b-lg resize-none text-lg leading-relaxed overflow-y-auto">
//                            {error ? <p className="text-red-400">{error}</p> : <p className="whitespace-pre-wrap">{aiOutput}</p>}
//                         </div>
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// }

import React, { useState, useCallback, useRef } from 'react';

// --- Helper Icons ---
const MagicWandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
        <path d="M15 4V2" /><path d="M15 10V8" /><path d="M10 15H8" /><path d="M20 15H18" /><path d="M12.5 5.5 10 3 7.5 5.5" /><path d="M5.5 7.5 3 10l2.5 2.5" /><path d="M18.5 7.5 21 10l-2.5 2.5" /><path d="m14 14 2.5 2.5a2.12 2.12 0 0 1-3 3L11 17" /><path d="m3 3 3 3" /><path d="M9 17 6.5 19.5" /><path d="m17 9 2.5-2.5" /><path d="M19.5 6.5 17 9" /><path d="m14 14-3-3" /><path d="m5 21 3-3" />
    </svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const SystemIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
        <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 8h10" /><path d="M7 12h10" /><path d="M7 16h4" />
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
    const debounceTimeout = useRef(null);
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
            const apiUrl = '/.netlify/functions/generate'; 
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: requestPrompt }),
                signal,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `Function error! status: ${response.status}`);
            }

            const result = await response.json();
            
            // **FIX:** Updated to parse the Gemini API response structure
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content?.parts?.[0]?.text) {
                const newText = result.candidates[0].content.parts[0].text;
                setAiOutput(newText);
            } else {
                setAiOutput("Sorry, I couldn't generate a response. Please try again.");
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
    }, [systemPrompt]);

    // --- Event Handlers ---
    const handleUserInputChange = (e) => {
        const text = e.target.value;
        setUserInput(text);
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            if (text.trim() !== "") {
                generateContent(text);
            } else {
                setAiOutput("");
            }
        }, 750);
    };

    const handleKeyDown = (e) => {
        if (e.ctrlKey && e.key === 'Backspace') {
            e.preventDefault();
            if (!userInput.trim() || isGenerating) return;
            setAiOutput("Regenerating...");
            generateContent(userInput, true);
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans p-4 sm:p-6 lg:p-8 flex flex-col">
            <header className="mb-6 text-center">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    Real-Time AI Co-Writer
                </h1>
                <p className="text-gray-400 mt-2">Powered by Google Gemini</p>
            </header>
            <main className="flex-grow flex flex-col gap-6">
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
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-blue-300 flex items-center">
                                <UserIcon />
                                Your Input
                            </h2>
                            <span className="text-sm text-gray-400">
                                <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">Ctrl</kbd> + <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">Backspace</kbd> to regenerate
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

