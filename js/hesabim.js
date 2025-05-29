// js/hesabim.js - Kullanıcı hesap yönetimi sayfası

// State variables
let currentUser = null;
let userProfile = null;
let userStats = null;
let authInitialized = false;
let hasUnsavedChanges = false;

// DOM elements
let loginBtn, logoutBtn, userInfo, userName;
let loadingSpinner, errorMessage, accountContainer;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 Hesap sayfası başlatılıyor...');
    
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
        
        // Hesap bilgilerini yükle
        await loadAccountData();
        
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
    accountContainer = document.getElementById('accountContainer');
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
                await loadUserStats();
                await populateAccountForm();
                showAccountContainer();
            } else {
                userProfile = null;
                userStats = null;
                showLoginRequired();
            }
            
            authInitialized = true;
        });
        
        console.log('✅ Auth dinleyici kuruldu');
        
    } catch (error) {
        console.error('❌ Auth başlatma hatası:', error);
        throw error;
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
    
    // Form events
    const accountForm = document.getElementById('accountForm');
    if (accountForm) accountForm.addEventListener('submit', handleFormSubmit);
    
    // Phone number formatting
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', handlePhoneInput);
        phoneField.addEventListener('blur', validatePhoneNumber);
    }
    
    // Track changes for unsaved changes warning
    setupChangeTracking();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Ctrl+S to save
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            if (hasUnsavedChanges && accountForm) {
                accountForm.dispatchEvent(new Event('submit'));
            }
        }
        
        // Escape to go back
        if (event.key === 'Escape') {
            goHome();
        }
    });
    
    // Warn about unsaved changes
    window.addEventListener('beforeunload', function(e) {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'Kaydedilmemiş değişiklikleriniz var. Sayfadan ayrılmak istediğinizden emin misiniz?';
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
            
            // Hesap bilgilerini yükle
            await loadAccountData();
        }
        
    } catch (error) {
        console.error('❌ Login hatası:', error);
        showNotification('Giriş yapılırken hata oluştu: ' + error.message, 'error');
    }
}

