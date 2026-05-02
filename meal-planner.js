const DAILY_GOALS = {
    groups: { Fruits: 2, Veggies: 3, Protein: 3, Grains: 4, Dairy: 2 },
    nutrition: { carbs: 130, protein: 35, fat: 50 }
};

const GROUP_INFO = {
    Fruits:  { emoji: '🍎', color: '#ef4444', kid: 'Vitamin power!' },
    Veggies: { emoji: '🥦', color: '#22c55e', kid: 'Grow tall & strong!' },
    Protein: { emoji: '💪', color: '#f97316', kid: 'Builds muscles!' },
    Grains:  { emoji: '🌾', color: '#eab308', kid: 'Yummy energy!' },
    Dairy:   { emoji: '🥛', color: '#60a5fa', kid: 'Strong bones!' }
};

const NUTRITION_INFO = {
    carbs:   { label: 'Energy Fuel',    emoji: '⚡', color: '#f59e0b', kid: 'Powers your run, jump & play!' },
    protein: { label: 'Muscle Builder', emoji: '💪', color: '#ef4444', kid: 'Helps you grow big and strong!' },
    fat:     { label: 'Brain Power',    emoji: '🧠', color: '#8b5cf6', kid: 'Helps you think and focus!' }
};

const defaultRecipes = [
    { id: 'pancakes', name: 'Fluffy Pancakes', meal: 'Breakfast',
      emoji: '🥞', art: '🥞🍓🍯', gradient: 'linear-gradient(135deg,#fde68a,#f59e0b)',
      summary: 'Stack of fluffy pancakes with berries and syrup.',
      groups: ['Grains', 'Fruits', 'Dairy'],
      nutrition: { carbs: 55, protein: 8, fat: 10, calories: 340 },
      notes: ['Energy to run and play', 'Sweet morning treat'] },
    { id: 'oatmeal', name: 'Banana Oatmeal', meal: 'Breakfast',
      emoji: '🥣', art: '🥣🍌🍯', gradient: 'linear-gradient(135deg,#fef3c7,#f97316)',
      summary: 'Warm oatmeal with banana slices and honey.',
      groups: ['Grains', 'Fruits'],
      nutrition: { carbs: 48, protein: 6, fat: 5, calories: 260 },
      notes: ['Slow energy for school', 'Cozy and warm'] },
    { id: 'yogurt', name: 'Berry Yogurt Bowl', meal: 'Breakfast',
      emoji: '🍧', art: '🥛🫐🍓', gradient: 'linear-gradient(135deg,#dbeafe,#a78bfa)',
      summary: 'Creamy yogurt with berries and crunchy oats.',
      groups: ['Dairy', 'Fruits'],
      nutrition: { carbs: 30, protein: 12, fat: 4, calories: 210 },
      notes: ['Strong bones', 'Cool and creamy'] },
    { id: 'eggs', name: 'Scrambled Eggs', meal: 'Breakfast',
      emoji: '🍳', art: '🍳🧀🥖', gradient: 'linear-gradient(135deg,#fef9c3,#facc15)',
      summary: 'Soft scrambled eggs with toast.',
      groups: ['Protein', 'Grains'],
      nutrition: { carbs: 22, protein: 18, fat: 14, calories: 290 },
      notes: ['Brain food', 'Builds muscles'] },
    { id: 'mac-cheese', name: 'Mac & Cheese', meal: 'Lunch',
      emoji: '🧀', art: '🧀🍝', gradient: 'linear-gradient(135deg,#fed7aa,#f97316)',
      summary: 'Cheesy pasta that feels like a hug.',
      groups: ['Grains', 'Dairy'],
      nutrition: { carbs: 60, protein: 14, fat: 16, calories: 440 },
      notes: ['Afternoon energy', 'Comfort food'] },
    { id: 'nuggets', name: 'Chicken Nuggets', meal: 'Lunch',
      emoji: '🍗', art: '🍗🥕🍚', gradient: 'linear-gradient(135deg,#fde68a,#dc2626)',
      summary: 'Crispy nuggets with veggie sticks.',
      groups: ['Protein', 'Veggies'],
      nutrition: { carbs: 25, protein: 22, fat: 18, calories: 380 },
      notes: ['Fun finger food', 'Power-up protein'] },
    { id: 'sandwich', name: 'Turkey Sandwich', meal: 'Lunch',
      emoji: '🥪', art: '🥪🥬🍅', gradient: 'linear-gradient(135deg,#bbf7d0,#16a34a)',
      summary: 'Turkey with lettuce and tomato on soft bread.',
      groups: ['Protein', 'Grains', 'Veggies'],
      nutrition: { carbs: 38, protein: 20, fat: 9, calories: 330 },
      notes: ['All-day energy', 'Veggies inside!'] },
    { id: 'pizza', name: 'Veggie Pizza', meal: 'Lunch',
      emoji: '🍕', art: '🍕🍅🌶️', gradient: 'linear-gradient(135deg,#fecaca,#dc2626)',
      summary: 'Crispy pizza loaded with colorful veggies.',
      groups: ['Grains', 'Dairy', 'Veggies'],
      nutrition: { carbs: 50, protein: 14, fat: 12, calories: 380 },
      notes: ['Cheesy and fun', 'Sneaky veggies!'] },
    { id: 'fish', name: 'Grilled Fish', meal: 'Dinner',
      emoji: '🐟', art: '🐟🍋🥦', gradient: 'linear-gradient(135deg,#bae6fd,#0ea5e9)',
      summary: 'Tender grilled fish with lemon and broccoli.',
      groups: ['Protein', 'Veggies'],
      nutrition: { carbs: 12, protein: 28, fat: 10, calories: 290 },
      notes: ['Brain power', 'Strong muscles'] },
    { id: 'chicken', name: 'Roast Chicken & Rice', meal: 'Dinner',
      emoji: '🍱', art: '🍗🍚🥕', gradient: 'linear-gradient(135deg,#fde68a,#b45309)',
      summary: 'Juicy chicken with fluffy rice and carrots.',
      groups: ['Protein', 'Grains', 'Veggies'],
      nutrition: { carbs: 45, protein: 26, fat: 11, calories: 400 },
      notes: ['Power dinner', 'Yummy and filling'] },
    { id: 'spaghetti', name: 'Spaghetti & Meatballs', meal: 'Dinner',
      emoji: '🍝', art: '🍝🍅🧀', gradient: 'linear-gradient(135deg,#fecaca,#b91c1c)',
      summary: 'Spaghetti with tomato sauce and meatballs.',
      groups: ['Grains', 'Protein', 'Veggies'],
      nutrition: { carbs: 58, protein: 22, fat: 14, calories: 470 },
      notes: ['Italian feast', 'Energy for play'] },
    { id: 'tacos', name: 'Taco Night', meal: 'Dinner',
      emoji: '🌮', art: '🌮🥑🌶️', gradient: 'linear-gradient(135deg,#fed7aa,#ea580c)',
      summary: 'Soft tacos with beef, cheese, and lettuce.',
      groups: ['Grains', 'Protein', 'Veggies', 'Dairy'],
      nutrition: { carbs: 40, protein: 20, fat: 16, calories: 410 },
      notes: ['Fiesta time!', 'Crunchy and tasty'] },
    { id: 'fruit-bowl', name: 'Rainbow Fruit Bowl', meal: 'Snack',
      emoji: '🍓', art: '🍓🍎🍇🍌', gradient: 'linear-gradient(135deg,#fbcfe8,#ec4899)',
      summary: 'A rainbow of apples, berries, and melon.',
      groups: ['Fruits'],
      nutrition: { carbs: 28, protein: 1, fat: 0, calories: 110 },
      notes: ['Sweet vitamins', 'Bright colors'] },
    { id: 'veggie-mix', name: 'Veggie Sticks & Dip', meal: 'Snack',
      emoji: '🥕', art: '🥕🥒🫑', gradient: 'linear-gradient(135deg,#bbf7d0,#15803d)',
      summary: 'Crunchy carrot, cucumber and pepper sticks.',
      groups: ['Veggies'],
      nutrition: { carbs: 12, protein: 2, fat: 4, calories: 80 },
      notes: ['Crunch crunch!', 'Helps you grow'] },
    { id: 'smoothie', name: 'Berry Smoothie', meal: 'Snack',
      emoji: '🥤', art: '🥤🍓🍌', gradient: 'linear-gradient(135deg,#f9a8d4,#a855f7)',
      summary: 'Frosty berry & banana smoothie.',
      groups: ['Fruits', 'Dairy'],
      nutrition: { carbs: 32, protein: 6, fat: 3, calories: 180 },
      notes: ['Sip the rainbow', 'Cool and creamy'] }
];

