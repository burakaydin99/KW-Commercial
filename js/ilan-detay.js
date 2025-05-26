// js/ilan-detay.js - İlan detay sayfası için Firebase entegre

// Firebase servisleri import edilecek (HTML'de)
// import { authService } from './auth-service.js';
// import { firestoreService } from './firestore-service.js';

// DOM elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const detailContainer = document.getElementById('detailContainer');

// State
let isLoggedIn = false;
let currentUser = null;
let currentListing = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Detail page DOM loaded, initializing...');
    
    // Wait for Firebase services to load
    await waitForFirebaseServices();
    
    // Auth state dinle
    authService.onAuthStateChange(handleAuthChange);
    
    // Event listeners
    setupEventListeners();
    
    // İlan detayını yükle
    await loadListingDetail();
});

// Firebase servislerinin yüklenmesini bekle
function waitForFirebaseServices() {
    return new Promise((resolve) => {
        const checkServices = () => {
            if (window.authService && window.firestoreService) {
                resolve();
            } else {
                setTimeout(checkServices, 100);
            }
        };
        checkServices();
    });
}

// Auth state change handler
function handleAuthChange(user) {
    currentUser = user;
    isLoggedIn = !!user;
    
    if (user) {
        showUserInfo(user);
        console.log('✅ User logged in:', user.email);
    } else {
        hideUserInfo();
        console.log('👤 User logged out');
    }
    
    // Edit butonunu güncelle
    setTimeout(() => {
        setupEditButton();
    }, 100);
}

// User info göster
function showUserInfo(user) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (userInfo) userInfo.style.display = 'flex';
    if (userName) userName.textContent = user.displayName || user.email;
}

// User info gizle
function hideUserInfo() {
    if (loginBtn) loginBtn.style.display = 'block';
    if (userInfo) userInfo.style.display = 'none';
}

// Event listeners
function setupEventListeners() {
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    // Contact button event
    const contactBtn = document.querySelector('.contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', function() {
            if (!currentListing) return;
            
            const advisor = currentListing.advisor;
            const title = currentListing.title;
            const price = formatPrice(currentListing.price);
            
            const message = `Merhaba ${advisor}, "${title}" ilanı hakkında bilgi almak istiyorum. (Fiyat: ${price} TL)`;
            
            // Try to open WhatsApp if on mobile, otherwise show contact info
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                const whatsappUrl = authService.createWhatsAppLink(currentListing.advisorPhone, message);
                window.open(whatsappUrl, '_blank');
            } else {
                alert(`Danışman İletişim Bilgileri:\n\n${advisor}\n\nMesaj: ${message}\n\nWhatsApp veya telefon ile iletişime geçebilirsiniz.`);
            }
        });
    }
}

// Login
async function handleLogin() {
    try {
        const result = await authService.signInWithGoogle();
        if (result.user) {
            console.log('✅ Login successful');
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        alert('Giriş yapılırken hata oluştu: ' + error.message);
    }
}

// Logout
async function handleLogout() {
    try {
        await authService.signOut();
        console.log('✅ Logout successful');
    } catch (error) {
        console.error('❌ Logout error:', error);
        alert('Çıkış yapılırken hata oluştu');
    }
}

// Get listing ID from URL
function getListingIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log('📋 Listing ID from URL:', id);
    return id;
}

// Load listing detail
async function loadListingDetail() {
    const listingId = getListingIdFromUrl();
    console.log('Loading listing with ID:', listingId);
    
    if (!listingId) {
        console.error('❌ No listing ID provided');
        showError('İlan ID\'si bulunamadı.');
        return;
    }

    try {
        // Firestore'dan ilan al
        showLoading();
        const listing = await firestoreService.getListing(listingId);
        console.log('Found listing:', listing);
        
        if (!listing) {
            console.error('❌ Listing not found:', listingId);
            showError('İlan bulunamadı.');
            return;
        }

        currentListing = listing;
        populateListingDetail(listing);
        showDetail();
        
        // Setup edit button after everything is loaded
        setTimeout(() => {
            setupEditButton();
        }, 100);
        
    } catch (error) {
        console.error('❌ Error loading listing:', error);
        showError('İlan yüklenirken hata oluştu.');
    }
}

