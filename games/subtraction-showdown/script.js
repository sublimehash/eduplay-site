(function(){

  var STORAGE_KEY = 'eduplay_ss_best';
  var MUTE_KEY = 'eduplay_ss_muted';
  var REPLAY_MISS_PROBABILITY = 0.2;

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

  var missCounts = {};      // key "larger-smaller" -> times missed this session
  var missKeysList = [];    // ordered list of keys that have been missed, for replay
  var recentKeys = [];      // last couple of question keys, to avoid immediate repeats

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

  // Picks a subtraction pair where the result is always >= 0 (larger minus
  // smaller). Most of the time generates a fresh pair within the chosen
  // range; sometimes replays a fact missed earlier this session.
  function pickPair(){
    var max = parseInt(tableSelect.value, 10);
    var pair;
    var attempts = 0;

    if (missKeysList.length > 0 && Math.random() < REPLAY_MISS_PROBABILITY){
      var candidates = missKeysList.filter(function(k){ return recentKeys.indexOf(k) === -1; });
      var pool = candidates.length > 0 ? candidates : missKeysList;
      var key = pool[randInt(0, pool.length - 1)];
      var parts = key.split('-').map(Number);
      pair = [parts[0], parts[1]];
    } else {
      do{
        var larger = randInt(1, max);
        var smaller = randInt(0, larger);
        pair = [larger, smaller];
        attempts++;
      } while (keyFor(pair) === recentKeys[recentKeys.length - 1] && attempts < 6);
    }

    return pair;
  }

  function keyFor(pair){
    return pair[0] + '-' + pair[1];
  }

  function buildChoices(answer, max){
    var spread = Math.max(4, Math.round(max / 5));
    var choices = [answer];
    while (choices.length < 4){
      var offset = randInt(-spread, spread);
      var candidate = answer + offset;
      if (candidate < 0) candidate = answer + Math.abs(offset) + 1;
      if (candidate !== answer && choices.indexOf(candidate) === -1){
        choices.push(candidate);
      }
    }
    for (var i = choices.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = choices[i]; choices[i] = choices[j]; choices[j] = tmp;
    }
    return choices;
  }

  function renderQuestion(){
    if (!started) return;
    locked = false;
    feedbackText.textContent = '';
    feedbackText.className = 'feedback';

    var max = parseInt(tableSelect.value, 10);
    var pair = pickPair();
    var larger = pair[0], smaller = pair[1];
    currentAnswer = larger - smaller;
    currentKey = keyFor(pair);

    recentKeys.push(currentKey);
    if (recentKeys.length > 2) recentKeys.shift();

    questionText.innerHTML = larger + ' <span class="op">&minus;</span> ' + smaller;

    var choices = buildChoices(currentAnswer, max);
    answersGrid.innerHTML = '';
    choices.forEach(function(choice, idx){
      var btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = choice;
      btn.setAttribute('data-index', idx + 1);
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

  // Once a previously-missed fact is answered correctly again, stop
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
      if (parseInt(b.textContent, 10) === currentAnswer){
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
        if (parseInt(b.textContent, 10) === currentAnswer){
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
