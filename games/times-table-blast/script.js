(function(){

  // ---------- State ----------
  var correct = 0;
  var incorrect = 0;
  var streak = 0;
  var currentAnswer = null;
  var timeLimit = 8;
  var timeLeft = timeLimit;
  var timerInterval = null;
  var locked = false;
  var started = false;

  // ---------- DOM refs ----------
  var startScreen = document.getElementById('startScreen');
  var playArea = document.getElementById('playArea');
  var playBtn = document.getElementById('playBtn');
  var questionText = document.getElementById('questionText');
  var answersGrid = document.getElementById('answersGrid');
  var feedbackText = document.getElementById('feedbackText');
  var correctCountEl = document.getElementById('correctCount');
  var incorrectCountEl = document.getElementById('incorrectCount');
  var streakCountEl = document.getElementById('streakCount');
  var timerBar = document.getElementById('timerBar');
  var tableSelect = document.getElementById('tableSelect');
  var speedSelect = document.getElementById('speedSelect');
  var resetBtn = document.getElementById('resetBtn');

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
    var ctx = getAudioCtx();
    var now = ctx.currentTime;
    var notes = [523.25, 659.25, 784.0, 1046.5]; // C5, E5, G5, C6 - happy major arpeggio
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
    var ctx = getAudioCtx();
    var now = ctx.currentTime;
    var hits = [0, 0.14]; // thud - thud

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

  function pickFactors(){
    var chosenTable = parseInt(tableSelect.value, 10);
    var a, b;
    if (chosenTable === 0){
      a = randInt(1, 12);
      b = randInt(1, 12);
    } else {
      a = chosenTable;
      b = randInt(1, 12);
      if (Math.random() < 0.5){ var t = a; a = b; b = t; }
    }
    return [a, b];
  }

  function buildChoices(answer){
    var choices = [answer];
    while (choices.length < 4){
      var offset = randInt(-10, 10);
      var candidate = answer + offset;
      if (candidate < 0) candidate = answer + Math.abs(offset) + 1;
      if (candidate !== answer && choices.indexOf(candidate) === -1){
        choices.push(candidate);
      }
    }
    // shuffle
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

    var factors = pickFactors();
    var a = factors[0], b = factors[1];
    currentAnswer = a * b;

    questionText.innerHTML = a + ' <span class="op">&times;</span> ' + b;

    var choices = buildChoices(currentAnswer);
    answersGrid.innerHTML = '';
    choices.forEach(function(choice){
      var btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = choice;
      btn.addEventListener('click', function(){ handleAnswer(choice, btn); });
      answersGrid.appendChild(btn);
    });

    startTimer();
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

  function handleTimeout(){
    if (locked) return;
    locked = true;
    incorrect++;
    streak = 0;
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
      playCorrectSound();
      btn.classList.add('correct-flash');
      feedbackText.textContent = pickPraise();
      feedbackText.className = 'feedback good';
    } else {
      incorrect++;
      streak = 0;
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
  }

  function endGame(){
    clearInterval(timerInterval);
    started = false;
    locked = true;
    correct = 0;
    incorrect = 0;
    streak = 0;
    updateScores();
    playArea.classList.remove('visible');
    startScreen.style.display = 'flex';
  }

  function startGame(){
    started = true;
    correct = 0;
    incorrect = 0;
    streak = 0;
    updateScores();
    startScreen.style.display = 'none';
    playArea.classList.add('visible');
    renderQuestion();
  }

  // ---------- Wire up controls ----------
  playBtn.addEventListener('click', startGame);
  resetBtn.addEventListener('click', endGame);
  tableSelect.addEventListener('change', function(){ if (started) renderQuestion(); });
  speedSelect.addEventListener('change', function(){ if (started) renderQuestion(); });

})();
