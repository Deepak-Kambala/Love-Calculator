const segments = [
    { text: "Kiss Challenge 💋", emoji: "💋", color: "#ff1744" },
    { text: "Send a Cute Text 💌", emoji: "💌", color: "#e91e63" },
    { text: "Truth or Dare ❤️", emoji: "❤️", color: "#9c27b0" },
    { text: "Virtual Hug 🤗", emoji: "🤗", color: "#673ab7" },
    { text: "Love Quote 💭", emoji: "💭", color: "#3f51b5" },
    { text: "Compliment Time 💕", emoji: "💕", color: "#2196f3" },
    { text: "Movie Night Idea 🍿", emoji: "🍿", color: "#00bcd4" },
    { text: "Memory Game 🧠", emoji: "🧠", color: "#009688" }
];

const destinySegments = [
    { text: "Soulmates Forever 💍", emoji: "💍", color: "#ffd700" },
    { text: "True Love Destiny 💖", emoji: "💖", color: "#ff1744" },
    { text: "Infinite Bond 💫", emoji: "💫", color: "#9c27b0" },
    { text: "Eternal Love 💞", emoji: "💞", color: "#e91e63" }
];

let currentRotation = 0;
let isSpinning = false;
let lovePercentage = 50;
let secretModeUnlocked = false;
let spinCount = 0;

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const resultModal = document.getElementById('resultModal');
const miniGameModal = document.getElementById('miniGameModal');

canvas.width = 400;
canvas.height = 400;

function drawWheel(activeSegments = segments) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;
    const anglePerSegment = (2 * Math.PI) / activeSegments.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    activeSegments.forEach((segment, index) => {
        const startAngle = index * anglePerSegment;
        const endAngle = startAngle + anglePerSegment;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = segment.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerSegment / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Poppins';
        ctx.fillText(segment.emoji, radius / 1.5, 10);
        ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary');
    ctx.lineWidth = 5;
    ctx.stroke();
}

function spinWheel() {
    if (isSpinning) return;

    isSpinning = true;
    spinBtn.disabled = true;

    const activeSegments = secretModeUnlocked ? destinySegments : segments;
    const numRotations = 5 + Math.random() * 3;
    const randomDegree = Math.random() * 360;
    const totalRotation = numRotations * 360 + randomDegree;

    currentRotation += totalRotation;
    canvas.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        const normalizedRotation = currentRotation % 360;
        const segmentAngle = 360 / activeSegments.length;
        const adjustedRotation = (360 - normalizedRotation + 90) % 360;
        const segmentIndex = Math.floor(adjustedRotation / segmentAngle) % activeSegments.length;
        const result = activeSegments[segmentIndex];

        showResult(result);
        addLovePoints(10);
        boostLoveMeter();
        launchConfetti();
        isSpinning = false;
        spinBtn.disabled = false;
        spinCount++;

        saveProgress();
    }, 4000);
}

function showResult(result) {
    const resultText = document.getElementById('resultText');
    const resultDescription = document.getElementById('resultDescription');

    resultText.textContent = result.text;
    resultDescription.textContent = getResultDescription(result.text, lovePercentage);

    resultModal.style.display = 'block';

    // resultModal.scrollIntoView({ behavior: "smooth", block: "center" });

    setTimeout(() => {
        handleMiniGame(result.text);
    }, 1000);
}

