// script.js — Love Alchemy (numerology-based, feature rich)
// Author: ChatGPT (adapt & enhance as you like)

/* ============================
   Configuration & Helpers
   ============================ */

// Pythagorean letter mapping
const LETTER_MAP = {
	A: 1,
	J: 1,
	S: 1,
	B: 2,
	K: 2,
	T: 2,
	C: 3,
	L: 3,
	U: 3,
	D: 4,
	M: 4,
	V: 4,
	E: 5,
	N: 5,
	W: 5,
	F: 6,
	O: 6,
	X: 6,
	G: 7,
	P: 7,
	Y: 7,
	H: 8,
	Q: 8,
	Z: 8,
	I: 9,
	R: 9,
}

// DOM elements
const name1El = document.getElementById('name1')
const name2El = document.getElementById('name2')
const calcBtn = document.getElementById('calcBtn')
const shareBtn = document.getElementById('shareBtn')
const percentText = document.getElementById('percentText')
const heading = document.getElementById('heading')
const description = document.getElementById('description')
const progressRing = document.querySelector('.ring')
const confettiToggle = document.getElementById('confettiToggle')
const soundToggle = document.getElementById('soundToggle')
const particleCanvas = document.getElementById('particleCanvas')
const allowJitterEl = document.getElementById('allowJitter')
const useMasterEl = document.getElementById('useMaster')
const resetBtn = document.getElementById('resetBtn')
const historyBtn = document.getElementById('historyBtn')
const historyPanel = document.getElementById('historyPanel')
const historyPopupOverlay = document.getElementById('historyPopupOverlay')
const closeHistoryPopup = document.getElementById('closeHistoryPopup')
const historyList = document.getElementById('historyList')
const clearHistory = document.getElementById('clearHistory')
const chime = document.getElementById('chime')
const themeToggleBtn = document.getElementById('themeToggleBtn')
// Premium UI elements
const app = document.querySelector('.app')
const moodIndicator = document.getElementById('moodIndicator')
const moodIcon = document.getElementById('moodIcon')
const moodLabel = document.getElementById('moodLabel')
const loveOracle = document.getElementById('loveOracle')
const oracleText = document.getElementById('oracleText')
// share preview modal elements
const sharePreviewOverlay = document.getElementById('sharePreviewOverlay')
const closeSharePreview = document.getElementById('closeSharePreview')
const shareCanvas = document.getElementById('shareCanvas')
const downloadImageBtn = document.getElementById('downloadImageBtn')
const copyImageBtn = document.getElementById('copyImageBtn')
const nativeShareBtn = document.getElementById('nativeShareBtn')

const feedbackBtn = document.getElementById('feedbackBtn')
const feedbackPopupOverlay = document.getElementById('feedbackPopupOverlay')
const shareLinkPopupOverlay = document.getElementById('shareLinkPopupOverlay')
const closeFeedbackPopup = document.getElementById('closeFeedbackPopup')
const closeShareLinkPopup = document.getElementById('closeShareLinkPopup')
const closeShareLinkBtn = document.getElementById('closeShareLinkBtn')
const copyShareLink = document.getElementById('copyShareLink')
const feedbackForm = document.getElementById('feedbackForm')
const cancelFeedback = document.getElementById('cancelFeedback')
const feedbackSuccess = document.getElementById('feedbackSuccess')
const feedbackList = document.getElementById('feedbackList')
const clearFeedbackBtn = document.getElementById('clearFeedback')
const ratingStars = document.querySelectorAll('.rating-stars .star')
const feedbackRatingInput = document.getElementById('feedbackRating')
const feedbackMessage = document.getElementById('feedbackMessage')
const charCount = document.getElementById('charCount')

let feedbacks = JSON.parse(localStorage.getItem('lovecalc_feedbacks')) || []

let confettiEnabled = true
let soundEnabled = false

// Setup canvas size
const ctx = particleCanvas.getContext ? particleCanvas.getContext('2d') : null
function resizeCanvas() {
	particleCanvas.width = window.innerWidth
	particleCanvas.height = window.innerHeight
}
resizeCanvas()
window.addEventListener('resize', resizeCanvas)

let oracleInterval; 

function typeOracleText(elementId, text, delay = 50) {
    const element = document.getElementById(elementId);

    if (oracleInterval) clearInterval(oracleInterval); // stop any running animation
    element.textContent = '';
    element.classList.add('oracle-text');

    let i = 0;
    const chars = [...text]; // splits text into proper Unicode characters
    oracleInterval = setInterval(() => {
        if (i < chars.length) {
            element.textContent += chars[i];
            i++;
        } else {
            clearInterval(oracleInterval);
            element.classList.remove('oracle-text');
        }
    }, delay);
}


/* ============================
   Numerology Logic
   ============================ */

function sanitizeName(s) {
	if (!s) return ''
	return s.replace(/[^A-Za-z]/g, '').toUpperCase()
}

function nameToNumber(name, supportMaster = true) {
	// Convert to letter values and sum
	name = sanitizeName(name)
	let sum = 0
	for (let ch of name) {
		if (LETTER_MAP[ch]) sum += LETTER_MAP[ch]
	}
	// Reduce: keep master numbers optionally
	if (supportMaster) {
		while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
			sum = sum
				.toString()
				.split('')
				.reduce((a, b) => a + parseInt(b), 0)
		}
	} else {
		while (sum > 9)
			sum = sum
				.toString()
				.split('')
				.reduce((a, b) => a + parseInt(b), 0)
	}
	return sum || 0
}

function combineNumbers(num1, num2, supportMaster = true) {
	let combined = num1 + num2
	if (supportMaster) {
		while (combined > 9 && combined !== 11 && combined !== 22 && combined !== 33) {
			combined = combined
				.toString()
				.split('')
				.reduce((a, b) => a + parseInt(b), 0)
		}
	} else {
		while (combined > 9)
			combined = combined
				.toString()
				.split('')
				.reduce((a, b) => a + parseInt(b), 0)
	}
	return combined
}

function mapToPercent(combined, num1, num2) {
	// A tuned mapping/formula for UX:
	// Base formula: transform combined into an attractive distribution
	// We treat master numbers with higher base values.
	let base
	if (combined === 11) base = 95
	else if (combined === 22) base = 99
	else if (combined === 33) base = 99
	else base = 30 + combined * 7 // gives 37..93-ish depending on combined

	// Boosts and penalties
	if (num1 === num2 && num1 !== 0) base += 6 // same core = better sync
	if ([11, 22, 33].includes(num1) || [11, 22, 33].includes(num2)) base += 6 // master influence
	// Favor odd mystical numbers a bit
	if (combined === 1) base = 92
	if (combined === 7) base += 10

	// Cap and final rounding
	base = Math.min(100, Math.max(1, Math.round(base)))
	return base
}

