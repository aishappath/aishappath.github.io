class ChecklistApp {
    constructor() {
        this.userId = this.generateUserId();
        this.currentWeek = this.getCurrentWeek();
        this.checklistItems = [];
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
        return storedWeek ? parseInt(storedWeek) : 0;
    }

    async init() {
        await this.loadChecklist();
        this.renderWeek();
        this.renderChecklist();
    }

    async loadChecklist() {
        try {
            // Load the checklist for the current week
            const response = await fetch(`checklists/week${this.currentWeek}.txt`);
            const text = await response.text();
            this.checklistItems = text.split('\n').filter(item => item.trim());
            
            // Load user progress
            const progress = localStorage.getItem(`${this.userId}_week${this.currentWeek}`);
            if (progress) {
                this.completed = new Set(JSON.parse(progress));
            } else {
                this.completed = new Set();
            }
        } catch (error) {
            console.error('Error loading checklist:', error);
            this.checklistItems = ['Error loading checklist'];
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
        if (this.currentWeek < 55) {  // Max 56 weeks (0-55)
            setTimeout(() => {
                this.currentWeek++;
                localStorage.setItem(`${this.userId}_currentWeek`, this.currentWeek);
                this.completed = new Set();
                this.init();
            }, 1000);  // Small delay to show completion
        }
    }
}

// Initialize the app
new ChecklistApp();