(() => {
  // Floating hearts background (Games-like subtle effect)
  const heartsContainer = document.querySelector('.floating-hearts');
  if (heartsContainer) {
    setInterval(() => {
      const heart = document.createElement('div');
      heart.className = 'heart-float';
      heart.textContent = ['❤️','💕','💖','💗','💓'][Math.floor(Math.random()*5)];
      heart.style.position = 'absolute';
      heart.style.left = Math.random()*100 + '%';
      heart.style.fontSize = (Math.random()*12 + 10) + 'px';
      heart.style.animation = 'floatUp 4s ease-in infinite';
      heart.style.opacity = '0';
      heartsContainer.appendChild(heart);
      setTimeout(()=> heart.remove(), 4000);
    }, 900);
  }
  const EMOJIS = ['🌹', '💌', '🍫', '💎', '🍷', '🎵', '🐻', '🌙'];
  let cards = [...EMOJIS, ...EMOJIS];

  const grid = document.getElementById('grid');
  const movesEl = document.getElementById('moves');
  const matchesEl = document.getElementById('matches');
  const messageEl = document.getElementById('message');
  const bestEl = document.getElementById('best');
  const restartBtn = document.getElementById('restart');

  const resultModal = document.getElementById('resultModal');
  const resultTitle = document.getElementById('resultTitle');
  const resultText = document.getElementById('resultText');
  const resultDescription = document.getElementById('resultDescription');
  const resultActions = document.getElementById('resultActions');
  const shareBtn = document.getElementById('shareWhatsApp');
  const copyBtn = document.getElementById('copyResult');

  let first = null, second = null, lock = false, moves = 0, matches = 0;

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildGrid() {
    grid.innerHTML = '';
    shuffle(cards);
    cards.forEach((emoji, idx) => {
      const el = document.createElement('div');
      el.className = 'card';
      el.dataset.value = emoji;
      el.dataset.index = idx;
      el.innerHTML = `
        <div class="card-inner face front">?</div>
        <div class="card-inner face back">${emoji}</div>
      `;
      el.addEventListener('click', onCardClick);
      grid.appendChild(el);
    });
  }

  function onCardClick(e) {
    if (lock) return;
    const card = e.currentTarget;
    if (card.classList.contains('matched') || card.classList.contains('back')) return;

    flip(card);

    if (!first) { first = card; return; }
    second = card;
    lock = true;
    moves++;
    movesEl.textContent = moves;

    if (first.dataset.value === second.dataset.value) {
      setTimeout(() => {
        first.classList.add('matched');
        second.classList.add('matched');
        showMessage(randomCompliment());
        matches++;
        matchesEl.textContent = matches;
        resetSelection();
        if (matches === EMOJIS.length) onWin();
      }, 300);
    } else {
      setTimeout(() => {
        flipBack(first);
        flipBack(second);
        resetSelection();
        clearMessage();
      }, 700);
    }
  }

  function flip(card) { card.classList.add('back'); }
  function flipBack(card) { card.classList.remove('back'); }
  function resetSelection() { first = null; second = null; lock = false; }
  function randomCompliment() {
    const texts = ["You found a match! 💘","Sweet connection 🍫","Perfect pair 💞","Lovely combo 🌹","Adorable find 🐻","Heart match 💝"];
    return texts[Math.floor(Math.random() * texts.length)];
  }
  function showMessage(text) { messageEl.textContent = text; }
  function clearMessage() { messageEl.textContent = ''; }

  function onWin() {
    resultTitle.textContent = "🎉 Congratulations! 🎉";
    resultText.textContent = `You matched all love cards in ${moves} moves! 💖`;
    resultDescription.textContent = "Share your score with your partner and see if they can beat it!";
    resultActions.style.display = 'flex'; // Show WhatsApp buttons
    resultModal.style.display = 'flex';
  }

  shareBtn.addEventListener('click', () => {
    const message = `I just completed the Love Memory Match in ${moves} moves! 💖 Try to beat me: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  });

  copyBtn.addEventListener('click', () => {
    const message = `I just completed the Love Memory Match in ${moves} moves! 💖`;
    navigator.clipboard.writeText(message).then(() => alert('Result copied! 📋💕'));
  });

  restartBtn.addEventListener('click', () => {
    moves = 0; matches = 0;
    movesEl.textContent = '0';
    matchesEl.textContent = '0';
    clearMessage();
    resultActions.style.display = 'none';
    resultModal.style.display = 'none';
    buildGrid();
  });

  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => resultModal.style.display = 'none');
  });

  window.onclick = (event) => {
    if (event.target === resultModal) resultModal.style.display = 'none';
  };

  buildGrid();
})();