/* ============================
   UI helpers: ring animation
   ============================ */
const RADIUS = 64
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function setRing(percent) {
	const val = Math.max(0, Math.min(100, percent))
	const dash = (val / 100) * CIRCUMFERENCE
	progressRing.style.strokeDasharray = `${dash} ${CIRCUMFERENCE}`
	// color shift (green-ish for high, pink for mid)
	const hue = Math.round(340 - (val / 100) * 200) // pink -> greenish
	progressRing.style.filter = `drop-shadow(0 12px 24px rgba(255,46,99,${0.14 * (val / 100)}))`
	percentText.textContent = `${val}%`
}

/* ============================
   Message Generation
   ============================ */
function messageForPercent(p) {
	if (p >= 95) return '💞 Cosmic Bond — Truly rare!'
	if (p >= 85) return '💕 Soulmates in the making!'
	if (p >= 70) return '💖 Strong connection — nurture it!'
	if (p >= 50) return '✨ Promising — work & communicate!'
	if (p >= 30) return '🤍 Some sparks — effort required.'
	return '💔 Friendly vibes — maybe best as friends.'
}

/* ============================
    Mood & Tips System
   ============================ */

// Mood data with icons and CSS classes
const MOODS = {
	dreamy: { icon: '💫', label: 'Dreamy', class: 'mood-dreamy' },
	passionate: { icon: '🔥', label: 'Passionate', class: 'mood-passionate' },
	adventurous: { icon: '🌟', label: 'Adventurous', class: 'mood-adventurous' },
	flirty: { icon: '😍', label: 'Flirty', class: 'mood-flirty' },
	playful: { icon: '✨', label: 'Playful', class: 'mood-playful' },
	curious: { icon: '🤔', label: 'Curious', class: 'mood-curious' },
	friendly: { icon: '😊', label: 'Friendly', class: 'mood-friendly' },
	chill: { icon: '🤝', label: 'Chill', class: 'mood-chill' },
}

// Mood-specific tip collections
const MOOD_TIPS = {
	dreamy: [
		'🌙 Stargaze together tonight',
		'💌 Write them a heartfelt letter',
		'🎵 Create a dreamy playlist for them',
		'🌸 Leave a sweet note on their pillow',
		'☁️ Plan a cozy afternoon nap together',
	],
	passionate: [
		'💋 Surprise them with a passionate kiss',
		'🌹 Leave rose petals on their path',
		'🕯️ Set up a candlelit dinner',
		'💃 Dance together to your favorite song',
		'🔥 Write them a love poem',
	],
	adventurous: [
		'🗺️ Plan a spontaneous mini-adventure',
		'🥾 Go on an unexpected hike together',
		'🎢 Try something new and exciting',
		'📍 Explore a new place in your city',
		'🎯 Challenge them to a fun competition',
	],
	flirty: [
		'😉 Send them a cheeky text',
		'💄 Leave a lipstick mark on their mirror',
		'🍓 Feed them something sweet',
		'💐 Surprise them with their favorite flowers',
		'📱 Send a cute selfie with a flirty caption',
	],
	playful: [
		'🎈 Plan a silly photo shoot together',
		'🎮 Have a game night with their favorite games',
		'🍕 Build a blanket fort and order pizza',
		'🎭 Do silly impressions of each other',
		'🧩 Work on a puzzle together',
	],
	curious: [
		'❓ Ask them about their wildest dream',
		'📚 Share an interesting article with them',
		'🔍 Explore a new hobby together',
		'🎨 Try creating something artistic together',
		'🌟 Learn something new about each other',
	],
	friendly: [
		'☕ Share a warm cup of coffee',
		'🤗 Give them an unexpected hug',
		'📞 Call them just to hear their voice',
		'🍪 Bake their favorite treat together',
		'💬 Have a deep, meaningful conversation',
	],
	chill: [
		'🛋️ Have a relaxing movie marathon',
		'🧘 Try meditation or yoga together',
		'🍵 Enjoy a peaceful tea time',
		'📖 Read books in comfortable silence',
		'🌅 Watch the sunrise or sunset together',
	],
}

// Get mood based on compatibility score
function getMoodForPercent(p) {
	if (p >= 90) return MOODS.dreamy
	if (p >= 80) return MOODS.passionate
	if (p >= 70) return MOODS.adventurous
	if (p >= 60) return MOODS.flirty
	if (p >= 50) return MOODS.playful
	if (p >= 40) return MOODS.curious
	if (p >= 30) return MOODS.friendly
	return MOODS.chill
}

// Get random tip based on mood
function getRandomTipForMood(moodKey) {
	const tips = MOOD_TIPS[moodKey] || MOOD_TIPS.playful
	return tips[Math.floor(Math.random() * tips.length)]
}

// Apply mood theme to entire page
function applyMoodTheme(mood) {
	// Remove all existing mood classes
	Object.values(MOODS).forEach((m) => app.classList.remove(m.class))

	// Add current mood class
	app.classList.add(mood.class)

	// Update mood indicator
	moodIcon.textContent = mood.icon
	moodLabel.textContent = mood.label
	moodIndicator.classList.remove('hidden')
}

// Enhanced Oracle Messages with mystical flair

// Get mystical oracle message based on mood
function getMysticalOracleMessage(moodKey) {
	const messages = ORACLE_MESSAGES[moodKey] || ORACLE_MESSAGES.playful
	return messages[Math.floor(Math.random() * messages.length)]
}

// Show Love Oracle with magical animation
function showLoveOracle(message) {
	// oracleText.textContent = message
	typeOracleText('oracleText', message, 50);
	loveOracle.classList.remove('hidden')

	// Add typewriter effect delay
	setTimeout(() => {
		oracleText.style.animation = 'typewriterReveal 3s ease-out forwards'
	}, 200)
}

// Hide mood and oracle displays
function hideMoodAndTips() {
	moodIndicator.classList.add('hidden')
	loveOracle.classList.add('hidden')

	// Remove all mood classes
	Object.values(MOODS).forEach((m) => app.classList.remove(m.class))
}
function getRandomTip() {
	const tips = [
		'💌 Send a sweet message today',
		'☕ Plan a surprise coffee date',
		'🌅 Watch the sunrise together',
		'🎵 Share your favorite song',
		'🌸 Leave a cute note somewhere',
		'🍕 Cook something special together',
		'📚 Read the same book',
		'🌙 Stargaze tonight',
		'🎨 Try a creative activity together',
		'💐 Surprise with flowers',
		'🚶‍♀️ Take a romantic walk',
		'📷 Take a silly photo together',
	]
	return tips[Math.floor(Math.random() * tips.length)]
}

/* ============================
   Confetti & Heart Particles
   ============================ */

let particles = []
let particleAnimId = null

function random(min, max) {
	return Math.random() * (max - min) + min
}

