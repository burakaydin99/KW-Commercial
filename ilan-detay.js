// Mock data for listings (updated with createdBy fields)
const listings = [
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

// DOM elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const detailContainer = document.getElementById('detailContainer');

// Authentication state
let isLoggedIn = false;
let currentUser = null;
let currentListing = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    initializeAuth();
    setupEventListeners();
    loadListingDetail();
});

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
        console.log('User logged in:', currentUser);
    } else {
        console.log('User not logged in');
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
    
    // Update edit button visibility immediately
    setupEditButton();
}

function logout() {
    currentUser = null;
    isLoggedIn = false;
    sessionStorage.removeItem('mockLoggedIn');
    hideUserInfo();
    alert('Çıkış yapıldı!');
    
    // Remove edit button immediately
    const existingEditBtn = document.querySelector('.edit-btn');
    if (existingEditBtn) {
        existingEditBtn.remove();
    }
}

// Event listeners
function setupEventListeners() {
    loginBtn.addEventListener('click', mockLogin);
    logoutBtn.addEventListener('click', logout);
    
    // Contact button event
    document.querySelector('.contact-btn').addEventListener('click', function() {
        if (!currentListing) return;
        
        const advisor = currentListing.advisor;
        const title = currentListing.title;
        const price = formatPrice(currentListing.price);
        
        const message = `Merhaba ${advisor}, "${title}" ilanı hakkında bilgi almak istiyorum. (Fiyat: ${price} TL)`;
        
        // Try to open WhatsApp if on mobile, otherwise show contact info
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        } else {
            alert(`Danışman İletişim Bilgileri:\n\n${advisor}\n\nMesaj: ${message}\n\nWhatsApp veya telefon ile iletişime geçebilirsiniz.`);
        }
    });
}

// Get listing ID from URL
function getListingIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id'));
}

// Load listing detail
function loadListingDetail() {
    const listingId = getListingIdFromUrl();
    console.log('Loading listing with ID:', listingId);
    
    if (!listingId) {
        showError();
        return;
    }

    // Simulate loading delay
    setTimeout(() => {
        const listing = listings.find(l => l.id === listingId);
        console.log('Found listing:', listing);
        
        if (!listing) {
            showError();
            return;
        }

        currentListing = listing;
        populateListingDetail(listing);
        showDetail();
        
        // Setup edit button after everything is loaded
        setTimeout(() => {
            setupEditButton();
        }, 100);
    }, 800);
}

// Setup edit button - NO ownership check, only login check
function setupEditButton() {
    console.log('Setting up edit button. Logged in:', isLoggedIn, 'Current listing:', currentListing?.id);
    
    if (!currentListing) {
        console.log('No current listing, skipping edit button');
        return;
    }
    
    // Remove existing edit button if any
    const existingEditBtn = document.querySelector('.edit-btn');
    if (existingEditBtn) {
        existingEditBtn.remove();
        console.log('Removed existing edit button');
    }
    
    // Add edit button if user is logged in - NO ownership check
    if (isLoggedIn && currentUser) {
        const actionButtons = document.querySelector('.action-buttons');
        
        if (actionButtons) {
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '✏️ İlanı Düzenle';
            editBtn.onclick = () => editListing();
            
            // Insert edit button as the first button
            actionButtons.insertBefore(editBtn, actionButtons.firstChild);
            console.log('Edit button added successfully');
        } else {
            console.log('Action buttons container not found');
        }
    } else {
        console.log('User not logged in, edit button not added');
    }
}

// Show error message
function showError() {
    loadingSpinner.style.display = 'none';
    errorMessage.style.display = 'block';
    detailContainer.style.display = 'none';
}

// Show detail container
function showDetail() {
    loadingSpinner.style.display = 'none';
    errorMessage.style.display = 'none';
    detailContainer.style.display = 'block';
    checkFavoriteStatus();
}

