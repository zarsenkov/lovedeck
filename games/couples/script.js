const app = {
    state: {
        p1: localStorage.getItem('ls_p1') || "",
        p2: localStorage.getItem('ls_p2') || "",
        currentStoryId: null,
        currentPhaseIdx: 0,
        currentStepIdx: 0,
        honestyScore: 0,
        totalQuestions: 0,
        shuffledPhases: [],
        diary: JSON.parse(localStorage.getItem('ls_diary')) || [],
        history: JSON.parse(localStorage.getItem('ls_history')) || [],
        audioEnabled: false
    },

    npcTimer: null,

    // Инициализация имен
    initUser: function() {
        const n1 = document.getElementById('name1').value.trim();
        const n2 = document.getElementById('name2').value.trim();
        if (n1.length < 2 || n2.length < 2) {
            this.toast("Введите имена обоих игроков 🌸");
            return;
        }
        this.state.p1 = n1;
        this.state.p2 = n2;
        localStorage.setItem('ls_p1', n1);
        localStorage.setItem('ls_p2', n2);
        this.toLobby();
    },

    // Сброс всех данных (Исправлено)
    resetData: function() {
        if (confirm("Это удалит ваши имена, историю и дневник навсегда. Вы уверены?")) {
            localStorage.clear();
            location.reload();
        }
    },

    toLobby: function() {
        this.showScreen('screen-lobby');
        this.renderStories();
        this.renderResumeButton();
        this.initParticles();
    },

    renderStories: function() {
        const grid = document.getElementById('story-list');
        grid.innerHTML = "";
        Object.keys(STORIES).forEach(key => {
            const s = STORIES[key];
            const history = this.state.history.find(h => h.storyId === key);
            const isUnfinished = JSON.parse(localStorage.getItem('ls_current_progress'))?.storyId === key;
            
            const card = document.createElement('div');
            card.className = "story-card clay-box";
            card.onclick = () => this.startStory(key);
            
            let badge = isUnfinished ? 
                `<span class="status-badge badge-unfinished">НЕ ЗАВЕРШЕН</span>` : 
                (history ? `<span class="status-badge badge-finished">ПРОЙДЕНО: ${history.honesty}%</span>` : "");

            card.innerHTML = `
                <div class="story-img">${s.coverIcon}</div>
                <div class="story-info">
                    ${badge}
                    <h3>${s.title}</h3>
                    <p>${s.phases.length} этапа глубины</p>
                </div>
            `;
            grid.appendChild(card);
        });
    },

    renderResumeButton: function() {
        const cont = document.getElementById('resume-container');
        cont.innerHTML = "";
        const saved = JSON.parse(localStorage.getItem('ls_current_progress'));
        if (saved) {
            const btn = document.createElement('button');
            btn.className = "btn-clay primary";
            btn.style.marginBottom = "20px";
            btn.innerHTML = `<i class="fas fa-play"></i> ПРОДОЛЖИТЬ: ${STORIES[saved.storyId].title}`;
            btn.onclick = () => this.startStory(saved.storyId, true);
            cont.appendChild(btn);
        }
    },

    startStory: function(id, resume = false) {
        this.state.currentStoryId = id;
        if (resume) {
            const saved = JSON.parse(localStorage.getItem('ls_current_progress'));
            this.state.currentPhaseIdx = saved.phaseIdx;
            this.state.currentStepIdx = saved.stepIdx;
            this.state.honestyScore = saved.honesty;
            this.state.totalQuestions = saved.totalQuestions;
            this.state.shuffledPhases = saved.shuffledPhases;
        } else {
            this.state.currentPhaseIdx = 0;
            this.state.currentStepIdx = 0;
            this.state.honestyScore = 0;
            this.state.totalQuestions = 0;
            this.state.shuffledPhases = STORIES[id].phases.map(p => 
                [...Array(p.cards.length).keys()].sort(() => Math.random() - 0.5)
            );
        }
        this.showScreen('screen-quest');
        this.nextStep();
    },

    nextStep: function() {
        if (this.npcTimer) { clearTimeout(this.npcTimer); this.npcTimer = null; }
        
        const story = STORIES[this.state.currentStoryId];
        const phase = story.phases[this.state.currentPhaseIdx];
        const amalia = document.getElementById('amalia-avatar');
        
        document.getElementById('phase-name').innerText = phase.name;
        document.getElementById('phase-icon').innerText = phase.icon;
        document.body.style.backgroundColor = phase.bg;

        const actionArea = document.getElementById('action-area');
        actionArea.innerHTML = "";

        const currentPhaseIndices = this.state.shuffledPhases[this.state.currentPhaseIdx];
        const totalPhaseSteps = phase.npc.length + currentPhaseIndices.length;
        
        // Jar Logic
        const progress = (this.state.currentStepIdx / totalPhaseSteps) * 100;
        document.getElementById('jar-fill').style.height = progress + "%";
        document.getElementById('jar-fill').style.background = phase.color;

        if (this.state.currentStepIdx < phase.npc.length) {
            const npcData = phase.npc[this.state.currentStepIdx];
            document.getElementById('npc-text').innerText = npcData.text;
            amalia.classList.add('amalia-talking');
            
            if (npcData.auto) {
                this.animateTimerLine();
                this.npcTimer = setTimeout(() => { this.state.currentStepIdx++; this.nextStep(); }, 5000);
            } else {
                actionArea.appendChild(this.createBtn("ПРОДОЛЖИТЬ", () => { this.state.currentStepIdx++; this.nextStep(); }));
            }
        } else if (this.state.currentStepIdx < totalPhaseSteps) {
            amalia.classList.remove('amalia-talking');
            const cardIdx = currentPhaseIndices[this.state.currentStepIdx - phase.npc.length];
            this.renderCard(phase.cards[cardIdx]);
        } else {
            this.completePhase();
        }
        this.saveProgress();
    },

    renderCard: function(card) {
        const area = document.getElementById('action-area');
        const box = document.createElement('div');
        box.className = "card-body clay-box";
        const txt = card.text.replace(/{name1}/g, `<b>${this.state.p1}</b>`).replace(/{name2}/g, `<b>${this.state.p2}</b>`);
        box.innerHTML = `<p>${txt}</p>`;

        if (card.type === 'duel') {
            area.appendChild(box);
            area.appendChild(this.createBtn("КТО ЖЕ?", () => this.showDuel()));
        } else if (card.type === 'confession') {
            const inp = document.createElement('textarea');
            inp.className = "joy-input"; inp.placeholder = "Ваше откровение...";
            box.appendChild(inp);
            area.appendChild(box);
            area.appendChild(this.createBtn("СОХРАНИТЬ", () => {
                if (inp.value.length < 2) return this.toast("Напишите ответ...");
                this.saveToDiary(txt, inp.value);
                this.state.totalQuestions++;
                this.showHonesty();
            }));
        } else {
            area.appendChild(box);
            area.appendChild(this.createBtn(card.type === 'question' ? "Я ОТВЕТИЛ" : "МЫ СДЕЛАЛИ", () => {
                if (card.type === 'question') { 
                    this.state.totalQuestions++; 
                    this.saveToDiary(txt, null);
                    this.showHonesty(); 
                } else { this.state.currentStepIdx++; this.nextStep(); }
            }));
        }
    },

    showDuel: function() {
        const overlay = document.getElementById('duel-overlay');
        overlay.classList.remove('hidden');
        document.getElementById('sector1').innerText = this.state.p1.substring(0,6);
        document.getElementById('sector2').innerText = this.state.p2.substring(0,6);
        document.getElementById('duel-result-text').innerText = "КРУТИТЕ!";
    },

    spinWheel: function() {
        const wheel = document.getElementById('wheel');
        const spin = Math.floor(Math.random() * 360) + 1440;
        wheel.style.transform = `rotate(${spin}deg)`;
        
        setTimeout(() => {
            const deg = spin % 360;
            const winner = (deg > 0 && deg <= 180) ? this.state.p2 : this.state.n1; // n1 fallback logic
            const winnerName = (deg > 0 && deg <= 180) ? this.state.p2 : this.state.p1;
            document.getElementById('duel-result-text').innerText = winnerName.toUpperCase();
            if (navigator.vibrate) navigator.vibrate(200);
            
            setTimeout(() => {
                document.getElementById('duel-overlay').classList.add('hidden');
                wheel.style.transform = 'rotate(0deg)';
                wheel.style.transition = 'none';
                setTimeout(() => wheel.style.transition = 'transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)', 50);
                this.state.currentStepIdx++;
                this.nextStep();
            }, 2000);
        }, 4000);
    },

    completePhase: function() {
        const jar = document.getElementById('main-jar');
        jar.classList.add('liquid-burst');
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        
        setTimeout(() => {
            jar.classList.remove('liquid-burst');
            if (this.state.currentPhaseIdx < STORIES[this.state.currentStoryId].phases.length - 1) {
                this.state.currentPhaseIdx++;
                this.state.currentStepIdx = 0;
                this.nextStep();
            } else {
                this.finishStory();
            }
        }, 2000);
    },

    finishStory: function() {
        const percent = this.state.totalQuestions > 0 ? Math.round((this.state.honestyScore / this.state.totalQuestions) * 100) : 100;
        this.state.history.push({ storyId: this.state.currentStoryId, honesty: percent, date: new Date().toISOString() });
        localStorage.setItem('ls_history', JSON.stringify(this.state.history));
        localStorage.removeItem('ls_current_progress');
        document.getElementById('honesty-result').innerText = percent + "%";
        this.showScreen('screen-results');
    },

    saveToDiary: function(q, a) {
        const story = STORIES[this.state.currentStoryId];
        const phase = story.phases[this.state.currentPhaseIdx];
        this.state.diary.push({
            storyTitle: story.title, phaseName: phase.name, phaseIcon: phase.icon,
            question: q, answer: a, date: new Date().toISOString()
        });
        localStorage.setItem('ls_diary', JSON.stringify(this.state.diary));
    },

    showAlbum: function() {
        this.showScreen('screen-album');
        const cont = document.getElementById('album-content');
        cont.innerHTML = this.state.diary.length ? "" : "<p style='text-align:center; opacity:0.5; margin-top:50px;'>Дневник пуст...</p>";
        
        [...this.state.diary].reverse().forEach(entry => {
            const item = document.createElement('div');
            item.className = "memory-item clay-box";
            item.innerHTML = `
                <div style="font-size:0.7rem; font-weight:800; opacity:0.5; margin-bottom:5px;">${entry.phaseIcon} ${entry.storyTitle} / ${entry.phaseName}</div>
                <p>${entry.question}</p>
                ${entry.answer ? `<p style="color:var(--p-dark); font-weight:700; margin-top:10px;">Ответ: ${entry.answer}</p>` : ''}
            `;
            cont.appendChild(item);
        });
    },

    saveProgress: function() {
        localStorage.setItem('ls_current_progress', JSON.stringify({
            storyId: this.state.currentStoryId, phaseIdx: this.state.currentPhaseIdx,
            stepIdx: this.state.currentStepIdx, honesty: this.state.honestyScore,
            totalQuestions: this.state.totalQuestions, shuffledPhases: this.state.shuffledPhases
        }));
    },

    // UTILS
    showScreen: id => { 
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    },
    createBtn: (t, f) => { const b = document.createElement('button'); b.className="btn-clay primary"; b.innerText=t; b.onclick=f; return b; },
    toast: m => { const t=document.getElementById('toast'); t.innerText=m; t.classList.add('active'); setTimeout(()=>t.classList.remove('active'), 3000); },
    toggleAudio: function() {
        const audio = document.getElementById('bg-music');
        this.state.audioEnabled = !this.state.audioEnabled;
        document.getElementById('audio-icon').className = this.state.audioEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        this.state.audioEnabled ? audio.play() : audio.pause();
    },
    animateTimerLine: () => {
        const line = document.getElementById('npc-timer-line');
        line.style.transition = 'none'; line.style.width = '0%';
        setTimeout(() => { line.style.transition = 'width 5s linear'; line.style.width = '100%'; }, 50);
    },
    showHonesty: () => document.getElementById('honesty-overlay').classList.remove('hidden'),
    rateHonesty: function(v) {
        if(v) this.state.honestyScore++;
        document.getElementById('honesty-overlay').classList.add('hidden');
        this.state.currentStepIdx++; this.nextStep();
    },
    confirmExit: function() { if (confirm("Выйти в лобби? Прогресс сохранен.")) this.toLobby(); },
    initParticles: function() {
        const cont = document.getElementById('particle-container');
        cont.innerHTML = "";
        for(let i=0; i<15; i++) {
            const p = document.createElement('div');
            p.className = 'particle'; p.innerText = '❤️';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.fontSize = (Math.random() * 15 + 10) + 'px';
            p.style.setProperty('--speed', (Math.random() * 10 + 5) + 's');
            cont.appendChild(p);
        }
    }
};

window.onload = () => { if (app.state.p1 && app.state.p2) app.toLobby(); };
