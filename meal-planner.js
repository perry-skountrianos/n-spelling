// Per-age daily targets (USDA-based, simplified for kids)
// Per-age targets. `limits` = stay UNDER values (added sugar, sodium).
// Calorie/macro targets calibrated to ACTIVE boys per USDA Dietary Guidelines 2020-2025.
const TARGETS_BY_AGE = {
    7:  { groups: { Fruits: 1, Veggies: 2, Protein: 4, Grains: 5, Dairy: 2.5 },
          nutrition: { carbs: 240, protein: 45, fat: 60, calories: 1800, fiber: 17 },
          limits: { sugar: 25, sodium: 1900 } },
    12: { groups: { Fruits: 2, Veggies: 3, Protein: 5, Grains: 8, Dairy: 3 },
          nutrition: { carbs: 320, protein: 60, fat: 80, calories: 2400, fiber: 28 },
          limits: { sugar: 25, sodium: 2200 } }
};
function getTargets() {
    const profile = (typeof Profiles !== 'undefined') ? Profiles.getCurrent() : null;
    const age = profile && profile.age ? profile.age : 7;
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

// Default recipes — every entry is a real TheMealDB meal (image+name+link match).
const defaultRecipes = [
    // ===== BREAKFAST =====
    { id: 'pancakes', name: 'Pancakes', meal: 'Breakfast', emoji: '🥞',
      image: 'https://www.themealdb.com/images/media/meals/rwuyqx1511383174.jpg',
      href: 'https://www.themealdb.com/meal/52854',
      summary: 'Classic pancakes with raspberries, blueberries and a drizzle of syrup.',
      groups: ['Grains','Fruits','Dairy'], nutrition: { carbs:58, protein:9, fat:11, calories:380, sugar:18, fiber:3, sodium:430 } },
    { id: 'banana-pancakes', name: 'Banana Pancakes', meal: 'Breakfast', emoji: '🥞',
      image: 'https://www.themealdb.com/images/media/meals/sywswr1511383814.jpg',
      href: 'https://www.themealdb.com/meal/52855',
      summary: 'Mashed banana pancakes topped with pecans and raspberries.',
      groups: ['Grains','Fruits'], nutrition: { carbs:50, protein:8, fat:10, calories:320, sugar:14, fiber:4, sodium:380 } },
    { id: 'breakfast-potatoes', name: 'Breakfast Potatoes', meal: 'Breakfast', emoji: '🥔',
      image: 'https://www.themealdb.com/images/media/meals/1550441882.jpg',
      href: 'https://www.themealdb.com/meal/52965',
      summary: 'Crispy seasoned potatoes pan-fried with peppers and onion.',
      groups: ['Grains','Veggies'], nutrition: { carbs:42, protein:5, fat:12, calories:290, sugar:3, fiber:5, sodium:520 } },
    { id: 'english-breakfast', name: 'Full English Breakfast', meal: 'Breakfast', emoji: '🍳',
      image: 'https://www.themealdb.com/images/media/meals/sqrtwu1511721265.jpg',
      href: 'https://www.themealdb.com/meal/52896',
      summary: 'Eggs, sausage, bacon, beans, tomato, mushrooms and toast.',
      groups: ['Protein','Grains','Veggies'], nutrition: { carbs:32, protein:24, fat:22, calories:460, sugar:6, fiber:6, sodium:1320 } },

    // ===== LUNCH =====
    { id: 'mac-cheese-grilled', name: 'Grilled Mac & Cheese Sandwich', meal: 'Lunch', emoji: '🥪',
      image: 'https://www.themealdb.com/images/media/meals/xutquv1505330523.jpg',
      href: 'https://www.themealdb.com/meal/52829',
      summary: 'Mac & cheese pressed between buttered toasted bread.',
      groups: ['Grains','Dairy'], nutrition: { carbs:55, protein:18, fat:25, calories:540, sugar:5, fiber:2, sodium:980 } },
    { id: 'big-mac', name: 'Big Mac', meal: 'Lunch', emoji: '🍔',
      image: 'https://www.themealdb.com/images/media/meals/urzj1d1587670726.jpg',
      href: 'https://www.themealdb.com/meal/53013',
      summary: 'Two beef patties, cheese, lettuce and special sauce on a sesame bun.',
      groups: ['Protein','Grains','Dairy'], nutrition: { carbs:45, protein:25, fat:30, calories:540, sugar:9, fiber:3, sodium:1010 } },
    { id: 'fajita-mac', name: 'Chicken Fajita Mac & Cheese', meal: 'Lunch', emoji: '🧀',
      image: 'https://www.themealdb.com/images/media/meals/qrqywr1503066605.jpg',
      href: 'https://www.themealdb.com/meal/52818',
      summary: 'Creamy mac & cheese with seasoned chicken and peppers.',
      groups: ['Grains','Dairy','Protein','Veggies'], nutrition: { carbs:50, protein:22, fat:18, calories:470, sugar:6, fiber:3, sodium:870 } },
    { id: 'beef-patty', name: 'Jamaican Beef Patty', meal: 'Lunch', emoji: '🥟',
      image: 'https://www.themealdb.com/images/media/meals/wsqqsw1515364068.jpg',
      href: 'https://www.themealdb.com/meal/52938',
      summary: 'Flaky golden pastry filled with seasoned ground beef.',
      groups: ['Grains','Protein'], nutrition: { carbs:32, protein:16, fat:18, calories:360, sugar:2, fiber:2, sodium:540 } },

    // ===== DINNER =====
    { id: 'spaghetti-bolognese', name: 'Spaghetti Bolognese', meal: 'Dinner', emoji: '🍝',
      image: 'https://www.themealdb.com/images/media/meals/sutysw1468247559.jpg',
      href: 'https://www.themealdb.com/meal/52770',
      summary: 'Spaghetti tossed in a slow-cooked beef and tomato sauce.',
      groups: ['Grains','Protein'], nutrition: { carbs:60, protein:24, fat:15, calories:490, sugar:10, fiber:6, sodium:680 } },
    { id: 'lasagne', name: 'Lasagne', meal: 'Dinner', emoji: '🍲',
      image: 'https://www.themealdb.com/images/media/meals/wtsvxx1511296896.jpg',
      href: 'https://www.themealdb.com/meal/52844',
      summary: 'Layers of pasta, beef ragù, tomato sauce and melted cheese.',
      groups: ['Grains','Protein','Dairy'], nutrition: { carbs:45, protein:24, fat:22, calories:480, sugar:9, fiber:4, sodium:760 } },
    { id: 'sweet-sour-chicken', name: 'Sweet and Sour Chicken', meal: 'Dinner', emoji: '🍛',
      image: 'https://www.themealdb.com/images/media/meals/arzs741766434335.jpg',
      href: 'https://www.themealdb.com/meal/53376',
      summary: 'Crispy chicken with peppers and pineapple in a tangy sauce.',
      groups: ['Protein','Grains','Veggies','Fruits'], nutrition: { carbs:55, protein:24, fat:12, calories:440, sugar:22, fiber:3, sodium:720 } },
    { id: 'beef-broccoli', name: 'Beef and Broccoli Stir-Fry', meal: 'Dinner', emoji: '🥡',
      image: 'https://www.themealdb.com/images/media/meals/m0p0j81765568742.jpg',
      href: 'https://www.themealdb.com/meal/53366',
      summary: 'Tender beef and broccoli in a savory garlic-soy sauce.',
      groups: ['Protein','Veggies'], nutrition: { carbs:20, protein:28, fat:14, calories:340, sugar:6, fiber:4, sodium:820 } },
    { id: 'teriyaki-chicken', name: 'Teriyaki Chicken Casserole', meal: 'Dinner', emoji: '🍱',
      image: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
      href: 'https://www.themealdb.com/meal/52772',
      summary: 'Baked teriyaki chicken with rice and mixed vegetables.',
      groups: ['Protein','Grains','Veggies'], nutrition: { carbs:48, protein:26, fat:10, calories:420, sugar:12, fiber:3, sodium:880 } },

    // ===== SNACKS =====
    { id: 'apple-tart', name: 'Apple Frangipan Tart', meal: 'Snack', emoji: '🥧',
      image: 'https://www.themealdb.com/images/media/meals/wxywrq1468235067.jpg',
      href: 'https://www.themealdb.com/meal/52768',
      summary: 'A buttery tart filled with almond cream and sliced apple.',
      groups: ['Fruits','Grains'], nutrition: { carbs:35, protein:4, fat:12, calories:270, sugar:22, fiber:2, sodium:120 } },
    { id: 'pb-cookies', name: 'Peanut Butter Cookies', meal: 'Snack', emoji: '🍪',
      image: 'https://www.themealdb.com/images/media/meals/1544384070.jpg',
      href: 'https://www.themealdb.com/meal/52958',
      summary: 'Three-ingredient soft & chewy peanut butter cookies.',
      groups: ['Grains','Protein'], nutrition: { carbs:18, protein:4, fat:9, calories:170, sugar:14, fiber:1, sodium:80 } },
    { id: 'choc-rasp-brownie', name: 'Chocolate Raspberry Brownies', meal: 'Snack', emoji: '🍫',
      image: 'https://www.themealdb.com/images/media/meals/yypvst1511386427.jpg',
      href: 'https://www.themealdb.com/meal/52860',
      summary: 'Rich chocolate brownies bursting with fresh raspberries.',
      groups: ['Grains','Fruits'], nutrition: { carbs:28, protein:3, fat:11, calories:230, sugar:22, fiber:2, sodium:90 } }
];

const MEAL_FILTERS = ['All','Breakfast','Lunch','Dinner','Snack'];
const meals = ['Breakfast','Lunch','Dinner'];
const FULL_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

let selectedProfileId = null;
let customRecipes = [];
let favorites = new Set();
let hiddenDefaults = new Set();
// New plan shape: { 'YYYY-MM-DD': { Breakfast: [recipeIds], Lunch: [...], Dinner: [...] } }
let planMap = {};
let selectedDate = startOfToday();
let activeFilter = 'All';
let confettiTimer = null;

// ----- Date helpers -----
function startOfToday() { const d = new Date(); d.setHours(0,0,0,0); return d; }
function isoDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function shiftDate(d, n) { const o = new Date(d); o.setDate(o.getDate()+n); return o; }
function formatLongDate(d) {
    return d.toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric' });
}
function daysBetween(a, b) {
    const da = new Date(a); da.setHours(0,0,0,0);
    const db = new Date(b); db.setHours(0,0,0,0);
    return Math.round((db - da) / 86400000);
}
function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ----- Init -----
function initMealPlanner() {
    if (typeof Profiles === 'undefined' || !Profiles.requireProfile()) return;
    selectedProfileId = Profiles.getCurrentId();
    loadCustomRecipes();
    loadFavorites();
    loadHidden();
    loadPlan();
    pruneStaleFromPlan();
    renderProfileSwitcher();
    document.getElementById('profileSwitcher').addEventListener('click', switchProfile);
    document.getElementById('addRecipeBtn').addEventListener('click', openRecipeModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeRecipeModal);
    document.getElementById('saveRecipeBtn').addEventListener('click', saveNewRecipe);
    document.getElementById('fetchUrlBtn').addEventListener('click', fetchFromUrl);
    document.getElementById('findByIngredientsBtn').addEventListener('click', openIngredientModal);
    document.getElementById('closeIngredientBtn').addEventListener('click', closeIngredientModal);
    document.getElementById('searchIngredientsBtn').addEventListener('click', searchByIngredients);
    document.getElementById('ingredientModal').addEventListener('click', e => {
        if (e.target.classList.contains('modal-backdrop')) closeIngredientModal();
    });
    document.querySelectorAll('.ingredient-chip').forEach(chip => {
        chip.addEventListener('click', () => addQuickIngredient(chip.dataset.ing));
    });
    document.getElementById('recipeModal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) closeRecipeModal();
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
function switchProfile() { Profiles.clearCurrent(); window.location.href = 'index.html'; }

// ----- Storage -----
function loadCustomRecipes() {
    const saved = localStorage.getItem('mealPlannerCustomRecipes');
    customRecipes = saved ? JSON.parse(saved) : [];
}
function saveCustomRecipes() {
    localStorage.setItem('mealPlannerCustomRecipes', JSON.stringify(customRecipes));
}
function loadFavorites() {
    const saved = localStorage.getItem(`mealPlannerFavorites_${selectedProfileId}`);
    favorites = new Set(saved ? JSON.parse(saved) : []);
}
function saveFavorites() {
    localStorage.setItem(`mealPlannerFavorites_${selectedProfileId}`, JSON.stringify([...favorites]));
}
function loadHidden() {
    const saved = localStorage.getItem(`mealPlannerHidden_${selectedProfileId}`);
    hiddenDefaults = new Set(saved ? JSON.parse(saved) : []);
}
function saveHidden() {
    localStorage.setItem(`mealPlannerHidden_${selectedProfileId}`, JSON.stringify([...hiddenDefaults]));
}
function loadPlan() {
    const v3 = localStorage.getItem(`mealPlannerPlanV3_${selectedProfileId}`);
    if (v3) { planMap = JSON.parse(v3); return; }
    // Migrate v2 (array form) -> v3 (object form, multi-recipe per meal)
    const v2 = localStorage.getItem(`mealPlannerPlanV2_${selectedProfileId}`);
    if (v2) {
        const old = JSON.parse(v2);
        const out = {};
        Object.keys(old).forEach(date => {
            const arr = old[date] || [];
            const day = { Breakfast: [], Lunch: [], Dinner: [] };
            meals.forEach((m, i) => { if (arr[i]) day[m] = [arr[i]]; });
            out[date] = day;
        });
        planMap = out;
        savePlan();
        return;
    }
    planMap = {};
}
function savePlan() {
    localStorage.setItem(`mealPlannerPlanV3_${selectedProfileId}`, JSON.stringify(planMap));
}

function getAllRecipes() {
    return [...defaultRecipes.filter(r => !hiddenDefaults.has(r.id)), ...customRecipes];
}
function findRecipe(id) {
    return [...defaultRecipes, ...customRecipes].find(r => r.id === id);
}
function isCustom(id) { return customRecipes.some(r => r.id === id); }

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
    let list = getAllRecipes().filter(r => activeFilter === 'All' || r.meal === activeFilter);
    // Favorites first
    list.sort((a, b) => (favorites.has(b.id) ? 1 : 0) - (favorites.has(a.id) ? 1 : 0));
    if (!list.length) {
        recipeList.innerHTML = `<div class="empty-recipes">No ${activeFilter.toLowerCase()} recipes. Click <strong>Add</strong> to create one from a URL.</div>`;
        return;
    }
    list.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card' + (favorites.has(recipe.id) ? ' is-fav' : '');
        card.draggable = true;
        card.dataset.recipeId = recipe.id;
        const n = recipe.nutrition || { carbs:0, protein:0, fat:0, calories:0 };
        const imgHtml = recipe.image
            ? `<img class="recipe-photo" src="${escapeHtml(recipe.image)}" alt="${escapeHtml(recipe.name)}" loading="lazy"
                  onerror="this.style.display='none';this.nextElementSibling.style.display='grid';"/>
               <div class="recipe-art-fallback" style="display:none;background:${recipe.gradient || ''}">
                  <div class="recipe-art-emoji">${recipe.emoji || '🍽️'}</div>
               </div>`
            : `<div class="recipe-art-fallback" style="background:${recipe.gradient || ''}">
                  <div class="recipe-art-emoji">${recipe.emoji || '🍽️'}</div>
               </div>`;
        const linkBtn = recipe.href
            ? `<a class="recipe-link" href="${escapeHtml(recipe.href)}" target="_blank" rel="noopener" title="Open recipe">↗</a>`
            : '';
        card.innerHTML = `
            <div class="recipe-art">
                ${imgHtml}
                <span class="recipe-meal-badge">${recipe.meal}</span>
                ${linkBtn}
                <div class="recipe-actions">
                    <button class="recipe-action fav-btn ${favorites.has(recipe.id) ? 'on' : ''}" data-act="fav" title="Favorite">★</button>
                    <button class="recipe-action del-btn" data-act="del" title="Delete">✕</button>
                </div>
            </div>
            <div class="recipe-card-body">
                <div class="recipe-card-title">${escapeHtml(recipe.name)}</div>
                <div class="recipe-summary">${escapeHtml(recipe.summary || '')}</div>
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
                    <span class="nutri-pill sugar" title="Added sugar (stay under ${getTargets().limits.sugar}g/day)">🍬 ${n.sugar || 0}g</span>
                    <span class="cal-pill">🔥 ${n.calories || 0} kcal</span>
                </div>
            </div>
        `;
        card.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', recipe.id);
            card.classList.add('dragging');
        });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));
        card.querySelector('[data-act="fav"]').addEventListener('click', e => {
            e.stopPropagation(); e.preventDefault();
            toggleFavorite(recipe.id);
        });
        card.querySelector('[data-act="del"]').addEventListener('click', e => {
            e.stopPropagation(); e.preventDefault();
            deleteRecipe(recipe.id);
        });
        recipeList.appendChild(card);
    });
}

