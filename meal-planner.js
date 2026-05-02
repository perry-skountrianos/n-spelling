const profiles = [
    { id: 'nicholas', name: 'Nicholas', avatar: '🦁' },
    { id: 'constantine', name: 'Constantine', avatar: '🐯' }
];

const defaultRecipes = [
    { id: 'pancakes', name: 'Pancakes', meal: 'Breakfast', summary: 'Fluffy pancakes with berries and syrup.', tags: ['Fruit', 'Carbs'], notes: ['Energy to run and play', 'Sweet and fun'] },
    { id: 'oatmeal', name: 'Oatmeal', meal: 'Breakfast', summary: 'Warm oatmeal with banana and honey.', tags: ['Carbs', 'Fruit'], notes: ['Keeps your tummy happy', 'Slow energy for the morning'] },
    { id: 'yogurt', name: 'Yogurt', meal: 'Breakfast', summary: 'Creamy yogurt with berries and oats.', tags: ['Protein', 'Fruit'], notes: ['Strong bones and teeth', 'Creamy snack'] },
    { id: 'mac-cheese', name: 'Mac and Cheese', meal: 'Lunch', summary: 'Cheesy pasta that feels like a hug.', tags: ['Carbs', 'Protein'], notes: ['Energy for the afternoon', 'Comfort food'] },
    { id: 'fish', name: 'Fish', meal: 'Dinner', summary: 'Simple grilled fish with lemon.', tags: ['Protein'], notes: ['Brain food', 'Strong muscles'] },
    { id: 'chicken-nuggets', name: 'Chicken Nuggets', meal: 'Lunch', summary: 'Crispy nuggets with dipping sauce.', tags: ['Protein'], notes: ['Fun to eat', 'Protein to grow'] },
    { id: 'chicken', name: 'Chicken', meal: 'Dinner', summary: 'Roasted chicken with soft rice.', tags: ['Protein'], notes: ['Strong and healthy', 'Tasty dinner'] },
    { id: 'fruit-bowl', name: 'Fruit Bowl', meal: 'Any', summary: 'Fresh fruits like apples, melon and berries.', tags: ['Fruit'], notes: ['Vitamins for a bright day', 'Sweet and crunchy'] },
    { id: 'veggie-mix', name: 'Veggie Mix', meal: 'Any', summary: 'Colorful vegetables with a light dip.', tags: ['Veggies'], notes: ['Helps you grow tall', 'Crunchy and fun'] }
];

const meals = ['Breakfast', 'Lunch', 'Dinner'];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
let selectedProfileId = null;
let customRecipes = [];
let currentPlan = [];

function initMealPlanner() {
    loadCustomRecipes();
    renderProfiles();
    const savedProfile = localStorage.getItem('mealPlannerProfile') || profiles[0].id;
    selectProfile(savedProfile);
    document.getElementById('addRecipeBtn').addEventListener('click', openRecipeModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeRecipeModal);
    document.getElementById('saveRecipeBtn').addEventListener('click', saveNewRecipe);
    document.getElementById('recipeModal').addEventListener('click', (event) => {
        if (event.target.classList.contains('modal-backdrop')) closeRecipeModal();
    });
}

function renderProfiles() {
    const profileRow = document.getElementById('profileRow');
    profileRow.innerHTML = '';
    profiles.forEach(profile => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'profile-card';
        card.dataset.profile = profile.id;
        card.innerHTML = `
            <div class="profile-card-avatar">${profile.avatar}</div>
            <div class="profile-card-name">${profile.name}</div>
        `;
        card.addEventListener('click', () => selectProfile(profile.id));
        profileRow.appendChild(card);
    });
}

function selectProfile(profileId) {
    selectedProfileId = profileId;
    localStorage.setItem('mealPlannerProfile', profileId);
    document.querySelectorAll('.profile-card').forEach(card => {
        card.classList.toggle('active', card.dataset.profile === profileId);
    });
    loadPlan();
    renderRecipeList();
    renderCalendar();
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

function renderRecipeList() {
    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = '';
    const recipes = [...defaultRecipes, ...customRecipes];
    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.draggable = true;
        card.dataset.recipeId = recipe.id;
        card.innerHTML = `
            <div class="recipe-card-title">
                <div>${recipe.name}</div>
                <span>${recipe.meal}</span>
            </div>
            <div class="recipe-summary">${recipe.summary}</div>
            <div class="recipe-meta">
                ${recipe.tags.map(tag => `<span class="recipe-chip">${tag}</span>`).join('')}
            </div>
            <div class="recipe-notes">${recipe.notes.join(' · ')}</div>
        `;
        card.addEventListener('dragstart', event => {
            event.dataTransfer.setData('text/plain', recipe.id);
        });
        recipeList.appendChild(card);
    });
}

