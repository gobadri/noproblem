const inputField = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const chatContainer = document.getElementById("chat-container");
const mainWrapper = document.getElementById("main-wrapper");
const greeting = document.getElementById("greeting");

let isFirstMessage = true;
let responseList = [];

// Fetch responses on load
fetch("responses.json")
  .then((res) => res.json())
  .then((data) => {
    responseList = data;
  })
  .catch((err) => {
    console.error(
      "Could not load responses. Ensure you are running on a local server.",
      err,
    );
  });

// Auto-resize textarea
inputField.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 150) + "px";
  if (this.value === "") this.style.height = "auto";
});

// Handle Enter key (Shift+Enter for new line)
inputField.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleMessage();
  }
});

sendBtn.addEventListener("click", handleMessage);

function handleMessage() {
  const text = inputField.value.trim();
  if (!text) return;

  // UI Updates
  if (mainWrapper.classList.contains("center-mode")) {
    mainWrapper.classList.remove("center-mode");
    mainWrapper.classList.add("chat-mode");
    greeting.style.display = "none";
  }

  // Add User Message
  addMessage(text, "user");
  inputField.value = "";
  inputField.style.height = "auto"; // Reset height

  // Start AI Logic
  processAiResponse();
}

function processAiResponse(isRemake = false) {
  // 1. Thinking Phase
  const loadingId = showLoading("Analyzing your problem...");

  // 2. Switch to Searching Phase after 2 seconds
  setTimeout(() => {
    updateLoadingToSearch(loadingId);

    // 3. Reveal Result after another 5 seconds
    setTimeout(() => {
      removeLoading(loadingId);

      let responseText;

      if (isFirstMessage && !isRemake) {
        responseText = "معلش";
        isFirstMessage = false;
      } else {
        // Random response from JSON
        if (responseList.length > 0) {
          const randomIndex = Math.floor(Math.random() * responseList.length);
          responseText = responseList[randomIndex];
        } else {
          // Fallback if JSON failed to load (e.g. CORS error)
          responseText = "معلش (Error loading responses. check console)";
        }
      }

      addAiMessageWithActions(responseText);
    }, 5000); // 5 seconds searching
  }, 2000); // 2 seconds thinking
}

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("message", sender);

  const avatarDiv = document.createElement("div");
  avatarDiv.classList.add(
    "avatar",
    sender === "user" ? "user-avatar" : "ai-avatar",
  );

  if (sender === "ai") {
    avatarDiv.innerHTML = getAiIcon();
  } else {
    avatarDiv.textContent = "U";
  }

  const contentDiv = document.createElement("div");
  contentDiv.classList.add("message-content");
  contentDiv.textContent = text;
  contentDiv.dir = "auto";

  if (sender === "user") {
    div.appendChild(contentDiv);
    div.appendChild(avatarDiv);
  } else {
    div.appendChild(avatarDiv);
    div.appendChild(contentDiv);
  }

  chatContainer.appendChild(div);
  scrollToBottom();
}

function addAiMessageWithActions(text) {
  const div = document.createElement("div");
  div.classList.add("message", "ai");

  const avatarDiv = document.createElement("div");
  avatarDiv.classList.add("avatar", "ai-avatar");
  avatarDiv.innerHTML = getAiIcon();

  const contentWrapper = document.createElement("div");
  contentWrapper.classList.add("message-content");

  const textDiv = document.createElement("div");
  textDiv.textContent = text;
  textDiv.dir = "auto";

  // Action Icons
  const actionBar = document.createElement("div");
  actionBar.classList.add("action-bar");

  const actions = [
    {
      path: "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z",
      tooltip: "Like",
      id: "like",
    },
    {
      path: "M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z",
      tooltip: "Dislike",
      id: "dislike",
    },
    {
      path: "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
      tooltip: "Remake",
      id: "remake",
    },
    {
      path: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z",
      tooltip: "Copy",
      id: "copy",
    },
  ];

  actions.forEach((action) => {
    const btn = document.createElement("button");
    btn.classList.add("action-btn");
    btn.setAttribute("data-tooltip", action.tooltip);
    btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="${action.path}"/></svg>`;

    btn.addEventListener("click", () => handleAction(action.id, text, div));
    actionBar.appendChild(btn);
  });

  contentWrapper.appendChild(textDiv);
  contentWrapper.appendChild(actionBar);

  div.appendChild(avatarDiv);
  div.appendChild(contentWrapper);

  chatContainer.appendChild(div);
  scrollToBottom();
}

function handleAction(type, text, messageDiv) {
  if (type === "copy") {
    navigator.clipboard.writeText(text);
  } else if (type === "remake") {
    // Remove the current AI message and restart process
    messageDiv.remove();
    processAiResponse(true); // true = isRemake
  }
}

function showLoading(initialText) {
  const id = "loading-" + Date.now();
  const div = document.createElement("div");
  div.classList.add("message", "ai");
  div.id = id;

  div.innerHTML = `
    <div class="avatar ai-avatar">${getAiIcon()}</div>
    <div class="message-content">
        <div class="loading-wrapper">
            <div class="status-row">
                <div class="typing-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
                <span id="${id}-text" class="status-text">${initialText}</span>
            </div>
            <div id="${id}-thumbnails" class="thumbnails-container" style="display:none">
                </div>
        </div>
    </div>
`;
  chatContainer.appendChild(div);
  scrollToBottom();
  return id;
}

function updateLoadingToSearch(id) {
  const textEl = document.getElementById(`${id}-text`);
  const thumbsEl = document.getElementById(`${id}-thumbnails`);

  if (textEl) textEl.textContent = "Searching for resources...";
  if (thumbsEl) {
    thumbsEl.style.display = "flex";
    // Add 3 fake thumbnails
    thumbsEl.innerHTML = `
        <div class="fake-thumb"></div>
        <div class="fake-thumb"></div>
        <div class="fake-thumb"></div>
    `;
  }
}

function removeLoading(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function scrollToBottom() {
  setTimeout(() => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 50);
}

const getAiIcon = () => {
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="m 13.365631,2.8614804 0.577591,1.7327707 a 8.6370129,8.6370129 0 0 0 5.462526,5.4625259 l 1.73277,0.577591 a 1.4395022,1.4395022 0 0 1 0,2.731263 l -1.73277,0.577591 a 8.6370129,8.6370129 0 0 0 -5.462526,5.462526 l -0.577591,1.73277 a 1.4395022,1.4395022 0 0 1 -2.731263,0 l -0.577591,-1.73277 A 8.6370129,8.6370129 0 0 0 4.5942511,13.943222 L 2.8614804,13.365631 a 1.4395022,1.4395022 0 0 1 0,-2.731263 L 4.5942511,10.056777 A 8.6370129,8.6370129 0 0 0 10.056777,4.5942511 l 0.577591,-1.7327707 a 1.4395022,1.4395022 0 0 1 2.731263,0 z" fill="#7070c2" /></svg>`;
};
