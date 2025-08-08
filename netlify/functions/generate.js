// // netlify/functions/generate.js

// exports.handler = async function (event) {
//   // Only allow POST requests
//   if (event.httpMethod !== 'POST') {
//     return { statusCode: 405, body: 'Method Not Allowed' };
//   }

//   // Get the API key from Netlify's environment variables
//   const apiKey = process.env.TOGETHER_API_KEY;
//   if (!apiKey) {
//     return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured.' }) };
//   }

//   // Parse the incoming request body to get the prompts
//   const { system_prompt, user_prompt } = JSON.parse(event.body);
//   if (!user_prompt) {
//     return { statusCode: 400, body: JSON.stringify({ error: 'Please provide a user_prompt.' }) };
//   }

//   const apiUrl = 'https://api.together.xyz/v1/chat/completions';

//   // Structure the payload for the Together AI API
//   const payload = {
//     // --- THIS IS THE FIX ---
//     model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free', 
//     messages: [
//       {
//         role: 'system',
//         content: system_prompt,
//       },
//       {
//         role: 'user',
//         content: user_prompt,
//       },
//     ],
//     temperature: 0.7,
//     max_tokens: 1024,
//   };

//   try {
//     const response = await fetch(apiUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${apiKey}`,
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error('Together AI API Error:', errorData);
//       return { statusCode: response.status, body: JSON.stringify(errorData) };
//     }

//     const data = await response.json();

//     // Send the successful response back to the frontend
//     return {
//       statusCode: 200,
//       body: JSON.stringify(data),
//     };
//   } catch (error) {
//     console.error('Error calling Together AI API:', error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: 'Failed to fetch from Together AI API.' }),
//     };
//   }
// };

// netlify/functions/generate.js

exports.handler = async function (event) {
  // We only care about POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Get the prompt from the request body
  const { prompt } = JSON.parse(event.body);
  // Get the key from environment variables
  const apiKey = process.env.GEMINI_API_KEY; 

  if (!prompt) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Please provide a prompt.'}) };
  }
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured.'}) };
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return { statusCode: response.status, body: JSON.stringify(errorData) };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch from Gemini API.' }),
    };
  }
};