// Logout
async function handleLogout() {
    try {
        if (hasUnsavedChanges) {
            if (!confirm('Kaydedilmemiş değişiklikleriniz var. Çıkış yapmak istediğinizden emin misiniz?')) {
                return;
            }
        }
        
        await window.authService.signOut();
        console.log('✅ Çıkış başarılı');
        showNotification('Çıkış yapıldı!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('❌ Logout hatası:', error);
        showNotification('Çıkış yapılırken hata oluştu', 'error');
    }
}

// Hesap verilerini yükle
async function loadAccountData() {
    if (!currentUser) {
        showLoginRequired();
        return;
    }

    try {
        showLoading();
        
        await loadUserProfile();
        await loadUserStats();
        await populateAccountForm();
        
        showAccountContainer();
        
    } catch (error) {
        console.error('❌ Hesap verileri yükleme hatası:', error);
        showError('Hesap bilgileri yüklenirken hata oluştu: ' + error.message);
    }
}

// Kullanıcı profilini yükle
async function loadUserProfile() {
    try {
        if (!currentUser) return;
        
        console.log('👤 Kullanıcı profili yükleniyor...');
        userProfile = await window.userService.getUserProfile();
        console.log('✅ Kullanıcı profili yüklendi:', userProfile);
        
    } catch (error) {
        console.error('❌ Kullanıcı profili yükleme hatası:', error);
        userProfile = null;
    }
}

// Kullanıcı istatistiklerini yükle
async function loadUserStats() {
    try {
        if (!currentUser) return;
        
        console.log('📊 Kullanıcı istatistikleri yükleniyor...');
        
        // Kullanıcının ilanlarını al
        const userListings = await window.firestoreService.getUserListings(currentUser.uid);
        
        userStats = {
            totalListings: userListings.length,
            activeListings: userListings.length, // Şimdilik hepsi aktif
            totalViews: userListings.reduce((total, listing) => total + (listing.views || 0), 0),
            memberSince: currentUser.metadata?.creationTime ? 
                new Date(currentUser.metadata.creationTime).toLocaleDateString('tr-TR') : 
                'Bilinmiyor'
        };
        
        console.log('✅ Kullanıcı istatistikleri yüklendi:', userStats);
        
    } catch (error) {
        console.error('❌ Kullanıcı istatistikleri yükleme hatası:', error);
        userStats = {
            totalListings: 0,
            activeListings: 0,
            totalViews: 0,
            memberSince: 'Bilinmiyor'
        };
    }
}

// Form alanlarını doldur
async function populateAccountForm() {
    if (!currentUser) return;
    
    try {
        // Profile header bilgileri
        const displayName = document.getElementById('displayName');
        const displayTitle = document.getElementById('displayTitle');
        const displayEmail = document.getElementById('displayEmail');
        const userAvatar = document.getElementById('userAvatar');
        const avatarFallback = document.getElementById('avatarFallback');
        const avatarInitials = document.getElementById('avatarInitials');
        
        const fullName = userProfile?.name || currentUser.displayName || '';
        const regionalOffice = userProfile?.regionalOffice || '';
        const email = currentUser.email || '';
        
        // Header bilgilerini güncelle
        if (displayName) displayName.textContent = fullName || 'Kullanıcı Adı';
        if (displayTitle) displayTitle.textContent = regionalOffice ? `${fullName} | ${regionalOffice}` : 'KW Commercial';
        if (displayEmail) displayEmail.textContent = email;
        
        // Avatar yönetimi
        if (currentUser.photoURL) {
            if (userAvatar) {
                userAvatar.src = currentUser.photoURL;
                userAvatar.style.display = 'block';
            }
            if (avatarFallback) avatarFallback.style.display = 'none';
        } else {
            // İlk harfleri al
            const initials = fullName
                .split(' ')
                .map(name => name.charAt(0))
                .join('')
                .toUpperCase()
                .substring(0, 2) || 'KW';
            
            if (avatarInitials) avatarInitials.textContent = initials;
            if (userAvatar) userAvatar.style.display = 'none';
            if (avatarFallback) avatarFallback.style.display = 'flex';
        }
        
        // Form alanlarını doldur
        const fullNameField = document.getElementById('fullName');
        const phoneField = document.getElementById('phone');
        const emailField = document.getElementById('email');
        const regionalOfficeField = document.getElementById('regionalOffice');
        
        if (fullNameField) fullNameField.value = fullName;
        if (phoneField) phoneField.value = userProfile?.phone || '';
        if (emailField) emailField.value = email;
        if (regionalOfficeField) regionalOfficeField.value = regionalOffice;
        
        // İstatistikleri güncelle
        updateStatsDisplay();
        
        console.log('✅ Form başarıyla dolduruldu');
        
    } catch (error) {
        console.error('❌ Form doldurma hatası:', error);
    }
}

// İstatistikleri güncelle
function updateStatsDisplay() {
    if (!userStats) return;
    
    const totalListingsEl = document.getElementById('totalListings');
    const activeListingsEl = document.getElementById('activeListings');
    const totalViewsEl = document.getElementById('totalViews');
    const memberSinceEl = document.getElementById('memberSince');
    
    if (totalListingsEl) totalListingsEl.textContent = userStats.totalListings;
    if (activeListingsEl) activeListingsEl.textContent = userStats.activeListings;
    if (totalViewsEl) totalViewsEl.textContent = userStats.totalViews;
    if (memberSinceEl) memberSinceEl.textContent = userStats.memberSince;
}

// Form gönderimi
async function handleFormSubmit(event) {
    event.preventDefault();
    console.log('💾 Hesap bilgileri kaydediliyor...');
    
    if (!validateForm()) {
        return;
    }
    
    try {
        showNotification('Bilgiler kaydediliyor...', 'info');
        
        const formData = new FormData(event.target);
        
        // Güncellenecek kullanıcı verileri
        const userData = {
            name: formData.get('fullName'),
            phone: formData.get('phone'),
            regionalOffice: formData.get('regionalOffice'),
            email: currentUser.email // Email değişmez
        };
        
        console.log('📄 Güncellenecek veri:', userData);
        
        // Kullanıcı profilini güncelle
        await window.userService.createOrUpdateUserProfile(userData);
        
        // Local state'i güncelle
        userProfile = { ...userProfile, ...userData };
        
        // Display'i yeniden güncelle
        await populateAccountForm();
        
        hasUnsavedChanges = false;
        showNotification('Bilgileriniz başarıyla güncellendi!', 'success');
        
        console.log('✅ Hesap bilgileri başarıyla güncellendi');
        
    } catch (error) {
        console.error('❌ Hesap bilgileri güncelleme hatası:', error);
        showNotification('Bilgiler güncellenirken hata oluştu: ' + error.message, 'error');
    }
}

// Form validasyonu
function validateForm() {
    const requiredFields = [
        'fullName',
        'regionalOffice'
    ];
    
    // Clear previous error styles
    document.querySelectorAll('.field-error').forEach(field => {
        field.classList.remove('field-error');
    });
    
    for (const fieldName of requiredFields) {
        const field = document.getElementById(fieldName);
        if (!field || !field.value.trim()) {
            if (field) {
                field.classList.add('field-error');
                field.focus();
            }
            const label = field ? field.previousElementSibling : null;
            const labelText = label ? label.textContent : fieldName;
            showNotification(`Lütfen ${labelText} alanını doldurunuz.`, 'error');
            return false;
        }
    }
    
    // Validate name length
    const nameField = document.getElementById('fullName');
    if (nameField && nameField.value) {
        if (nameField.value.length < 2 || nameField.value.length > 50) {
            nameField.classList.add('field-error');
            nameField.focus();
            showNotification('Ad Soyad 2-50 karakter arasında olmalıdır.', 'error');
            return false;
        }
    }
    
    // Validate phone number
    if (!validatePhoneNumber()) {
        return false;
    }
    
    return true;
}

// Telefon numarası input işleme
function handlePhoneInput(event) {
    let value = event.target.value.replace(/\D/g, ''); // Sadece rakamlar
    
    // 90 ile başlamıyorsa otomatik ekle
    if (value && !value.startsWith('90')) {
        if (value.startsWith('0')) {
            value = '90' + value.substring(1);
        } else if (value.startsWith('5')) {
            value = '90' + value;
        }
    }
    
    // Maksimum 12 karakter (90XXXXXXXXXX)
    if (value.length > 12) {
        value = value.substring(0, 12);
    }
    
    event.target.value = value;
    hasUnsavedChanges = true;
}

// Telefon numarası validasyonu
function validatePhoneNumber() {
    const phoneField = document.getElementById('phone');
    if (!phoneField || !phoneField.value) return true; // Telefon zorunlu değil
    
    const phone = phoneField.value;
    const isValid = /^90[0-9]{10}$/.test(phone);
    
    if (!isValid && phone.length > 0) {
        phoneField.classList.add('field-error');
        showNotification('Geçersiz telefon formatı. Örnek: 905551234567', 'error');
        return false;
    } else {
        phoneField.classList.remove('field-error');
        phoneField.classList.add('field-updated');
        return true;
    }
}

// Change tracking
function setupChangeTracking() {
    const accountForm = document.getElementById('accountForm');
    if (!accountForm) return;
    
    const formElements = accountForm.querySelectorAll('input:not([readonly]), select');
    
    formElements.forEach(element => {
        element.addEventListener('input', function() {
            this.classList.add('field-updated');
            hasUnsavedChanges = true;
        });
        
        element.addEventListener('change', function() {
            this.classList.add('field-updated');
            hasUnsavedChanges = true;
        });
    });
}

// UI State Management
function showLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'flex';
    if (errorMessage) errorMessage.style.display = 'none';
    if (accountContainer) accountContainer.style.display = 'none';
}