function toggleFavorite(id) {
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);
    saveFavorites();
    renderRecipeList();
}

function deleteRecipe(id) {
    const recipe = findRecipe(id);
    if (!recipe) return;
    const isCustomR = isCustom(id);
    const msg = isCustomR
        ? `Delete "${recipe.name}"? It will also be removed from any planned days.`
        : `Hide "${recipe.name}" from your recipe list? You can reset it later by clearing browser data.`;
    if (!confirm(msg)) return;
    if (isCustomR) {
        customRecipes = customRecipes.filter(r => r.id !== id);
        saveCustomRecipes();
        // also strip from any planned day
        Object.keys(planMap).forEach(date => {
            meals.forEach(m => {
                if (planMap[date][m]) planMap[date][m] = planMap[date][m].filter(rid => rid !== id);
            });
            if (meals.every(m => !planMap[date][m] || !planMap[date][m].length)) {
                delete planMap[date];
            }
        });
        savePlan();
    } else {
        hiddenDefaults.add(id);
        saveHidden();
    }
    favorites.delete(id);
    saveFavorites();
    renderRecipeList();
    renderDayView();
    renderTopbar();
}

function nutriPill(key, grams) {
    const info = NUTRITION_INFO[key];
    return `<span class="nutri-pill" style="background:${info.color}1a;color:${info.color}" title="${info.label}: ${info.kid}">
        ${info.emoji} ${grams || 0}g
    </span>`;
}

