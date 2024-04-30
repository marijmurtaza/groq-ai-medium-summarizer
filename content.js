// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Function to extract text from the page
  async function extractText() {
    const titleElement = document.querySelector('[data-testid="storyTitle"]');
    if (!titleElement) {
      console.error('Title not found.');
      return 'Title not found.';
    }

    const articleSection = document.querySelector('section');
    if (!articleSection) {
      console.error('Article section not found.');
      return 'Article section not found.';
    }

    let extractedText = titleElement.innerText.trim() + '\n\n';
    const paragraphs = articleSection.querySelectorAll('p');

    paragraphs.forEach(paragraph => {
      const textContent = paragraph.textContent.trim();
      if (textContent.split(/\s+/).filter(word => word.length > 5).length > 0) {
        extractedText += textContent + '\n';
      }
    });

    return extractedText;
  }

  // Function to send extracted text to background script for summarization
  async function sendTextToBackground(text) {
    const summary = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'summarizeText', text }, response => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else {
          resolve(response);
        }
      });
    });
    return summary;
  }

  // Create a button element
  const buttonElement = document.createElement('button');
  buttonElement.style.position = 'fixed';
  buttonElement.style.bottom = '20px'; // Position at the bottom
  buttonElement.style.right = '20px'; // Position at the right
  buttonElement.style.background = 'linear-gradient(to right, #FF6B6B, #FF8E53, #FFCA3A)'; // Gradient background
  buttonElement.style.border = 'none';
  buttonElement.style.borderRadius = '5px';
  buttonElement.style.color = 'white';
  buttonElement.style.padding = '10px 20px';
  buttonElement.style.cursor = 'pointer';
  buttonElement.textContent = 'Summarize Text'; // Changed button text to "Summarize Text"
  buttonElement.addEventListener('click', async function() {
    const extractedText = await extractText();
    if (extractedText) {
      const boxElement = document.createElement('div');
      boxElement.classList.add('custom-box');

      const spinnerElement = document.createElement('div');
      spinnerElement.classList.add('spinner');
      spinnerElement.style.border = '4px solid rgba(0, 0, 0, 0.1)';
      spinnerElement.style.borderTop = '4px solid #333';
      spinnerElement.style.borderRadius = '50%';
      spinnerElement.style.width = '20px';
      spinnerElement.style.height = '20px';
      spinnerElement.style.animation = 'spin 1s linear infinite';
      spinnerElement.style.position = 'absolute';
      spinnerElement.style.top = '50%';
      spinnerElement.style.left = '50%';
      spinnerElement.style.transform = 'translate(-50%, -50%)';

      boxElement.appendChild(spinnerElement);

      const titleElement = document.createElement('div');
      titleElement.textContent = 'Medium Article Summarizer';
      titleElement.style.fontWeight = 'bold';
      titleElement.style.fontSize = '18px';
      titleElement.style.marginBottom = '10px';
      boxElement.appendChild(titleElement);

      const closeButton = document.createElement('button');
      closeButton.textContent = 'Close';
      closeButton.style.position = 'absolute';
      closeButton.style.top = '10px';
      closeButton.style.right = '10px';
      closeButton.style.background = 'none';
      closeButton.style.border = 'none';
      closeButton.style.color = '#888';
      closeButton.style.cursor = 'pointer';
      closeButton.addEventListener('click', function() {
        boxElement.remove(); // Close the box when close button is clicked
        buttonElement.style.display = 'block'; // Show the button again
      });
      boxElement.appendChild(closeButton);

      document.body.appendChild(boxElement);

      const summary = await sendTextToBackground(extractedText);
      const summaryElement = document.createElement('div');
      summaryElement.style.color = '#333';
      summaryElement.style.fontSize = '14px';
      summaryElement.textContent = summary;

      boxElement.removeChild(spinnerElement); // Remove the spinner
      boxElement.appendChild(summaryElement);

      // Simulate loading spinner for 3 seconds (adjust as needed)
      setTimeout(function() {
        buttonElement.style.display = 'none';
      }, 3000);
    } else {
      console.error('Error: Text extraction failed.');
    }
  });

  // Append the button element to the body
  document.body.appendChild(buttonElement);

  // Styles for the loading spinner animation and custom box
  const styles = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .custom-box {
      background-color: #f8f8f8;
      padding: 20px;
      position: fixed;
      top: 2px; /* Position above the button */
      bottom: 2px; /* Position above the button */
      right: 5px; /* Position at the right */
      width: 260px;
      height: 100%;
      z-index: 9999;
      border-radius: 10px; /* Rounded corners */
      overflow-y: scroll; /* Enable vertical scrolling */
      -ms-overflow-style: none; /* Hide scrollbar (IE and Edge) */
      scrollbar-width: none; /* Hide scrollbar (Firefox) */
    }

    .custom-box::-webkit-scrollbar {
      display: none; /* Hide scrollbar (Chrome, Safari, Opera) */
    }
  `;

  // Create a style element and add the styles to it
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;

  // Append the style element to the head of the document
  document.head.appendChild(styleElement);
});