function getResultDescription(resultText, lovePercent) {
    const descriptions = {
        high: {
            "Kiss Challenge 💋": "Your love is burning bright! Time for a sweet kiss to seal your bond! 💋✨",
            "Send a Cute Text 💌": "Send your soulmate the most romantic message ever! Let your heart speak! 💌💕",
            "Truth or Dare ❤️": "Your connection is strong! Ask the deepest truth or dare the sweetest challenge! ❤️",
            "Virtual Hug 🤗": "Wrap your partner in a warm virtual embrace! Your love radiates! 🤗💖",
            "Love Quote 💭": "Share a beautiful quote that expresses your eternal love! 💭✨",
            "Compliment Time 💕": "Tell your beloved what makes them absolutely perfect! 💕🌟",
            "Movie Night Idea 🍿": "Cuddle up for a romantic movie marathon together! 🍿❤️",
            "Memory Game 🧠": "Test how well you know your perfect match! 🧠💞"
        },
        medium: {
            "Kiss Challenge 💋": "A sweet peck could spark something magical! Go for it! 💋",
            "Send a Cute Text 💌": "Send a flirty message to brighten their day! 💌😊",
            "Truth or Dare ❤️": "Time for fun! Ask something interesting or dare something exciting! ❤️",
            "Virtual Hug 🤗": "Send some warm vibes and positive energy! 🤗",
            "Love Quote 💭": "Share an inspiring quote about love and connection! 💭",
            "Compliment Time 💕": "Say something nice to make them smile! 💕",
            "Movie Night Idea 🍿": "Pick a fun movie you both would enjoy! 🍿",
            "Memory Game 🧠": "See how much you remember about each other! 🧠"
        },
        low: {
            "Kiss Challenge 💋": "Maybe start with a friendly smile? Or be brave and go for it! 💋😄",
            "Send a Cute Text 💌": "Break the ice with a friendly, fun message! 💌",
            "Truth or Dare ❤️": "Play it fun and light! Get to know each other better! ❤️",
            "Virtual Hug 🤗": "A friendly gesture never hurts! Send good vibes! 🤗",
            "Love Quote 💭": "Share an uplifting quote to inspire the day! 💭",
            "Compliment Time 💕": "Everyone loves a genuine compliment! 💕",
            "Movie Night Idea 🍿": "Suggest a casual movie hangout! 🍿",
            "Memory Game 🧠": "Learn fun facts about each other! 🧠"
        },
        destiny: {
            "Soulmates Forever 💍": "The universe has spoken! You two are destined to be together forever! 💍✨",
            "True Love Destiny 💖": "Your souls are eternally intertwined! This is true love! 💖🌟",
            "Infinite Bond 💫": "An unbreakable connection that transcends time and space! 💫💕",
            "Eternal Love 💞": "A love story written in the stars! Forever and always! 💞🌠"
        }
    };

    if (secretModeUnlocked) {
        return descriptions.destiny[resultText] || "Destiny has chosen you! 💫";
    }

    if (lovePercent >= 80) {
        return descriptions.high[resultText] || "Amazing result! Your love is strong! 💖";
    } else if (lovePercent >= 50) {
        return descriptions.medium[resultText] || "Great result! Keep the spark alive! ✨";
    } else {
        return descriptions.low[resultText] || "Fun result! Enjoy the moment! 🎉";
    }
}

function handleMiniGame(resultText) {
    if (resultText.includes("Truth or Dare")) {
        setTimeout(() => showTruthOrDare(), 2000);
    } else if (resultText.includes("Love Quote")) {
        setTimeout(() => showLoveQuote(), 2000);
    } else if (resultText.includes("Memory Game")) {
        setTimeout(() => showMemoryGame(), 2000);
    }
}

function showTruthOrDare() {
    const truths = [
        "What was your first impression of your partner?",
        "What's your favorite memory together?",
        "What do you love most about your relationship?",
        "When did you first realize you were in love?",
        "What's your partner's hidden talent?"
    ];

    const dares = [
        "Send a voice message saying 'I love you' in a funny accent",
        "Share your most embarrassing moment with your partner",
        "Do a silly dance and record it",
        "Write a short love poem right now",
        "Give your partner 5 genuine compliments"
    ];

    const truth = truths[Math.floor(Math.random() * truths.length)];
    const dare = dares[Math.floor(Math.random() * dares.length)];

    document.getElementById('miniGameTitle').textContent = "Truth or Dare? ❤️";
    document.getElementById('miniGameContent').innerHTML = `
        <div style="margin: 20px 0;">
            <h3 style="color: var(--primary);">Truth:</h3>
            <p style="font-size: 1.1rem; margin: 15px 0;">${truth}</p>
        </div>
        <div style="margin: 20px 0;">
            <h3 style="color: var(--secondary);">Dare:</h3>
            <p style="font-size: 1.1rem; margin: 15px 0;">${dare}</p>
        </div>
        <p style="color: var(--accent); margin-top: 20px;">Choose one and complete it! 💕</p>
    `;

    miniGameModal.style.display = 'block';
}

function showLoveQuote() {
    const quotes = [
        "Love is not about how many days, months, or years you have been together. It's all about how much you love each other every single day. 💕",
        "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine. 💖",
        "You are my today and all of my tomorrows. 💫",
        "The best thing to hold onto in life is each other. 🤗",
        "Love is composed of a single soul inhabiting two bodies. 💞",
        "I have found the one whom my soul loves. 💍",
        "Every love story is beautiful, but ours is my favorite. ✨"
    ];

    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    document.getElementById('miniGameTitle').textContent = "Love Quote 💭";
    document.getElementById('miniGameContent').innerHTML = `
        <div class="quote-box">${quote}</div>
        <button class="action-btn copy-btn" onclick="copyQuote('${quote.replace(/'/g, "\\'")}')">
            Copy Quote 📋
        </button>
    `;

    miniGameModal.style.display = 'block';
}