// ----- Day view -----
function getDayPlan(dateKey) {
    const d = planMap[dateKey];
    if (!d) return { Breakfast: [], Lunch: [], Dinner: [] };
    // Filter out ids that no longer resolve to a recipe (deleted custom, etc.)
    const filterValid = ids => (ids || []).filter(id => !!findRecipe(id));
    return {
        Breakfast: filterValid(d.Breakfast),
        Lunch:     filterValid(d.Lunch),
        Dinner:    filterValid(d.Dinner)
    };
}

function pruneStaleFromPlan() {
    let changed = false;
    Object.keys(planMap).forEach(date => {
        const day = planMap[date];
        meals.forEach(m => {
            const before = (day[m] || []).length;
            day[m] = (day[m] || []).filter(id => !!findRecipe(id));
            if (day[m].length !== before) changed = true;
        });
        if (meals.every(m => !day[m] || !day[m].length)) {
            delete planMap[date];
            changed = true;
        }
    });
    if (changed) savePlan();
}

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
    const dayPlan = getDayPlan(dateKey);

    grid.innerHTML = '';
    meals.forEach(meal => {
        const slot = document.createElement('div');
        slot.className = 'day-slot';
        slot.dataset.meal = meal;
        slot.addEventListener('dragover', e => e.preventDefault());
        slot.addEventListener('dragenter', () => slot.classList.add('drag-over'));
        slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
        slot.addEventListener('drop', e => {
            e.preventDefault();
            slot.classList.remove('drag-over');
            const recipeId = e.dataTransfer.getData('text/plain');
            addToMeal(meal, recipeId);
        });
        const icon = meal === 'Breakfast' ? '☀️' : meal === 'Lunch' ? '🥗' : '🌙';
        const ids = dayPlan[meal];
        const itemsHtml = ids.length
            ? ids.map((rid, idx) => {
                const r = findRecipe(rid);
                if (!r) return '';
                const n = r.nutrition || {};
                const imgPart = r.image
                    ? `<img class="day-item-photo" src="${escapeHtml(r.image)}" alt="${escapeHtml(r.name)}" loading="lazy"
                           onerror="this.style.display='none';this.nextElementSibling.style.display='grid';"/>
                       <div class="day-item-fallback" style="display:none;background:${r.gradient || ''}">
                           <span>${r.emoji || '🍽️'}</span>
                       </div>`
                    : `<div class="day-item-fallback" style="background:${r.gradient || ''}">
                           <span>${r.emoji || '🍽️'}</span>
                       </div>`;
                return `
                    <div class="day-item" data-idx="${idx}">
                        <div class="day-item-image">${imgPart}</div>
                        <div class="day-item-info">
                            <div class="day-item-name">${escapeHtml(r.name)}</div>
                            <div class="day-item-cal">🔥 ${n.calories || 0} kcal · ⚡${n.carbs||0}g · 💪${n.protein||0}g · 🧠${n.fat||0}g</div>
                            ${r.href ? `<a class="day-item-link" href="${escapeHtml(r.href)}" target="_blank" rel="noopener">View recipe ↗</a>` : ''}
                        </div>
                        <button class="day-item-remove" data-idx="${idx}" title="Remove">✕</button>
                    </div>
                `;
            }).join('')
            : '';
        slot.innerHTML = `
            <div class="day-slot-head">
                <span class="day-slot-icon">${icon}</span>
                <span class="day-slot-meal">${meal}</span>
                <span class="day-slot-count">${ids.length}</span>
            </div>
            <div class="day-items">${itemsHtml}</div>
            <div class="day-slot-empty">
                <span class="plus">+</span>
                <span>Drag a ${meal.toLowerCase()} recipe here</span>
            </div>
        `;
        slot.querySelectorAll('.day-item-remove').forEach(btn => {
            btn.addEventListener('click', () => removeFromMeal(meal, parseInt(btn.dataset.idx, 10)));
        });
        grid.appendChild(slot);
    });
}

