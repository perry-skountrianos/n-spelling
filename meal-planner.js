// Per-age daily targets (USDA-based, simplified for kids)
const TARGETS_BY_AGE = {
    // 4-8 yrs (Nicholas, 7)
    7: {
        groups:    { Fruits: 1, Veggies: 2, Protein: 3, Grains: 4, Dairy: 2 },
        nutrition: { carbs: 200, protein: 34, fat: 50, calories: 1600 }
    },
    // 9-13 yrs (Constantine, 12)
    12: {
        groups:    { Fruits: 2, Veggies: 3, Protein: 4, Grains: 6, Dairy: 3 },
        nutrition: { carbs: 285, protein: 52, fat: 70, calories: 2200 }
    }
};

function getTargets() {
    const profile = (typeof Profiles !== 'undefined') ? Profiles.getCurrent() : null;
    const age = profile && profile.age ? profile.age : 7;
    // Pick the closest bracket
    return age >= 9 ? TARGETS_BY_AGE[12] : TARGETS_BY_AGE[7];
}

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

// Realistic recipes. Each has:
//   image  - external thumbnail (TheMealDB / Wikimedia / Unsplash). Falls back to emoji art on error.
//   href   - link to the actual recipe page.
//   nutrition values are per single child-sized serving (~1 cup main + sides).
const defaultRecipes = [
    // ===== BREAKFAST =====
    {
        id: 'pancakes', name: 'Buttermilk Pancakes', meal: 'Breakfast',
        emoji: '🥞', art: '🥞�', gradient: 'linear-gradient(135deg,#fde68a,#f59e0b)',
        image: 'https://www.themealdb.com/images/media/meals/rwuyqx1511383174.jpg',
        href: 'https://www.allrecipes.com/recipe/21014/good-old-fashioned-pancakes/',
        summary: '3 fluffy pancakes with butter and a drizzle of maple syrup.',
        groups: ['Grains', 'Dairy'],
        nutrition: { carbs: 58, protein: 9, fat: 11, calories: 360 },
        notes: ['Energy to run and play']
    },
    {
        id: 'oatmeal', name: 'Banana Oatmeal', meal: 'Breakfast',
        emoji: '🥣', art: '🥣🍌🍯', gradient: 'linear-gradient(135deg,#fef3c7,#f97316)',
        image: 'https://www.themealdb.com/images/media/meals/1550441882.jpg',
        href: 'https://www.allrecipes.com/recipe/235168/easy-oatmeal/',
        summary: 'Warm oats cooked in milk, topped with banana and honey.',
        groups: ['Grains', 'Fruits', 'Dairy'],
        nutrition: { carbs: 50, protein: 8, fat: 6, calories: 290 },
        notes: ['Slow energy for school']
    },
    {
        id: 'yogurt', name: 'Greek Yogurt Parfait', meal: 'Breakfast',
        emoji: '🍧', art: '🥛🫐🍓', gradient: 'linear-gradient(135deg,#dbeafe,#a78bfa)',
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600',
        href: 'https://www.bbcgoodfood.com/recipes/berry-yogurt-pots',
        summary: 'Greek yogurt layered with berries and granola.',
        groups: ['Dairy', 'Fruits', 'Grains'],
        nutrition: { carbs: 32, protein: 14, fat: 5, calories: 240 },
        notes: ['Strong bones', 'Cool and creamy']
    },
    {
        id: 'eggs-toast', name: 'Scrambled Eggs & Toast', meal: 'Breakfast',
        emoji: '🍳', art: '🍳�', gradient: 'linear-gradient(135deg,#fef9c3,#facc15)',
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600',
        href: 'https://www.bbcgoodfood.com/recipes/perfect-scrambled-eggs-recipe',
        summary: 'Soft scrambled eggs with buttered whole-wheat toast.',
        groups: ['Protein', 'Grains'],
        nutrition: { carbs: 24, protein: 19, fat: 15, calories: 310 },
        notes: ['Brain food', 'Builds muscles']
    },
    {
        id: 'cereal', name: 'Cereal & Milk', meal: 'Breakfast',
        emoji: '🥣', art: '🥣🥛🍓', gradient: 'linear-gradient(135deg,#fee2e2,#f87171)',
        image: 'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?w=600',
        href: 'https://www.bbcgoodfood.com/howto/guide/healthy-breakfast-cereal',
        summary: 'Whole-grain cereal with milk and a few berries.',
        groups: ['Grains', 'Dairy', 'Fruits'],
        nutrition: { carbs: 45, protein: 9, fat: 4, calories: 240 },
        notes: ['Quick start', 'Crunchy']
    },

    // ===== LUNCH =====
    {
        id: 'mac-cheese', name: 'Mac & Cheese', meal: 'Lunch',
        emoji: '🧀', art: '🧀🍝', gradient: 'linear-gradient(135deg,#fed7aa,#f97316)',
        image: 'https://www.themealdb.com/images/media/meals/qyutlu1511553957.jpg',
        href: 'https://www.allrecipes.com/recipe/14905/macaroni-and-cheese/',
        summary: 'Classic baked macaroni with creamy cheddar sauce.',
        groups: ['Grains', 'Dairy'],
        nutrition: { carbs: 55, protein: 16, fat: 18, calories: 450 },
        notes: ['Afternoon energy', 'Comfort food']
    },
    {
        id: 'turkey-sandwich', name: 'Turkey & Cheese Sandwich', meal: 'Lunch',
        emoji: '🥪', art: '🥪', gradient: 'linear-gradient(135deg,#bbf7d0,#16a34a)',
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600',
        href: 'https://www.bbcgoodfood.com/recipes/turkey-club-sandwich',
        summary: 'Turkey and cheese on whole-wheat bread.',
        groups: ['Protein', 'Grains', 'Dairy'],
        nutrition: { carbs: 36, protein: 22, fat: 11, calories: 350 },
        notes: ['All-day energy']
    },
    {
        id: 'chicken-nuggets', name: 'Baked Chicken Nuggets', meal: 'Lunch',
        emoji: '🍗', art: '🍗', gradient: 'linear-gradient(135deg,#fde68a,#dc2626)',
        image: 'https://www.themealdb.com/images/media/meals/4ll7as1565130265.jpg',
        href: 'https://www.allrecipes.com/recipe/229960/chef-johns-chicken-nuggets/',
        summary: 'Crispy oven-baked breaded chicken nuggets.',
        groups: ['Protein', 'Grains'],
        nutrition: { carbs: 18, protein: 24, fat: 14, calories: 320 },
        notes: ['Fun finger food', 'Power-up protein']
    },
    {
        id: 'pizza-slice', name: 'Cheese Pizza Slice', meal: 'Lunch',
        emoji: '🍕', art: '🍕', gradient: 'linear-gradient(135deg,#fecaca,#dc2626)',
        image: 'https://www.themealdb.com/images/media/meals/x0lk931587671540.jpg',
        href: 'https://www.allrecipes.com/recipe/254131/garlic-cheese-pizza/',
        summary: 'A slice of cheese pizza on a tomato-sauce crust.',
        groups: ['Grains', 'Dairy'],
        nutrition: { carbs: 42, protein: 14, fat: 12, calories: 350 },
        notes: ['Cheesy and fun']
    },
    {
        id: 'quesadilla', name: 'Cheese Quesadilla', meal: 'Lunch',
        emoji: '🫓', art: '🫓🧀🥑', gradient: 'linear-gradient(135deg,#fde68a,#ca8a04)',
        image: 'https://images.unsplash.com/photo-1618040996337-11c0d24bf25e?w=600',
        href: 'https://www.allrecipes.com/recipe/22669/quesadillas/',
        summary: 'Tortilla folded with melted cheese, served with salsa.',
        groups: ['Grains', 'Dairy'],
        nutrition: { carbs: 38, protein: 14, fat: 16, calories: 360 },
        notes: ['Crispy and gooey']
    },
    {
        id: 'pbj', name: 'Peanut Butter & Jelly', meal: 'Lunch',
        emoji: '🥪', art: '🥪🍇🥜', gradient: 'linear-gradient(135deg,#fde68a,#a855f7)',
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600',
        href: 'https://www.allrecipes.com/recipe/21809/perfect-peanut-butter-and-jelly-sandwich/',
        summary: 'Peanut butter & jelly on whole-wheat bread, plus a banana.',
        groups: ['Grains', 'Protein', 'Fruits'],
        nutrition: { carbs: 48, protein: 12, fat: 14, calories: 380 },
        notes: ['Classic favorite']
    },

    // ===== DINNER =====
    {
        id: 'spaghetti', name: 'Spaghetti & Meatballs', meal: 'Dinner',
        emoji: '🍝', art: '🍝', gradient: 'linear-gradient(135deg,#fecaca,#b91c1c)',
        image: 'https://www.themealdb.com/images/media/meals/sutysw1468247559.jpg',
        href: 'https://www.allrecipes.com/recipe/11691/spaghetti-and-meatballs/',
        summary: 'Spaghetti tossed in tomato sauce with beef meatballs.',
        groups: ['Grains', 'Protein'],
        nutrition: { carbs: 60, protein: 24, fat: 15, calories: 490 },
        notes: ['Italian feast']
    },
    {
        id: 'roast-chicken', name: 'Roast Chicken & Rice', meal: 'Dinner',
        emoji: '🍱', art: '🍗🍚🥕', gradient: 'linear-gradient(135deg,#fde68a,#b45309)',
        image: 'https://www.themealdb.com/images/media/meals/ysxwuq1487323065.jpg',
        href: 'https://www.bbcgoodfood.com/recipes/easy-roast-chicken',
        summary: 'Juicy roast chicken with steamed rice and carrots.',
        groups: ['Protein', 'Grains', 'Veggies'],
        nutrition: { carbs: 46, protein: 28, fat: 12, calories: 410 },
        notes: ['Power dinner']
    },
    {
        id: 'salmon', name: 'Honey Glazed Salmon', meal: 'Dinner',
        emoji: '🐟', art: '🐟🍋🥦', gradient: 'linear-gradient(135deg,#bae6fd,#0ea5e9)',
        image: 'https://www.themealdb.com/images/media/meals/1548772327.jpg',
        href: 'https://www.allrecipes.com/recipe/12720/lemon-baked-salmon/',
        summary: 'Salmon glazed with honey and lemon, served with broccoli.',
        groups: ['Protein', 'Veggies'],
        nutrition: { carbs: 14, protein: 30, fat: 12, calories: 320 },
        notes: ['Brain power', 'Strong muscles']
    },
    {
        id: 'tacos', name: 'Beef Tacos', meal: 'Dinner',
        emoji: '🌮', art: '🌮🥑🌶️', gradient: 'linear-gradient(135deg,#fed7aa,#ea580c)',
        image: 'https://www.themealdb.com/images/media/meals/uvuyxu1503067369.jpg',
        href: 'https://www.allrecipes.com/recipe/70343/taco-seasoning-i/',
        summary: 'Soft tortillas filled with seasoned beef, lettuce and cheese.',
        groups: ['Grains', 'Protein', 'Veggies', 'Dairy'],
        nutrition: { carbs: 38, protein: 22, fat: 16, calories: 410 },
        notes: ['Fiesta time!']
    },
    {
        id: 'stir-fry', name: 'Chicken Stir-Fry', meal: 'Dinner',
        emoji: '🥡', art: '🥡🥦🌶️', gradient: 'linear-gradient(135deg,#bbf7d0,#15803d)',
        image: 'https://www.themealdb.com/images/media/meals/1529444113.jpg',
        href: 'https://www.bbcgoodfood.com/recipes/chicken-stir-fry',
        summary: 'Chicken with mixed veggies and rice in a savory sauce.',
        groups: ['Protein', 'Veggies', 'Grains'],
        nutrition: { carbs: 48, protein: 26, fat: 10, calories: 420 },
        notes: ['Colorful and tasty']
    },
    {
        id: 'beef-burger', name: 'Cheeseburger & Fries', meal: 'Dinner',
        emoji: '🍔', art: '🍔', gradient: 'linear-gradient(135deg,#fde68a,#92400e)',
        image: 'https://www.themealdb.com/images/media/meals/urzj1d1587670726.jpg',
        href: 'https://www.allrecipes.com/recipe/49404/juiciest-hamburgers-ever/',
        summary: 'Beef burger with cheese on a bun, plus a side of fries.',
        groups: ['Protein', 'Grains', 'Dairy'],
        nutrition: { carbs: 50, protein: 26, fat: 24, calories: 560 },
        notes: ['Diner-style']
    },

    // ===== SNACKS =====
    {
        id: 'fruit-bowl', name: 'Rainbow Fruit Bowl', meal: 'Snack',
        emoji: '🍓', art: '🍓🍎🍇🍌', gradient: 'linear-gradient(135deg,#fbcfe8,#ec4899)',
        image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600',
        href: 'https://www.bbcgoodfood.com/recipes/rainbow-fruit-salad',
        summary: 'Apples, berries, melon and grapes.',
        groups: ['Fruits'],
        nutrition: { carbs: 28, protein: 1, fat: 0, calories: 110 },
        notes: ['Sweet vitamins']
    },
    {
        id: 'veggie-sticks', name: 'Veggie Sticks & Hummus', meal: 'Snack',
        emoji: '🥕', art: '🥕🥒🫑', gradient: 'linear-gradient(135deg,#bbf7d0,#15803d)',
        image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=600',
        href: 'https://www.bbcgoodfood.com/recipes/veggie-sticks-hummus',
        summary: 'Carrot, cucumber and pepper sticks with hummus.',
        groups: ['Veggies', 'Protein'],
        nutrition: { carbs: 18, protein: 5, fat: 6, calories: 140 },
        notes: ['Crunch crunch!']
    },
    {
        id: 'smoothie', name: 'Berry Banana Smoothie', meal: 'Snack',
        emoji: '🥤', art: '🥤🍓🍌', gradient: 'linear-gradient(135deg,#f9a8d4,#a855f7)',
        image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600',
        href: 'https://www.bbcgoodfood.com/recipes/banana-berry-smoothie',
        summary: 'Banana, mixed berries and yogurt blended frosty.',
        groups: ['Fruits', 'Dairy'],
        nutrition: { carbs: 34, protein: 7, fat: 3, calories: 200 },
        notes: ['Sip the rainbow']
    },
    {
        id: 'apple-pb', name: 'Apple Slices & Peanut Butter', meal: 'Snack',
        emoji: '🍎', art: '🍎🥜', gradient: 'linear-gradient(135deg,#fecaca,#ef4444)',
        image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600',
        href: 'https://www.allrecipes.com/recipe/238999/apples-with-peanut-butter/',
        summary: 'Crisp apple slices with creamy peanut butter dip.',
        groups: ['Fruits', 'Protein'],
        nutrition: { carbs: 22, protein: 4, fat: 8, calories: 180 },
        notes: ['Crunchy & nutty']
    }
];