const meals = ['Breakfast', 'Lunch', 'Dinner'];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
let selectedProfileId = null;
let customRecipes = [];
let currentPlan = [];
let selectedDayIndex = (new Date().getDay() + 6) % 7;
let confettiTimer = null;

function initMealPlanner() {
    if (typeof Profiles === 'undefined' || !Profiles.requireProfile()) return;
    selectedProfileId = Profiles.getCurrentId();
    loadCustomRecipes();
    renderProfileSwitcher();
    document.getElementById('profileSwitcher').addEventListener('click', switchProfile);
    loadPlan();
    renderRecipeList();
    renderCalendar();
    renderTopbar();
    document.getElementById('addRecipeBtn').addEventListener('click', openRecipeModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeRecipeModal);
    document.getElementById('saveRecipeBtn').addEventListener('click', saveNewRecipe);
    document.getElementById('recipeModal').addEventListener('click', (event) => {
        if (event.target.classList.contains('modal-backdrop')) closeRecipeModal();
    });
}

function renderProfileSwitcher() {
    const profile = Profiles.getCurrent();
    const avatarEl = document.getElementById('profileSwitcherAvatar');
    const btn = document.getElementById('profileSwitcher');
    if (!profile || !avatarEl) return;
    avatarEl.textContent = profile.avatar || '🦁';
    btn.title = `${profile.name} — click to switch`;
}

