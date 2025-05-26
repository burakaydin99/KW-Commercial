// script.js - Ana sayfa için

// ✅ Değişken çakışmasını önlemek için farklı isim kullan
let allListings = [];

// Location data
const locationData = {
    "İstanbul": {
        "Şişli": ["Mecidiyeköy", "Levent", "Gayrettepe"],
        "Kadıköy": ["Moda", "Bağdat Caddesi", "Fenerbahçe"],
        "Beşiktaş": ["Etiler", "Bebek", "Ortaköy"]
    },
    "Ankara": {
        "Çankaya": ["Kızılay", "Bahçelievler", "Balgat"],
        "Keçiören": ["Etimesgut", "Ostim", "Çamlıdere"]
    },
    "İzmir": {
        "Konak": ["Alsancak", "Pasaport", "Kemeraltı"],
        "Karşıyaka": ["Bostanlı", "Mavişehir", "Çiğli"]
    },
    "Bursa": {
        "Osmangazi": ["Organize Sanayi", "Heykel", "Santral Garaj"],
        "Nilüfer": ["Görükle", "Özlüce", "Beşevler"]
    },
    "Antalya": {
        "Muratpaşa": ["Lara", "Konyaaltı", "Varsak"],
        "Kepez": ["Dokuma", "Şirinyalı", "Hurma"]
    }
};

// DOM elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const listingsContainer = document.getElementById('listingsContainer');
const listingCount = document.getElementById('listingCount');
const loadingSpinner = document.getElementById('loadingSpinner');
const noResults = document.getElementById('noResults');

// Filter elements
const searchInput = document.getElementById('searchInput');
const dateFilter = document.getElementById('dateFilter');
const advisorFilter = document.getElementById('advisorFilter');
const portfolioTypeFilter = document.getElementById('portfolioTypeFilter');
const usagePurposeFilter = document.getElementById('usagePurposeFilter');
const cityFilter = document.getElementById('cityFilter');
const districtFilter = document.getElementById('districtFilter');
const minBudget = document.getElementById('minBudget');
const maxBudget = document.getElementById('maxBudget');
const clearFiltersBtn = document.querySelector('.clear-filters-btn');

// Authentication state
let isLoggedIn = false;
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Main page DOM loaded');
    
    // ✅ Güvenli şekilde veri yükle
    loadListingsData();
    
    initializeAuth();
    setupEventListeners();
    setupLocationFilters();
});

// ✅ Veri yükleme fonksiyonu
function loadListingsData() {
    try {
        // Shared data'dan veri al
        allListings = getSharedListings();
        console.log('Listings loaded successfully:', allListings.length);
        
        // Listings'i göster
        displayListings(allListings);
        updateListingCount(allListings);
    } catch (error) {
        console.error('Error loading listings:', error);
        // Fallback: boş array
        allListings = [];
        displayListings(allListings);
        updateListingCount(allListings);
    }
}

// Authentication functions
function initializeAuth() {
    if (sessionStorage.getItem('mockLoggedIn') === 'true') {
        currentUser = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            id: '123456789'
        };
        isLoggedIn = true;
        showUserInfo();
        console.log('User logged in on main page:', currentUser);
    } else {
        console.log('User not logged in on main page');
    }
}

function showUserInfo() {
    if (loginBtn) loginBtn.style.display = 'none';
    if (userInfo) userInfo.style.display = 'flex';
    if (userName) userName.textContent = currentUser.name;
}

function hideUserInfo() {
    if (loginBtn) loginBtn.style.display = 'block';
    if (userInfo) userInfo.style.display = 'none';
}

function mockLogin() {
    const mockUser = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        id: '123456789'
    };
    
    currentUser = mockUser;
    isLoggedIn = true;
    sessionStorage.setItem('mockLoggedIn', 'true');
    showUserInfo();
    
    alert('Giriş başarılı! (Mock Login)');
    
    // ✅ Edit butonlarını göstermek için listings'i yeniden render et
    displayListings(allListings);
}

function logout() {
    currentUser = null;
    isLoggedIn = false;
    sessionStorage.removeItem('mockLoggedIn');
    hideUserInfo();
    alert('Çıkış yapıldı!');
    
    // Edit butonlarını gizlemek için listings'i yeniden render et
    displayListings(allListings);
}

