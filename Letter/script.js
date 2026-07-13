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

// Update preview function
function updatePreview() {
    const toValue = inputTo.value.trim();
    const fromValue = inputFrom.value.trim();
    const dateValue = inputDate.value.trim() || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const contentValue = inputContent.value;

    // Update character counter
    const charCount = contentValue.length;
    charCounter.textContent = `${charCount}/800`;
    
    // Change counter color based on usage
    if (charCount > 700) {
        charCounter.className = 'char-counter danger';
    } else if (charCount > 500) {
        charCounter.className = 'char-counter warning';
    } else {
        charCounter.className = 'char-counter';
    }

    previewDate.textContent = dateValue;
    previewTo.textContent = toValue || 'My Dearest [Recipient],';
    previewFrom.textContent = fromValue || '[Your Name]';
    previewContent.textContent = contentValue;
}

// Show message function
function showMessage(text, type = 'info') {
    const typeClasses = {
        success: 'success',
        error: 'error',
        info: 'info'
    };

    messageBox.className = `message-box ${typeClasses[type]}`;
    messageBox.textContent = text;
    messageBox.style.display = 'block';

    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000);
}

// Generate full text for copying
function generateFullText() {
    const date = previewDate.textContent;
    const to = inputTo.value.trim();
    const from = inputFrom.value.trim();
    const content = inputContent.value;

    const recipientLine = to || 'My Dearest [Recipient],';
    const signatureLine = from ? `\nWith all my love,\n${from}` : '\nWith all my love,\n[Your Name]';

    return `${date}\n\n${recipientLine}\n\n${content}${signatureLine}`;
}

// Copy to clipboard function
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
        if (successful) {
            showMessage('💖 Letter text copied to clipboard! 💖', 'success');
        } else {
            showMessage('💔 Failed to copy. Please try manually. 💔', 'error');
        }
    } catch (err) {
        showMessage('💔 Error copying to clipboard. Browser restrictions may apply. 💔', 'error');
        console.error('Copy failed:', err);
    } finally {
        document.body.removeChild(textArea);
    }
}

// Export as PNG function
async function exportAsPng() {
    showMessage('⏳ Generating PNG... Please wait! ⏳', 'info');

    const tempPrintableArea = document.createElement('div');
    tempPrintableArea.className = 'printable-letter-area'; 
    tempPrintableArea.innerHTML = `
        <span class="heart-decoration heart-top-left">❤️</span>
        <span class="heart-decoration heart-bottom-right">❤️</span>
        <div class="letter-date">${previewDate.textContent}</div>
        <div class="letter-to">${previewTo.textContent}</div>
        <div class="letter-text">${previewContent.textContent}</div>
        <div class="letter-from">
            <p class="closing">With all my love,</p>
            <p class="signature">${previewFrom.textContent}</p>
        </div>
    `;
    document.body.appendChild(tempPrintableArea);

    try {
        const canvas = await html2canvas(tempPrintableArea, {
            scale: 2, 
            useCORS: true, 
            backgroundColor: null 
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
    } finally {
        document.body.removeChild(tempPrintableArea);
    }
}

// Initialize the app with default values
window.onload = () => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    inputDate.value = today;

    inputTo.value = 'My Sweetheart';
    inputFrom.value = 'Your Secret Admirer';
    inputContent.value = "My Dearest,\n\nEvery pixel of my world shines brighter when you're in it. My heart beats in 8-bit rhythms for you, a nostalgic melody only we can hear.\n\nLike a classic arcade game, our love is an endless adventure, filled with thrilling quests and precious power-ups. With every level, my affection for you grows stronger, reaching for that high score of eternal bliss.\n\nYou are my Player Two, my ultimate companion in this magnificent journey. Thank you for making every moment feel like a cherished memory.\n\nWith all my love, forever and always.";
    document.body.setAttribute("data-theme", "romantic"); // default theme

    updatePreview();
};

function changeTheme() {
    const theme = document.getElementById("theme").value;
    document.body.setAttribute("data-theme", theme);
}
