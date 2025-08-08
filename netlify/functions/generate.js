// netlify/functions/generate.js

exports.handler = async function (event, context) {
  // We only care about POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Get the prompt from the request body
  const { prompt } = JSON.parse(event.body);
  const apiKey = process.env.GEMINI_API_KEY; // Get the key from environment variables

  if (!prompt) {
    return { statusCode: 400, body: 'Please provide a prompt.' };
  }
  if (!apiKey) {
    return { statusCode: 500, body: 'API key not configured.' };
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