// Event listeners
function setupEventListeners() {
    // Auth events
    if (loginBtn) loginBtn.addEventListener('click', mockLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    // Filter events with debounce for performance
    if (searchInput) searchInput.addEventListener('input', debounce(applyFilters, 300));
    if (dateFilter) dateFilter.addEventListener('change', applyFilters);
    if (advisorFilter) advisorFilter.addEventListener('input', debounce(applyFilters, 300));
    if (portfolioTypeFilter) portfolioTypeFilter.addEventListener('change', applyFilters);
    if (usagePurposeFilter) usagePurposeFilter.addEventListener('change', applyFilters);
    if (cityFilter) cityFilter.addEventListener('change', applyFilters);
    if (districtFilter) districtFilter.addEventListener('change', applyFilters);
    if (minBudget) minBudget.addEventListener('input', debounce(applyFilters, 500));
    if (maxBudget) maxBudget.addEventListener('input', debounce(applyFilters, 500));
    
    // Clear filters
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearAllFilters);
}

// Debounce function for better performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Location filter setup
function setupLocationFilters() {
    if (cityFilter) {
        cityFilter.addEventListener('change', function() {
            updateDistrictOptions();
            applyFilters();
        });
    }
}

function updateDistrictOptions() {
    if (!cityFilter || !districtFilter) return;
    
    const selectedCity = cityFilter.value;
    districtFilter.innerHTML = '<option value="">Tümü</option>';
    
    if (selectedCity && locationData[selectedCity]) {
        Object.keys(locationData[selectedCity]).forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtFilter.appendChild(option);
        });
    }
}

// Filtering functions
function applyFilters() {
    showLoading();
    
    setTimeout(() => {
        // ✅ Güncel veriyi al
        allListings = getSharedListings();
        
        const startTime = performance.now();
        const filteredListings = filterListings();
        const endTime = performance.now();
        
        console.log(`Filtering ${allListings.length} listings took ${endTime - startTime} milliseconds`);
        
        displayListings(filteredListings);
        updateListingCount(filteredListings);
        hideLoading();
    }, 50);
}

function filterListings() {
    return allListings.filter(listing => {
        // Search filter
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const matchesSearch = !searchTerm || 
            listing.title.toLowerCase().includes(searchTerm) ||
            listing.description.toLowerCase().includes(searchTerm) ||
            listing.advisor.toLowerCase().includes(searchTerm);
        
        // Date filter
        const dateValue = dateFilter ? dateFilter.value : '';
        const matchesDate = !dateValue || listing.date >= dateValue;
        
        // Advisor filter
        const advisorValue = advisorFilter ? advisorFilter.value.toLowerCase() : '';
        const matchesAdvisor = !advisorValue || 
            listing.advisor.toLowerCase().includes(advisorValue);
        
        // Portfolio type filter
        const portfolioValue = portfolioTypeFilter ? portfolioTypeFilter.value : '';
        const matchesPortfolio = !portfolioValue || listing.portfolioType === portfolioValue;
        
        // Usage purpose filter
        const usageValue = usagePurposeFilter ? usagePurposeFilter.value : '';
        const matchesUsage = !usageValue || listing.usagePurpose === usageValue;
        
        // City filter
        const cityValue = cityFilter ? cityFilter.value : '';
        const matchesCity = !cityValue || listing.city === cityValue;
        
        // District filter
        const districtValue = districtFilter ? districtFilter.value : '';
        const matchesDistrict = !districtValue || listing.district === districtValue;
        
        // Budget filter
        const minBudgetValue = minBudget ? minBudget.value : '';
        const maxBudgetValue = maxBudget ? maxBudget.value : '';
        const matchesBudget = (!minBudgetValue || listing.price >= parseInt(minBudgetValue)) &&
                              (!maxBudgetValue || listing.price <= parseInt(maxBudgetValue));
        
        return matchesSearch && matchesDate && matchesAdvisor && 
               matchesPortfolio && matchesUsage && matchesCity && 
               matchesDistrict && matchesBudget;
    });
}

function clearAllFilters() {
    if (searchInput) searchInput.value = '';
    if (dateFilter) dateFilter.value = '';
    if (advisorFilter) advisorFilter.value = '';
    if (portfolioTypeFilter) portfolioTypeFilter.value = '';
    if (usagePurposeFilter) usagePurposeFilter.value = '';
    if (cityFilter) cityFilter.value = '';
    if (districtFilter) districtFilter.value = '';
    if (minBudget) minBudget.value = '';
    if (maxBudget) maxBudget.value = '';
    
    updateDistrictOptions();
    applyFilters();
}