function showMemoryGame() {
    const questions = [
        {
            q: "What's your partner's favorite color?",
            options: ["Red", "Blue", "Green", "Purple"]
        },
        {
            q: "What's their favorite food?",
            options: ["Pizza", "Pasta", "Sushi", "Burgers"]
        },
        {
            q: "What's their dream vacation spot?",
            options: ["Beach Paradise", "Mountain Retreat", "City Adventure", "Countryside"]
        },
        {
            q: "What's their love language?",
            options: ["Words of Affirmation", "Quality Time", "Physical Touch", "Acts of Service"]
        }
    ];

    const question = questions[Math.floor(Math.random() * questions.length)];

    document.getElementById('miniGameTitle').textContent = "Memory Game 🧠";
    document.getElementById('miniGameContent').innerHTML = `
        <p style="font-size: 1.3rem; margin-bottom: 25px;">${question.q}</p>
        ${question.options.map(opt =>
        `<button class="quiz-option" onclick="answerQuiz('${opt}')">${opt}</button>`
    ).join('')}
        <p style="color: var(--accent); margin-top: 20px; font-size: 0.9rem;">
            Choose what you think is correct! 💕
        </p>
    `;

    miniGameModal.style.display = 'block';
}

function answerQuiz(answer) {
    document.getElementById('miniGameContent').innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 4rem; margin: 20px 0;">❤️</div>
            <h3 style="color: var(--primary);">You chose: ${answer}</h3>
            <p style="margin: 20px 0; font-size: 1.1rem;">
                Great! Now ask your partner if you got it right! 💕
            </p>
            <p style="color: var(--accent);">
                Every answer brings you closer together! 🌟
            </p>
        </div>
    `;
}

function copyQuote(quote) {
    navigator.clipboard.writeText(quote).then(() => {
        alert('Quote copied to clipboard! 💕');
    });
}

function closeMiniGame() {
    miniGameModal.style.display = 'none';
}

function launchConfetti() {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999
    };

    function fire(particleRatio, opts) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
            colors: ['#ff1744', '#ff4081', '#ff80ab', '#ffc0cb']
        });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });

    createFloatingHearts();
}

function createFloatingHearts() {
    const container = document.querySelector('.floating-hearts');

    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart-float';
        heart.textContent = ['❤️', '💕', '💖', '💗', '💓'][Math.floor(Math.random() * 5)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 2 + 's';
        heart.style.fontSize = (Math.random() * 20 + 15) + 'px';
        container.appendChild(heart);

        setTimeout(() => heart.remove(), 4000);
    }
}

function addLovePoints(points) {
    let totalPoints = parseInt(localStorage.getItem('lovePoints') || '0');
    totalPoints += points;
    localStorage.setItem('lovePoints', totalPoints);

    document.getElementById('pointsDisplay').textContent = totalPoints;
    updateLoveTitle(totalPoints);
}

function updateLoveTitle(points) {
    const titleEl = document.getElementById('loveTitle');
    let title = "New Player";

    if (points >= 1000) title = "Eternal Lovers 💍";
    else if (points >= 500) title = "Perfect Pair 💞";
    else if (points >= 200) title = "Sweet Duo 💕";
    else if (points >= 100) title = "Love Birds 🕊️";
    else if (points >= 50) title = "Cute Couple 💑";

    titleEl.textContent = title;
}

function boostLoveMeter() {
    const currentPercent = parseInt(localStorage.getItem('loveMeterPercent') || lovePercentage);
    const newPercent = Math.min(100, currentPercent + 5);

    localStorage.setItem('loveMeterPercent', newPercent);
    updateLoveMeter(newPercent);

    const meterContainer = document.querySelector('.love-meter');
    const boostEl = document.createElement('div');
    boostEl.className = 'love-boost';
    boostEl.textContent = '+5% Love Boost 💕';
    meterContainer.appendChild(boostEl);

    setTimeout(() => boostEl.remove(), 2000);
}

function updateLoveMeter(percent) {
    document.getElementById('loveMeterFill').style.width = percent + '%';
    document.getElementById('loveMeterText').textContent = percent + '%';
    lovePercentage = percent;
}

function checkSecretMode() {
    if (lovePercentage === 100 && !secretModeUnlocked) {
        secretModeUnlocked = true;
        alert('🎉 SECRET MODE UNLOCKED! 🎉\n\nWheel of Destiny activated!\nYour love is at 100%! Prepare for exclusive results! 💍✨');
        drawWheel(destinySegments);
        spinBtn.textContent = 'SPIN DESTINY WHEEL 💫';
        localStorage.setItem('secretMode', 'true');
    }
}

function switchTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-theme="${theme}"]`).classList.add('active');

    drawWheel(secretModeUnlocked ? destinySegments : segments);
}