function switchProfile() {
    Profiles.clearCurrent();
    window.location.href = 'index.html';
}

function loadCustomRecipes() {
    const saved = localStorage.getItem('mealPlannerCustomRecipes');
    customRecipes = saved ? JSON.parse(saved) : [];
}

function saveCustomRecipes() {
    localStorage.setItem('mealPlannerCustomRecipes', JSON.stringify(customRecipes));
}

function loadPlan() {
    const saved = localStorage.getItem(`mealPlannerPlan_${selectedProfileId}`);
    if (saved) {
        currentPlan = JSON.parse(saved);
    } else {
        currentPlan = days.map(() => meals.map(() => null));
        savePlan();
    }
}

function savePlan() {
    localStorage.setItem(`mealPlannerPlan_${selectedProfileId}`, JSON.stringify(currentPlan));
}

function getAllRecipes() {
    return [...defaultRecipes, ...customRecipes];
}

function renderRecipeList() {
    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = '';
    getAllRecipes().forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.draggable = true;
        card.dataset.recipeId = recipe.id;
        const n = recipe.nutrition || { carbs: 0, protein: 0, fat: 0, calories: 0 };
        card.innerHTML = `
            <div class="recipe-art" style="background:${recipe.gradient || 'linear-gradient(135deg,#e0e7ff,#a5b4fc)'}">
                <div class="recipe-art-emoji">${recipe.art || recipe.emoji || '🍽️'}</div>
                <span class="recipe-meal-badge">${recipe.meal}</span>
            </div>
            <div class="recipe-card-body">
                <div class="recipe-card-title">${recipe.name}</div>
                <div class="recipe-summary">${recipe.summary}</div>
                <div class="recipe-meta">
                    ${(recipe.groups || []).map(g => `
                        <span class="recipe-chip" style="background:${GROUP_INFO[g]?.color || '#6366f1'}1a;color:${GROUP_INFO[g]?.color || '#4338ca'}">
                            ${GROUP_INFO[g]?.emoji || ''} ${g}
                        </span>`).join('')}
                </div>
                <div class="nutri-row">
                    ${nutriPill('carbs', n.carbs)}
                    ${nutriPill('protein', n.protein)}
                    ${nutriPill('fat', n.fat)}
                    <span class="cal-pill">🔥 ${n.calories || 0} kcal</span>
                </div>
            </div>
        `;
        card.addEventListener('dragstart', event => {
            event.dataTransfer.setData('text/plain', recipe.id);
            card.classList.add('dragging');
        });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));
        recipeList.appendChild(card);
    });
}