class Particle {
	constructor(x, y, vx, vy, size, life, color, shape = 'confetti') {
		this.x = x
		this.y = y
		this.vx = vx
		this.vy = vy
		this.size = size
		this.life = life
		this.initialLife = life
		this.color = color
		this.shape = shape
		this.angle = Math.random() * Math.PI * 2
		this.spin = Math.random() * 0.2 - 0.1
	}
	update(dt) {
		this.x += this.vx * dt
		this.y += this.vy * dt
		this.vy += 0.02 * dt // gravity
		this.life -= dt
		this.angle += this.spin * dt
	}
	draw(ctx) {
		const alpha = Math.max(0, this.life / this.initialLife)
		ctx.save()
		ctx.globalAlpha = alpha
		ctx.translate(this.x, this.y)
		ctx.rotate(this.angle)
		if (this.shape === 'heart') {
			// draw simple heart
			const s = this.size
			ctx.beginPath()
			ctx.moveTo(0, s * 0.35)
			ctx.bezierCurveTo(-s * 0.6, -s * 0.6, -s * 1.2, s * 0.5, 0, s * 1.2)
			ctx.bezierCurveTo(s * 1.2, s * 0.5, s * 0.6, -s * 0.6, 0, s * 0.35)
			ctx.fillStyle = this.color
			ctx.fill()
		} else {
			// confetti rectangle
			ctx.fillStyle = this.color
			ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6)
		}
		ctx.restore()
	}
}

function spawnBurst(x, y, count = 40, heartChance = 0.25) {
	for (let i = 0; i < count; i++) {
		const speed = random(1, 6)
		const angle = random(0, Math.PI * 2)
		const vx = Math.cos(angle) * speed
		const vy = Math.sin(angle) * speed * 0.6 - random(1, 3) // upward bias
		const size = random(6, 18)
		const life = random(60, 120)
		const color =
			Math.random() > 0.5
				? `hsl(${Math.round(random(340, 360))}, 90%, ${Math.round(random(45, 65))}%)`
				: `hsl(${Math.round(random(0, 50))}, 85%, ${Math.round(random(55, 70))}%)`
		const shape = Math.random() < heartChance ? 'heart' : 'confetti'
		particles.push(new Particle(x, y, vx, vy, size, life, color, shape))
	}
}

let lastTime = performance.now()
function animateParticles(now) {
	const dt = Math.min(3, (now - lastTime) / 16) // normalized delta
	lastTime = now
	if (!ctx) return
	ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height)
	// update/draw
	for (let i = particles.length - 1; i >= 0; i--) {
		const p = particles[i]
		p.update(dt)
		p.draw(ctx)
		if (p.life <= 0 || p.y > particleCanvas.height + 100) particles.splice(i, 1)
	}
	if (particles.length > 0) particleAnimId = requestAnimationFrame(animateParticles)
	else particleAnimId = null
}

function triggerCelebration(percent) {
	// big celebration for high %
	const cx = particleCanvas.width / 2
	const cy = particleCanvas.height / 4
	if (percent >= 70) {
		spawnBurst(cx, cy, 120, 0.45)
	} else {
		spawnBurst(cx, cy, 50, 0.25)
	}
	if (!particleAnimId) {
		lastTime = performance.now()
		particleAnimId = requestAnimationFrame(animateParticles)
	}
}

/* ============================
   Small floating hearts background
   ============================ */

function createFloatingHeart() {
	const heart = document.createElement('div')
	heart.className = 'floating-heart'
	heart.style.position = 'fixed'
	heart.style.left = Math.random() * window.innerWidth + 'px'
	heart.style.top = window.innerHeight + 20 + 'px'
	heart.style.pointerEvents = 'none'
	heart.style.zIndex = 0
	heart.style.fontSize = `${Math.round(random(12, 36))}px`
	heart.style.opacity = `${random(0.25, 0.9)}`
	heart.style.transform = `translateY(0) rotate(${Math.random() * 360}deg)`
	heart.textContent = '❤'
	document.body.appendChild(heart)
	const duration = random(5, 14)
	heart.animate(
		[
			{ transform: `translateY(0)`, opacity: heart.style.opacity },
			{
				transform: `translateY(-${window.innerHeight + 200}px) rotate(${Math.random() * 720}deg)`,
				opacity: 0,
			},
		],
		{ duration: duration * 1000, easing: 'cubic-bezier(.2,.8,.2,1)' }
	)
	setTimeout(() => heart.remove(), duration * 1000 + 300)
}
setInterval(createFloatingHeart, 700)

/* ============================
   Storage: history
   ============================ */

const STORAGE_KEY = 'love_alchemy_history_v1'

function saveHistory(item) {
	const h = getHistory()
	h.unshift(item)
	// keep last 10
	while (h.length > 10) h.pop()
	localStorage.setItem(STORAGE_KEY, JSON.stringify(h))
	renderHistory()
}

function getHistory() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		return raw ? JSON.parse(raw) : []
	} catch (e) {
		return []
	}
}

function clearHistoryStorage() {
	localStorage.removeItem(STORAGE_KEY)
	renderHistory()
}

function renderHistory() {
	const h = getHistory()
	historyList.innerHTML = ''
	if (h.length === 0) {
		historyList.innerHTML =
			'<div style="color:var(--muted); font-size:13px">No history yet — calculate something romantic!</div>'
		return
	}
	for (const entry of h) {
		const el = document.createElement('div')
		el.className = 'history-item'
		const left = document.createElement('div')
		left.innerHTML = `<strong>${entry.name1}</strong> + <strong>${
			entry.name2
		}</strong><div style="color:var(--muted); font-size:12px">${new Date(
			entry.t
		).toLocaleString()}</div>`
		const right = document.createElement('div')
		right.innerHTML = `<div style="text-align:right"><span style="font-weight:800">${entry.percent}%</span><div style="font-size:12px;color:var(--muted)">${entry.msg}</div></div>`
		el.appendChild(left)
		el.appendChild(right)
		historyList.appendChild(el)
	}
}

/* ============================
   Share / URL
   ============================ */

function makeShareableUrl(name1, name2, percent) {
	const base = location.origin + location.pathname
	const params = new URLSearchParams({ n1: name1, n2: name2, p: percent })
	return `${base}?${params.toString()}`
}

function isValidName(name) {
	// Allows letters, spaces; rejects numbers, symbols
	return /^[A-Za-z\s]+$/.test(name.trim())
}

function alertDialog(message, title = 'Warning') {
	const alertBox = document.getElementById('customAlert')
	const alertTitle = document.getElementById('alertTitle')
	const alertMessage = document.getElementById('alertMessage')
	const alertBtn = document.getElementById('alertOkBtn')

	alertTitle.textContent = title
	alertMessage.textContent = message

	// Show alert
	alertBox.classList.add('show')

	// Hide alert on button click
	alertBtn.onclick = () => {
		alertBox.classList.remove('show')
	}
}