function shareToWhatsApp() {
    const resultText = document.getElementById('resultText').textContent;
    const message = `We just spun the Wheel of Love and got "${resultText}"! Try yours here 💞 ${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function copyResult() {
    const resultText = document.getElementById('resultText').textContent;
    const message = `I got "${resultText}" on the Wheel of Love! 💕`;

    navigator.clipboard.writeText(message).then(() => {
        alert('Result copied to clipboard! 📋💕');
    });
}

function saveProgress() {
    localStorage.setItem('spinCount', spinCount);
}

function loadProgress() {
    const savedPoints = parseInt(localStorage.getItem('lovePoints') || '0');
    const savedTheme = localStorage.getItem('theme') || 'romantic';
    const savedLovePercent = parseInt(localStorage.getItem('loveMeterPercent') || '50');
    const savedSecretMode = localStorage.getItem('secretMode') === 'true';

    document.getElementById('pointsDisplay').textContent = savedPoints;
    updateLoveTitle(savedPoints);
    updateLoveMeter(savedLovePercent);
    switchTheme(savedTheme);

    if (savedSecretMode && savedLovePercent === 100) {
        secretModeUnlocked = true;
        drawWheel(destinySegments);
        spinBtn.textContent = 'SPIN DESTINY WHEEL 💫';
    }

    spinCount = parseInt(localStorage.getItem('spinCount') || '0');
}

spinBtn.addEventListener('click', spinWheel);

//alert box
const alertOverlay = document.getElementById('alertOverlay');
const alertTitle = document.getElementById('alertTitle');
const alertMessage = document.getElementById('alertMessage');

function showAlert(message, title = 'Alert') {
  alertTitle.textContent = title;
  alertMessage.textContent = message;
  alertOverlay.classList.add('show');

  spinBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeAlert() {
  alertOverlay.classList.remove('show');
}

document.getElementById('setLoveBtn').addEventListener('click', () => {
    const input = document.getElementById('lovePercentage');
    const value = parseInt(input.value);

    if (value >= 0 && value <= 100) {
        lovePercentage = value;
        updateLoveMeter(value);
        localStorage.setItem('loveMeterPercent', value);
        checkSecretMode();
        showAlert(`Love percentage set to ${value}%! 💕`, 'Success');
    } else {
        showAlert('Please enter a value between 0 and 100!', 'Error');
    }
});

const loveInput = document.getElementById("lovePercentage");

loveInput.addEventListener("input", () => {
    // Remove all leading zeros
    loveInput.value = loveInput.value.replace(/^0+(?=\d)/, '');

    let value = parseInt(loveInput.value);

    if (isNaN(value)) return; // allow empty field

    if (value > 100) loveInput.value = 100;
    if (value < 0) loveInput.value = 0;
});


document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const theme = e.target.getAttribute('data-theme');
        switchTheme(theme);
    });
});

document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
        resultModal.style.display = 'none';
        miniGameModal.style.display = 'none';
    });
});

document.getElementById('shareWhatsApp').addEventListener('click', shareToWhatsApp);
document.getElementById('copyResult').addEventListener('click', copyResult);

window.onclick = (event) => {
    if (event.target === resultModal) {
        resultModal.style.display = 'none';
    }
    if (event.target === miniGameModal) {
        miniGameModal.style.display = 'none';
    }
};

function createBackgroundHearts() {
    setInterval(() => {
        const container = document.querySelector('.floating-hearts');
        const heart = document.createElement('div');
        heart.className = 'heart-float';
        heart.textContent = ['❤️', '💕', '💖', '💗', '💓', '💝'][Math.floor(Math.random() * 6)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (Math.random() * 15 + 10) + 'px';
        container.appendChild(heart);

        setTimeout(() => heart.remove(), 4000);
    }, 800);
}

loadProgress();
drawWheel();
createBackgroundHearts();