function addToMeal(meal, recipeId) {
    if (!recipeId) return;
    const dateKey = isoDate(selectedDate);
    const day = planMap[dateKey] || { Breakfast: [], Lunch: [], Dinner: [] };
    day[meal] = day[meal] || [];
    day[meal].push(recipeId);
    planMap[dateKey] = day;
    savePlan();
    renderDayView();
    renderTopbar(true);
}

function removeFromMeal(meal, idx) {
    const dateKey = isoDate(selectedDate);
    const day = planMap[dateKey];
    if (!day || !day[meal]) return;
    day[meal].splice(idx, 1);
    if (meals.every(m => !day[m] || !day[m].length)) {
        delete planMap[dateKey];
    } else {
        planMap[dateKey] = day;
    }
    savePlan();
    renderDayView();
    renderTopbar();
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
        groups: { Fruits:0, Veggies:0, Protein:0, Grains:0, Dairy:0 },
        nutrition: { carbs:0, protein:0, fat:0, calories:0, sugar:0, fiber:0, sodium:0 }
    };
    const day = planMap[dateKey];
    if (!day) return totals;
    meals.forEach(m => {
        (day[m] || []).forEach(rid => {
            const r = findRecipe(rid);
            if (!r) return;
            (r.groups || []).forEach(g => { if (totals.groups[g] !== undefined) totals.groups[g]++; });
            const n = r.nutrition || {};
            totals.nutrition.carbs    += n.carbs    || 0;
            totals.nutrition.protein  += n.protein  || 0;
            totals.nutrition.fat      += n.fat      || 0;
            totals.nutrition.calories += n.calories || 0;
            totals.nutrition.sugar    += n.sugar    || 0;
            totals.nutrition.fiber    += n.fiber    || 0;
            totals.nutrition.sodium   += n.sodium   || 0;
        });
    });
    return totals;
}