// Display functions
function displayListings(listingsToShow) {
    if (!listingsContainer) return;
    
    if (listingsToShow.length === 0) {
        showNoResults();
        return;
    }
    
    hideNoResults();
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    const startTime = performance.now();
    
    listingsToShow.forEach(listing => {
        const listingElement = createListingElement(listing);
        fragment.appendChild(listingElement);
    });
    
    listingsContainer.innerHTML = '';
    listingsContainer.appendChild(fragment);
    
    const endTime = performance.now();
    console.log(`Rendering ${listingsToShow.length} listings took ${endTime - startTime} milliseconds`);
}

function createListingElement(listing) {
    const div = document.createElement('div');
    div.className = 'listing-card';
    div.onclick = () => viewListingDetails(listing.id);
    
    // Create edit button HTML only if user is logged in
    const editButtonHTML = isLoggedIn ? 
        `<div class="listing-actions">
            <button class="edit-btn" onclick="event.stopPropagation(); editListing(${listing.id})">✏️ Düzenle</button>
        </div>` : '';
    
    div.innerHTML = `
        <img src="${listing.image}" alt="${listing.title}" class="listing-image" loading="lazy">
        <div class="listing-details">
            <h3 class="listing-title">${listing.title}</h3>
            <div class="listing-advisor">${listing.advisor}</div>
            <div class="listing-type-usage">
                <span class="listing-type">${getDisplayText(listing.portfolioType)}</span>
                <span class="listing-usage">${getDisplayText(listing.usagePurpose)}</span>
            </div>
            <div class="listing-location">
                📍 ${listing.city}, ${listing.district}, ${listing.neighborhood}
            </div>
            <div class="listing-price">
                ${formatPrice(listing.price)} TL
            </div>
            ${editButtonHTML}
        </div>
    `;
    
    return div;
}

function updateListingCount(listingsToShow) {
    if (listingCount) {
        listingCount.textContent = `${listingsToShow.length} ilan bulundu`;
    }
}

function showLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    if (listingsContainer) listingsContainer.style.display = 'none';
    if (noResults) noResults.style.display = 'none';
}

function hideLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (listingsContainer) listingsContainer.style.display = 'grid';
}

function showNoResults() {
    if (listingsContainer) listingsContainer.style.display = 'none';
    if (noResults) noResults.style.display = 'block';
}

function hideNoResults() {
    if (noResults) noResults.style.display = 'none';
}

// Utility functions
function getDisplayText(value) {
    const displayTexts = {
        'MUSTAKİL BİNA': 'Mustakil Bina',
        'BİNA KATI VEYA BÖLÜMÜ': 'Bina Katı',
        'DÜKKAN-MAĞAZA': 'Dükkan',
        'ARSA': 'Arsa',
        'TARLA': 'Tarla',
        'HİZMET OFİS': 'Ofis',
        'EĞİTİM': 'Eğitim',
        'SAĞLIK': 'Sağlık',
        'TURİZM': 'Turizm',
        'PERAKENDE': 'Perakende',
        'GIDA': 'Gıda',
        'SANAYİ-İMALAT': 'Sanayi',
        'LOJİSTİK': 'Lojistik',
        'YURT': 'Yurt',
        'YATIRIM': 'Yatırım'
    };
    return displayTexts[value] || value;
}

function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR').format(price);
}

// Navigation functions
function viewListingDetails(listingId) {
    console.log('Viewing details for listing:', listingId);
    window.location.href = `ilan-detay.html?id=${listingId}`;
}

// Edit function - Available to all logged in users
function editListing(listingId) {
    console.log('Edit listing clicked for ID:', listingId);
    
    if (!isLoggedIn) {
        alert('İlan düzenlemek için giriş yapmanız gerekiyor.');
        return;
    }
    
    const listing = allListings.find(l => l.id === listingId);
    if (!listing) {
        alert('İlan bulunamadı.');
        return;
    }
    
    console.log('Redirecting to edit page for listing:', listingId);
    window.location.href = `ilan-duzenle.html?id=${listingId}`;
}