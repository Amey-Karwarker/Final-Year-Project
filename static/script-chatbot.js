document.addEventListener("DOMContentLoaded", () => {
    const sendBtn = document.getElementById("send-btn");
    const userInput = document.getElementById("userQuestion");

    // Allow pressing Enter to send
    userInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();  // Prevent newline
            sendBtn.click();
        }
    });

    sendBtn.addEventListener("click", askQuestion);
});

function uploadReport() {
    const fileInput = document.getElementById('reportFile');
    const file = fileInput.files[0];

    const extractedTextDiv = document.getElementById("extractedText");
    const aiResponseDiv = document.getElementById("aiResponse");

    const formData = new FormData();
    formData.append('file', file);

    extractedTextDiv.innerHTML = "Extracting text...";
    aiResponseDiv.innerHTML = "Analyzing report...";

    fetch('/extract-and-chat', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('extractedText').textContent = data.extracted_text || "No text extracted.";
        document.getElementById('aiResponse').textContent = data.ai_explanation || "No explanation received.";
        document.getElementById('chatBox').innerHTML = `
        <div class="bot-message">Hello! You may now ask follow-up questions related to the uploaded report.</div>
    `;
    })
    .catch(err => {
        console.error(err);
        alert("Error processing the file.");
    });
}

function askQuestion() {
    const inputEl = document.getElementById('userQuestion');
    const question = inputEl.value.trim();
    if (!question) return;

    const chatBox = document.getElementById('chatBox');
    const userMsg = `<div class="user-message"><strong>You:</strong> ${question}</div>`;
    chatBox.innerHTML += userMsg;
    chatBox.scrollTop = chatBox.scrollHeight;
    inputEl.value = '';

    const loadingMsg = `<div class="bot-message"><em>Bot is typing...</em></div>`;
    chatBox.innerHTML += loadingMsg;
    chatBox.scrollTop = chatBox.scrollHeight;

    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
    })
    .then(res => res.json())
    .then(data => {
        // Remove loading message
        chatBox.removeChild(chatBox.lastChild);
        const botMsg = `<div class="bot-message"><strong>Bot:</strong> ${data.response}</div>`;
        chatBox.innerHTML += botMsg;
        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(err => {
        console.error(err);
        alert("Error sending question.");
    });
}
