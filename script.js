// Get chatbot elements
const chatbotToggleBtn = document.getElementById('chatbotToggleBtn');
const chatbotPanel = document.getElementById('chatbotPanel');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSendBtn = document.getElementById('chatbotSendBtn');

if (chatbotToggleBtn && chatbotPanel) {
  // Toggle chat open/closed when clicking the button
  chatbotToggleBtn.addEventListener('click', () => {
    chatbotPanel.classList.toggle('open');
  });

  // Close chat when clicking anywhere except the chat panel or button
  document.addEventListener('click', (e) => {
    // If chat is open AND user clicked outside chat area, close it
    if (chatbotPanel.classList.contains('open') && 
        !chatbotPanel.contains(e.target) && 
        !chatbotToggleBtn.contains(e.target)) {
      chatbotPanel.classList.remove('open');
    }
  });
}

// Function to add a message to the chat window
function addMessage(message, isUser = false) {
  const messageElement = document.createElement('div');
  messageElement.className = isUser ? 'user-message' : 'assistant-message';
  messageElement.textContent = message;
  chatbotMessages.appendChild(messageElement);
  
  // Scroll to the bottom of the chat
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Function to send message to OpenAI API
async function sendMessageToOpenAI(userMessage) {
  try {
    // Show that the assistant is typing
    addMessage('Thinking...', false);
    
    // Make API call to OpenAI Chat Completions
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using gpt-4o model as specified
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      })
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    // Parse the response
    const data = await response.json();
    
    // Remove the "Thinking..." message
    const lastMessage = chatbotMessages.lastElementChild;
    if (lastMessage && lastMessage.textContent === 'Thinking...') {
      chatbotMessages.removeChild(lastMessage);
    }
    
    // Get the assistant's reply
    const assistantReply = data.choices[0].message.content;
    
    // Display the assistant's reply in the chat window
    addMessage(assistantReply, false);
    
  } catch (error) {
    console.error('Error sending message to OpenAI:', error);
    
    // Remove the "Thinking..." message if it exists
    const lastMessage = chatbotMessages.lastElementChild;
    if (lastMessage && lastMessage.textContent === 'Thinking...') {
      chatbotMessages.removeChild(lastMessage);
    }
    
    // Show error message to user
    addMessage('Sorry, I encountered an error. Please try again.', false);
  }
}

// Function to handle sending messages
function handleSendMessage() {
  const userMessage = chatbotInput.value.trim();
  
  // Don't send empty messages
  if (!userMessage) return;
  
  // Add user message to chat
  addMessage(userMessage, true);
  
  // Clear the input field
  chatbotInput.value = '';
  
  // Send message to OpenAI API
  sendMessageToOpenAI(userMessage);
}

// Add event listener for send button
if (chatbotSendBtn) {
  chatbotSendBtn.addEventListener('click', handleSendMessage);
}

// Add event listener for Enter key in input field
if (chatbotInput) {
  chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  });
}