function showError(message) {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'flex';
    if (accountContainer) accountContainer.style.display = 'none';
    
    if (message) {
        const errorText = errorMessage.querySelector('p');
        if (errorText) {
            errorText.textContent = message;
        }
    }
}

function showAccountContainer() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
    if (accountContainer) accountContainer.style.display = 'block';
}

function showLoginRequired() {
    console.log('🔐 Login gerekli, UI gösteriliyor');
    
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'flex';
    if (accountContainer) accountContainer.style.display = 'none';
    
    // Global olarak handleLogin fonksiyonunu erişilebilir yap
    window.handleLogin = handleLogin;
}

// Notification sistemi
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
    }, type === 'error' ? 5000 : 3000);
}

// Utility functions
function goHome() {
    if (hasUnsavedChanges) {
        if (!confirm('Kaydedilmemiş değişiklikleriniz var. Ana sayfaya dönmek istediğinizden emin misiniz?')) {
            return;
        }
    }
    window.location.href = 'index.html';
}

// Global functions (HTML onclick için)
window.goHome = goHome;
window.handleLogin = handleLogin;

// Error handling
window.addEventListener('error', function(event) {
    console.error('Global JavaScript hatası:', event.error);
    showNotification('Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.', 'error');
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('İşlenmeyen Promise hatası:', event.reason);
    showNotification('Bir işlem tamamlanamadı. Lütfen tekrar deneyin.', 'error');
});

console.log('✅ Hesap sayfası modülü başarıyla yüklendi');