function nutriPill(key, grams) {
    const info = NUTRITION_INFO[key];
    return `<span class="nutri-pill" style="background:${info.color}1a;color:${info.color}" title="${info.label}: ${info.kid}">
        ${info.emoji} ${grams || 0}g
    </span>`;
}

function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    calendarGrid.appendChild(createCalendarHeader(''));
    days.forEach((day, idx) => {
        const cell = document.createElement('div');
        cell.className = 'calendar-header day-header';
        if (idx === selectedDayIndex) cell.classList.add('today');
        cell.textContent = day;
        cell.addEventListener('click', () => {
            selectedDayIndex = idx;
            renderCalendar();
            renderTopbar();
        });
        calendarGrid.appendChild(cell);
    });
    meals.forEach((meal, mealIndex) => {
        calendarGrid.appendChild(createRowLabel(meal));
        days.forEach((_, dayIndex) => {
            const slot = document.createElement('div');
            slot.className = 'calendar-slot';
            if (dayIndex === selectedDayIndex) slot.classList.add('selected-day');
            slot.dataset.day = dayIndex;
            slot.dataset.meal = mealIndex;
            slot.addEventListener('dragover', event => event.preventDefault());
            slot.addEventListener('dragenter', () => slot.classList.add('drag-over'));
            slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
            slot.addEventListener('drop', event => {
                event.preventDefault();
                slot.classList.remove('drag-over');
                const recipeId = event.dataTransfer.getData('text/plain');
                assignRecipeToSlot(dayIndex, mealIndex, recipeId);
            });
            const assigned = getAssignedRecipe(dayIndex, mealIndex);
            if (assigned) {
                slot.classList.add('filled');
                const slotCard = document.createElement('div');
                slotCard.className = 'slot-card';
                slotCard.style.background = assigned.gradient || '#fff';
                slotCard.innerHTML = `
                    <div class="slot-emoji">${assigned.emoji || '🍽️'}</div>
                    <strong>${assigned.name}</strong>
                    <button class="slot-remove" title="Remove">✕</button>
                `;
                slotCard.querySelector('.slot-remove').addEventListener('click', (e) => {
                    e.stopPropagation();
                    assignRecipeToSlot(dayIndex, mealIndex, null);
                });
                slot.appendChild(slotCard);
            } else {
                const placeholder = document.createElement('div');
                placeholder.className = 'slot-empty';
                placeholder.innerHTML = `<span>+</span><small>${meal}</small>`;
                slot.appendChild(placeholder);
            }
            calendarGrid.appendChild(slot);
        });
    });
}

function createCalendarHeader(text) {
    const cell = document.createElement('div');
    cell.className = 'calendar-header';
    cell.textContent = text;
    return cell;
}

function createRowLabel(text) {
    const label = document.createElement('div');
    label.className = 'calendar-row-label';
    const icon = text === 'Breakfast' ? '☀️' : text === 'Lunch' ? '🥗' : '🌙';
    label.innerHTML = `<span class="row-icon">${icon}</span><span>${text}</span>`;
    return label;
}

function assignRecipeToSlot(dayIndex, mealIndex, recipeId) {
    const previous = currentPlan[dayIndex][mealIndex];
    currentPlan[dayIndex][mealIndex] = recipeId || null;
    savePlan();
    renderCalendar();
    renderTopbar(recipeId && !previous);
}

