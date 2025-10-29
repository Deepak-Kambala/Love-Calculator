// DOM Elements
const inputTo = document.getElementById('inputTo');
const inputFrom = document.getElementById('inputFrom');
const inputDate = document.getElementById('inputDate');
const inputContent = document.getElementById('inputContent');
const charCounter = document.getElementById('charCounter');

const previewDate = document.getElementById('previewDate');
const previewTo = document.getElementById('previewTo');
const previewContent = document.getElementById('previewContent');
const previewFrom = document.querySelector('.signature');

const messageBox = document.getElementById('messageBox');
const letterPreviewArea = document.getElementById('letterPreviewArea');

// Templates
const templates = {
    romantic: {
        to: "My Beloved",
        from: "Your Devoted Admirer",
        content: `My Dearest,\n\nEvery moment without you feels like a game paused forever. My heart races every time I see you, like the ultimate power-up.\n\nI treasure every pixel of our memories together and dream of creating new adventures hand in hand.\n\nWith all my love,`,
        color: "#ffe0f0", // soft pink background
        textColor: "#330033",
        emoji: "❤️"
    },
    cute: {
        to: "Sweetest Honeybun",
        from: "Your Snuggle Bear",
        content: `Hi Cutie!\n\nJust wanted to send you a little love in pixels. You make my days brighter than a full-screen rainbow in a retro game!\n\nHugs, kisses, and endless giggles for you.\n\nAlways yours,`,
        color: "#fff3e0", // light beige/brown
        textColor: "#5d4037",
        emoji: "🐻"
    },
    poetic: {
        to: "My Muse",
        from: "Your Poet",
        content: `Dearest Soul,\n\nThrough the flicker of pixelated stars, my thoughts drift to you. Every line of code I write carries whispers of your name.\n\nTogether, we script an endless story of love and wonder.\n\nYours in rhyme and reason,`,
        color: "#f0f8ff", // soft blue
        textColor: "#003366",
        emoji: "✨"
    },
    funny: {
        to: "Player Two",
        from: "Your Console Buddy",
        content: `Hey Player Two,\n\nLife without you is like a game without cheat codes: challenging and full of bugs. Thanks for being my ultimate co-op partner.\n\nLet's keep leveling up together!\n\nGame over? Never!`,
        color: "#e0f7fa", // light cyan
        textColor: "#006064",
        emoji: "😆"
    }
};

// Update preview function
function updatePreview() {
    const toValue = inputTo.value.trim();
    const fromValue = inputFrom.value.trim();
    const dateValue = inputDate.value.trim() || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const contentValue = inputContent.value;

    const charCount = contentValue.length;
    charCounter.textContent = `${charCount}/800`;
    if (charCount > 700) { charCounter.className = 'char-counter danger'; }
    else if (charCount > 500) { charCounter.className = 'char-counter warning'; }
    else { charCounter.className = 'char-counter'; }

    previewDate.textContent = dateValue;
    previewTo.textContent = toValue || 'My Dearest [Recipient],';
    previewFrom.textContent = fromValue || '[Your Name]';
    previewContent.textContent = contentValue;
}

// Apply template
function applyTemplate() {
    const selected = document.getElementById('templateSelect').value;
    if (selected && templates[selected]) {
        const temp = templates[selected];

        // Update content
        inputTo.value = temp.to;
        inputFrom.value = temp.from;
        inputContent.value = temp.content;

        // Update preview
        updatePreview();

        // Change letter colors
        letterPreviewArea.style.backgroundColor = temp.color;
        letterPreviewArea.style.color = temp.textColor;

        // Update heart/emoji decorations
        const hearts = letterPreviewArea.querySelectorAll('.heart-decoration');
        hearts.forEach(el => el.textContent = temp.emoji);

        showMessage(`Template "${selected}" applied! 💖`, 'success');
    }
}


// Show message
function showMessage(text, type = 'info') {
    messageBox.className = `message-box ${type}`;
    messageBox.textContent = text;
    messageBox.style.display = 'block';
    setTimeout(() => { messageBox.style.display = 'none'; }, 3000);
}

// Generate full text
function generateFullText() {
    const date = previewDate.textContent;
    const to = inputTo.value.trim() || 'My Dearest [Recipient],';
    const from = inputFrom.value.trim() || '[Your Name]';
    const content = inputContent.value;

    return `${date}\n\n${to}\n\n${content}\n\nWith all my love,\n${from}`;
}

// Copy to clipboard
function copyDocumentToClipboard() {
    const fullText = generateFullText();
    const textArea = document.createElement('textarea');
    textArea.value = fullText;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        showMessage(successful ? '💖 Letter text copied to clipboard! 💖' : '💔 Failed to copy. 💔', successful ? 'success' : 'error');
    } catch {
        showMessage('💔 Error copying to clipboard. 💔', 'error');
    } finally {
        document.body.removeChild(textArea);
    }
}

// Export as PNG
async function exportAsPng() {
    showMessage('⏳ Generating PNG... Please wait! ⏳', 'info');

    try {
        const canvas = await html2canvas(letterPreviewArea, {
            scale: 2,           // higher resolution
            useCORS: true,      // allow external images if any
            backgroundColor: null // preserve background color
        });

        const image = canvas.toDataURL('image/png');
        const filename = (inputTo.value.trim() || 'my_love_letter') + '.png';

        const a = document.createElement('a');
        a.href = image;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        showMessage(`💌 '${filename}' has been downloaded! 💌`, 'success');
    } catch (error) {
        console.error('Error generating PNG:', error);
        showMessage('💔 Failed to generate PNG. Please try again. 💔', 'error');
    }
}

// Initialize default
window.onload = () => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    inputDate.value = today;

    inputTo.value = 'My Sweetheart';
    inputFrom.value = 'Your Secret Admirer';
    inputContent.value = `My Dearest,\n\nEvery pixel of my world shines brighter when you're in it. My heart beats in 8-bit rhythms for you, a nostalgic melody only we can hear.\n\nWith all my love, forever and always.`;

    updatePreview();
};