/* ============================
   Main calculate function
   ============================ */

function calculateLove() {
	const name1 = name1El.value.trim()
	const name2 = name2El.value.trim()
	const allowJitter = allowJitterEl.checked
	const supportMaster = useMasterEl.checked

	if (!name1 || !name2) {
		alertDialog('Please enter both names to calculate love ✨')
		return
	}

	if (!isValidName(name1) || !isValidName(name2)) {
		alertDialog('Please enter valid names: letters, spaces only.', 'Invalid Input')
		return
	}

	// Compute numerology numbers
	const num1 = nameToNumber(name1, supportMaster)
	const num2 = nameToNumber(name2, supportMaster)
	const combined = combineNumbers(num1, num2, supportMaster)

	// percent mapping
	let percent = mapToPercent(combined, num1, num2)

	// optional small random jitter for 'surprise' toggle
	if (allowJitter) {
		const jitter = Math.round(random(-5, 5))
		percent = Math.max(1, Math.min(100, percent + jitter))
	}

	// UI update: progress ring
	// animate ring smoothly
	animateRingTo(percent)
	const message = messageForPercent(percent)
	heading.textContent = `${name1} + ${name2}`
	description.textContent = message

	// Apply premium mood theme to entire page
	const mood = getMoodForPercent(percent)
	const romanticTip = getRandomTipForMood(mood.label.toLowerCase())

	applyMoodTheme(mood)
	showLoveOracle(romanticTip)

	// trigger party
	if (confettiEnabled) triggerCelebration(percent)
	if (soundEnabled) playChime(percent)

	// store in history (including mood and romantic tip)
	saveHistory({
		name1,
		name2,
		percent,
		msg: message,
		mood: mood.label,
		tip: romanticTip,
		t: Date.now(),
	})
}

function animateRingTo(targetPercent) {
	const raw = percentText.textContent || ''
	const parsed = parseInt(raw.replace(/[^\d]/g, ''), 10)
	const current = isNaN(parsed) ? 0 : parsed

	const duration = 1100
	const start = performance.now()

	function ease(t) {
		return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
	}

	function step(now) {
		const t = Math.min(1, (now - start) / duration)
		const eased = ease(t)
		const val = Math.round(current + (targetPercent - current) * eased)

		setRing(val)
		if (t < 1) {
			requestAnimationFrame(step)
		} else {
			setRing(targetPercent)
			percentText.textContent = `${targetPercent}%`
		}
	}
	requestAnimationFrame(step)
}

/* ============================
   Sound
   ============================ */
function playChime(percent) {
	try {
		const ctx = new (window.AudioContext || window.webkitAudioContext)()

		// tiny romantic arpeggio sequence
		const notes = [440, 550, 660] // simple rising notes
		const startTime = ctx.currentTime

		notes.forEach((freq, i) => {
			const osc = ctx.createOscillator()
			const gain = ctx.createGain()
			osc.type = 'triangle' // softer and pleasant
			osc.frequency.value = freq + percent // vary slightly by percent
			gain.gain.value = 0.0001 // start almost silent
			osc.connect(gain)
			gain.connect(ctx.destination)

			// fade in/out quickly
			gain.gain.linearRampToValueAtTime(0.08, startTime + i * 0.1 + 0.05)
			gain.gain.exponentialRampToValueAtTime(0.0001, startTime + i * 0.1 + 0.4)

			osc.start(startTime + i * 0.1)
			osc.stop(startTime + i * 0.1 + 0.5)
		})
	} catch (e) {
		console.error(e)
	}
}

/* ============================
   Event hookups
   ============================ */

calcBtn.addEventListener('click', () => {
	calculateLove()
})

shareBtn.addEventListener('click', (ev) => {
	ev.preventDefault()
	const name1 = name1El.value.trim()
	const name2 = name2El.value.trim()
	if (!name1 || !name2) {
		alert('Enter names to share result')
		return
	}
	// compute percent using current options but deterministic (no jitter)
	const num1 = nameToNumber(name1, useMasterEl.checked)
	const num2 = nameToNumber(name2, useMasterEl.checked)
	const combined = combineNumbers(num1, num2, useMasterEl.checked)
	const percent = mapToPercent(combined, num1, num2)

	if (!isValidName(name1) || !isValidName(name2) || !name1 || !name2) {
		alert('Please enter valid names: letters, spaces only.')
		return
	}

	// 1) copy classic URL to clipboard (existing behaviour)
	const url = makeShareableUrl(name1, name2, percent)
	navigator.clipboard
		?.writeText(url)
		.then(() => {
			// copied — proceed to image generation
		})
		.catch(() => {
			// ignore copy errors; still proceed to image generation
		})

	// 2) generate shareable image and open preview modal
	generateShareImage(name1, name2, percent, {
		theme: document.body.classList.contains('light-theme') ? 'light' : 'dark',
	})
		.then((blob) => {
			// show preview modal (canvas already drawn by generateShareImage)
			sharePreviewOverlay.classList.remove('hidden')
			// enable/disable native share button based on API
			nativeShareBtn.style.display =
				navigator.canShare &&
				navigator.canShare({ files: [new File([blob], 'love.png', { type: 'image/png' })] })
					? 'inline-block'
					: 'none'

			// wire download (use blob)
			downloadImageBtn.onclick = () => {
				const a = document.createElement('a')
				const url = URL.createObjectURL(blob)
				a.href = url
				a.download = `love-${name1.replace(/\s+/g, '_')}-${name2.replace(/\s+/g, '_')}.png`
				document.body.appendChild(a)
				a.click()
				a.remove()
				setTimeout(() => URL.revokeObjectURL(url), 1000)
			}

			copyImageBtn.onclick = async () => {
				try {
					// try ClipboardItem copy (may fail in some browsers)
					const file = new File([blob], 'love.png', { type: 'image/png' })
					// @ts-ignore navigator clipboard write
					await navigator.clipboard.write([new ClipboardItem({ [file.type]: file })])
					alert('Image copied to clipboard — paste into chat or apps that accept images.')
				} catch (err) {
					// fallback: open save dialog
					alert('Copying image failed in this browser. Use Download instead.')
				}
			}

			nativeShareBtn.onclick = async () => {
				try {
					const file = new File([blob], 'love.png', { type: 'image/png' })
					if (navigator.canShare && navigator.canShare({ files: [file] })) {
						await navigator.share({
							files: [file],
							title: 'Love Alchemy',
							text: `${name1} + ${name2} — ${percent}%`,
						})
					} else {
						alert('Native share is not available for files in this browser.')
					}
				} catch (err) {
					console.error(err)
					alert('Sharing failed.')
				}
			}
		})
		.catch((err) => {
			console.error('Error generating share image:', err)
			alert('Could not generate image. You can still share the link copied to clipboard.')
		})
})

