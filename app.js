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
        this.renderWeek();
        this.renderChecklist();
        this.setupNavigation();
    }

    setupNavigation() {
        const nav = document.createElement('div');
        nav.className = 'navigation';
        
        const prevButton = document.createElement('button');
        prevButton.textContent = '← Previous Week';
        prevButton.className = 'nav-button prev-week';
        prevButton.onclick = () => this.navigateWeek(-1);
        
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next Week →';
        nextButton.className = 'nav-button next-week';
        nextButton.onclick = () => this.navigateWeek(1);
        
        nav.appendChild(prevButton);
        nav.appendChild(nextButton);
        
        const weekDisplay = document.getElementById('weekDisplay');
        weekDisplay.parentNode.insertBefore(nav, weekDisplay.nextSibling);
        
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const prevButton = document.querySelector('.prev-week');
        const nextButton = document.querySelector('.next-week');
        
        prevButton.disabled = this.currentWeek <= 1;
        nextButton.disabled = this.currentWeek >= 50;
    }

    navigateWeek(delta) {
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
            
            const weeks = text.split(/Week \d+:/);
            
            weeks.forEach((week, index) => {
                if (week.trim()) {
                    const missions = week.split(/Mission \d+:/)
                        .filter(mission => mission.trim())
                        .map(mission => mission.trim());
                    
                    this.allChecklists[index + 1] = missions;
                }
            });
        } catch (error) {
            console.error('Error loading checklists:', error);
            this.allChecklists = {};
        }
    }

    loadCurrentChecklist() {
        this.checklistItems = this.allChecklists[this.currentWeek] || [];
        
        const progress = localStorage.getItem(`${this.userId}_week${this.currentWeek}`);
        if (progress) {
            this.completed = new Set(JSON.parse(progress));
        } else {
            this.completed = new Set();
        }
    }

    renderWeek() {
        const weekDisplay = document.getElementById('weekDisplay');
        weekDisplay.textContent = `Week ${this.currentWeek}`;
    }

    renderChecklist() {
        const checklistDiv = document.getElementById('checklist');
        checklistDiv.innerHTML = '';

        this.checklistItems.slice(1).forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'checklist-item';
            if (this.completed.has(index + 1)) {
                itemDiv.classList.add('completed');
            }

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = this.completed.has(index);
            checkbox.addEventListener('change', () => this.toggleItem(index));

            const label = document.createElement('label');
            
            // Add mission title
            const missionTitle = document.createElement('div');
            missionTitle.className = 'mission-title';
            missionTitle.textContent = `Mission ${index + 1}`;
            label.appendChild(missionTitle);
            
            // Add mission content
            const missionContent = document.createElement('div');
            missionContent.textContent = item;
            label.appendChild(missionContent);

            itemDiv.appendChild(checkbox);
            itemDiv.appendChild(label);
            checklistDiv.appendChild(itemDiv);
        });
    }

    toggleItem(index) {
        if (this.completed.has(index)) {
            this.completed.delete(index);
        } else {
            this.completed.add(index);
        }

        localStorage.setItem(
            `${this.userId}_week${this.currentWeek}`,
            JSON.stringify(Array.from(this.completed))
        );

        this.renderChecklist();
    }

    isWeekCompleted() {
        return this.completed.size === this.checklistItems.length;
    }
}

// Initialize the app
new ChecklistApp();