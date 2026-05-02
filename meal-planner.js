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

// Realistic recipes. EVERY recipe links to TheMealDB where image, name, and full
// recipe page are guaranteed to match (TheMealDB is the canonical source).
//   image  - TheMealDB CDN thumbnail (always renders)
//   href   - TheMealDB recipe page (same idMeal as the image)
//   nutrition values are per single child-sized serving.
const defaultRecipes = [
    // ===== BREAKFAST =====
    {
        id: 'pancakes', name: 'Pancakes', meal: 'Breakfast',
        emoji: '🥞', art: '🥞', gradient: 'linear-gradient(135deg,#fde68a,#f59e0b)',
        image: 'https://www.themealdb.com/images/media/meals/rwuyqx1511383174.jpg',
        href: 'https://www.themealdb.com/meal/52854',
        summary: 'Classic pancakes served with raspberries, blueberries and a drizzle of syrup.',
        groups: ['Grains', 'Fruits', 'Dairy'],
        nutrition: { carbs: 58, protein: 9, fat: 11, calories: 380 },
        notes: ['Energy to run and play']
    },
    {
        id: 'banana-pancakes', name: 'Banana Pancakes', meal: 'Breakfast',
        emoji: '🥞', art: '🥞', gradient: 'linear-gradient(135deg,#fef3c7,#f97316)',
        image: 'https://www.themealdb.com/images/media/meals/sywswr1511383814.jpg',
        href: 'https://www.themealdb.com/meal/52855',
        summary: 'Mashed banana pancakes topped with pecans and raspberries.',
        groups: ['Grains', 'Fruits'],
        nutrition: { carbs: 50, protein: 8, fat: 10, calories: 320 },
        notes: ['Naturally sweet']
    },
    {
        id: 'breakfast-potatoes', name: 'Breakfast Potatoes', meal: 'Breakfast',
        emoji: '🥔', art: '🥔', gradient: 'linear-gradient(135deg,#fde68a,#a16207)',
        image: 'https://www.themealdb.com/images/media/meals/1550441882.jpg',
        href: 'https://www.themealdb.com/meal/52965',
        summary: 'Crispy seasoned potatoes pan-fried with peppers and onion.',
        groups: ['Grains', 'Veggies'],
        nutrition: { carbs: 42, protein: 5, fat: 12, calories: 290 },
        notes: ['Crispy & filling']
    },
    {
        id: 'english-breakfast', name: 'Full English Breakfast', meal: 'Breakfast',
        emoji: '🍳', art: '🍳', gradient: 'linear-gradient(135deg,#fef3c7,#dc2626)',
        image: 'https://www.themealdb.com/images/media/meals/sqrtwu1511721265.jpg',
        href: 'https://www.themealdb.com/meal/52896',
        summary: 'Eggs, sausage, bacon, beans, tomato, mushrooms and toast.',
        groups: ['Protein', 'Grains', 'Veggies'],
        nutrition: { carbs: 32, protein: 24, fat: 22, calories: 460 },
        notes: ['Big morning fuel']
    },

    // ===== LUNCH =====
    {
        id: 'mac-cheese-grilled', name: 'Grilled Mac & Cheese Sandwich', meal: 'Lunch',
        emoji: '🥪', art: '🥪', gradient: 'linear-gradient(135deg,#fed7aa,#f97316)',
        image: 'https://www.themealdb.com/images/media/meals/xutquv1505330523.jpg',
        href: 'https://www.themealdb.com/meal/52829',
        summary: 'Mac & cheese pressed between buttered toasted bread.',
        groups: ['Grains', 'Dairy'],
        nutrition: { carbs: 55, protein: 18, fat: 25, calories: 540 },
        notes: ['Cheesy comfort']
    },
    {
        id: 'big-mac', name: 'Big Mac', meal: 'Lunch',
        emoji: '🍔', art: '🍔', gradient: 'linear-gradient(135deg,#fde68a,#92400e)',
        image: 'https://www.themealdb.com/images/media/meals/urzj1d1587670726.jpg',
        href: 'https://www.themealdb.com/meal/53013',
        summary: 'Two beef patties, cheese, lettuce and special sauce on a sesame bun.',
        groups: ['Protein', 'Grains', 'Dairy'],
        nutrition: { carbs: 45, protein: 25, fat: 30, calories: 540 },
        notes: ['Diner classic']
    },
    {
        id: 'fajita-mac', name: 'Chicken Fajita Mac & Cheese', meal: 'Lunch',
        emoji: '🧀', art: '🧀', gradient: 'linear-gradient(135deg,#fecaca,#dc2626)',
        image: 'https://www.themealdb.com/images/media/meals/qrqywr1503066605.jpg',
        href: 'https://www.themealdb.com/meal/52818',
        summary: 'Creamy mac & cheese with seasoned chicken and peppers.',
        groups: ['Grains', 'Dairy', 'Protein', 'Veggies'],
        nutrition: { carbs: 50, protein: 22, fat: 18, calories: 470 },
        notes: ['Power lunch']
    },
    {
        id: 'beef-patty', name: 'Jamaican Beef Patty', meal: 'Lunch',
        emoji: '🥟', art: '🥟', gradient: 'linear-gradient(135deg,#fde68a,#ca8a04)',
        image: 'https://www.themealdb.com/images/media/meals/wsqqsw1515364068.jpg',
        href: 'https://www.themealdb.com/meal/52938',
        summary: 'Flaky golden pastry filled with seasoned ground beef.',
        groups: ['Grains', 'Protein'],
        nutrition: { carbs: 32, protein: 16, fat: 18, calories: 360 },
        notes: ['Hand-held & tasty']
    },

    // ===== DINNER =====
    {
        id: 'spaghetti-bolognese', name: 'Spaghetti Bolognese', meal: 'Dinner',
        emoji: '🍝', art: '🍝', gradient: 'linear-gradient(135deg,#fecaca,#b91c1c)',
        image: 'https://www.themealdb.com/images/media/meals/sutysw1468247559.jpg',
        href: 'https://www.themealdb.com/meal/52770',
        summary: 'Spaghetti tossed in a slow-cooked beef and tomato sauce.',
        groups: ['Grains', 'Protein'],
        nutrition: { carbs: 60, protein: 24, fat: 15, calories: 490 },
        notes: ['Italian feast']
    },
    {
        id: 'lasagne', name: 'Lasagne', meal: 'Dinner',
        emoji: '🍲', art: '🍲', gradient: 'linear-gradient(135deg,#fed7aa,#dc2626)',
        image: 'https://www.themealdb.com/images/media/meals/wtsvxx1511296896.jpg',
        href: 'https://www.themealdb.com/meal/52844',
        summary: 'Layers of pasta, beef ragù, tomato sauce and melted cheese.',
        groups: ['Grains', 'Protein', 'Dairy'],
        nutrition: { carbs: 45, protein: 24, fat: 22, calories: 480 },
        notes: ['Family favorite']
    },
    {
        id: 'sweet-sour-chicken', name: 'Sweet and Sour Chicken', meal: 'Dinner',
        emoji: '🍛', art: '🍛', gradient: 'linear-gradient(135deg,#fed7aa,#ea580c)',
        image: 'https://www.themealdb.com/images/media/meals/arzs741766434335.jpg',
        href: 'https://www.themealdb.com/meal/53376',
        summary: 'Crispy chicken with peppers and pineapple in a tangy sauce.',
        groups: ['Protein', 'Grains', 'Veggies', 'Fruits'],
        nutrition: { carbs: 55, protein: 24, fat: 12, calories: 440 },
        notes: ['Sweet & tangy']
    },
    {
        id: 'beef-broccoli', name: 'Beef and Broccoli Stir-Fry', meal: 'Dinner',
        emoji: '🥡', art: '🥡', gradient: 'linear-gradient(135deg,#bbf7d0,#15803d)',
        image: 'https://www.themealdb.com/images/media/meals/m0p0j81765568742.jpg',
        href: 'https://www.themealdb.com/meal/53366',
        summary: 'Tender beef and broccoli in a savory garlic-soy sauce.',
        groups: ['Protein', 'Veggies'],
        nutrition: { carbs: 20, protein: 28, fat: 14, calories: 340 },
        notes: ['Strong muscles']
    },
    {
        id: 'teriyaki-chicken', name: 'Teriyaki Chicken Casserole', meal: 'Dinner',
        emoji: '🍱', art: '🍱', gradient: 'linear-gradient(135deg,#fde68a,#b45309)',
        image: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
        href: 'https://www.themealdb.com/meal/52772',
        summary: 'Baked teriyaki chicken with rice and mixed vegetables.',
        groups: ['Protein', 'Grains', 'Veggies'],
        nutrition: { carbs: 48, protein: 26, fat: 10, calories: 420 },
        notes: ['Power dinner']
    },

    // ===== SNACKS =====
    {
        id: 'apple-tart', name: 'Apple Frangipan Tart', meal: 'Snack',
        emoji: '🥧', art: '🥧', gradient: 'linear-gradient(135deg,#fecaca,#ef4444)',
        image: 'https://www.themealdb.com/images/media/meals/wxywrq1468235067.jpg',
        href: 'https://www.themealdb.com/meal/52768',
        summary: 'A buttery tart filled with almond cream and sliced apple.',
        groups: ['Fruits', 'Grains'],
        nutrition: { carbs: 35, protein: 4, fat: 12, calories: 270 },
        notes: ['Sweet treat']
    },
    {
        id: 'pb-cookies', name: 'Peanut Butter Cookies', meal: 'Snack',
        emoji: '🍪', art: '🍪', gradient: 'linear-gradient(135deg,#fde68a,#a16207)',
        image: 'https://www.themealdb.com/images/media/meals/1544384070.jpg',
        href: 'https://www.themealdb.com/meal/52958',
        summary: 'Three-ingredient soft & chewy peanut butter cookies.',
        groups: ['Grains', 'Protein'],
        nutrition: { carbs: 18, protein: 4, fat: 9, calories: 170 },
        notes: ['Quick energy']
    },
    {
        id: 'choc-rasp-brownie', name: 'Chocolate Raspberry Brownies', meal: 'Snack',
        emoji: '🍫', art: '🍫', gradient: 'linear-gradient(135deg,#fbcfe8,#9333ea)',
        image: 'https://www.themealdb.com/images/media/meals/yypvst1511386427.jpg',
        href: 'https://www.themealdb.com/meal/52860',
        summary: 'Rich chocolate brownies bursting with fresh raspberries.',
        groups: ['Grains', 'Fruits'],
        nutrition: { carbs: 28, protein: 3, fat: 11, calories: 230 },
        notes: ['Chocolatey']
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
