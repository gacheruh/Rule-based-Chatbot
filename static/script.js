document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    
    // Set current time
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Focus on input
    messageInput.focus();
});

function updateCurrentTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        timeElement.textContent = timeString;
    }
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message === '') return;
    
    // Add user message to chat
    addMessage(message, 'user');
    messageInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Send message to server
    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({message: message})
    })
    .then(response => response.json())
    .then(data => {
        // Calculate realistic typing delay based on response length
        const responseLength = data.response.length;
        const baseDelay = 800; // Base delay of 0.8 seconds
        const charDelay = 20; // 20ms per character
        const maxDelay = 2000; // Maximum 2 seconds
        const typingDelay = Math.min(baseDelay + (responseLength * charDelay), maxDelay);
        
        // Hide typing indicator and show response after delay
        setTimeout(() => {
            hideTypingIndicator();
            typeMessage(data.response, 'bot');
            
            // If it's an exit message, disable input
            if (data.is_exit) {
                setTimeout(() => disableInput(), 2000);
            }
        }, typingDelay);
    })
    .catch(error => {
        hideTypingIndicator();
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        console.error('Error:', error);
    });
}

function sendQuickMessage(message) {
    const messageInput = document.getElementById('messageInput');
    messageInput.value = message;
    sendMessage();
}

function addMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const avatarIcon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${text}</div>
                <div class="message-time">${timeString}</div>
            </div>
            <div class="message-avatar">
                <i class="${avatarIcon}"></i>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <div class="message-text">${text}</div>
                <div class="message-time">${timeString}</div>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function typeMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const avatarIcon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text"></div>
                <div class="message-time">${timeString}</div>
            </div>
            <div class="message-avatar">
                <i class="${avatarIcon}"></i>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <div class="message-text"></div>
                <div class="message-time">${timeString}</div>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    
    const messageText = messageDiv.querySelector('.message-text');
    let index = 0;
    
    function typeChar() {
        if (index < text.length) {
            messageText.textContent += text.charAt(index);
            index++;
            scrollToBottom();
            setTimeout(typeChar, 15 + Math.random() * 25); // Faster typing speed
        }
    }
    
    typeChar();
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="message-text">
                <span class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function disableInput() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    messageInput.disabled = true;
    messageInput.placeholder = 'Chat session ended. Please refresh to start a new conversation.';
    sendButton.disabled = true;
    sendButton.style.opacity = '0.5';
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add typing animation CSS
const style = document.createElement('style');
style.textContent = `
    .typing-indicator .message-content {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
    }
    
    .typing-dots {
        display: inline-flex;
        gap: 4px;
    }
    
    .typing-dots span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #667eea;
        animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-dots span:nth-child(1) {
        animation-delay: -0.32s;
    }
    
    .typing-dots span:nth-child(2) {
        animation-delay: -0.16s;
    }
    
    @keyframes typing {
        0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
        }
        40% {
            transform: scale(1);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