function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    calendarGrid.appendChild(createCalendarHeader(''));
    days.forEach(day => calendarGrid.appendChild(createCalendarHeader(day)));
    meals.forEach((meal, mealIndex) => {
        calendarGrid.appendChild(createRowLabel(meal));
        days.forEach((_, dayIndex) => {
            const slot = document.createElement('div');
            slot.className = 'calendar-slot';
            slot.dataset.day = dayIndex;
            slot.dataset.meal = mealIndex;
            slot.innerHTML = `<div class="slot-title">${meal}</div>`;
            slot.addEventListener('dragover', event => event.preventDefault());
            slot.addEventListener('dragenter', () => slot.classList.add('drag-over'));
            slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
            slot.addEventListener('drop', event => {
                event.preventDefault();
                slot.classList.remove('drag-over');
                const recipeId = event.dataTransfer.getData('text/plain');
                assignRecipeToSlot(dayIndex, mealIndex, recipeId);
            });
            const assignedRecipe = getAssignedRecipe(dayIndex, mealIndex);
            if (assignedRecipe) {
                slot.classList.add('filled');
                const slotCard = document.createElement('div');
                slotCard.className = 'slot-card';
                slotCard.innerHTML = `
                    <strong>${assignedRecipe.name}</strong>
                    <div class="slot-chip">${assignedRecipe.tags.join(' · ')}</div>
                    <div class="recipe-notes">${assignedRecipe.notes.join(' · ')}</div>
                    <button class="slot-remove">Remove</button>
                `;
                slotCard.querySelector('.slot-remove').addEventListener('click', () => {
                    assignRecipeToSlot(dayIndex, mealIndex, null);
                });
                slot.appendChild(slotCard);
            } else {
                const placeholder = document.createElement('div');
                placeholder.className = 'slot-empty';
                placeholder.textContent = 'Drop a recipe here';
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
    label.textContent = text;
    return label;
}

function assignRecipeToSlot(dayIndex, mealIndex, recipeId) {
    currentPlan[dayIndex][mealIndex] = recipeId || null;
    savePlan();
    renderCalendar();
}

function getAssignedRecipe(dayIndex, mealIndex) {
    const recipeId = currentPlan[dayIndex][mealIndex];
    if (!recipeId) return null;
    return [...defaultRecipes, ...customRecipes].find(r => r.id === recipeId) || null;
}

function openRecipeModal() {
    document.getElementById('newRecipeName').value = '';
    document.getElementById('newRecipeNote').value = '';
    document.getElementById('newRecipeMeal').value = 'Breakfast';
    document.getElementById('newRecipeFruit').checked = false;
    document.getElementById('newRecipeVeg').checked = false;
    document.getElementById('newRecipeProtein').checked = false;
    document.getElementById('newRecipeCarbs').checked = false;
    document.getElementById('recipeModal').classList.remove('hidden');
}

function closeRecipeModal() {
    document.getElementById('recipeModal').classList.add('hidden');
}

function saveNewRecipe() {
    const name = document.getElementById('newRecipeName').value.trim();
    if (!name) {
        alert('Please enter a recipe name.');
        return;
    }
    const meal = document.getElementById('newRecipeMeal').value;
    const fruit = document.getElementById('newRecipeFruit').checked;
    const veg = document.getElementById('newRecipeVeg').checked;
    const protein = document.getElementById('newRecipeProtein').checked;
    const carbs = document.getElementById('newRecipeCarbs').checked;
    const note = document.getElementById('newRecipeNote').value.trim();
    const tags = [];
    if (fruit) tags.push('Fruit');
    if (veg) tags.push('Veggies');
    if (protein) tags.push('Protein');
    if (carbs) tags.push('Carbs');
    if (!tags.length) tags.push('Balanced');
    const newRecipe = {
        id: `custom-${Date.now()}`,
        name,
        meal,
        summary: note || 'A favorite recipe made by you.',
        tags,
        notes: tags.map(tag => getNutritionNote(tag))
    };
    customRecipes.unshift(newRecipe);
    saveCustomRecipes();
    closeRecipeModal();
    renderRecipeList();
}

function getNutritionNote(tag) {
    switch (tag) {
        case 'Fruit': return 'Vitamin-filled and sweet';
        case 'Veggies': return 'Helps you grow strong';
        case 'Protein': return 'Builds muscles';
        case 'Carbs': return 'Gives you energy';
        default: return 'Tastes great';
    }
}

document.addEventListener('DOMContentLoaded', initMealPlanner);