const MEAL_FILTERS = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];
const meals = ['Breakfast', 'Lunch', 'Dinner'];
const FULL_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

let selectedProfileId = null;
let customRecipes = [];
let planMap = {};                 // { 'YYYY-MM-DD': [bId, lId, dId] }
let selectedDate = startOfToday();
let activeFilter = 'All';
let confettiTimer = null;

// ----- Date helpers -----
function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}
function isoDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
function shiftDate(d, deltaDays) {
    const out = new Date(d);
    out.setDate(out.getDate() + deltaDays);
    return out;
}
function formatLongDate(d) {
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}
function daysBetween(a, b) {
    const ms = 86400000;
    const da = new Date(a); da.setHours(0,0,0,0);
    const db = new Date(b); db.setHours(0,0,0,0);
    return Math.round((db - da) / ms);
}

// ----- Init -----
function initMealPlanner() {
    if (typeof Profiles === 'undefined' || !Profiles.requireProfile()) return;
    selectedProfileId = Profiles.getCurrentId();
    loadCustomRecipes();
    loadPlan();
    renderProfileSwitcher();
    document.getElementById('profileSwitcher').addEventListener('click', switchProfile);
    document.getElementById('addRecipeBtn').addEventListener('click', openRecipeModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeRecipeModal);
    document.getElementById('saveRecipeBtn').addEventListener('click', saveNewRecipe);
    document.getElementById('recipeModal').addEventListener('click', (event) => {
        if (event.target.classList.contains('modal-backdrop')) closeRecipeModal();
    });
    renderFilterChips();
    renderRecipeList();
    renderDayView();
    renderTopbar();
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

// ----- Storage -----
function loadCustomRecipes() {
    const saved = localStorage.getItem('mealPlannerCustomRecipes');
    customRecipes = saved ? JSON.parse(saved) : [];
}
function saveCustomRecipes() {
    localStorage.setItem('mealPlannerCustomRecipes', JSON.stringify(customRecipes));
}
function loadPlan() {
    const saved = localStorage.getItem(`mealPlannerPlanV2_${selectedProfileId}`);
    planMap = saved ? JSON.parse(saved) : {};
}
function savePlan() {
    localStorage.setItem(`mealPlannerPlanV2_${selectedProfileId}`, JSON.stringify(planMap));
}
function getAllRecipes() {
    return [...defaultRecipes, ...customRecipes];
}

// ----- Filter chips -----
function renderFilterChips() {
    const row = document.getElementById('filterChips');
    if (!row) return;
    row.innerHTML = '';
    MEAL_FILTERS.forEach(name => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'filter-chip' + (activeFilter === name ? ' active' : '');
        const icon = name === 'Breakfast' ? '☀️' : name === 'Lunch' ? '🥗' : name === 'Dinner' ? '🌙' : name === 'Snack' ? '🍎' : '🍽️';
        btn.innerHTML = `<span>${icon}</span> ${name}`;
        btn.addEventListener('click', () => {
            activeFilter = name;
            renderFilterChips();
            renderRecipeList();
        });
        row.appendChild(btn);
    });
}

