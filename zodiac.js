// zodiac.js
// Zodiac compatibility logic (deterministic, lightweight)
// Designed to be included alongside your Love-Calculator project

const SIGNS = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];

const ELEMENT = {
  Aries: "Fire", Leo: "Fire", Sagittarius: "Fire",
  Taurus: "Earth", Virgo: "Earth", Capricorn: "Earth",
  Gemini: "Air", Libra: "Air", Aquarius: "Air",
  Cancer: "Water", Scorpio: "Water", Pisces: "Water"
};

// populate selects
function populateSelects(){
  const a = document.getElementById('signA');
  const b = document.getElementById('signB');
  SIGNS.forEach(s => {
    const o1 = document.createElement('option');
    o1.value = s; o1.textContent = s;
    a.appendChild(o1);
    const o2 = document.createElement('option');
    o2.value = s; o2.textContent = s;
    b.appendChild(o2);
  });
}

// simple deterministic hash for small jitter (keeps results repeatable)
function smallHash(a,b){
  const s = (a + '|' + b).toLowerCase();
  let h = 0;
  for(let i=0;i<s.length;i++) h = (h*31 + s.charCodeAt(i)) >>> 0;
  return h % 7; // returns 0..6
}

// base score logic by elements
function baseScore(sign1, sign2){
  if(sign1 === sign2) return 88; // same sign gives very high baseline

  const e1 = ELEMENT[sign1];
  const e2 = ELEMENT[sign2];

  if(e1 === e2) return 84;          // same element
  // traditionally good combos: Fire <-> Air, Earth <-> Water
  if( (e1 === "Fire" && e2 === "Air") || (e1 === "Air" && e2 === "Fire") ) return 78;
  if( (e1 === "Earth" && e2 === "Water") || (e1 === "Water" && e2 === "Earth") ) return 78;

  // fire <-> earth or air <-> water -> mixed (average)
  if( (e1 === "Fire" && e2 === "Earth") || (e1 === "Earth" && e2 === "Fire") ) return 56;
  if( (e1 === "Air" && e2 === "Water") || (e1 === "Water" && e2 === "Air") ) return 54;

  // other combos -> a bit lower baseline
  return 48;
}

function compatibilityMessage(score){
  if(score >= 81) return {label: "High", text: "Strong chemistry! ✨ You two connect easily and bring out the best in each other."};
  if(score >= 61) return {label: "Medium", text: "Good potential. ❤ With understanding and effort this pairing can grow nicely."};
  return {label: "Low", text: "Challenging match. 💡 Differences are real — communication and patience are key."};
}

function elementTip(sign1, sign2){
  const e1 = ELEMENT[sign1], e2 = ELEMENT[sign2];
  if(e1 === e2) return `Both ${e1} signs — you likely share similar drives and rhythms.`;
  if((e1==="Fire" && e2==="Air")||(e1==="Air"&&e2==="Fire")) return "Fire + Air: energetic and talkative — lots of spark and curiosity.";
  if((e1==="Earth" && e2==="Water")||(e1==="Water"&&e2==="Earth")) return "Earth + Water: grounded and nurturing — stable emotional support.";
  if((e1==="Fire" && e2==="Earth")||(e1==="Earth"&&e2==="Fire")) return "Fire + Earth: ambition meets practicality — balance action with planning.";
  if((e1==="Air" && e2==="Water")||(e1==="Water"&&e2==="Air")) return "Air + Water: ideas meet feelings — practice clear emotional communication.";
  return "This pairing blends different temperaments — celebrate the differences and learn from each other.";
}

function computeCompatibility(sign1, sign2){
  if(!SIGNS.includes(sign1) || !SIGNS.includes(sign2)) return null;
  const base = baseScore(sign1, sign2);
  const sameSignBonus = (sign1 === sign2) ? 4 : 0;
  const jitter = smallHash(sign1, sign2); // 0..6
  const final = Math.min(98, base + sameSignBonus + jitter);
  return {
    score: final,
    breakdown: { base, sameSignBonus, jitter }
  };
}

// UI handling
document.addEventListener('DOMContentLoaded', () => {
  populateSelects();

  const form = document.getElementById('zodiac-form');
  const btn = document.getElementById('checkBtn');
  const swapBtn = document.getElementById('swapBtn');
  const signA = document.getElementById('signA');
  const signB = document.getElementById('signB');
  const result = document.getElementById('result');
  const scoreBubble = document.getElementById('scoreBubble');
  const scoreNumber = document.getElementById('scoreNumber');
  const resultText = document.getElementById('resultText');
  const resultTip = document.getElementById('resultTip');

  btn.addEventListener('click', () => {
    const a = signA.value;
    const b = signB.value;
    if(!a || !b){
      alert("Please choose both zodiac signs to check compatibility.");
      return;
    }
    const c = computeCompatibility(a,b);
    if(!c) return;

    const { score } = c;
    // label classes
    scoreBubble.classList.remove('score-high','score-medium','score-low');
    if(score >= 81) scoreBubble.classList.add('score-high');
    else if(score >= 61) scoreBubble.classList.add('score-medium');
    else scoreBubble.classList.add('score-low');

    scoreNumber.textContent = `${score}%`;

    const msg = compatibilityMessage(score);
    resultText.textContent = `${msg.label} — ${msg.text}`;
    resultTip.textContent = elementTip(a,b);

    result.hidden = false;
    // accessibility: focus result
    scoreBubble.focus?.();
  });

  swapBtn.addEventListener('click', () => {
    const tmp = signA.value;
    signA.value = signB.value;
    signB.value = tmp;
  });
});