confettiToggle.addEventListener('click', () => {
	confettiEnabled = !confettiEnabled
	confettiToggle.classList.toggle('active', confettiEnabled)
	confettiToggle.textContent = confettiEnabled ? '🎊 Confetti (on)' : '🎊 Confetti (off)'
})

soundToggle.addEventListener('click', () => {
	soundEnabled = !soundEnabled
	soundToggle.classList.toggle('active', soundEnabled)
	soundToggle.textContent = soundEnabled ? '🔈 Sound (on)' : '🔈 Sound (off)'
})

resetBtn.addEventListener('click', () => {
	name1El.value = ''
	name2El.value = ''
	heading.textContent = 'Waiting for names...'
	description.textContent = 'Try entering your names and press Calculate.'
	animateRingTo(0)
})

// History popup functionality
closeSharePreview.addEventListener('click', () => {
	sharePreviewOverlay.classList.add('hidden')
})

// also close on overlay click / ESC if you want:
sharePreviewOverlay.addEventListener('click', (e) => {
	if (e.target === sharePreviewOverlay) sharePreviewOverlay.classList.add('hidden')
})
document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape' && !sharePreviewOverlay.classList.contains('hidden')) {
		sharePreviewOverlay.classList.add('hidden')
	}
})

// Close popup with Escape key
document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape' && !historyPopupOverlay.classList.contains('hidden')) {
		historyPopupOverlay.classList.add('hidden')
	}
})

clearHistory.addEventListener('click', () => {
	if (confirm('Clear saved history?')) clearHistoryStorage()
})
let currentTheme = localStorage.getItem('theme') || 'dark'

function applyTheme(theme) {
	document.body.classList.toggle('light-theme', theme === 'light')
	themeToggleBtn.textContent = theme === 'light' ? '☀️ Theme' : '🌙 Theme'
	localStorage.setItem('theme', theme)
	currentTheme = theme
}

function toggleTheme() {
	const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
	applyTheme(newTheme)
}

themeToggleBtn.addEventListener('click', toggleTheme)

/* initialize */
renderHistory()
setRing(0)
;(function init() {
	try {
		const savedTheme = localStorage.getItem('theme') || 'dark'
		applyTheme(savedTheme)

		const params = new URLSearchParams(location.search)
		const n1 = params.get('n1')
		const n2 = params.get('n2')
		const p = parseInt(params.get('p'))

		if (n1 && n2 && !isNaN(p)) {
			name1El.value = n1
			name2El.value = n2
			setTimeout(() => {
				animateRingTo(p)
				heading.textContent = `${n1} + ${n2}`
				description.textContent = messageForPercent(p)
				triggerCelebration(p)
			}, 600)
		}
	} catch (e) {
		console.error('Error loading theme or URL params:', e)
	}
})()

/**
 * generateShareImage (premium, centered, smaller)
 * Draws a square premium card (900x900) and returns a Promise that resolves to a Blob.
 * Centered layout: names (top), percent + ring (center), message & branding (bottom).
 */
