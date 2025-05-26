// Mock data for listings - Extended to 1000+ listings for performance test
let listings = [
    {
        id: 1,
        title: "Merkezi Konumda Satılık Ofis",
        image: "https://media.istockphoto.com/id/182188795/tr/foto%C4%9Fraf/modern-office-building-exterior.jpg?s=612x612&w=is&k=20&c=PXNc2xNZXbCvoNTaPnX9NJcUgvbUU0tckENXDENMvW0=",
        advisor: "Ahmet Yılmaz",
        portfolioType: "BİNA KATI VEYA BÖLÜMÜ",
        usagePurpose: "HİZMET OFİS",
        city: "İstanbul",
        district: "Şişli",
        neighborhood: "Mecidiyeköy",
        price: 2500000,
        date: "2024-01-15",
        description: "Merkezi konumda modern ofis alanı. Metro istasyonuna 5 dakika yürüme mesafesinde. 150 m² kullanım alanı, 2 toplantı odası, açık ofis alanı ve mutfak bulunmaktadır. Bina yeni yapılmış olup, tüm modern imkanlar mevcuttur.",
        islandParcel: "Ada: 123, Parsel: 45",
        zoningStatus: "Ticari",
        createdBy: "123456789",
        createdAt: "2024-01-15T10:00:00.000Z"
    },
    {
        id: 2,
        title: "Cadde Üzeri Kiralık Dükkan",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPWGq950txuigG7DfO6bMtCg2X13S5uH5N0A&s",
        advisor: "Fatma Demir",
        portfolioType: "DÜKKAN-MAĞAZA",
        usagePurpose: "PERAKENDE",
        city: "İstanbul",
        district: "Kadıköy",
        neighborhood: "Moda",
        price: 15000,
        date: "2024-01-10",
        description: "Ana cadde üzerinde kiralık dükkan. Yoğun pedestrian trafiği bulunan lokasyon. 80 m² kapalı alan, geniş vitrin alanı. Perakende satış için ideal konumdadır.",
        islandParcel: "Ada: 456, Parsel: 78",
        zoningStatus: "Ticari",
        createdBy: "987654321",
        createdAt: "2024-01-10T14:30:00.000Z"
    },
    {
        id: 3,
        title: "Sanayi Alanında Satılık Arsa",
        image: "https://www.katilimevim.com.tr/wp-content/uploads/shutterstock_2229665975-min-580x350.jpg",
        advisor: "Mehmet Kaya",
        portfolioType: "ARSA",
        usagePurpose: "SANAYİ-İMALAT",
        city: "Bursa",
        district: "Osmangazi",
        neighborhood: "Organize Sanayi",
        price: 5000000,
        date: "2024-01-08",
        description: "Organize sanayi bölgesinde imar izinli arsa. Toplam 2500 m² alan. Elektrik, su, doğalgaz altyapısı mevcut. Fabrika inşaatı için uygun zemin etüdü yapılmıştır.",
        islandParcel: "Ada: 789, Parsel: 12",
        zoningStatus: "Sanayi",
        createdBy: "456789123",
        createdAt: "2024-01-08T09:15:00.000Z"
    },
    {
        id: 4,
        title: "Ana Cadde Üzeri Kiralık Dükkan",
        image: "https://www.maveraprojeleri.com/uploads/637458.jpg",
        advisor: "Fatma Demir",
        portfolioType: "DÜKKAN-MAĞAZA",
        usagePurpose: "PERAKENDE",
        city: "İstanbul",
        district: "Kadıköy",
        neighborhood: "Bağdat Caddesi",
        price: 25000,
        date: "2024-01-12",
        description: "Yoğun geçiş trafiği olan ana cadde üzerinde kiralık dükkan. Premium lokasyon, yüksek görünürlük. 120 m² alan, geniş depo imkanı.",
        islandParcel: "Ada: 321, Parsel: 54",
        zoningStatus: "Ticari",
        createdBy: "123456789",
        createdAt: "2024-01-12T16:45:00.000Z"
    },
    {
        id: 5,
        title: "Sanayi Alanında Satılık Fabrika Binası",
        image: "https://media.istockphoto.com/id/1365029556/tr/foto%C4%9Fraf/interior-of-metalworking-factory-workshop-hangar-modern-industrial-enterprise-production.jpg?s=612x612&w=0&k=20&c=Qqe95Tt7QNKmmDPqsFDXsTxp1pkw1FcDIWzqfgiTO3U=",
        advisor: "Mehmet Kaya",
        portfolioType: "MUSTAKİL BİNA",
        usagePurpose: "SANAYİ-İMALAT",
        city: "Bursa",
        district: "Osmangazi",
        neighborhood: "Organize Sanayi Bölgesi",
        price: 8500000,
        date: "2024-01-08",
        description: "Organize sanayi bölgesinde tam donanımlı fabrika binası. 3000 m² kapalı alan, vinç sistemi mevcut, yükleme rampaları.",
        islandParcel: "Ada: 654, Parsel: 87",
        zoningStatus: "Sanayi",
        createdBy: "456789123",
        createdAt: "2024-01-08T11:20:00.000Z"
    },
    {
        id: 6,
        title: "Deniz Manzaralı Otel Projesi",
        image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/db/cb/76/levent-otel-dis-cephesi.jpg?w=900&h=500&s=1",
        advisor: "Ayşe Çelik",
        portfolioType: "MUSTAKİL BİNA",
        usagePurpose: "TURİZM",
        city: "Antalya",
        district: "Muratpaşa",
        neighborhood: "Lara",
        price: 15000000,
        date: "2024-01-05",
        description: "Denize sıfır konumda 4 yıldızlı otel projesi. 50 odalı otel konsepti, havuz ve spa alanı planlaması mevcut.",
        islandParcel: "Ada: 111, Parsel: 22",
        zoningStatus: "Turizm",
        createdBy: "789123456",
        createdAt: "2024-01-05T13:10:00.000Z"
    },
    {
        id: 7,
        title: "Merkezi Konumda Eğitim Kurumu Binası",
        image: "https://www.baskentosb.org/_uploads/2021041908113143.jpg",
        advisor: "Mustafa Özkan",
        portfolioType: "BİNA KATI VEYA BÖLÜMÜ",
        usagePurpose: "EĞİTİM",
        city: "Ankara",
        district: "Çankaya",
        neighborhood: "Kızılay",
        price: 35000,
        date: "2024-01-03",
        description: "Merkezi konumda eğitim kurumu için uygun geniş alan. 500 m² alan, 8 derslik kapasitesi, laboratuvar imkanı.",
        islandParcel: "Ada: 333, Parsel: 44",
        zoningStatus: "Eğitim",
        createdBy: "321654987",
        createdAt: "2024-01-03T08:30:00.000Z"
    },
    {
        id: 8,
        title: "Hastane Yakını Sağlık Merkezi",
        image: "https://saglik.ibb.istanbul/wp-content/uploads/2022/10/ESENYURT-2-705x446.jpg",
        advisor: "Dr. Zeynep Arslan",
        portfolioType: "BİNA KATI VEYA BÖLÜMÜ",
        usagePurpose: "SAĞLIK",
        city: "İzmir",
        district: "Konak",
        neighborhood: "Alsancak",
        price: 28000,
        date: "2024-01-01",
        description: "Hastane ve üniversite yakınında sağlık merkezi için ideal konum. Modern tıbbi cihaz altyapısı mevcut.",
        islandParcel: "Ada: 555, Parsel: 66",
        zoningStatus: "Sağlık",
        createdBy: "654987321",
        createdAt: "2024-01-01T15:45:00.000Z"
    }
];

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