function renderTopbar(animateBump = false) {
    renderFoodRings(animateBump);
}

function renderFoodRings(animateBump = false) {
    const foodRings = document.getElementById('foodRings');
    if (!foodRings) return;
    const targets = getTargets().groups;
    const totals = getDayTotals(isoDate(selectedDate));
    const ringSize = 88, stroke = 8;
    const radius = (ringSize - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    // Only render serving rings for groups that aren't already represented by a gram-based macro ring.
    // Protein servings ↔ Muscle (protein grams); Grains servings ↔ Energy (carb grams) — keep the gram ring instead.
    const SERVING_GROUPS = ['Fruits', 'Veggies', 'Dairy'];
    let html = SERVING_GROUPS.map(group => {
        const target = targets[group];
        const value = totals.groups[group];
        const pct = Math.min(1, value / target);
        const offset = circumference * (1 - pct);
        const info = GROUP_INFO[group];
        const done = value >= target;
        return `
            <div class="food-ring ${done ? 'complete' : ''}" title="${group}: ${info.kid}">
                <svg width="${ringSize}" height="${ringSize}" viewBox="0 0 ${ringSize} ${ringSize}">
                    <circle cx="${ringSize/2}" cy="${ringSize/2}" r="${radius}" fill="none" stroke="#eef2f7" stroke-width="${stroke}"/>
                    <circle cx="${ringSize/2}" cy="${ringSize/2}" r="${radius}" fill="none" stroke="${info.color}" stroke-width="${stroke}"
                        stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
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

    // Helper to render an extra ring (sugar/sodium = stay-UNDER, fiber = hit-target)
    function extraRing({ emoji, label, value, target, kind, unit, tooltip }) {
        const pct = Math.min(1, value / target);
        const offset = circumference * (1 - pct);
        let color, classes = 'food-ring extra-ring';
        if (kind === 'limit') {
            const over = value > target;
            color = over ? '#dc2626' : pct >= 0.8 ? '#f59e0b' : '#10b981';
            if (over) classes += ' over';
        } else { // goal
            const done = value >= target;
            color = done ? '#10b981' : '#22c55e';
            if (done) classes += ' complete';
        }
        return `
            <div class="${classes}" title="${tooltip}">
                <svg width="${ringSize}" height="${ringSize}" viewBox="0 0 ${ringSize} ${ringSize}">
                    <circle cx="${ringSize/2}" cy="${ringSize/2}" r="${radius}" fill="none" stroke="#eef2f7" stroke-width="${stroke}"/>
                    <circle cx="${ringSize/2}" cy="${ringSize/2}" r="${radius}" fill="none" stroke="${color}" stroke-width="${stroke}"
                        stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
                        transform="rotate(-90 ${ringSize/2} ${ringSize/2})"/>
                </svg>
                <div class="food-ring-center">
                    <div class="food-ring-emoji">${emoji}</div>
                    <div class="food-ring-count">${value}/${target}${unit}</div>
                </div>
                <div class="food-ring-label">${label}</div>
            </div>
        `;
    }

    const T = getTargets();
    html += extraRing({
        emoji: '🍬', label: 'Sugar', kind: 'limit', unit: 'g',
        value: totals.nutrition.sugar, target: T.limits.sugar,
        tooltip: `Added sugar: stay under ${T.limits.sugar}g per day`
    });
    html += extraRing({
        emoji: '🌿', label: 'Fiber', kind: 'goal', unit: 'g',
        value: totals.nutrition.fiber, target: T.nutrition.fiber,
        tooltip: `Fiber goal: ${T.nutrition.fiber}g — keeps your tummy happy!`
    });
    html += extraRing({
        emoji: '🧂', label: 'Sodium', kind: 'limit', unit: 'mg',
        value: totals.nutrition.sodium, target: T.limits.sodium,
        tooltip: `Sodium: stay under ${T.limits.sodium}mg per day`
    });
    // Macro & calorie rings (fold the old macro bar into the ring strip)
    html += extraRing({
        emoji: '⚡', label: 'Energy', kind: 'goal', unit: 'g',
        value: totals.nutrition.carbs, target: T.nutrition.carbs,
        tooltip: `Carbs (Energy Fuel): ${T.nutrition.carbs}g — powers play!`
    });
    html += extraRing({
        emoji: '💪', label: 'Muscle', kind: 'goal', unit: 'g',
        value: totals.nutrition.protein, target: T.nutrition.protein,
        tooltip: `Protein (Muscle Builder): ${T.nutrition.protein}g — helps you grow strong!`
    });
    html += extraRing({
        emoji: '🧠', label: 'Brain', kind: 'goal', unit: 'g',
        value: totals.nutrition.fat, target: T.nutrition.fat,
        tooltip: `Fat (Brain Power): ${T.nutrition.fat}g — helps you focus!`
    });
    html += extraRing({
        emoji: '🔥', label: 'Calories', kind: 'goal', unit: '',
        value: totals.nutrition.calories, target: T.nutrition.calories,
        tooltip: `Calories: about ${T.nutrition.calories} kcal/day for an active kid`
    });
    foodRings.innerHTML = html;

    const sugarOver = totals.nutrition.sugar > T.limits.sugar;
    const sodiumOver = totals.nutrition.sodium > T.limits.sodium;
    const allDone = SERVING_GROUPS.every(g => totals.groups[g] >= targets[g])
        && !sugarOver && !sodiumOver
        && totals.nutrition.fiber    >= T.nutrition.fiber
        && totals.nutrition.protein  >= T.nutrition.protein
        && totals.nutrition.calories >= T.nutrition.calories;
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
    const macroHtml = ['carbs','protein','fat'].map(key => {
        const target = targets[key];
        const value = totals.nutrition[key];
        const pct = Math.min(100, Math.round((value / target) * 100));
        const info = NUTRITION_INFO[key];
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

// ----- Add Recipe modal (URL-based) -----
function openRecipeModal() {
    document.getElementById('newRecipeUrl').value = '';
    document.getElementById('newRecipeName').value = '';
    document.getElementById('newRecipeSummary').value = '';
    document.getElementById('newRecipeImage').value = '';
    document.getElementById('newRecipeMeal').value = 'Breakfast';
    document.getElementById('newRecipeEmoji').value = '🍽️';
    ['Fruits','Veggies','Protein','Grains','Dairy'].forEach(g => {
        const el = document.getElementById('grp_' + g);
        if (el) el.checked = false;
    });
    document.getElementById('newCarbs').value = 30;
    document.getElementById('newProtein').value = 10;
    document.getElementById('newFat').value = 8;
    document.getElementById('newSugar').value = 5;
    document.getElementById('newFiber').value = 2;
    document.getElementById('newSodium').value = 200;
    document.getElementById('fetchStatus').textContent = '';
    document.getElementById('previewBlock').classList.add('hidden');
    document.getElementById('recipeModal').classList.remove('hidden');
}
function closeRecipeModal() {
    document.getElementById('recipeModal').classList.add('hidden');
}

async function fetchFromUrl() {
    const urlInput = document.getElementById('newRecipeUrl');
    const status = document.getElementById('fetchStatus');
    const url = (urlInput.value || '').trim();
    if (!url) { status.textContent = 'Paste a recipe URL above first.'; return; }
    status.textContent = 'Fetching…';
    try {
        const meta = await fetchRecipeMetadata(url);
        if (meta.name)    document.getElementById('newRecipeName').value = meta.name;
        if (meta.summary) document.getElementById('newRecipeSummary').value = meta.summary;
        if (meta.image)   document.getElementById('newRecipeImage').value = meta.image;
        if (meta.meal)    document.getElementById('newRecipeMeal').value = meta.meal;
        // Show preview
        const prev = document.getElementById('previewBlock');
        prev.classList.remove('hidden');
        const img = document.getElementById('previewImg');
        if (meta.image) {
            img.src = meta.image; img.style.display = 'block';
        } else {
            img.style.display = 'none';
        }
        document.getElementById('previewName').textContent = meta.name || '(no title)';
        document.getElementById('previewSummary').textContent = meta.summary || '';
        status.textContent = '✓ Got it. Tweak the details below, then Save.';
    } catch (err) {
        console.error(err);
        status.textContent = 'Could not auto-fetch. Fill in the fields below manually.';
    }
}

async function fetchRecipeMetadata(url) {
    // Strategy A: TheMealDB direct (https://www.themealdb.com/meal/{id})
    const mdb = url.match(/themealdb\.com\/meal\/(\d+)/i);
    if (mdb) {
        const r = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mdb[1]}`);
        const j = await r.json();
        const m = j.meals && j.meals[0];
        if (!m) throw new Error('Meal not found');
        return {
            name: m.strMeal,
            summary: (m.strInstructions || '').split(/\.\s+/).slice(0, 2).join('. ').slice(0, 220),
            image: m.strMealThumb,
            meal: guessMealType(m.strCategory, m.strTags)
        };
    }
    // Strategy B: microlink.io (free CORS-friendly metadata extractor; no API key needed)
    const r = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
    if (!r.ok) throw new Error('microlink ' + r.status);
    const j = await r.json();
    if (j.status !== 'success') throw new Error('microlink status=' + j.status);
    const d = j.data || {};
    return {
        name: d.title || '',
        summary: d.description || '',
        image: (d.image && d.image.url) || (d.logo && d.logo.url) || '',
        meal: 'Breakfast'
    };
}

function guessMealType(category, tags) {
    const c = (category || '').toLowerCase();
    const t = (tags || '').toLowerCase();
    if (/breakfast|pancake/.test(c + ' ' + t)) return 'Breakfast';
    if (/dessert|snack|cookie|biscuit|cake|brownie/.test(c + ' ' + t)) return 'Snack';
    if (/starter|side|soup|sandwich/.test(c + ' ' + t)) return 'Lunch';
    return 'Dinner';
}

function saveNewRecipe() {
    const name    = document.getElementById('newRecipeName').value.trim();
    if (!name) { alert('Please enter a recipe name.'); return; }
    const url     = document.getElementById('newRecipeUrl').value.trim();
    const summary = document.getElementById('newRecipeSummary').value.trim();
    const image   = document.getElementById('newRecipeImage').value.trim();
    const meal    = document.getElementById('newRecipeMeal').value;
    const emoji   = document.getElementById('newRecipeEmoji').value.trim() || '🍽️';
    const groups = ['Fruits','Veggies','Protein','Grains','Dairy'].filter(g => document.getElementById('grp_' + g)?.checked);
    const carbs   = parseInt(document.getElementById('newCarbs').value, 10)   || 0;
    const protein = parseInt(document.getElementById('newProtein').value, 10) || 0;
    const fat     = parseInt(document.getElementById('newFat').value, 10)     || 0;
    const sugar   = parseInt(document.getElementById('newSugar').value, 10)   || 0;
    const fiber   = parseInt(document.getElementById('newFiber').value, 10)   || 0;
    const sodium  = parseInt(document.getElementById('newSodium').value, 10)  || 0;
    const calories = Math.round(carbs * 4 + protein * 4 + fat * 9);
    const newRecipe = {
        id: `custom-${Date.now()}`,
        name, meal, emoji,
        gradient: 'linear-gradient(135deg,#ddd6fe,#8b5cf6)',
        image: image || '',
        href: url || '',
        summary: summary || 'A favorite recipe.',
        groups: groups.length ? groups : ['Grains'],
        nutrition: { carbs, protein, fat, calories, sugar, fiber, sodium }
    };
    customRecipes.unshift(newRecipe);
    saveCustomRecipes();
    closeRecipeModal();
    renderRecipeList();
}

// ----- Ingredient finder (TheMealDB) -----
function openIngredientModal() {
    document.getElementById('ingredientInput').value = '';
    document.getElementById('ingredientStatus').textContent = '';
    document.getElementById('ingredientResults').innerHTML = '';
    document.getElementById('ingredientModal').classList.remove('hidden');
}
function closeIngredientModal() {
    document.getElementById('ingredientModal').classList.add('hidden');
}
function addQuickIngredient(name) {
    const ta = document.getElementById('ingredientInput');
    const cur = ta.value.trim();
    if (cur.split(/[,\n]/).map(s => s.trim().toLowerCase()).includes(name.toLowerCase())) return;
    ta.value = cur ? `${cur}, ${name}` : name;
}

function parseIngredients(text) {
    return (text || '')
        .split(/[,\n]/)
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);
}

