// js/ilan-detay.js - İlan detay sayfası (Düzeltilmiş Firebase entegre versiyon)

// State variables
let currentUser = null;
let currentListing = null;
let userProfile = null;
let authInitialized = false;

// DOM elements - güvenli erişim
let loginBtn, logoutBtn, userInfo, userName;
let loadingSpinner, errorMessage, detailContainer;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 İlan detay sayfası başlatılıyor...');
    
    try {
        // DOM elementleri al
        initializeDOMElements();
        
        // Firebase servislerinin yüklenmesini bekle
        await waitForFirebaseServices();
        console.log('✅ Firebase servisleri hazır');
        
        // Auth state'i dinle
        initializeAuth();
        
        // Event listeners kur
        setupEventListeners();
        
        // İlan detayını yükle
        await loadListingDetail();
        
    } catch (error) {
        console.error('❌ Sayfa başlatma hatası:', error);
        showError('Sayfa yüklenirken hata oluştu: ' + error.message);
    }
});

// DOM elementlerini güvenli şekilde al
function initializeDOMElements() {
    loginBtn = document.getElementById('loginBtn');
    logoutBtn = document.getElementById('logoutBtn');
    userInfo = document.getElementById('userInfo');
    userName = document.getElementById('userName');
    loadingSpinner = document.getElementById('loadingSpinner');
    errorMessage = document.getElementById('errorMessage');
    detailContainer = document.getElementById('detailContainer');
}

// Firebase servislerinin yüklenmesini bekle
async function waitForFirebaseServices() {
    let attempts = 0;
    const maxAttempts = 100; // 10 saniye
    
    while (attempts < maxAttempts) {
        if (window.authService && window.firestoreService && window.userService) {
            console.log('✅ Firebase servisleri yüklendi');
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    throw new Error('Firebase servisleri yüklenemedi');
}

// Auth state'i başlat
function initializeAuth() {
    try {
        console.log('🔐 Auth dinleyici başlatılıyor...');
        
        // Auth state değişikliklerini dinle
        window.authService.onAuthStateChange(async (user) => {
            console.log('👤 Auth state değişti:', user ? user.email : 'Çıkış yapıldı');
            
            currentUser = user;
            updateAuthUI(user);
            
            if (user) {
                await loadUserProfile();
            } else {
                userProfile = null;
            }
            
            authInitialized = true;
            
            // Edit butonunu güncelle
            setTimeout(() => {
                setupEditButton();
            }, 100);
        });
        
        console.log('✅ Auth dinleyici kuruldu');
        
    } catch (error) {
        console.error('❌ Auth başlatma hatası:', error);
        throw error;
    }
}

// Kullanıcı profilini yükle
async function loadUserProfile() {
    try {
        if (!currentUser) return;
        
        console.log('👤 Kullanıcı profili yükleniyor...');
        userProfile = await window.userService.getUserProfile();
        console.log('✅ Kullanıcı profili yüklendi:', userProfile);
        
        // İlan detaylarını yeniden render et (danışman bilgileri için)
        if (currentListing) {
            populateListingDetail(currentListing);
        }
        
    } catch (error) {
        console.error('❌ Kullanıcı profili yükleme hatası:', error);
        userProfile = null;
    }
}

// Auth UI güncelle
function updateAuthUI(user) {
    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (userName) userName.textContent = user.displayName || user.email;
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
    }
}

// Event listeners kur
function setupEventListeners() {
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    // Keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            goHome();
        }
        
        // E key to edit (if user has permission)
        if (event.key === 'e' || event.key === 'E') {
            if (currentUser && currentListing && window.authService.canEditListing(currentListing)) {
                editListing();
            }
        }
    });
}

// Login
async function handleLogin() {
    try {
        showNotification('Giriş yapılıyor...', 'info');
        console.log('🔑 Google ile giriş başlatılıyor...');
        
        const result = await window.authService.signInWithGoogle();
        
        if (result.user) {
            console.log('✅ Giriş başarılı:', result.user.email);
            showNotification('Giriş başarılı! Hoş geldiniz.', 'success');
        }
        
    } catch (error) {
        console.error('❌ Login hatası:', error);
        showNotification('Giriş yapılırken hata oluştu: ' + error.message, 'error');
    }
}

// Logout
async function handleLogout() {
    try {
        await window.authService.signOut();
        console.log('✅ Çıkış başarılı');
        showNotification('Çıkış yapıldı!', 'success');
    } catch (error) {
        console.error('❌ Logout hatası:', error);
        showNotification('Çıkış yapılırken hata oluştu', 'error');
    }
}

// URL'den listing ID al
function getListingIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log('📋 URL\'den alınan ilan ID:', id);
    return id ? id.trim() : null;
}

