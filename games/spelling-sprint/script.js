(function(){

  var STORAGE_KEY = 'eduplay_spell_best';
  var MUTE_KEY = 'eduplay_spell_muted';
  var REPLAY_MISS_PROBABILITY = 0.2;

  // ---------- Word bank: [correct, wrong1, wrong2, wrong3] ----------
  var WORDS = {
    easy: [
      ['friend', 'freind', 'frend', 'friennd'],
      ['because', 'becuase', 'becaus', 'beacause'],
      ['school', 'shcool', 'scool', 'schoool'],
      ['people', 'poeple', 'peaple', 'pepole'],
      ['little', 'litle', 'littel', 'liitle'],
      ['would', 'wuold', 'whould', 'woud'],
      ['their', 'thier', 'theyre', 'thair'],
      ['said', 'sayed', 'siad', 'sed'],
      ['again', 'agian', 'agaen', 'agin'],
      ['beautiful', 'beatiful', 'beautifull', 'beutiful'],
      ['before', 'befor', 'beofre', 'befoer'],
      ['could', 'coud', 'culd', 'coulde'],
      ['every', 'evrey', 'evry', 'everry'],
      ['favorite', 'favorate', 'favroite', 'faviorite'],
      ['first', 'frist', 'firstt', 'fisrt'],
      ['finally', 'finaly', 'finnaly', 'finalley'],
      ['happy', 'happpy', 'hapy', 'happie'],
      ['hospital', 'hopsital', 'hospitle', 'hosiptal'],
      ['immediately', 'imediately', 'immediatly', 'immediatley'],
      ['island', 'iland', 'isand', 'ilsand'],
      ['knowledge', 'knowlege', 'knowledg', 'knowledege'],
      ['library', 'libary', 'libarary', 'librery'],
      ['listen', 'lisen', 'listeen', 'listne'],
      ['morning', 'mornnig', 'mornign', 'morening'],
      ['neighbor', 'neighber', 'nieghbor', 'neighbore'],
      ['ocean', 'oceon', 'oshun', 'oceann'],
      ['often', 'offen', 'oftin', 'offten'],
      ['once', 'onse', 'wonce', 'onece'],
      ['potato', 'potatoe', 'potatoo', 'patato'],
      ['purple', 'purpel', 'purpple', 'prurple'],
      ['quiet', 'qiuet', 'quiett', 'wuiet'],
      ['really', 'realy', 'realley', 'reallly'],
      ['remember', 'remeber', 'remmember', 'rememeber'],
      ['sandwich', 'sandwhich', 'sandwitch', 'sanwich'],
      ['science', 'scince', 'sciance', 'sceince'],
      ['special', 'speical', 'specail', 'speciall'],
      ['sudden', 'suddenn', 'suden', 'sudded'],
      ['sure', 'shure', 'sur', 'suer'],
      ['thought', 'thoght', 'thawt', 'thougt'],
      ['through', 'throo', 'thru', 'throught'],
    ],
    medium: [
      ['definitely', 'definately', 'definitly', 'defenitely'],
      ['separate', 'seperate', 'separete', 'seperete'],
      ['necessary', 'neccessary', 'necesary', 'neccesary'],
      ['embarrass', 'embarass', 'embarrasse', 'embarras'],
      ['occurred', 'occured', 'ocurred', 'occurrred'],
      ['believe', 'beleive', 'belive', 'beleve'],
      ['receive', 'recieve', 'receve', 'receeve'],
      ['calendar', 'calender', 'calandar', 'calendear'],
      ['rhythm', 'rythm', 'rhythem', 'rhytm'],
      ['tomorrow', 'tommorow', 'tomorow', 'tommorrow'],
      ['accommodate', 'accomodate', 'acommodate', 'accommadate'],
      ['acquire', 'aquire', 'accquire', 'aquier'],
      ['amateur', 'amature', 'amatuer', 'ameteur'],
      ['apparent', 'apparant', 'aparent', 'appearant'],
      ['argument', 'arguement', 'argumant', 'arguemint'],
      ['arithmetic', 'arithmatic', 'arithmetick', 'arithmentic'],
      ['basically', 'basicly', 'basicaly', 'basicalley'],
      ['category', 'catagory', 'catergory', 'categorry'],
      ['cemetery', 'cemetary', 'cemetry', 'cematery'],
      ['changeable', 'changable', 'changeible', 'changeabel'],
      ['committee', 'commitee', 'comittee', 'committey'],
      ['conscience', 'concience', 'consience', 'conscence'],
      ['conscious', 'concious', 'consious', 'conscius'],
      ['disappear', 'dissapear', 'disapear', 'dissappear'],
      ['embarrassment', 'embarassment', 'embarrassement', 'embarasment'],
      ['environment', 'enviroment', 'envirnoment', 'enviornment'],
      ['exaggerate', 'exagerate', 'exxagerate', 'exagerrate'],
      ['existence', 'existance', 'exhistence', 'existince'],
      ['experience', 'experiance', 'expereince', 'experence'],
      ['fascinating', 'facinating', 'fascinateing', 'fasinating'],
      ['foreign', 'foriegn', 'foregin', 'foreing'],
      ['grammar', 'grammer', 'gramar', 'gramer'],
      ['harass', 'harrass', 'harras', 'harrasse'],
      ['humorous', 'humerous', 'humourous', 'humorus'],
      ['independent', 'independant', 'indipendent', 'independint'],
      ['jewelry', 'jewelery', 'jewellry', 'jewlery'],
      ['knowledgeable', 'knowledgable', 'knowledgeble', 'knowlegable'],
      ['leisure', 'liesure', 'leasure', 'leisur'],
      ['license', 'lisence', 'liscense', 'licens'],
      ['maneuver', 'manuever', 'maneuvre', 'manoover'],
    ],
    hard: [
      ['conscientious', 'consciencious', 'conscientous', 'conscienscious'],
      ['bureaucracy', 'beaurocracy', 'bureaucrasy', 'burocracy'],
      ['millennium', 'millenium', 'milennium', 'millenneum'],
      ['entrepreneur', 'entreprenuer', 'entrepeneur', 'entreprenneur'],
      ['questionnaire', 'questionaire', 'questionnair', 'questionnairre'],
      ['maintenance', 'maintainance', 'maintenence', 'maintanance'],
      ['liaison', 'liason', 'liaision', 'liasion'],
      ['pharaoh', 'pharoah', 'faroah', 'pharoh'],
      ['connoisseur', 'connoiseur', 'conoisseur', 'connisseur'],
      ['unnecessary', 'unecessary', 'unnecesary', 'uneccessary'],
      ['accommodation', 'acommodation', 'accomodation', 'accommadation'],
      ['aesthetic', 'asthetic', 'aesthetick', 'aestetic'],
      ['apocalypse', 'apocolypse', 'apocalips', 'apokalypse'],
      ['archipelago', 'archipelego', 'archepelago', 'archipellago'],
      ['asphyxiation', 'asphixiation', 'asfixiation', 'asphyxiasion'],
      ['camouflage', 'camoflage', 'camouflague', 'camoflague'],
      ['chrysanthemum', 'chrysanthimum', 'chrisanthemum', 'chrysantemum'],
      ['colonel', 'colonal', 'kernal', 'colnel'],
      ['diarrhea', 'diarhea', 'diarreah', 'dyarrhea'],
      ['gauge', 'guage', 'gaug', 'gague'],
      ['hierarchy', 'heirarchy', 'hierarcy', 'hiearchy'],
      ['idiosyncrasy', 'idiosyncracy', 'idyosyncrasy', 'idiosincrasy'],
      ['indict', 'indite', 'indyct', 'endict'],
      ['inoculate', 'innoculate', 'inocculate', 'inoculatte'],
      ['mischievous', 'mischievious', 'mischevous', 'mischeivous'],
      ['occasionally', 'occasionaly', 'occassionally', 'ocasionally'],
      ['onomatopoeia', 'onomatopeia', 'onomatopoiea', 'onamatopoeia'],
      ['paraphernalia', 'paraphenalia', 'parafernalia', 'paraphanalia'],
      ['perseverance', 'perseverence', 'persaverance', 'perseverense'],
      ['playwright', 'playright', 'playwrite', 'playwrighte'],
      ['privilege', 'priviledge', 'privelege', 'privilage'],
      ['pronunciation', 'pronounciation', 'pronunciaton', 'pronuncation'],
      ['psychiatrist', 'psychyatrist', 'sychiatrist', 'psychiatrest'],
      ['renaissance', 'rennaissance', 'renaisance', 'reniassance'],
      ['rhinoceros', 'rhinocerous', 'rhinoseros', 'rinoceros'],
      ['sacrilegious', 'sacreligious', 'sacrilegous', 'sacreligous'],
      ['supersede', 'supercede', 'superseed', 'supersead'],
      ['surveillance', 'surveilance', 'survaillance', 'surveillence'],
      ['vacuum', 'vaccuum', 'vaccum', 'vacume'],
      ['vengeance', 'vengance', 'vengeanse', 'vengiance'],
    ]
  };

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

  function getPool(){
    var level = tableSelect.value;
    if (level === '0'){
      return WORDS.easy.concat(WORDS.medium, WORDS.hard);
    }
    return WORDS[level];
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

  function shuffle(arr){
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function renderQuestion(){
    if (!started) return;
    locked = false;
    feedbackText.textContent = '';
    feedbackText.className = 'feedback';

    var entry = pickEntry();
    currentAnswer = entry[0];
    currentKey = entry[0];

    recentKeys.push(currentKey);
    if (recentKeys.length > 2) recentKeys.shift();

    questionText.textContent = 'Which is spelled correctly?';

    var choices = shuffle(entry);
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
