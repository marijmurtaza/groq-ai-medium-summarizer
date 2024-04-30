console.log("Background script running");

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarizeText') {
    // Your API key and API URL
    const apiKey = 'yourapikeyhere';
    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

    const messages = [
      { role: 'system', content: 'Consider yourself as a summarization expert...' },
      { role: 'user', content: request.text },
    ];

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: 'mixtral-8x7b-32768',
        temperature: 1,
        max_tokens: 1024
      }),
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
    })
    .then(data => {
      const summary = data.choices[0]?.message?.content || 'No response from Groq AI.';
      sendResponse(summary);
    })
    .catch(error => {
      console.error('Fetch error:', error);
      sendResponse('An error occurred while summarizing text.');
    });

    return true; // Indicates that sendResponse will be called asynchronously
  }
});