// İlan detayını yükle
async function loadListingDetail() {
    const listingId = getListingIdFromUrl();
    console.log('📋 İlan yükleniyor, ID:', listingId);
    
    if (!listingId) {
        console.error('❌ İlan ID bulunamadı');
        showError('İlan ID\'si bulunamadı.');
        return;
    }

    try {
        showLoading();
        
        // Firestore'dan ilan al
        const listing = await window.firestoreService.getListing(listingId);
        console.log('📋 Bulunan ilan:', listing);
        
        if (!listing) {
            console.error('❌ İlan bulunamadı:', listingId);
            showError('İlan bulunamadı.');
            return;
        }

        currentListing = listing;
        populateListingDetail(listing);
        showDetail();
        
        // Edit butonunu kur
        setTimeout(() => {
            setupEditButton();
        }, 200);
        
        console.log('✅ İlan detayı başarıyla yüklendi');
        
    } catch (error) {
        console.error('❌ İlan yükleme hatası:', error);
        showError('İlan yüklenirken hata oluştu: ' + error.message);
    }
}

// Edit butonu kur - İzin bazlı
function setupEditButton() {
    if (!currentListing) {
        console.log('❌ İlan bulunamadı, edit butonu atlanıyor');
        return;
    }
    
    console.log('🔧 Edit butonu kuruluyor. Giriş durumu:', !!currentUser, 'İlan ID:', currentListing.id);
    
    // Mevcut edit butonunu kaldır
    const existingEditBtn = document.querySelector('.edit-btn');
    if (existingEditBtn) {
        existingEditBtn.remove();
        console.log('🗑️ Mevcut edit butonu kaldırıldı');
    }
    
    // Kullanıcı giriş yapmışsa ve yetki varsa edit butonu ekle
    if (currentUser && window.authService.canEditListing(currentListing)) {
        const actionButtons = document.querySelector('.action-buttons');
        
        if (actionButtons) {
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '✏️ İlanı Düzenle';
            editBtn.onclick = () => editListing();
            
            // Edit butonunu en başa ekle
            actionButtons.insertBefore(editBtn, actionButtons.firstChild);
            console.log('✅ Edit butonu başarıyla eklendi');
        } else {
            console.log('❌ Action buttons container bulunamadı');
        }
    } else {
        console.log('❌ Kullanıcının bu ilanı düzenleme yetkisi yok');
    }
}

// Loading göster
function showLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    if (errorMessage) errorMessage.style.display = 'none';
    if (detailContainer) detailContainer.style.display = 'none';
}

// Error göster
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

// Detay container göster
function showDetail() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
    if (detailContainer) detailContainer.style.display = 'block';
}

// İlan detaylarını doldur
function populateListingDetail(listing) {
    console.log('📝 İlan detayları doldruluyor:', listing.title);
    
    // Sayfa başlığını güncelle
    document.title = `${listing.title} - KW Commercial`;

    // Ana görsel
    const mainImage = document.getElementById('listingMainImage');
    if (mainImage) {
        const imageUrl = listing.imageUrl || listing.image || 'https://via.placeholder.com/400x300/667eea/ffffff?text=Resim+Yok';
        mainImage.src = imageUrl;
        mainImage.alt = listing.title;
        
        // Görsel yükleme hatası durumunda
        mainImage.onerror = function() {
            this.src = 'https://via.placeholder.com/400x300/667eea/ffffff?text=Resim+Yüklenemedi';
        };
    }

    // Başlık ve fiyat
    const titleElement = document.getElementById('listingTitle');
    if (titleElement) titleElement.textContent = listing.title;
    
    const priceElement = document.getElementById('listingPrice');
    if (priceElement) priceElement.textContent = formatPrice(listing.price) + ' TL';

    // Temel bilgiler
    const dateElement = document.getElementById('listingDate');
    if (dateElement) dateElement.textContent = formatDate(listing.date);
    
    // Danışman bilgileri - Önce user profile'dan, sonra listing'den
    let advisorName = listing.advisor || 'Belirtilmemiş';
    let advisorPhone = listing.advisorPhone || 'Belirtilmemiş';
    let advisorEmail = listing.advisorEmail || 'Belirtilmemiş';
    
    // Eğer ilan sahibi ile giriş yapan kullanıcı aynıysa, Firestore'dan güncel bilgileri al
    if (userProfile && listing.createdBy === currentUser?.uid) {
        advisorName = userProfile.name || advisorName;
        advisorPhone = userProfile.phone || advisorPhone;
        advisorEmail = userProfile.email || advisorEmail;
    }
    
    const advisorElement = document.getElementById('listingAdvisor');
    const phoneElement = document.getElementById('advisorPhone');
    const emailElement = document.getElementById('advisorEmail');
    
    if (advisorElement) advisorElement.textContent = advisorName;
    if (phoneElement) phoneElement.textContent = advisorPhone;
    if (emailElement) emailElement.textContent = advisorEmail;
    
    // Portföy detayları
    const portfolioElement = document.getElementById('portfolioType');
    if (portfolioElement) portfolioElement.textContent = getDisplayText(listing.portfolioType);
    
    const usageElement = document.getElementById('usagePurpose');
    if (usageElement) usageElement.textContent = getDisplayText(listing.usagePurpose);

    // Konum bilgileri
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

    // Detay fiyat
    const detailPriceElement = document.getElementById('detailPrice');
    if (detailPriceElement) detailPriceElement.textContent = formatPrice(listing.price) + ' TL';

    // Açıklama
    const descriptionElement = document.getElementById('listingDescription');
    if (descriptionElement) {
        descriptionElement.textContent = listing.description || 'Açıklama bulunmuyor.';
    }
    
    console.log('✅ İlan detayları başarıyla dolduruldu');
}