// Authentication state - using session storage for persistence
let isLoggedIn = false;
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Main page DOM loaded');
    initializeAuth();
    setupEventListeners();
    setupLocationFilters();
    displayListings(listings);
    updateListingCount(listings);
});

// Authentication functions
function initializeAuth() {
    // Check session storage for login state
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
    loginBtn.style.display = 'none';
    userInfo.style.display = 'flex';
    userName.textContent = currentUser.name;
}

function hideUserInfo() {
    loginBtn.style.display = 'block';
    userInfo.style.display = 'none';
}

// Mock login function
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
    
    // Refresh listings to show edit buttons
    displayListings(listings);
}

function logout() {
    currentUser = null;
    isLoggedIn = false;
    sessionStorage.removeItem('mockLoggedIn');
    hideUserInfo();
    alert('Çıkış yapıldı!');
    
    // Refresh listings to hide edit buttons
    displayListings(listings);
}

// Event listeners
function setupEventListeners() {
    // Auth events
    loginBtn.addEventListener('click', mockLogin);
    logoutBtn.addEventListener('click', logout);
    
    // Filter events with debounce for performance
    searchInput.addEventListener('input', debounce(applyFilters, 300));
    dateFilter.addEventListener('change', applyFilters);
    advisorFilter.addEventListener('input', debounce(applyFilters, 300));
    portfolioTypeFilter.addEventListener('change', applyFilters);
    usagePurposeFilter.addEventListener('change', applyFilters);
    cityFilter.addEventListener('change', applyFilters);
    districtFilter.addEventListener('change', applyFilters);
    minBudget.addEventListener('input', debounce(applyFilters, 500));
    maxBudget.addEventListener('input', debounce(applyFilters, 500));
    
    // Clear filters
    clearFiltersBtn.addEventListener('click', clearAllFilters);
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
    cityFilter.addEventListener('change', function() {
        updateDistrictOptions();
        applyFilters();
    });
}