// ----- Recipe list -----
function renderRecipeList() {
    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = '';
    const filtered = getAllRecipes().filter(r => activeFilter === 'All' || r.meal === activeFilter);
    if (!filtered.length) {
        recipeList.innerHTML = `<div class="empty-recipes">No ${activeFilter.toLowerCase()} recipes yet. Try "Create your own".</div>`;
        return;
    }
    filtered.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.draggable = true;
        card.dataset.recipeId = recipe.id;
        const n = recipe.nutrition || { carbs: 0, protein: 0, fat: 0, calories: 0 };
        const imgHtml = recipe.image
            ? `<img class="recipe-photo" src="${recipe.image}" alt="${recipe.name}" loading="lazy"
                  onerror="this.style.display='none';this.nextElementSibling.style.display='grid';"/>
               <div class="recipe-art-fallback" style="display:none;background:${recipe.gradient || ''}">
                  <div class="recipe-art-emoji">${recipe.art || recipe.emoji || '🍽️'}</div>
               </div>`
            : `<div class="recipe-art-fallback" style="background:${recipe.gradient || ''}">
                  <div class="recipe-art-emoji">${recipe.art || recipe.emoji || '🍽️'}</div>
               </div>`;
        const linkBtn = recipe.href
            ? `<a class="recipe-link" href="${recipe.href}" target="_blank" rel="noopener" title="Open recipe">↗</a>`
            : '';
        card.innerHTML = `
            <div class="recipe-art">
                ${imgHtml}
                <span class="recipe-meal-badge">${recipe.meal}</span>
                ${linkBtn}
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

// ----- Day view (single day) -----
function renderDayView() {
    const grid = document.getElementById('dayGrid');
    const titleEl = document.getElementById('dayTitle');
    const subEl = document.getElementById('daySubtitle');
    if (!grid || !titleEl) return;

    const today = startOfToday();
    const offset = daysBetween(today, selectedDate);
    let prefix;
    if (offset === 0) prefix = 'Today';
    else if (offset === 1) prefix = 'Tomorrow';
    else if (offset === -1) prefix = 'Yesterday';
    else prefix = FULL_DAYS[(selectedDate.getDay() + 6) % 7];
    titleEl.textContent = prefix;
    subEl.textContent = formatLongDate(selectedDate);

    const dateKey = isoDate(selectedDate);
    const dayPlan = planMap[dateKey] || [null, null, null];

    grid.innerHTML = '';
    meals.forEach((meal, mealIndex) => {
        const slot = document.createElement('div');
        slot.className = 'day-slot';
        slot.dataset.meal = mealIndex;
        slot.addEventListener('dragover', e => e.preventDefault());
        slot.addEventListener('dragenter', () => slot.classList.add('drag-over'));
        slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
        slot.addEventListener('drop', e => {
            e.preventDefault();
            slot.classList.remove('drag-over');
            const recipeId = e.dataTransfer.getData('text/plain');
            assignMeal(mealIndex, recipeId);
        });
        const icon = meal === 'Breakfast' ? '☀️' : meal === 'Lunch' ? '🥗' : '🌙';
        const recipeId = dayPlan[mealIndex];
        const assigned = recipeId ? getAllRecipes().find(r => r.id === recipeId) : null;
        if (assigned) {
            slot.classList.add('filled');
            const imgPart = assigned.image
                ? `<img class="day-slot-photo" src="${assigned.image}" alt="${assigned.name}" loading="lazy"
                       onerror="this.style.display='none';this.nextElementSibling.style.display='grid';"/>
                   <div class="day-slot-fallback" style="display:none;background:${assigned.gradient || ''}">
                       <span>${assigned.emoji || '🍽️'}</span>
                   </div>`
                : `<div class="day-slot-fallback" style="background:${assigned.gradient || ''}">
                       <span>${assigned.emoji || '🍽️'}</span>
                   </div>`;
            const n = assigned.nutrition || {};
            slot.innerHTML = `
                <div class="day-slot-head">
                    <span class="day-slot-icon">${icon}</span>
                    <span class="day-slot-meal">${meal}</span>
                    <button class="day-slot-remove" title="Remove">✕</button>
                </div>
                <div class="day-slot-body">
                    <div class="day-slot-image">${imgPart}</div>
                    <div class="day-slot-info">
                        <div class="day-slot-name">${assigned.name}</div>
                        <div class="day-slot-summary">${assigned.summary || ''}</div>
                        <div class="nutri-row">
                            ${nutriPill('carbs', n.carbs)}
                            ${nutriPill('protein', n.protein)}
                            ${nutriPill('fat', n.fat)}
                            <span class="cal-pill">🔥 ${n.calories || 0} kcal</span>
                        </div>
                        ${assigned.href ? `<a class="day-slot-link" href="${assigned.href}" target="_blank" rel="noopener">View recipe ↗</a>` : ''}
                    </div>
                </div>
            `;
            slot.querySelector('.day-slot-remove').addEventListener('click', () => assignMeal(mealIndex, null));
        } else {
            slot.innerHTML = `
                <div class="day-slot-head">
                    <span class="day-slot-icon">${icon}</span>
                    <span class="day-slot-meal">${meal}</span>
                </div>
                <div class="day-slot-empty">
                    <span class="plus">+</span>
                    <span>Drag a ${meal.toLowerCase()} recipe here</span>
                </div>
            `;
        }
        grid.appendChild(slot);
    });
}

function assignMeal(mealIndex, recipeId) {
    const dateKey = isoDate(selectedDate);
    const arr = planMap[dateKey] || [null, null, null];
    const previous = arr[mealIndex];
    arr[mealIndex] = recipeId || null;
    if (arr.every(v => !v)) {
        delete planMap[dateKey];
    } else {
        planMap[dateKey] = arr;
    }
    savePlan();
    renderDayView();
    renderTopbar(recipeId && !previous);
}

function shiftDay(delta) {
    selectedDate = shiftDate(selectedDate, delta);
    renderDayView();
    renderTopbar();
}

function jumpToday() {
    selectedDate = startOfToday();
    renderDayView();
    renderTopbar();
}

// ----- Topbar (rings + macros) -----
function getDayTotals(dateKey) {
    const totals = {
        groups: { Fruits: 0, Veggies: 0, Protein: 0, Grains: 0, Dairy: 0 },
        nutrition: { carbs: 0, protein: 0, fat: 0, calories: 0 }
    };
    const arr = planMap[dateKey] || [];
    arr.forEach(rid => {
        if (!rid) return;
        const r = getAllRecipes().find(x => x.id === rid);
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
}

function renderFoodRings(animateBump = false) {
    const foodRings = document.getElementById('foodRings');
    if (!foodRings) return;
    const targets = getTargets().groups;
    const totals = getDayTotals(isoDate(selectedDate));
    const ringSize = 72, stroke = 7;
    const radius = (ringSize - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    foodRings.innerHTML = Object.keys(targets).map(group => {
        const target = targets[group];
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

    const allDone = Object.keys(targets).every(g => totals.groups[g] >= targets[g]);
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
    const targets = getTargets().nutrition;
    const totals = getDayTotals(isoDate(selectedDate));
    const macroHtml = ['carbs', 'protein', 'fat'].map(key => {
        const target = targets[key];
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
            <div class="macro-cal-label">/ ${targets.calories} kcal</div>
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

// ----- Modal -----
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
