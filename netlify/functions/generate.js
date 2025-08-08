// netlify/functions/generate.js

exports.handler = async function (event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Get the API key from Netlify's environment variables
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured.' }) };
  }

  // Parse the incoming request body to get the prompts
  const { system_prompt, user_prompt } = JSON.parse(event.body);
  if (!user_prompt) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Please provide a user_prompt.' }) };
  }

  const apiUrl = 'https://api.together.xyz/v1/chat/completions';

  // Structure the payload for the Together AI API
  const payload = {
    model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo',
    messages: [
      {
        role: 'system',
        content: system_prompt,
      },
      {
        role: 'user',
        content: user_prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Together AI API Error:', errorData);
      return { statusCode: response.status, body: JSON.stringify(errorData) };
    }

    const data = await response.json();

    // Send the successful response back to the frontend
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error calling Together AI API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch from Together AI API.' }),
    };
  }
};