async function searchByIngredients() {
    const status = document.getElementById('ingredientStatus');
    const results = document.getElementById('ingredientResults');
    const ingredients = parseIngredients(document.getElementById('ingredientInput').value);
    if (!ingredients.length) {
        status.textContent = 'Add at least one ingredient first.';
        return;
    }
    status.textContent = `Searching for recipes with ${ingredients.join(' + ')}…`;
    results.innerHTML = '';
    try {
        // Per-ingredient lookups, then intersect by meal id.
        const lists = await Promise.all(ingredients.map(async ing => {
            const r = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ing)}`);
            const j = await r.json();
            return Array.isArray(j.meals) ? j.meals : [];
        }));
        // Intersection (recipes that contain ALL ingredients) with fallback to union if empty.
        const idCounts = new Map();
        const idMeta = new Map();
        lists.forEach(list => {
            list.forEach(m => {
                idCounts.set(m.idMeal, (idCounts.get(m.idMeal) || 0) + 1);
                idMeta.set(m.idMeal, m);
            });
        });
        let matches = [...idCounts.entries()]
            .filter(([, count]) => count === ingredients.length)
            .map(([id]) => idMeta.get(id));
        let mode = 'all';
        if (!matches.length) {
            // Fall back: recipes matching the most ingredients (at least 1)
            const max = Math.max(...idCounts.values());
            matches = [...idCounts.entries()]
                .filter(([, count]) => count === max)
                .map(([id]) => idMeta.get(id));
            mode = `at least ${max}`;
        }
        matches = matches.slice(0, 12);
        if (!matches.length) {
            status.textContent = 'No recipes found. Try different ingredients.';
            return;
        }
        status.textContent = mode === 'all'
            ? `Found ${matches.length} recipe${matches.length > 1 ? 's' : ''} using all your ingredients.`
            : `No recipes use all of those, but here are some that match ${mode} ingredient(s).`;
        results.innerHTML = matches.map(m => `
            <div class="ingredient-result" data-id="${m.idMeal}">
                <img src="${escapeHtml(m.strMealThumb)}" alt="${escapeHtml(m.strMeal)}" loading="lazy"/>
                <div class="ingredient-result-info">
                    <div class="ingredient-result-name">${escapeHtml(m.strMeal)}</div>
                    <a class="ingredient-result-link" href="https://www.themealdb.com/meal/${m.idMeal}" target="_blank" rel="noopener">View recipe ↗</a>
                </div>
                <button type="button" class="primary-btn ingredient-result-add" data-id="${m.idMeal}">+ Save</button>
            </div>
        `).join('');
        results.querySelectorAll('.ingredient-result-add').forEach(btn => {
            btn.addEventListener('click', () => saveMealFromIngredients(btn.dataset.id, btn));
        });
    } catch (err) {
        console.error(err);
        status.textContent = 'Could not reach TheMealDB. Check your internet and try again.';
    }
}

async function saveMealFromIngredients(mealId, btn) {
    btn.disabled = true; btn.textContent = 'Saving…';
    try {
        const r = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const j = await r.json();
        const m = j.meals && j.meals[0];
        if (!m) throw new Error('not found');
        const summary = (m.strInstructions || '').split(/\.\s+/).slice(0, 2).join('. ').slice(0, 220);
        const mealType = guessMealType(m.strCategory, m.strTags);
        // Best-effort group inference from ingredient list
        const ings = [];
        for (let i = 1; i <= 20; i++) {
            const ing = (m[`strIngredient${i}`] || '').toLowerCase();
            if (ing) ings.push(ing);
        }
        const groups = inferGroupsFromIngredients(ings, m.strCategory);
        const newRecipe = {
            id: `mdb-${m.idMeal}`,
            name: m.strMeal,
            meal: mealType,
            emoji: '🍽️',
            image: m.strMealThumb,
            href: `https://www.themealdb.com/meal/${m.idMeal}`,
            summary,
            groups: groups.length ? groups : ['Grains'],
            // Reasonable defaults; user can edit later via Add modal if they want
            nutrition: { carbs: 45, protein: 20, fat: 15, calories: 420, sugar: 6, fiber: 3, sodium: 600 }
        };
        // De-dupe
        if (!customRecipes.some(r => r.id === newRecipe.id)) {
            customRecipes.unshift(newRecipe);
            saveCustomRecipes();
        }
        renderRecipeList();
        btn.textContent = '✓ Saved';
        setTimeout(() => { btn.textContent = '+ Save'; btn.disabled = false; }, 1500);
    } catch (err) {
        console.error(err);
        btn.disabled = false; btn.textContent = '+ Save';
        alert('Could not save that recipe.');
    }
}