// Populate listing detail
function populateListingDetail(listing) {
    // Update page title
    document.title = `${listing.title} - KW Commercial`;

    // Main image
    document.getElementById('listingMainImage').src = listing.image;
    document.getElementById('listingMainImage').alt = listing.title;

    // Header
    document.getElementById('listingTitle').textContent = listing.title;
    document.getElementById('listingPrice').textContent = formatPrice(listing.price) + ' TL';

    // Basic info
    document.getElementById('listingDate').textContent = formatDate(listing.date);
    document.getElementById('listingAdvisor').textContent = listing.advisor;
    document.getElementById('portfolioType').textContent = getDisplayText(listing.portfolioType);
    document.getElementById('usagePurpose').textContent = getDisplayText(listing.usagePurpose);

    // Location info
    document.getElementById('listingCity').textContent = listing.city;
    document.getElementById('listingDistrict').textContent = listing.district;
    document.getElementById('listingNeighborhood').textContent = listing.neighborhood;
    document.getElementById('islandParcel').textContent = listing.islandParcel || 'Belirtilmemiş';
    document.getElementById('zoningStatus').textContent = listing.zoningStatus || 'Belirtilmemiş';

    // Price (duplicate for emphasis)
    document.getElementById('detailPrice').textContent = formatPrice(listing.price) + ' TL';

    // Description
    document.getElementById('listingDescription').textContent = listing.description || 'Açıklama bulunmuyor.';
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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Navigation functions
function goBack() {
    // Check if there's history to go back to
    if (document.referrer && document.referrer.includes(window.location.hostname)) {
        window.history.back();
    } else {
        // Fallback to main page
        window.location.href = 'index.html';
    }
}

// Edit function - NO ownership check
function editListing() {
    console.log('Edit listing clicked');
    
    if (!isLoggedIn) {
        alert('İlan düzenlemek için giriş yapmanız gerekiyor.');
        return;
    }
    
    if (!currentListing) {
        alert('İlan bilgileri yüklenemedi.');
        return;
    }
    
    console.log('Redirecting to edit page for listing:', currentListing.id);
    // NO ownership check - any logged in user can edit any listing
    window.location.href = `ilan-duzenle.html?id=${currentListing.id}`;
}

// Action functions
function shareProperty() {
    if (!currentListing) return;

    if (navigator.share) {
        // Use native sharing if available (mobile devices)
        navigator.share({
            title: currentListing.title,
            text: `${currentListing.title} - ${formatPrice(currentListing.price)} TL`,
            url: window.location.href
        }).then(() => {
            console.log('Sharing successful');
        }).catch((error) => {
            console.log('Error sharing:', error);
            fallbackShare();
        });
    } else {
        fallbackShare();
    }
}

function fallbackShare() {
    // Fallback sharing method
    const url = window.location.href;
    const title = currentListing ? currentListing.title : 'İlan Detayı';
    
    // Copy to clipboard
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            alert('İlan linki panoya kopyalandı!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('İlan linki panoya kopyalandı!');
        });
    }
}

function toggleFavorite() {
    if (!currentListing) return;

    const favoriteBtn = document.querySelector('.favorite-btn');
    let favorites = JSON.parse(sessionStorage.getItem('favorites') || '[]');
    
    const isFavorite = favorites.includes(currentListing.id);
    
    if (isFavorite) {
        // Remove from favorites
        const index = favorites.indexOf(currentListing.id);
        favorites.splice(index, 1);
        favoriteBtn.textContent = '🤍 Favorilere Ekle';
        favoriteBtn.classList.remove('active');
        alert('İlan favorilerden kaldırıldı.');
    } else {
        // Add to favorites
        favorites.push(currentListing.id);
        favoriteBtn.textContent = '❤️ Favorilerde';
        favoriteBtn.classList.add('active');
        alert('İlan favorilere eklendi!');
    }
    
    sessionStorage.setItem('favorites', JSON.stringify(favorites));
}

// Check if listing is in favorites on page load
function checkFavoriteStatus() {
    if (!currentListing) return;
    
    const favorites = JSON.parse(sessionStorage.getItem('favorites') || '[]');
    const favoriteBtn = document.querySelector('.favorite-btn');
    
    if (favorites.includes(currentListing.id)) {
        favoriteBtn.textContent = '❤️ Favorilerde';
        favoriteBtn.classList.add('active');
    }
}

// Add smooth scroll to top when page loads
window.addEventListener('load', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Add keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        goBack();
    }
    
    // E key to edit (if user is logged in - NO ownership check)
    if (event.key === 'e' || event.key === 'E') {
        if (isLoggedIn && currentUser && currentListing) {
            editListing();
        }
    }
});