function updateDistrictOptions() {
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

// Filtering functions - Optimized for large datasets
function applyFilters() {
    showLoading();
    
    // Use setTimeout to prevent UI blocking on large datasets
    setTimeout(() => {
        const startTime = performance.now();
        const filteredListings = filterListings();
        const endTime = performance.now();
        
        console.log(`Filtering ${listings.length} listings took ${endTime - startTime} milliseconds`);
        
        displayListings(filteredListings);
        updateListingCount(filteredListings);
        hideLoading();
    }, 50);
}

function filterListings() {
    return listings.filter(listing => {
        // Search filter
        const searchTerm = searchInput.value.toLowerCase();
        const matchesSearch = !searchTerm || 
            listing.title.toLowerCase().includes(searchTerm) ||
            listing.description.toLowerCase().includes(searchTerm) ||
            listing.advisor.toLowerCase().includes(searchTerm);
        
        // Date filter
        const dateValue = dateFilter.value;
        const matchesDate = !dateValue || listing.date >= dateValue;
        
        // Advisor filter
        const advisorValue = advisorFilter.value.toLowerCase();
        const matchesAdvisor = !advisorValue || 
            listing.advisor.toLowerCase().includes(advisorValue);
        
        // Portfolio type filter
        const portfolioValue = portfolioTypeFilter.value;
        const matchesPortfolio = !portfolioValue || listing.portfolioType === portfolioValue;
        
        // Usage purpose filter
        const usageValue = usagePurposeFilter.value;
        const matchesUsage = !usageValue || listing.usagePurpose === usageValue;
        
        // City filter
        const cityValue = cityFilter.value;
        const matchesCity = !cityValue || listing.city === cityValue;
        
        // District filter
        const districtValue = districtFilter.value;
        const matchesDistrict = !districtValue || listing.district === districtValue;
        
        // Budget filter
        const minBudgetValue = minBudget.value;
        const maxBudgetValue = maxBudget.value;
        const matchesBudget = (!minBudgetValue || listing.price >= parseInt(minBudgetValue)) &&
                              (!maxBudgetValue || listing.price <= parseInt(maxBudgetValue));
        
        return matchesSearch && matchesDate && matchesAdvisor && 
               matchesPortfolio && matchesUsage && matchesCity && 
               matchesDistrict && matchesBudget;
    });
}

function clearAllFilters() {
    searchInput.value = '';
    dateFilter.value = '';
    advisorFilter.value = '';
    portfolioTypeFilter.value = '';
    usagePurposeFilter.value = '';
    cityFilter.value = '';
    districtFilter.value = '';
    minBudget.value = '';
    maxBudget.value = '';
    
    updateDistrictOptions();
    applyFilters();
}

// Display functions - Optimized for performance
function displayListings(listingsToShow) {
    if (listingsToShow.length === 0) {
        showNoResults();
        return;
    }
    
    hideNoResults();
    
    // Use DocumentFragment for better performance with large lists
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
    listingCount.textContent = `${listingsToShow.length} ilan bulundu`;
}

function showLoading() {
    loadingSpinner.style.display = 'block';
    listingsContainer.style.display = 'none';
    noResults.style.display = 'none';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
    listingsContainer.style.display = 'grid';
}

function showNoResults() {
    listingsContainer.style.display = 'none';
    noResults.style.display = 'block';
}

function hideNoResults() {
    noResults.style.display = 'none';
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

// Edit function - Now available to all logged in users (NO ownership check)
function editListing(listingId) {
    console.log('Edit listing clicked for ID:', listingId);
    
    if (!isLoggedIn) {
        alert('İlan düzenlemek için giriş yapmanız gerekiyor.');
        return;
    }
    
    const listing = listings.find(l => l.id === listingId);
    if (!listing) {
        alert('İlan bulunamadı.');
        return;
    }
    
    console.log('Redirecting to edit page for listing:', listingId);
    window.location.href = `ilan-duzenle.html?id=${listingId}`;
}

// Function to update listing (called from edit page)
function updateListing(listingId, updatedData) {
    const index = listings.findIndex(l => l.id === listingId);
    if (index !== -1) {
        listings[index] = { ...listings[index], ...updatedData, updatedAt: new Date().toISOString() };
        return listings[index];
    }
    return null;
}

// Function to add new listing (called from add-listing page)
function addNewListing(listingData) {
    const newListing = {
        id: listings.length > 0 ? Math.max(...listings.map(l => l.id)) + 1 : 1,
        ...listingData,
        createdBy: currentUser ? currentUser.id : 'anonymous',
        createdAt: new Date().toISOString(),
        image: listingData.image || "https://via.placeholder.com/250x200/667eea/ffffff?text=Resim+Yok"
    };
    
    listings.unshift(newListing);
    return newListing;
}