function getAssignedRecipe(dayIndex, mealIndex) {
    const recipeId = currentPlan[dayIndex][mealIndex];
    if (!recipeId) return null;
    return getAllRecipes().find(r => r.id === recipeId) || null;
}

function getDayTotals(dayIndex) {
    const totals = {
        groups: { Fruits: 0, Veggies: 0, Protein: 0, Grains: 0, Dairy: 0 },
        nutrition: { carbs: 0, protein: 0, fat: 0, calories: 0 }
    };
    meals.forEach((_, mealIndex) => {
        const r = getAssignedRecipe(dayIndex, mealIndex);
        if (!r) return;
        (r.groups || []).forEach(g => { if (totals.groups[g] !== undefined) totals.groups[g]++; });
        const n = r.nutrition || {};
        totals.nutrition.carbs    += n.carbs    || 0;
        totals.nutrition.protein  += n.protein  || 0;
        totals.nutrition.fat      += n.fat      || 0;
        totals.nutrition.calories += n.calories || 0;
    });
    return totals;
}

function renderTopbar(animateBump = false) {
    renderFoodRings(animateBump);
    renderMacroBar();
    renderTopbarDay();
}

function renderTopbarDay() {
    const el = document.getElementById('topbarDay');
    if (!el) return;
    const totals = getDayTotals(selectedDayIndex);
    const completeCount = Object.keys(DAILY_GOALS.groups).filter(g => totals.groups[g] >= DAILY_GOALS.groups[g]).length;
    const total = Object.keys(DAILY_GOALS.groups).length;
    const dayLabel = days[selectedDayIndex];
    el.innerHTML = `
        <div class="topbar-day-label">${dayLabel}'s Plate</div>
        <div class="topbar-day-progress">${completeCount}/${total} circles ${completeCount === total ? '🎉' : ''}</div>
    `;
}

