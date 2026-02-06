let currentDiff = 'easy';
let selectedCats = [];
let quizPool = [];
let currentQuestionIdx = 0;
let score = 0;
let timer = null;
let timeLeft = 30;

function init() {
    const list = document.getElementById('categories-box');
    // Получаем уникальные категории из всех сложностей
    const allQuestions = [...QUIZ_QUESTIONS.easy, ...QUIZ_QUESTIONS.medium, ...QUIZ_QUESTIONS.hard];
    const uniqueCats = [...new Set(allQuestions.map(q => q.category))];
    
    list.innerHTML = '';
    uniqueCats.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'cat-item';
        div.innerText = cat.toUpperCase();
        div.onclick = () => {
            div.classList.toggle('selected');
            selectedCats.includes(cat) ? selectedCats = selectedCats.filter(c => c !== cat) : selectedCats.push(cat);
        };
        list.appendChild(div);
    });
}

function setDiff(diff, btn) {
    currentDiff = diff;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function startQuiz() {
    if(selectedCats.length === 0) return alert("Выбери темы!");
    
    quizPool = QUIZ_QUESTIONS[currentDiff].filter(q => selectedCats.includes(q.category));
    if(quizPool.length === 0) return alert("В этой сложности нет вопросов по выбранным темам");
    
    quizPool.sort(() => Math.random() - 0.5);
    currentQuestionIdx = 0;
    score = 0;
    showScreen('game-screen');
    renderQuestion();
}

function renderQuestion() {
    if(currentQuestionIdx >= quizPool.length) return showResults();
    
    const q = quizPool[currentQuestionIdx];
    document.getElementById('question-text').innerText = q.question;
    document.getElementById('score-counter').innerText = score;
    
    // Обновляем прогресс-бар
    const progress = ((currentQuestionIdx) / quizPool.length) * 100;
    document.getElementById('progress-line').style.width = progress + "%";

    const box = document.getElementById('answers-box');
    box.innerHTML = '';
    
    q.answers.forEach((ans, idx) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.innerText = ans;
        btn.onclick = () => checkAnswer(idx, btn);
        box.appendChild(btn);
    });

    startTimer();
}

function checkAnswer(idx, btn) {
    clearInterval(timer);
    const q = quizPool[currentQuestionIdx];
    const btns = document.querySelectorAll('.answer-btn');
    btns.forEach(b => b.style.pointerEvents = 'none');

    if(idx === q.correct) {
        btn.classList.add('correct');
        score += 10 + Math.floor(timeLeft / 2); // Бонус за скорость
    } else {
        if(btn) btn.classList.add('wrong');
        btns[q.correct].classList.add('correct');
    }

    setTimeout(() => {
        currentQuestionIdx++;
        renderQuestion();
    }, 1200);
}

function startTimer() {
    clearInterval(timer);
    timeLeft = 30;
    document.getElementById('timer-display').innerText = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-display').innerText = timeLeft;
        if(timeLeft <= 0) {
            clearInterval(timer);
            checkAnswer(-1, null);
        }
    }, 1000);
}

function showResults() {
    showScreen('result-screen');
    document.getElementById('final-score').innerText = score;
    document.getElementById('result-comment').innerText = score > 100 ? "Ты просто космос!" : "Можно и лучше!";
}

function goBack() {
    const active = document.querySelector('.screen.active').id;
    if(active === 'setup-screen') window.location.href = '../../index.html';
    else if(confirm("Выйти в настройки?")) location.reload();
}

function toggleRules(show) {
    document.getElementById('rules-modal').classList.toggle('active', show);
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

init();
