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
        return storedWeek ? parseInt(storedWeek) : 1;  // Start from Week 1
    }

    async init() {
        await this.loadAllChecklists();
        this.loadCurrentChecklist();
        this.renderWeek();
        this.renderChecklist();
    }

    async loadAllChecklists() {
        try {
            const response = await fetch('checklists.txt');
            const text = await response.text();
            
            // Split the text into weeks
            const weeks = text.split(/Week \d+:/);
            
            // Process each week
            weeks.forEach((week, index) => {
                if (week.trim()) {  // Skip empty entries
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
        
        // Load user progress
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

        this.checklistItems.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'checklist-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = this.completed.has(index);
            checkbox.addEventListener('change', () => this.toggleItem(index));

            const label = document.createElement('label');
            label.textContent = item;
            if (this.completed.has(index)) {
                label.className = 'completed';
            }

            itemDiv.appendChild(checkbox);
            itemDiv.appendChild(label);
            checklistDiv.appendChild(itemDiv);
        });

        if (this.isWeekCompleted()) {
            this.prepareNextWeek();
        }
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

    prepareNextWeek() {
        if (this.currentWeek < 50) {  // Max 50 weeks
            setTimeout(() => {
                this.currentWeek++;
                localStorage.setItem(`${this.userId}_currentWeek`, this.currentWeek);
                this.completed = new Set();
                this.loadCurrentChecklist();
                this.renderWeek();
                this.renderChecklist();
            }, 1000);  // Small delay to show completion
        }
    }
}

// Initialize the app
new ChecklistApp();