function inferGroupsFromIngredients(ings, category) {
    const has = (kw) => ings.some(i => i.includes(kw));
    const groups = new Set();
    if (has('chicken') || has('beef') || has('pork') || has('lamb') || has('fish') || has('salmon') || has('tuna') || has('egg') || has('bean') || has('lentil') || has('tofu')) groups.add('Protein');
    if (has('rice') || has('pasta') || has('bread') || has('flour') || has('oat') || has('noodle') || has('quinoa') || has('tortilla')) groups.add('Grains');
    if (has('milk') || has('cheese') || has('yogurt') || has('butter') || has('cream')) groups.add('Dairy');
    if (has('apple') || has('banana') || has('berry') || has('orange') || has('lemon') || has('lime') || has('mango') || has('pineapple') || has('peach') || has('grape') || has('avocado')) groups.add('Fruits');
    if (has('tomato') || has('onion') || has('pepper') || has('carrot') || has('broccoli') || has('spinach') || has('lettuce') || has('cucumber') || has('garlic') || has('potato') || has('mushroom') || has('zucchini')) groups.add('Veggies');
    if ((category || '').toLowerCase() === 'dessert') { groups.add('Grains'); }
    return [...groups];
}

document.addEventListener('DOMContentLoaded', initMealPlanner);
