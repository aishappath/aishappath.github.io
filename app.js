class ChecklistApp {
    constructor() {
        this.userId = this.generateUserId();
        this.currentWeek = this.getCurrentWeek();
        this.checklistItems = [];
        this.allChecklists = {};
        this.init();
    }

    generateUserId() {
        const storedId = localStorage.getItem('userId');
        if (storedId) return storedId;
        
        const newId = 'user_' + Date.now();
        localStorage.setItem('userId', newId);
        return newId;
    }

    getCurrentWeek() {
        const storedWeek = localStorage.getItem(`${this.userId}_currentWeek`);
        return storedWeek ? parseInt(storedWeek) : 1;
    }

    async init() {
        await this.loadAllChecklists();
        this.loadCurrentChecklist();
        this.setupNavigation();
        this.renderWeek();
        this.renderChecklist();
    }

    setupNavigation() {
        const nav = document.createElement('div');
        nav.className = 'navigation';
        
        const prevButton = document.createElement('button');
        prevButton.textContent = '←';
        prevButton.className = 'nav-button';
        prevButton.onclick = () => this.navigate(-1);
        
        const nextButton = document.createElement('button');
        nextButton.textContent = '→';
        nextButton.className = 'nav-button';
        nextButton.onclick = () => this.navigate(1);
        
        nav.appendChild(prevButton);
        nav.appendChild(nextButton);
        
        const weekDisplay = document.getElementById('weekDisplay');
        weekDisplay.parentNode.insertBefore(nav, weekDisplay.nextSibling);
        
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const [prevButton, nextButton] = document.querySelectorAll('.nav-button');
        prevButton.disabled = this.currentWeek <= 1;
        nextButton.disabled = this.currentWeek >= 50;
    }

    navigate(delta) {
        const newWeek = this.currentWeek + delta;
        if (newWeek >= 1 && newWeek <= 50) {
            this.currentWeek = newWeek;
            localStorage.setItem(`${this.userId}_currentWeek`, this.currentWeek);
            this.loadCurrentChecklist();
            this.renderWeek();
            this.renderChecklist();
            this.updateNavigationButtons();
        }
    }

    async loadAllChecklists() {
        try {
            const response = await fetch('checklists.txt');
            const text = await response.text();
            
            const weeksWithHeaders = text.split(/(?=Week \d+:)/);
            
            weeksWithHeaders.forEach((weekContent) => {
                if (weekContent.trim()) {
                    const weekMatch = weekContent.match(/Week (\d+):/);
                    if (weekMatch) {
                        const weekNumber = parseInt(weekMatch[1]);
                        
                        const missions = weekContent.split(/Mission \d+:/)
                            .slice(1)
                            .map(mission => mission.trim());
                        
                        this.allChecklists[weekNumber] = missions;
                    }
                }
            });
        } catch (error) {
            console.error('Error loading checklists:', error);
            this.allChecklists = {};
        }
    }

    loadCurrentChecklist() {
        this.checklistItems = this.allChecklists[this.currentWeek] || [];
    }

    renderWeek() {
        const weekDisplay = document.getElementById('weekDisplay');
        weekDisplay.textContent = `Week ${this.currentWeek}`;
    }

    renderChecklist() {
        const checklistDiv = document.getElementById('checklist');
        checklistDiv.innerHTML = '';

        this.checklistItems.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'checklist-item';

            const missionTitle = document.createElement('div');
            missionTitle.className = 'mission-title';
            missionTitle.textContent = `Mission ${index + 1}`;
            
            const missionContent = document.createElement('div');
            missionContent.className = 'mission-content';
            missionContent.textContent = item;

            itemDiv.appendChild(missionTitle);
            itemDiv.appendChild(missionContent);
            checklistDiv.appendChild(itemDiv);
        });
    }
}

// Initialize the app
new ChecklistApp();