// Setup edit button - Permission-based
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
    
    // Add edit button if user has permission
    if (isLoggedIn && authService.canEditListing(currentListing)) {
        const actionButtons = document.querySelector('.action-buttons');
        
        if (actionButtons) {
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '✏️ İlanı Düzenle';
            editBtn.onclick = () => editListing();
            
            // Insert edit button as the first button
            actionButtons.insertBefore(editBtn, actionButtons.firstChild);
            console.log('✅ Edit button added successfully');
        } else {
            console.log('Action buttons container not found');
        }
    } else {
        console.log('❌ User has no edit permission for this listing');
    }
}

// Show loading
function showLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    if (errorMessage) errorMessage.style.display = 'none';
    if (detailContainer) detailContainer.style.display = 'none';
}

// Show error message
function showError(message) {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'block';
    if (detailContainer) detailContainer.style.display = 'none';
    
    if (message) {
        const errorText = errorMessage.querySelector('p');
        if (errorText) {
            errorText.textContent = message;
        }
    }
}

// Show detail container
function showDetail() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
    if (detailContainer) detailContainer.style.display = 'block';
    checkFavoriteStatus();
}

// Populate listing detail
function populateListingDetail(listing) {
    // Update page title
    document.title = `${listing.title} - KW Commercial`;

    // Main image
    const mainImage = document.getElementById('listingMainImage');
    if (mainImage) {
        mainImage.src = listing.image || 'https://via.placeholder.com/400x300/667eea/ffffff?text=Resim+Yok';
        mainImage.alt = listing.title;
    }

    // Header
    const titleElement = document.getElementById('listingTitle');
    if (titleElement) titleElement.textContent = listing.title;
    
    const priceElement = document.getElementById('listingPrice');
    if (priceElement) priceElement.textContent = formatPrice(listing.price) + ' TL';

    // Basic info
    const dateElement = document.getElementById('listingDate');
    if (dateElement) dateElement.textContent = formatDate(listing.date);
    
    const advisorElement = document.getElementById('listingAdvisor');
    if (advisorElement) advisorElement.textContent = listing.advisor;
    
    const portfolioElement = document.getElementById('portfolioType');
    if (portfolioElement) portfolioElement.textContent = getDisplayText(listing.portfolioType);
    
    const usageElement = document.getElementById('usagePurpose');
    if (usageElement) usageElement.textContent = getDisplayText(listing.usagePurpose);

    // Location info
    const cityElement = document.getElementById('listingCity');
    if (cityElement) cityElement.textContent = listing.city;
    
    const districtElement = document.getElementById('listingDistrict');
    if (districtElement) districtElement.textContent = listing.district;
    
    const neighborhoodElement = document.getElementById('listingNeighborhood');
    if (neighborhoodElement) neighborhoodElement.textContent = listing.neighborhood;
    
    const islandElement = document.getElementById('islandParcel');
    if (islandElement) islandElement.textContent = listing.islandParcel || 'Belirtilmemiş';
    
    const zoningElement = document.getElementById('zoningStatus');
    if (zoningElement) zoningElement.textContent = listing.zoningStatus || 'Belirtilmemiş';

    // Price (duplicate for emphasis)
    const detailPriceElement = document.getElementById('detailPrice');
    if (detailPriceElement) detailPriceElement.textContent = formatPrice(listing.price) + ' TL';

    // Description
    const descriptionElement = document.getElementById('listingDescription');
    if (descriptionElement) descriptionElement.textContent = listing.description || 'Açıklama bulunmuyor.';
}

// Edit function
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
    window.location.href = `ilan-duzenle.html?id=${currentListing.id}`;
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
    if (!favoriteBtn) return;
    
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
    
    if (favoriteBtn && favorites.includes(currentListing.id)) {
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
    
    // E key to edit (if user has permission)
    if (event.key === 'e' || event.key === 'E') {
        if (isLoggedIn && currentListing && authService.canEditListing(currentListing)) {
            editListing();
        }
    }
});

// Make functions globally available for HTML onclick handlers
window.goBack = goBack;
window.shareProperty = shareProperty;
window.toggleFavorite = toggleFavorite;