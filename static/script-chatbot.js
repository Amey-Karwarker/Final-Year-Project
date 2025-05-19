// document.addEventListener("DOMContentLoaded", function () {
//     const uploadForm = document.getElementById("upload-form")
//     const fileInput = document.getElementById("file-input");
//     const extractedTextDiv = document.getElementById("extracted-text");
//     const aiResponseDiv = document.getElementById("ai-response");
//     const userInput = document.getElementById("user-input");
//     const sendBtn = document.getElementById("send-btn");
//     const chatbox = document.getElementById("chatbox");

//     uploadForm.addEventListener("submit", async function (e) {
//         e.preventDefault();
//         const file = fileInput.files[0];
//         if (!file) return;

//         extractedTextDiv.innerHTML = "Extracting text...";
//         aiResponseDiv.innerHTML = "Analyzing report...";
//         sendBtn.disabled = true;
//         userInput.disabled = true;

//         const formData = new FormData();
//         formData.append("file", file);

//         fetch('http://localhost:5000/extract-and-chat', {
//             method: 'POST',
//             body: formData
//         })
//             .then(res => res.json())
//             .then(data => {
//                 document.getElementById('extractedText').textContent = data.extracted_text;
//                 document.getElementById('aiResponse').textContent = data.ai_explanation;
//                 document.getElementById('chatBox').innerHTML = ''; // reset chat
//             })
//             .catch(err => {
//                 console.error(err);
//                 alert("Error processing the file.");
//           });

//         sendBtn.addEventListener("click", async function () {
//             const message = userInput.value.trim();
//             if (!message) return;

//             chatbox.innerHTML += `<div class="user-message">${message}</div>`;
//             userInput.value = "";
//             sendBtn.disabled = true;

//             try {
//                 const response = await fetch("/chat", { // corrected endpoint
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ question: message }), // match the app.py expectation
//                 });

//                 const data = await response.json();

//                 if (data.response) {
//                     chatbox.innerHTML += `<div class="bot-message">${data.response}</div>`;
//                 } else {
//                     chatbox.innerHTML += `<div class="bot-message">Sorry, I couldn't understand that.</div>`;
//                 }
//             } catch (error) {
//                 console.error(error);
//                 chatbox.innerHTML += `<div class="bot-message">Error communicating with server.</div>`;
//             } finally {
//                 sendBtn.disabled = false;
//             }
//         });
//     });
// })

// // Chatbot Interaction
// document.addEventListener("DOMContentLoaded", function () {
//     const sendBtn = document.getElementById("send-btn");
//     const userInput = document.getElementById("user-input");
//     const chatbox = document.getElementById("chatbox");

//     if (sendBtn && userInput && chatbox) {
//         sendBtn.addEventListener("click", async function () {
//             const message = userInput.value.trim();
//             if (!message) return;

//             // Display user message
//             const userMessage = document.createElement("div");
//             userMessage.className = "message user";
//             userMessage.textContent = message;
//             chatbox.appendChild(userMessage);

//             userInput.value = "";

//             try {
//                 const response = await fetch("/chat", {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json"
//                     },
//                     body: JSON.stringify({ message })
//                 });

//                 const data = await response.json();

//                 const botMessage = document.createElement("div");
//                 botMessage.className = "message bot";
//                 botMessage.textContent = data.reply || "Sorry, I didn't understand that.";
//                 chatbox.appendChild(botMessage);

//                 chatbox.scrollTop = chatbox.scrollHeight;
//             } catch (error) {
//                 const errorMessage = document.createElement("div");
//                 errorMessage.className = "message bot";
//                 errorMessage.textContent = "Error communicating with chatbot.";
//                 chatbox.appendChild(errorMessage);
//             }
//         });

//         // Allow pressing Enter to send
//         userInput.addEventListener("keydown", function (e) {
//             if (e.key === "Enter") {
//                 sendBtn.click();
//             }
//         });
//     }
// });

function uploadReport() {
    const fileInput = document.getElementById('reportFile');
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append('file', file);

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
    const question = document.getElementById('userQuestion').value.trim();
    if (!question) return;

    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
    })
    .then(res => res.json())
    .then(data => {
        const chatBox = document.getElementById('chatBox');
        const userMsg = `<div class="user-message"><strong>You:</strong> ${question}</div>`;
        const botMsg = `<div class="bot-message"><strong>Bot:</strong> ${data.response}</div>`;
        chatBox.innerHTML += userMsg + botMsg;
        chatBox.scrollTop = chatBox.scrollHeight;
        document.getElementById('userQuestion').value = '';
    })
    .catch(err => {
        console.error(err);
        alert("Error sending question.");
    });
}
  