// İlan düzenleme
function editListing() {
    console.log('✏️ İlan düzenleme başlatılıyor');
    
    if (!currentUser) {
        showNotification('İlan düzenlemek için giriş yapmanız gerekiyor.', 'error');
        return;
    }
    
    if (!currentListing) {
        showNotification('İlan bilgileri yüklenemedi.', 'error');
        return;
    }
    
    console.log('🔄 Düzenleme sayfasına yönlendiriliyor:', currentListing.id);
    window.location.href = `ilan-duzenle.html?id=${currentListing.id}`;
}

// Danışmanla iletişime geç (WhatsApp)
function contactAdvisor() {
    if (!currentListing) {
        showNotification('İlan bilgileri yüklenemedi.', 'error');
        return;
    }

    let advisorPhone = '';
    let advisorName = '';
    
    // Önce user profile'dan, sonra listing'den telefon al
    if (userProfile && currentListing.createdBy === currentUser?.uid) {
        advisorPhone = userProfile.phone || currentListing.advisorPhone || '';
        advisorName = userProfile.name || currentListing.advisor || 'Danışman';
    } else {
        advisorPhone = currentListing.advisorPhone || '';
        advisorName = currentListing.advisor || 'Danışman';
    }
    
    if (!advisorPhone) {
        showNotification('Danışman telefon numarası bulunamadı.', 'error');
        return;
    }
    
    const title = currentListing.title;
    const price = formatPrice(currentListing.price);
    
    const message = `Merhaba ${advisorName}, "${title}" ilanı hakkında bilgi almak istiyorum. (Fiyat: ${price} TL)`;
    
    try {
        const whatsappUrl = window.authService.createWhatsAppLink(advisorPhone, message);
        window.open(whatsappUrl, '_blank');
        showNotification('WhatsApp açılıyor...', 'success');
    } catch (error) {
        console.error('WhatsApp link hatası:', error);
        showNotification('WhatsApp linki oluşturulamadı.', 'error');
    }
}

// İlan linkini kopyala
function copyListingLink() {
    const url = window.location.href;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showNotification('İlan linki panoya kopyalandı!', 'success');
        }).catch(() => {
            fallbackCopy(url);
        });
    } else {
        fallbackCopy(url);
    }
}

// Fallback copy method
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showNotification('İlan linki panoya kopyalandı!', 'success');
    } catch (err) {
        console.error('Copy failed:', err);
        showNotification('Kopyalama başarısız. Link: ' + text, 'error');
    }
    document.body.removeChild(textArea);
}

// Bildirim göster
function showNotification(message, type = 'info') {
    // Mevcut bildirimleri kaldır
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animasyonla göster
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Otomatik kaldır
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, type === 'error' ? 5000 : 3000); // Error mesajları daha uzun kalır
}

// ================================
// UTILITY FUNCTIONS
// ================================

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
    if (!price || isNaN(price)) return '0';
    return new Intl.NumberFormat('tr-TR').format(price);
}

function formatDate(dateString) {
    if (!dateString) return 'Belirtilmemiş';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Date format hatası:', error);
        return 'Geçersiz tarih';
    }
}

// Ana sayfaya git
function goHome() {
    window.location.href = 'index.html';
}

// ================================
// GLOBAL FUNCTIONS (HTML onclick için)
// ================================

// HTML onclick olayları için global erişim
window.goHome = goHome;
window.contactAdvisor = contactAdvisor;
window.copyListingLink = copyListingLink;
window.editListing = editListing;

// ================================
// ERROR HANDLING
// ================================

// Global hata yakalayıcı
window.addEventListener('error', function(event) {
    console.error('Global JavaScript hatası:', event.error);
    showNotification('Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.', 'error');
});

// Promise rejection yakalayıcı
window.addEventListener('unhandledrejection', function(event) {
    console.error('İşlenmeyen Promise hatası:', event.reason);
    showNotification('Bir işlem tamamlanamadı. Lütfen tekrar deneyin.', 'error');
});

// Sayfa yüklendiğinde yumuşak scroll
window.addEventListener('load', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

console.log('✅ İlan detay modülü başarıyla yüklendi');