function generateShareImage(name1, name2, percent, opts = {}) {
	const canvas = shareCanvas // reuse modal canvas for preview
	const size = 900 // square card (smaller)
	canvas.width = size
	canvas.height = size
	const ctx = canvas.getContext('2d')

	// --- Palette & theme ---
	const accent1 = '#ff7a7a'
	const accent2 = '#ff2e63'
	const roseGold = '#f9c6b8'
	const deep = '#2b0f1e' // deep wine
	const softDark = 'rgba(20,10,14,0.72)'
	const cardGlass = 'rgba(255,255,255,0.04)'
	const textLight = '#fff'
	const textDark = '#111'

	const isLight = opts.theme === 'light'

	// --- Background: luxe rose gradient with subtle noise-ish vignette ---
	const g = ctx.createLinearGradient(0, 0, size, size)
	g.addColorStop(0, '#3a0b17') // deep
	g.addColorStop(0.35, '#5a1222')
	g.addColorStop(1, '#1c0a12')
	ctx.fillStyle = g
	ctx.fillRect(0, 0, size, size)

	// soft diagonal glow top-left
	const glow = ctx.createLinearGradient(0, 0, size * 0.7, size * 0.7)
	glow.addColorStop(0, 'rgba(255,110,130,0.12)')
	glow.addColorStop(1, 'rgba(0,0,0,0.0)')
	ctx.fillStyle = glow
	ctx.fillRect(0, 0, size, size)

	// vignette
	ctx.fillStyle = 'rgba(0,0,0,0.18)'
	ctx.beginPath()
	ctx.ellipse(size / 2, size / 2, size * 0.55, size * 0.55, 0, 0, Math.PI * 2)
	ctx.fill()

	// subtle rounded card glass panel
	ctx.save()
	roundRectPath(ctx, 36, 36, size - 72, size - 72, 28)
	ctx.fillStyle = 'rgba(255,255,255,0.035)'
	ctx.fill()
	// inner glow border
	ctx.lineWidth = 1
	ctx.strokeStyle = 'rgba(255,255,255,0.06)'
	ctx.stroke()
	ctx.restore()

	// --- Header: names ---
	ctx.textAlign = 'center'
	ctx.fillStyle = textLight
	ctx.font = '700 42px Poppins, sans-serif'
	const headerY = 160
	// Show names with space and a heart glyph between them
	ctx.font = '800 48px Poppins, sans-serif'
	const nameLine = `${name1}  ❤  ${name2}`
	// subtle text shadow for premium depth
	ctx.shadowColor = 'rgba(0,0,0,0.5)'
	ctx.shadowBlur = 12
	ctx.fillText(nameLine, size / 2, headerY)
	ctx.shadowBlur = 0

	// small subtitle under names
	ctx.font = '500 16px Poppins, sans-serif'
	ctx.fillStyle = 'rgba(255,255,255,0.88)'
	ctx.fillText('Soul chemistry • Numerology • Private', size / 2, headerY + 28)

	// --- Main: percentage ring in center ---
	const cx = size / 2
	const cy = size / 2 + 20
	const outerR = 150
	// soft drop shadow behind ring
	ctx.save()
	ctx.beginPath()
	ctx.fillStyle = 'rgba(0,0,0,0.3)'
	ctx.ellipse(cx + 6, cy + 10, outerR + 12, outerR + 8, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.restore()

	// background ring (subtle)
	ctx.beginPath()
	ctx.lineWidth = 18
	ctx.strokeStyle = 'rgba(255,255,255,0.06)'
	ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
	ctx.stroke()

	// gradient arc for percent
	const ringGrad = ctx.createLinearGradient(cx - outerR, cy, cx + outerR, cy)
	ringGrad.addColorStop(0, accent1)
	ringGrad.addColorStop(0.6, accent2)
	ringGrad.addColorStop(1, roseGold)
	ctx.lineCap = 'round'
	ctx.lineWidth = 20
	ctx.strokeStyle = ringGrad

	const startAngle = -Math.PI / 2
	const endAngle = startAngle + Math.PI * 2 * (Math.max(0, Math.min(100, percent)) / 100)
	ctx.beginPath()
	ctx.arc(cx, cy, outerR, startAngle, endAngle)
	ctx.stroke()

	// inner glass circle for inner content
	ctx.beginPath()
	ctx.fillStyle = 'rgba(0,0,0,0.18)'
	ctx.arc(cx, cy, outerR - 36, 0, Math.PI * 2)
	ctx.fill()

	// big percent text
	ctx.fillStyle = '#fff'
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'
	ctx.font = '800 92px Poppins, sans-serif'
	// soft gold glow for premium impression
	ctx.shadowColor = 'rgba(255,110,140,0.28)'
	ctx.shadowBlur = 24
	ctx.fillText(`${percent}%`, cx, cy - 6)
	ctx.shadowBlur = 0

	// small halo heart animation-ish mark (static in image)
	ctx.save()
	ctx.fillStyle = accent2
	ctx.beginPath()
	ctx.moveTo(cx + outerR - 28, cy + outerR - 20)
	ctx.bezierCurveTo(
		cx + outerR + 6,
		cy + outerR - 70,
		cx + outerR + 90,
		cy + outerR - 20,
		cx + outerR - 28,
		cy + outerR + 36
	)
	ctx.bezierCurveTo(
		cx + outerR - 130,
		cy + outerR - 20,
		cx + outerR - 20,
		cy + outerR - 70,
		cx + outerR - 28,
		cy + outerR - 20
	)
	ctx.fill()
	ctx.restore()

	// --- Bottom: message + branding ---
	const msg = messageForPercent(percent)
	ctx.font = '600 18px Poppins, sans-serif'
	ctx.fillStyle = 'rgba(255,255,255,0.92)'
	wrapTextCenter(ctx, msg, cx, cy + outerR + 48, size - 160, 26)

	// tiny footer line
	ctx.font = '500 12px Poppins, sans-serif'
	ctx.fillStyle = 'rgba(255,255,255,0.5)'
	ctx.fillText('Love Alchemy • premium card • no data leaves your browser', cx, size - 48)

	// final vignette overlay (soft)
	ctx.fillStyle = 'rgba(0,0,0,0.06)'
	ctx.fillRect(36, 36, size - 72, size - 72)

	// return PNG blob (high quality)
	return new Promise((resolve) => {
		canvas.toBlob(
			(blob) => {
				resolve(blob)
			},
			'image/png',
			0.96
		)
	})
}

/* --- helper: rounded rectangle path (no immediate fill) --- */
function roundRectPath(ctx, x, y, w, h, r) {
	ctx.beginPath()
	ctx.moveTo(x + r, y)
	ctx.lineTo(x + w - r, y)
	ctx.quadraticCurveTo(x + w, y, x + w, y + r)
	ctx.lineTo(x + w, y + h - r)
	ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
	ctx.lineTo(x + r, y + h)
	ctx.quadraticCurveTo(x, y + h, x, y + h - r)
	ctx.lineTo(x, y + r)
	ctx.quadraticCurveTo(x, y, x + r, y)
	ctx.closePath()
}

/* --- helper: center-wrapping text (multi-line) --- */
function wrapTextCenter(ctx, text, cx, startY, maxWidth, lineHeight) {
	const words = text.split(' ')
	let line = ''
	const lines = []
	for (let i = 0; i < words.length; i++) {
		const test = line + words[i] + ' '
		const metrics = ctx.measureText(test)
		if (metrics.width > maxWidth && line.length > 0) {
			lines.push(line.trim())
			line = words[i] + ' '
		} else {
			line = test
		}
	}
	if (line.trim()) lines.push(line.trim())
	// draw centered lines
	ctx.textAlign = 'center'
	for (let i = 0; i < lines.length; i++) {
		ctx.fillText(lines[i], cx, startY + i * lineHeight)
	}
}

function drawMiniHearts(ctx, x, y) {
	ctx.save()
	ctx.fillStyle = '#ff7a7a'
	ctx.beginPath()
	ctx.moveTo(x, y)
	ctx.bezierCurveTo(x - 10, y - 20, x - 50, y + 2, x, y + 28)
	ctx.bezierCurveTo(x + 50, y + 2, x + 10, y - 20, x, y)
	ctx.fill()
	ctx.restore()
}
const shareWhatsapp = document.getElementById('shareWhatsapp')
const shareTwitter = document.getElementById('shareTwitter')
const shareFacebook = document.getElementById('shareFacebook')
const shareInstagram = document.getElementById('shareInstagram')
const copyLinkBtn = document.getElementById('copyLinkBtn')

function getShareText() {
	const name1 = document.getElementById('name1').value || 'YourName'
	const name2 = document.getElementById('name2').value || 'CrushName'
	const percent = document.getElementById('percentText').textContent || '--%'
	const url = window.location.href
	return `Check our love compatibility! 💖 ${name1} + ${name2} = ${percent}\nSee more: ${url}`
}

// WhatsApp
shareWhatsapp.addEventListener('click', () => {
	const text = encodeURIComponent(getShareText())
	shareWhatsapp.href = `https://wa.me/?text=${text}`
})

// Twitter
shareTwitter.addEventListener('click', () => {
	const text = encodeURIComponent(getShareText())
	shareTwitter.href = `https://twitter.com/intent/tweet?text=${text}`
})

// Facebook
shareFacebook.addEventListener('click', () => {
	const url = encodeURIComponent(window.location.href)
	shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`
})

// Instagram
shareInstagram.addEventListener('click', () => {
    const pageUrl = window.location.href;

    navigator.clipboard.writeText(pageUrl).then(() => {
        // --- This part gives the user feedback ---

        // 1. Let the user know the link was copied successfully
        alert('Link copied! You can now paste it into your Instagram story or bio.');

        // 2. (Optional) Temporarily change the button's text
        const originalText = shareInstagram.textContent;
        shareInstagram.textContent = 'Copied!';

        // 3. Change it back after a few seconds
        setTimeout(() => {
            shareInstagram.textContent = originalText;
        }, 3000); // 3000 milliseconds = 3 seconds

    }).catch(err => {
        // If it fails, log the error and inform the user
        console.error('Failed to copy the link:', err);
        alert('Sorry, we could not copy the link to your clipboard.');
    });
});

// Copy Link
copyLinkBtn.addEventListener('click', () => {
	navigator.clipboard
		.writeText(window.location.href)
		.then(() => {
			document.getElementById('shareLinkInput').value = window.location.href
			shareLinkPopupOverlay.classList.remove('hidden')
		})
		.catch(() => alert('Failed to copy link'))
})

copyShareLink.addEventListener('click', () => {
	navigator.clipboard
		.writeText(window.location.href)
		.then(() => {
			document.getElementById('shareLinkInput').value = window.location.href
			shareLinkPopupOverlay.classList.remove('hidden')
		})
		.catch(() => alert('Failed to copy link'))
})

historyBtn.addEventListener('click', () => {
	historyPopupOverlay.classList.remove('hidden')
})

closeHistoryPopup.addEventListener('click', () => {
	historyPopupOverlay.classList.add('hidden')
})
;(function attachHistoryDeleteButtons() {
	function getKeyFromItem(itemEl) {
		try {
			const left = itemEl.querySelector('div:first-child') || itemEl.children[0]
			const right =
				itemEl.querySelector('div:last-child') || itemEl.children[itemEl.children.length - 1]
			let leftText = left ? left.innerText : itemEl.innerText
			leftText = leftText.split('\n')[0].trim()
			const percentMatch = itemEl.innerText.match(/(\d{1,3})\s*%/)
			const percent = percentMatch ? parseInt(percentMatch[1], 10) : null
			return { leftText, percent }
		} catch (e) {
			return null
		}
	}

	function removeHistoryEntryByKey(key) {
		try {
			const raw = localStorage.getItem(STORAGE_KEY)
			if (!raw) return false
			const arr = JSON.parse(raw)
			const idx = arr.findIndex((it) => {
				const candidate = `${it.name1} + ${it.name2}`
				const a = (candidate || '').trim().toLowerCase()
				const b = (key.leftText || '').trim().toLowerCase()
				const percentMatch = it.percent == key.percent
				return a === b && percentMatch
			})
			if (idx >= 0) {
				arr.splice(idx, 1)
				localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
				return true
			}
			if (key.percent != null) {
				const idx2 = arr.findIndex((it) => it.percent == key.percent)
				if (idx2 >= 0) {
					arr.splice(idx2, 1)
					localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
					return true
				}
			}
		} catch (e) {
			console.error('removeHistoryEntryByKey error', e)
		}
		return false
	}

	function makeDeleteButton() {
		const btn = document.createElement('button')
		btn.className = 'delete-history-btn'
		btn.title = 'Delete entry'
		btn.setAttribute('aria-label', 'Delete this history entry')
		btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 11v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M14 11v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9 6l1-2h4l1 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>`
		return btn
	}

	function injectButtonIntoItem(itemEl) {
		if (itemEl.querySelector('.delete-history-btn')) return
		const right = itemEl.querySelector('div:last-child')
		const btn = makeDeleteButton()
		btn.addEventListener('click', (ev) => {
			ev.stopPropagation()
			const key = getKeyFromItem(itemEl)
			itemEl.animate(
				[
					{ opacity: 1, transform: 'translateX(0) scale(1)' },
					{ opacity: 0, transform: 'translateX(20px) scale(0.98)' },
				],
				{ duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' }
			)
			setTimeout(() => {
				const removed = removeHistoryEntryByKey(key || {})
				renderHistory()
				if (!removed) console.warn('Could not deterministically remove entry; storage unchanged.')
			}, 240)
		})
		if (right) {
			const wrapper = document.createElement('div')
			wrapper.style.display = 'flex'
			wrapper.style.justifyContent = 'flex-end'
			wrapper.style.marginTop = '6px'
			wrapper.appendChild(btn)
			right.appendChild(wrapper)
		} else {
			itemEl.appendChild(btn)
		}
	}

	const observer = new MutationObserver((mutations) => {
		for (const m of mutations) {
			if (m.type === 'childList' && m.addedNodes.length) {
				m.addedNodes.forEach((node) => {
					if (node.nodeType === 1 && node.classList.contains('history-item'))
						injectButtonIntoItem(node)
				})
			}
		}
		historyList.querySelectorAll('.history-item').forEach((el) => injectButtonIntoItem(el))
	})

	if (historyList) {
		observer.observe(historyList, { childList: true, subtree: false })
		historyList.querySelectorAll('.history-item').forEach((el) => injectButtonIntoItem(el))
	}
})()

feedbackBtn.addEventListener('click', () => {
	feedbackPopupOverlay.classList.remove('hidden')
	renderFeedbackList()
})

// Close feedback popup
closeFeedbackPopup.addEventListener('click', () => {
	feedbackPopupOverlay.classList.add('hidden')
	resetFeedbackForm()
})

// Close share link popup
closeShareLinkPopup.addEventListener('click', () => {
	shareLinkPopupOverlay.classList.add('hidden')
})

// Cancel shareLink popup
closeShareLink.addEventListener('click', () => {
	shareLinkPopupOverlay.classList.add('hidden')
})

cancelFeedback.addEventListener('click', () => {
	feedbackPopupOverlay.classList.add('hidden')
	resetFeedbackForm()
})

// Close on overlay click
feedbackPopupOverlay.addEventListener('click', (e) => {
	if (e.target === feedbackPopupOverlay) {
		feedbackPopupOverlay.classList.add('hidden')
		resetFeedbackForm()
	}
})

// Rating stars functionality
ratingStars.forEach((star) => {
	star.addEventListener('click', () => {
		const rating = parseInt(star.getAttribute('data-rating'))
		feedbackRatingInput.value = rating

		ratingStars.forEach((s) => {
			const starRating = parseInt(s.getAttribute('data-rating'))
			if (starRating <= rating) {
				s.classList.add('active')
			} else {
				s.classList.remove('active')
			}
		})
	})

	star.addEventListener('mouseenter', () => {
		const rating = parseInt(star.getAttribute('data-rating'))
		ratingStars.forEach((s) => {
			const starRating = parseInt(s.getAttribute('data-rating'))
			if (starRating <= rating) {
				s.style.filter = 'grayscale(0%)'
				s.style.opacity = '1'
			} else {
				s.style.filter = 'grayscale(100%)'
				s.style.opacity = '0.4'
			}
		})
	})
})

document.querySelector('.rating-stars').addEventListener('mouseleave', () => {
	const currentRating = parseInt(feedbackRatingInput.value)
	ratingStars.forEach((s) => {
		const starRating = parseInt(s.getAttribute('data-rating'))
		if (starRating <= currentRating) {
			s.style.filter = 'grayscale(0%)'
			s.style.opacity = '1'
		} else {
			s.style.filter = 'grayscale(100%)'
			s.style.opacity = '0.4'
		}
	})
})

// Character count for textarea
feedbackMessage.addEventListener('input', () => {
	charCount.textContent = feedbackMessage.value.length
})

// Submit feedback
feedbackForm.addEventListener('submit', (e) => {
	e.preventDefault()

	const name = document.getElementById('feedbackName').value.trim() || 'Anonymous'
	const email = document.getElementById('feedbackEmail').value.trim()
	const rating = parseInt(feedbackRatingInput.value)
	const message = feedbackMessage.value.trim()

	if (rating === 0) {
		alert('Please select a rating!')
		return
	}

	if (!message) {
		alert('Please enter your feedback!')
		return
	}

	const feedback = {
		id: Date.now(),
		name,
		email,
		rating,
		message,
		date: new Date().toISOString(),
	}

	feedbacks.unshift(feedback)
	localStorage.setItem('lovecalc_feedbacks', JSON.stringify(feedbacks))

	// Show success message
	feedbackForm.style.display = 'none'
	feedbackSuccess.classList.remove('hidden')

	// Play sound if enabled
	if (soundEnabled) {
		playChime()
	}

	// Reset after 2 seconds
	setTimeout(() => {
		feedbackForm.style.display = 'flex'
		feedbackSuccess.classList.add('hidden')
		resetFeedbackForm()
		renderFeedbackList()
	}, 2000)
})

// Render feedback list
function renderFeedbackList() {
	if (feedbacks.length === 0) {
		feedbackList.innerHTML =
			'<p style="text-align:center; color: var(--text-secondary);">No feedback yet. Be the first!</p>'
		return
	}

	feedbackList.innerHTML = feedbacks
		.map((fb) => {
			const date = new Date(fb.date)
			const formattedDate =
				date.toLocaleDateString() +
				' ' +
				date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
			const stars = '⭐'.repeat(fb.rating)

			return `
      <div class="feedback-item">
        <div class="feedback-item-header">
          <span class="feedback-item-name">${escapeHtml(fb.name)}</span>
          <span class="feedback-item-rating">${stars}</span>
        </div>
        <div class="feedback-item-date">${formattedDate}</div>
        <div class="feedback-item-message">${escapeHtml(fb.message)}</div>
        ${fb.email ? `<div class="feedback-item-email">${escapeHtml(fb.email)}</div>` : ''}
      </div>
    `
		})
		.join('')
}

// Clear all feedbacks
// clearFeedbackBtn.addEventListener('click', () => {
// 	if (confirm('Are you sure you want to clear all feedback?')) {
// 		feedbacks = []
// 		localStorage.removeItem('lovecalc_feedbacks')
// 		renderFeedbackList()
// 	}
// })

// Reset feedback form
function resetFeedbackForm() {
	feedbackForm.reset()
	feedbackRatingInput.value = '0'
	ratingStars.forEach((s) => s.classList.remove('active'))
	charCount.textContent = '0'
	feedbackSuccess.classList.add('hidden')
	feedbackForm.style.display = 'flex'
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
	const div = document.createElement('div')
	div.textContent = text
	return div.innerHTML
}

/* ============================
  Love-Card Generator
============================ */

document.getElementById('generateLoveCard').addEventListener('click', async function() {
    
  const percentText = document.getElementById('percentText').textContent;

  if (percentText === '0%') {
    alertDialog('Please calculate love compatibility first!', 'Notice');
    return;
  }

    //required elements to be captured in the love-card
  const resultArea = document.querySelector('.result-area');
  const loveOracle = document.getElementById('loveOracle');

    
    // check if oracle is visible and can be included
  const includeOracle = !loveOracle.classList.contains('hidden');

  try {
    // ✅ Lazy-load html2canvas if not already loaded
    if (typeof html2canvas === 'undefined') {
      await loadHtml2Canvas();
    }

    // Create a temporary container with proper styling
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position: absolute;
      left: -99999px;
      top: 0;
      width: 600px;
      padding: 40px;
      background: linear-gradient(135deg, #2b0f1e 0%, #1c0a12 100%);
      border-radius: 20px;
      box-sizing: border-box;
    `;

        // Clone and add result area
    const resultClone = resultArea.cloneNode(true);
    resultClone.style.cssText = 'margin: 0; padding: 20px 0;';
    wrapper.appendChild(resultClone);

        // Clone and add oracle if visible
    if (includeOracle) {
    
      const oracleClone = loveOracle.cloneNode(true);
      oracleClone.classList.remove('hidden');
          oracleClone.style.cssText = 'margin-top: 2rem; display: block !important; opacity: 1 !important;';
    
            // increasing opacity
            const allElements = oracleClone.querySelectorAll('*');
            allElements.forEach(e => {
        e.style.opacity = '1';
        e.style.animation = 'none';
      });
    
      wrapper.appendChild(oracleClone);
      console.log('Oracle cloned and added');
                }
          else {
              console.log('Failed to capture Oracle');
    }

        //appending wrapper to body
    document.body.appendChild(wrapper);
        
        // waiting for styles to apply
    await new Promise(resolve => setTimeout(resolve, 100));

        if (typeof html2canvas === 'undefined') {
            throw new Error('html2canvas library not loaded');
        }
        
        
        
        // capture the screenshot with html2canvas
    const canvas = await html2canvas(wrapper, {
      backgroundColor: '#2b0f1e',
      scale: 2,
      logging: true,
      useCORS: true,
      allowTaint: true,
      width: wrapper.offsetWidth,
            height: wrapper.offsetHeight
    });

        //removing the temporary wrapper
    document.body.removeChild(wrapper);

        // blob conversion
    canvas.toBlob(function(blob) {
            
            
      if (!blob) {
        alertDialog('Failed to generate image blob.', 'Error');
        return;
      }
            

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const name1 = document.getElementById('name1').value.replace(/[^a-z0-9]/gi, '_') || 'You';
      const name2 = document.getElementById('name2').value.replace(/[^a-z0-9]/gi, '_') || 'Crush';
      const filename = `love-card-${name1}-${name2}-${Date.now()}.png`;
      link.download = filename;
      link.href = url;
            
            
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 100);
            
            
      alertDialog('Love Card downloaded successfully! 💖', 'Success');
    }, 'image/png');
        
    } 
    catch (error) {
    alertDialog('Failed to generate love card. Error: ' + error.message, 'Error');
  }
});

/* ============================
  Lazy Load html2canvas
============================ */

async function loadHtml2Canvas() {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-html2canvas]');
    if (existing) {
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.dataset.html2canvas = 'true';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load html2canvas library.'));
    document.body.appendChild(script);
  });
}


//back to top button
 document.addEventListener('DOMContentLoaded', () => {
            const backToTopButton = document.querySelector('.backtop');
            
            // Function to toggle the 'visible' class based on scroll position
            const toggleVisibility = () => {
                // Show button when user scrolls down more than 300 pixels
                if (window.scrollY > 300) {
                    backToTopButton.classList.add('visible');
                } else {
                    backToTopButton.classList.remove('visible');
                }
            };

            // Attach the function to the window scroll event
            window.addEventListener('scroll', toggleVisibility);
            
            // Run the check once when the page loads (in case of refresh)
            toggleVisibility();
        });