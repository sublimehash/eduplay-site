(function(){

  var STORAGE_KEY = 'eduplay_flag_best';
  var MUTE_KEY = 'eduplay_flag_muted';
  var REPLAY_MISS_PROBABILITY = 0.2;

  // ---------- Country data: [ISO code, name], grouped by difficulty ----------
  // Flag emoji is built from the ISO code at runtime (isoToFlag), so no
  // emoji characters need to be embedded directly in this file.
  // Easy = most globally recognizable flags. Medium/Hard add progressively
  // more niche/lesser-known flags. All 195 countries are covered across
  // the three tiers, and Mixed combines all of them.
  var COUNTRIES = {
    easy: [
      ['US', 'United States'],
      ['GB', 'United Kingdom'],
      ['FR', 'France'],
      ['DE', 'Germany'],
      ['IT', 'Italy'],
      ['ES', 'Spain'],
      ['CA', 'Canada'],
      ['AU', 'Australia'],
      ['JP', 'Japan'],
      ['CN', 'China'],
      ['IN', 'India'],
      ['BR', 'Brazil'],
      ['RU', 'Russia'],
      ['MX', 'Mexico'],
      ['KR', 'South Korea'],
      ['ZA', 'South Africa'],
      ['EG', 'Egypt'],
      ['NG', 'Nigeria'],
      ['SA', 'Saudi Arabia'],
      ['TR', 'Turkey'],
      ['NL', 'Netherlands'],
      ['CH', 'Switzerland'],
      ['SE', 'Sweden'],
      ['GR', 'Greece'],
      ['AR', 'Argentina'],
    ],
    medium: [
      ['PT', 'Portugal'],
      ['NO', 'Norway'],
      ['PL', 'Poland'],
      ['IE', 'Ireland'],
      ['BE', 'Belgium'],
      ['AT', 'Austria'],
      ['DK', 'Denmark'],
      ['FI', 'Finland'],
      ['CZ', 'Czechia'],
      ['HU', 'Hungary'],
      ['RO', 'Romania'],
      ['UA', 'Ukraine'],
      ['IL', 'Israel'],
      ['AE', 'United Arab Emirates'],
      ['TH', 'Thailand'],
      ['VN', 'Vietnam'],
      ['ID', 'Indonesia'],
      ['PH', 'Philippines'],
      ['PK', 'Pakistan'],
      ['BD', 'Bangladesh'],
      ['IR', 'Iran'],
      ['IQ', 'Iraq'],
      ['KE', 'Kenya'],
      ['MA', 'Morocco'],
      ['GH', 'Ghana'],
      ['ET', 'Ethiopia'],
      ['TZ', 'Tanzania'],
      ['DZ', 'Algeria'],
      ['TN', 'Tunisia'],
      ['LY', 'Libya'],
      ['CO', 'Colombia'],
      ['PE', 'Peru'],
      ['CL', 'Chile'],
      ['VE', 'Venezuela'],
      ['EC', 'Ecuador'],
      ['CU', 'Cuba'],
      ['JM', 'Jamaica'],
      ['NZ', 'New Zealand'],
      ['SG', 'Singapore'],
      ['MY', 'Malaysia'],
      ['KZ', 'Kazakhstan'],
      ['QA', 'Qatar'],
      ['KW', 'Kuwait'],
      ['JO', 'Jordan'],
      ['LB', 'Lebanon'],
      ['SY', 'Syria'],
      ['AF', 'Afghanistan'],
      ['MM', 'Myanmar'],
      ['LK', 'Sri Lanka'],
      ['NP', 'Nepal'],
      ['IS', 'Iceland'],
      ['HR', 'Croatia'],
      ['RS', 'Serbia'],
      ['BG', 'Bulgaria'],
      ['SK', 'Slovakia'],
    ],
    hard: [
      ['AL', 'Albania'],
      ['AD', 'Andorra'],
      ['AM', 'Armenia'],
      ['AZ', 'Azerbaijan'],
      ['BY', 'Belarus'],
      ['BA', 'Bosnia and Herzegovina'],
      ['CY', 'Cyprus'],
      ['EE', 'Estonia'],
      ['GE', 'Georgia'],
      ['LV', 'Latvia'],
      ['LI', 'Liechtenstein'],
      ['LT', 'Lithuania'],
      ['LU', 'Luxembourg'],
      ['MT', 'Malta'],
      ['MD', 'Moldova'],
      ['MC', 'Monaco'],
      ['ME', 'Montenegro'],
      ['MK', 'North Macedonia'],
      ['SM', 'San Marino'],
      ['SI', 'Slovenia'],
      ['VA', 'Vatican City'],
      ['BH', 'Bahrain'],
      ['BT', 'Bhutan'],
      ['BN', 'Brunei'],
      ['KH', 'Cambodia'],
      ['TL', 'Timor-Leste'],
      ['KG', 'Kyrgyzstan'],
      ['LA', 'Laos'],
      ['MV', 'Maldives'],
      ['MN', 'Mongolia'],
      ['OM', 'Oman'],
      ['TJ', 'Tajikistan'],
      ['TM', 'Turkmenistan'],
      ['UZ', 'Uzbekistan'],
      ['YE', 'Yemen'],
      ['KP', 'North Korea'],
      ['PS', 'Palestine'],
      ['AO', 'Angola'],
      ['BJ', 'Benin'],
      ['BW', 'Botswana'],
      ['BF', 'Burkina Faso'],
      ['BI', 'Burundi'],
      ['CV', 'Cabo Verde'],
      ['CM', 'Cameroon'],
      ['CF', 'Central African Republic'],
      ['TD', 'Chad'],
      ['KM', 'Comoros'],
      ['CD', 'DR Congo'],
      ['CG', 'Congo'],
      ['DJ', 'Djibouti'],
      ['GQ', 'Equatorial Guinea'],
      ['ER', 'Eritrea'],
      ['SZ', 'Eswatini'],
      ['GA', 'Gabon'],
      ['GM', 'Gambia'],
      ['GN', 'Guinea'],
      ['GW', 'Guinea-Bissau'],
      ['CI', 'Ivory Coast'],
      ['LS', 'Lesotho'],
      ['LR', 'Liberia'],
      ['MG', 'Madagascar'],
      ['MW', 'Malawi'],
      ['ML', 'Mali'],
      ['MR', 'Mauritania'],
      ['MU', 'Mauritius'],
      ['MZ', 'Mozambique'],
      ['NA', 'Namibia'],
      ['NE', 'Niger'],
      ['RW', 'Rwanda'],
      ['ST', 'Sao Tome and Principe'],
      ['SN', 'Senegal'],
      ['SC', 'Seychelles'],
      ['SL', 'Sierra Leone'],
      ['SO', 'Somalia'],
      ['SS', 'South Sudan'],
      ['SD', 'Sudan'],
      ['TG', 'Togo'],
      ['UG', 'Uganda'],
      ['ZM', 'Zambia'],
      ['ZW', 'Zimbabwe'],
      ['AG', 'Antigua and Barbuda'],
      ['BS', 'Bahamas'],
      ['BB', 'Barbados'],
      ['BZ', 'Belize'],
      ['BO', 'Bolivia'],
      ['CR', 'Costa Rica'],
      ['DM', 'Dominica'],
      ['DO', 'Dominican Republic'],
      ['SV', 'El Salvador'],
      ['GD', 'Grenada'],
      ['GT', 'Guatemala'],
      ['GY', 'Guyana'],
      ['HT', 'Haiti'],
      ['HN', 'Honduras'],
      ['NI', 'Nicaragua'],
      ['PA', 'Panama'],
      ['PY', 'Paraguay'],
      ['KN', 'Saint Kitts and Nevis'],
      ['LC', 'Saint Lucia'],
      ['VC', 'Saint Vincent and the Grenadines'],
      ['SR', 'Suriname'],
      ['TT', 'Trinidad and Tobago'],
      ['UY', 'Uruguay'],
      ['FJ', 'Fiji'],
      ['KI', 'Kiribati'],
      ['MH', 'Marshall Islands'],
      ['FM', 'Micronesia'],
      ['NR', 'Nauru'],
      ['PW', 'Palau'],
      ['PG', 'Papua New Guinea'],
      ['WS', 'Samoa'],
      ['SB', 'Solomon Islands'],
      ['TO', 'Tonga'],
      ['TV', 'Tuvalu'],
      ['VU', 'Vanuatu'],
    ]
  };

  function isoToFlag(iso){
    return iso.toUpperCase().replace(/./g, function(ch){
      return String.fromCodePoint(ch.charCodeAt(0) + 127397);
    });
  }

  // ---------- State ----------
  var correct = 0;
  var incorrect = 0;
  var streak = 0;
  var bestStreak = 0;
  var currentAnswer = null;
  var currentKey = null;
  var timeLimit = 8;
  var timeLeft = timeLimit;
  var timerInterval = null;
  var locked = false;
  var started = false;
  var muted = false;
  var practiceMode = false;

  var missCounts = {};
  var missKeysList = [];
  var recentKeys = [];

  // ---------- DOM refs ----------
  var startScreen = document.getElementById('startScreen');
  var bestNote = document.getElementById('bestNote');
  var playArea = document.getElementById('playArea');
  var playBtn = document.getElementById('playBtn');
  var questionText = document.getElementById('questionText');
  var answersGrid = document.getElementById('answersGrid');
  var feedbackText = document.getElementById('feedbackText');
  var correctCountEl = document.getElementById('correctCount');
  var incorrectCountEl = document.getElementById('incorrectCount');
  var streakCountEl = document.getElementById('streakCount');
  var bestCountEl = document.getElementById('bestCount');
  var timerWrap = document.querySelector('.timer-wrap');
  var timerBar = document.getElementById('timerBar');
  var tableSelect = document.getElementById('tableSelect');
  var speedSelect = document.getElementById('speedSelect');
  var practiceToggle = document.getElementById('practiceToggle');
  var resetBtn = document.getElementById('resetBtn');
  var muteBtn = document.getElementById('muteBtn');
  var startFlag = document.getElementById('startFlag');

  // set a friendly flag on the start screen
  startFlag.textContent = isoToFlag('FR');

  // ---------- Best streak persistence ----------
  function loadBest(){
    try{
      var saved = localStorage.getItem(STORAGE_KEY);
      bestStreak = saved ? parseInt(saved, 10) || 0 : 0;
    } catch(e){
      bestStreak = 0;
    }
    bestCountEl.textContent = bestStreak;
    bestNote.textContent = bestStreak > 0 ? ('Your best streak: ' + bestStreak) : '';
  }

  function saveBestIfNeeded(){
    if (streak > bestStreak){
      bestStreak = streak;
      bestCountEl.textContent = bestStreak;
      try{ localStorage.setItem(STORAGE_KEY, String(bestStreak)); } catch(e){}
    }
  }

  // ---------- Mute persistence ----------
  function loadMute(){
    try{
      muted = localStorage.getItem(MUTE_KEY) === '1';
    } catch(e){
      muted = false;
    }
    updateMuteBtn();
  }

  function updateMuteBtn(){
    muteBtn.textContent = muted ? '🔈' : '🔊';
    muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
    muteBtn.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
  }

  function toggleMute(){
    muted = !muted;
    try{ localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch(e){}
    updateMuteBtn();
  }

  // ---------- Sound effects (Web Audio API, no files needed) ----------
  var audioCtx = null;
  function getAudioCtx(){
    if (!audioCtx){
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended'){
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playCorrectSound(){
    if (muted) return;
    var ctx = getAudioCtx();
    var now = ctx.currentTime;
    var notes = [523.25, 659.25, 784.0, 1046.5];
    var noteGap = 0.07;

    notes.forEach(function(freq, i){
      var start = now + i * noteGap;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.32, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.17);
    });
  }

  function playIncorrectSound(){
    if (muted) return;
    var ctx = getAudioCtx();
    var now = ctx.currentTime;
    var hits = [0, 0.14];

    hits.forEach(function(delay){
      var start = now + delay;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, start);
      osc.frequency.exponentialRampToValueAtTime(70, start + 0.13);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.45, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.16);
    });
  }

  // ---------- Helpers ----------
  function randInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  var ALL_COUNTRIES = COUNTRIES.easy.concat(COUNTRIES.medium, COUNTRIES.hard);

  function getPool(){
    var level = tableSelect.value;
    if (level === '0'){
      return ALL_COUNTRIES;
    }
    return COUNTRIES[level];
  }

  function pickEntry(){
    var pool = getPool();
    var entry;
    var attempts = 0;

    if (missKeysList.length > 0 && Math.random() < REPLAY_MISS_PROBABILITY){
      var candidates = missKeysList.filter(function(k){ return recentKeys.indexOf(k) === -1; });
      var missPool = candidates.length > 0 ? candidates : missKeysList;
      var key = missPool[randInt(0, missPool.length - 1)];
      entry = pool.filter(function(e){ return e[0] === key; })[0];
      if (!entry) entry = pool[randInt(0, pool.length - 1)];
    } else {
      do{
        entry = pool[randInt(0, pool.length - 1)];
        attempts++;
      } while (entry[0] === recentKeys[recentKeys.length - 1] && attempts < 6 && pool.length > 1);
    }

    return entry;
  }

  function buildChoices(correctEntry, pool){
    var others = pool.filter(function(c){ return c[0] !== correctEntry[0]; });
    var shuffled = others.slice();
    for (var i = shuffled.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }
    var distractors = shuffled.slice(0, 3);
    var choices = [correctEntry[1]].concat(distractors.map(function(c){ return c[1]; }));

    for (var k = choices.length - 1; k > 0; k--){
      var m = Math.floor(Math.random() * (k + 1));
      var t = choices[k]; choices[k] = choices[m]; choices[m] = t;
    }
    return choices;
  }

  function renderQuestion(){
    if (!started) return;
    locked = false;
    feedbackText.textContent = '';
    feedbackText.className = 'feedback';

    var pool = getPool();
    var entry = pickEntry();
    currentAnswer = entry[1];
    currentKey = entry[0];

    recentKeys.push(currentKey);
    if (recentKeys.length > 2) recentKeys.shift();

    questionText.textContent = isoToFlag(entry[0]);

    var choices = buildChoices(entry, pool);
    answersGrid.innerHTML = '';
    choices.forEach(function(choice, idx){
      var btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = choice;
      btn.setAttribute('data-index', idx + 1);
      btn.setAttribute('data-value', choice);
      btn.addEventListener('click', function(){ handleAnswer(choice, btn); });
      answersGrid.appendChild(btn);
    });

    if (practiceMode){
      timerWrap.classList.add('practice-hidden');
      clearInterval(timerInterval);
    } else {
      timerWrap.classList.remove('practice-hidden');
      startTimer();
    }
  }

  function startTimer(){
    clearInterval(timerInterval);
    timeLimit = parseInt(speedSelect.value, 10);
    timeLeft = timeLimit;
    timerBar.style.width = '100%';

    var tickMs = 100;
    timerInterval = setInterval(function(){
      timeLeft -= tickMs / 1000;
      var pct = Math.max(0, (timeLeft / timeLimit) * 100);
      timerBar.style.width = pct + '%';
      if (timeLeft <= 0){
        clearInterval(timerInterval);
        handleTimeout();
      }
    }, tickMs);
  }

  function registerMiss(){
    missCounts[currentKey] = (missCounts[currentKey] || 0) + 1;
    if (missKeysList.indexOf(currentKey) === -1){
      missKeysList.push(currentKey);
    }
  }

  // Once a previously-missed item is answered correctly again, stop
  // over-weighting it in the replay pool so it doesn't keep resurfacing.
  function clearMiss(key){
    var idx = missKeysList.indexOf(key);
    if (idx !== -1){
      missKeysList.splice(idx, 1);
    }
    delete missCounts[key];
  }

  function handleTimeout(){
    if (locked) return;
    locked = true;
    incorrect++;
    streak = 0;
    registerMiss();
    updateScores();
    playIncorrectSound();
    feedbackText.textContent = "Time's up! Answer: " + currentAnswer;
    feedbackText.className = 'feedback bad';

    var buttons = answersGrid.querySelectorAll('.answer-btn');
    buttons.forEach(function(b){
      b.disabled = true;
      if (b.getAttribute('data-value') === currentAnswer){
        b.classList.add('correct-flash');
      }
    });

    setTimeout(renderQuestion, 1200);
  }

  function handleAnswer(choice, btn){
    if (locked) return;
    locked = true;
    clearInterval(timerInterval);

    var buttons = answersGrid.querySelectorAll('.answer-btn');
    buttons.forEach(function(b){ b.disabled = true; });

    if (choice === currentAnswer){
      correct++;
      streak++;
      clearMiss(currentKey);
      saveBestIfNeeded();
      playCorrectSound();
      btn.classList.add('correct-flash');
      feedbackText.textContent = pickPraise();
      feedbackText.className = 'feedback good';
    } else {
      incorrect++;
      streak = 0;
      registerMiss();
      playIncorrectSound();
      btn.classList.add('incorrect-flash');
      buttons.forEach(function(b){
        if (b.getAttribute('data-value') === currentAnswer){
          b.classList.add('correct-flash');
        }
      });
      feedbackText.textContent = 'Not quite! Answer: ' + currentAnswer;
      feedbackText.className = 'feedback bad';
    }

    updateScores();
    setTimeout(renderQuestion, 1000);
  }

  function pickPraise(){
    var lines = ['Nice!', 'Great job!', 'Boom!', 'You got it!', 'Awesome!', 'Blast!'];
    return lines[randInt(0, lines.length - 1)];
  }

  function updateScores(){
    correctCountEl.textContent = correct;
    incorrectCountEl.textContent = incorrect;
    streakCountEl.textContent = streak;
    bestCountEl.textContent = bestStreak;
  }

  function endGame(){
    clearInterval(timerInterval);
    started = false;
    locked = true;
    correct = 0;
    incorrect = 0;
    streak = 0;
    missCounts = {};
    missKeysList = [];
    recentKeys = [];
    updateScores();
    playArea.classList.remove('visible');
    startScreen.style.display = 'flex';
    bestNote.textContent = bestStreak > 0 ? ('Your best streak: ' + bestStreak) : '';
  }

  function startGame(){
    started = true;
    correct = 0;
    incorrect = 0;
    streak = 0;
    missCounts = {};
    missKeysList = [];
    recentKeys = [];
    practiceMode = practiceToggle.checked;
    updateScores();
    startScreen.style.display = 'none';
    playArea.classList.add('visible');
    renderQuestion();
  }

  // ---------- Keyboard support ----------
  document.addEventListener('keydown', function(e){
    if (!started){
      if (e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        startGame();
      }
      return;
    }

    if (locked) return;

    if (['1', '2', '3', '4'].indexOf(e.key) !== -1){
      var btn = answersGrid.querySelector('[data-index="' + e.key + '"]');
      if (btn){
        btn.click();
      }
    }
  });

  // ---------- Wire up controls ----------
  playBtn.addEventListener('click', startGame);
  resetBtn.addEventListener('click', endGame);
  muteBtn.addEventListener('click', toggleMute);
  tableSelect.addEventListener('change', function(){ if (started) renderQuestion(); });
  speedSelect.addEventListener('change', function(){ if (started) renderQuestion(); });
  practiceToggle.addEventListener('change', function(){
    if (started){
      practiceMode = practiceToggle.checked;
      renderQuestion();
    }
  });

  // ---------- Init ----------
  loadBest();
  loadMute();

})();