function renderFoodRings(animateBump = false) {
    const foodRings = document.getElementById('foodRings');
    if (!foodRings) return;
    const totals = getDayTotals(selectedDayIndex);
    const ringSize = 72;
    const stroke = 7;
    const radius = (ringSize - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    foodRings.innerHTML = Object.keys(DAILY_GOALS.groups).map(group => {
        const target = DAILY_GOALS.groups[group];
        const value  = totals.groups[group];
        const pct    = Math.min(1, value / target);
        const offset = circumference * (1 - pct);
        const info   = GROUP_INFO[group];
        const done   = value >= target;
        return `
            <div class="food-ring ${done ? 'complete' : ''}" title="${group}: ${info.kid}">
                <svg width="${ringSize}" height="${ringSize}" viewBox="0 0 ${ringSize} ${ringSize}">
                    <circle cx="${ringSize/2}" cy="${ringSize/2}" r="${radius}"
                        fill="none" stroke="#eef2f7" stroke-width="${stroke}"/>
                    <circle cx="${ringSize/2}" cy="${ringSize/2}" r="${radius}"
                        fill="none" stroke="${info.color}" stroke-width="${stroke}"
                        stroke-linecap="round"
                        stroke-dasharray="${circumference}"
                        stroke-dashoffset="${offset}"
                        transform="rotate(-90 ${ringSize/2} ${ringSize/2})"/>
                </svg>
                <div class="food-ring-center">
                    <div class="food-ring-emoji">${info.emoji}</div>
                    <div class="food-ring-count">${value}/${target}</div>
                </div>
                <div class="food-ring-label">${group}</div>
            </div>
        `;
    }).join('');

    const allDone = Object.keys(DAILY_GOALS.groups).every(g => totals.groups[g] >= DAILY_GOALS.groups[g]);
    if (animateBump) {
        foodRings.classList.remove('bump');
        void foodRings.offsetWidth;
        foodRings.classList.add('bump');
    }
    if (allDone) launchConfetti();
}

function renderMacroBar() {
    const row = document.getElementById('macroBarRow');
    if (!row) return;
    const totals = getDayTotals(selectedDayIndex);
    const macroHtml = ['carbs', 'protein', 'fat'].map(key => {
        const target = DAILY_GOALS.nutrition[key];
        const value  = totals.nutrition[key];
        const pct    = Math.min(100, Math.round((value / target) * 100));
        const info   = NUTRITION_INFO[key];
        return `
            <div class="macro-item">
                <div class="macro-head">
                    <span class="macro-emoji">${info.emoji}</span>
                    <span class="macro-label">${info.label}</span>
                    <span class="macro-value">${value}g <small>/ ${target}g</small></span>
                </div>
                <div class="macro-bar"><div class="macro-fill" style="width:${pct}%;background:${info.color}"></div></div>
            </div>
        `;
    }).join('');
    row.innerHTML = `
        ${macroHtml}
        <div class="macro-cal">
            <div class="macro-cal-emoji">🔥</div>
            <div class="macro-cal-value">${totals.nutrition.calories}</div>
            <div class="macro-cal-label">kcal today</div>
        </div>
    `;
}

function launchConfetti() {
    const layer = document.getElementById('confettiLayer');
    if (!layer || layer.dataset.active === '1') return;
    layer.dataset.active = '1';
    const emojis = ['🎉','⭐','🌟','🍎','🥦','💪','🥛','🌾'];
    for (let i = 0; i < 28; i++) {
        const piece = document.createElement('span');
        piece.className = 'confetti-piece';
        piece.textContent = emojis[i % emojis.length];
        piece.style.left = Math.random() * 100 + '%';
        piece.style.animationDelay = (Math.random() * 0.6) + 's';
        piece.style.fontSize = (16 + Math.random() * 16) + 'px';
        layer.appendChild(piece);
    }
    clearTimeout(confettiTimer);
    confettiTimer = setTimeout(() => {
        layer.innerHTML = '';
        layer.dataset.active = '0';
    }, 2400);
}

function openRecipeModal() {
    document.getElementById('newRecipeName').value = '';
    document.getElementById('newRecipeNote').value = '';
    document.getElementById('newRecipeMeal').value = 'Breakfast';
    document.getElementById('newRecipeEmoji').value = '🍽️';
    ['Fruits','Veggies','Protein','Grains','Dairy'].forEach(g => {
        const el = document.getElementById('grp_' + g);
        if (el) el.checked = false;
    });
    document.getElementById('newCarbs').value = 30;
    document.getElementById('newProtein').value = 10;
    document.getElementById('newFat').value = 8;
    document.getElementById('recipeModal').classList.remove('hidden');
}

function closeRecipeModal() {
    document.getElementById('recipeModal').classList.add('hidden');
}

function saveNewRecipe() {
    const name = document.getElementById('newRecipeName').value.trim();
    if (!name) { alert('Please enter a recipe name.'); return; }
    const meal = document.getElementById('newRecipeMeal').value;
    const emoji = document.getElementById('newRecipeEmoji').value.trim() || '🍽️';
    const note = document.getElementById('newRecipeNote').value.trim();
    const groups = ['Fruits','Veggies','Protein','Grains','Dairy'].filter(g => document.getElementById('grp_' + g)?.checked);
    const carbs   = parseInt(document.getElementById('newCarbs').value, 10)   || 0;
    const protein = parseInt(document.getElementById('newProtein').value, 10) || 0;
    const fat     = parseInt(document.getElementById('newFat').value, 10)     || 0;
    const calories = Math.round(carbs * 4 + protein * 4 + fat * 9);
    const newRecipe = {
        id: `custom-${Date.now()}`,
        name, meal, emoji, art: emoji,
        gradient: 'linear-gradient(135deg,#ddd6fe,#8b5cf6)',
        summary: note || 'A favorite recipe made by you.',
        groups: groups.length ? groups : ['Grains'],
        nutrition: { carbs, protein, fat, calories },
        notes: [note || 'Yummy and homemade']
    };
    customRecipes.unshift(newRecipe);
    saveCustomRecipes();
    closeRecipeModal();
    renderRecipeList();
}

document.addEventListener('DOMContentLoaded', initMealPlanner);
