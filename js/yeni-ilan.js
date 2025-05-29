// js/yeni-ilan.js - Yeni ilan oluşturma sayfası (Firebase entegre - tam versiyon)

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

// State variables
let currentUser = null;
let userProfile = null;
let authInitialized = false;
let isFormValid = false;

// DOM elements
let loginBtn, logoutBtn, userInfo, userName;
let loadingSpinner, errorMessage, formContainer;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 Yeni ilan sayfası başlatılıyor...');
    
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
        
        // Kullanıcı bilgilerini yükle
        await loadUserData();
        
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
    formContainer = document.getElementById('formContainer');
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
                await populateUserFields();
                showForm();
            } else {
                userProfile = null;
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

// Kullanıcı verilerini yükle
async function loadUserData() {
    if (!currentUser) {
        showLoginRequired();
        return;
    }

    try {
        showLoading();
        await loadUserProfile();
        await populateUserFields();
        showForm();
    } catch (error) {
        console.error('❌ Kullanıcı verileri yükleme hatası:', error);
        showError('Kullanıcı bilgileri yüklenirken hata oluştu: ' + error.message);
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

// Kullanıcı alanlarını doldur
function populateUserFields() {
    if (!userProfile && !currentUser) return;
    
    console.log('📝 Kullanıcı alanları dolduruluyor...');
    
    // Kullanıcı bilgilerini form alanlarına doldur
    const advisorNameField = document.getElementById('advisorName');
    const advisorPhoneField = document.getElementById('advisorPhone');
    const advisorEmailField = document.getElementById('advisorEmail');
    
    const userName = userProfile?.name || currentUser?.displayName || '';
    const userPhone = userProfile?.phone || '';
    const userEmail = currentUser?.email || '';
    
    if (advisorNameField) advisorNameField.value = userName;
    if (advisorPhoneField) advisorPhoneField.value = userPhone;
    if (advisorEmailField) advisorEmailField.value = userEmail;
    
    // Bugünün tarihini otomatik doldur
    const dateField = document.getElementById('listingDate');
    if (dateField && !dateField.value) {
        const today = new Date().toISOString().split('T')[0];
        dateField.value = today;
    }
    
    console.log('✅ Kullanıcı alanları dolduruldu');
}

// Event listeners kur
function setupEventListeners() {
    // Auth events
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    // Form events
    const newListingForm = document.getElementById('newListingForm');
    if (newListingForm) newListingForm.addEventListener('submit', handleFormSubmit);
    
    // Location events
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');
    
    if (citySelect) citySelect.addEventListener('change', updateDistrictOptions);
    if (districtSelect) districtSelect.addEventListener('change', updateNeighborhoodOptions);
    
    // Image upload event
    const listingImageInput = document.getElementById('listingImage');
    if (listingImageInput) listingImageInput.addEventListener('change', handleImageUpload);
    
    // Phone number formatting
    const phoneField = document.getElementById('advisorPhone');
    if (phoneField) {
        phoneField.addEventListener('input', handlePhoneInput);
        phoneField.addEventListener('blur', validatePhoneNumber);
    }
    
    // Real-time validation
    setupRealTimeValidation();
    
    // Auto-resize textarea
    const descriptionField = document.getElementById('description');
    if (descriptionField) {
        descriptionField.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Ctrl+S to save draft
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            if (newListingForm) {
                newListingForm.dispatchEvent(new Event('submit'));
            }
        }
        
        // Escape to go back
        if (event.key === 'Escape') {
            goHome();
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
            
            // Kullanıcı verilerini yükle
            await loadUserData();
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
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('❌ Logout hatası:', error);
        showNotification('Çıkış yapılırken hata oluştu', 'error');
    }
}

// Form gönderimi
async function handleFormSubmit(event) {
    event.preventDefault();
    console.log('📄 Form gönderiliyor...');
    
    if (!validateForm()) {
        return;
    }
    
    try {
        showNotification('İlan oluşturuluyor...', 'info');
        
        const formData = new FormData(event.target);
        const listingImageInput = document.getElementById('listingImage');
        
        // Kullanıcı bilgilerini güncelle (telefon değişmişse)
        const userData = {
            name: formData.get('advisorName'),
            phone: formData.get('advisorPhone'),
            email: currentUser.email
        };
        
        // Kullanıcı profilini güncelle
        await window.userService.createOrUpdateUserProfile(userData);
        console.log('✅ Kullanıcı profili güncellendi');
        
        // İlan verilerini hazırla
        const listingData = {
            title: formData.get('listingTitle'),
            date: formData.get('listingDate'),
            advisor: formData.get('advisorName'),
            advisorDetails: formData.get('advisorName'),
            advisorPhone: formData.get('advisorPhone'),
            advisorEmail: currentUser.email,
            portfolioType: formData.get('portfolioType'),
            usagePurpose: formData.get('usagePurpose'),
            city: formData.get('city'),
            district: formData.get('district'),
            neighborhood: formData.get('neighborhood'),
            islandParcel: formData.get('islandParcel') || '',
            zoningStatus: formData.get('zoningStatus') || '',
            price: parseInt(formData.get('price')),
            description: formData.get('description') || '',
            createdBy: currentUser.uid,
            createdAt: new Date().toISOString()
        };
        
        // Görsel işleme
        let imageFile = null;
        if (listingImageInput && listingImageInput.files && listingImageInput.files[0]) {
            imageFile = listingImageInput.files[0];
        }
        
        console.log('📄 Oluşturulacak ilan:', listingData);
        console.log('🖼️ Görsel dosyası:', imageFile ? 'Var' : 'Yok');
        
        // İlanı Firestore'a ekle
        const listingId = await window.firestoreService.addListingWithImage(listingData, imageFile);
        
        showNotification('İlan başarıyla oluşturuldu!', 'success');
        
        console.log('✅ İlan başarıyla oluşturuldu, ID:', listingId);
        
        // İlan detay sayfasına yönlendir
        setTimeout(() => {
            window.location.href = `ilan-detay.html?id=${listingId}`;
        }, 1500);
        
    } catch (error) {
        console.error('❌ İlan oluşturma hatası:', error);
        showNotification('İlan oluşturulurken hata oluştu: ' + error.message, 'error');
    }
}

// Form validasyonu
function validateForm() {
    const requiredFields = [
        'listingTitle',
        'listingDate', 
        'advisorName',
        'portfolioType',
        'usagePurpose',
        'city',
        'district',
        'neighborhood',
        'price'
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
    
    // Validate advisor name length
    const nameField = document.getElementById('advisorName');
    if (nameField && nameField.value) {
        if (nameField.value.length < 2 || nameField.value.length > 50) {
            nameField.classList.add('field-error');
            nameField.focus();
            showNotification('Danışman adı 2-50 karakter arasında olmalıdır.', 'error');
            return false;
        }
    }
    
    // Validate phone number
    if (!validatePhoneNumber()) {
        return false;
    }
    
    // Validate price
    const priceField = document.getElementById('price');
    const price = parseInt(priceField ? priceField.value : 0);
    if (isNaN(price) || price <= 0) {
        if (priceField) {
            priceField.classList.add('field-error');
            priceField.focus();
        }
        showNotification('Lütfen geçerli bir fiyat giriniz.', 'error');
        return false;
    }
    
    return true;
}

// Real-time validation
function setupRealTimeValidation() {
    const form = document.getElementById('newListingForm');
    if (!form) return;
    
    const requiredFields = form.querySelectorAll('input[required], select[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            if (this.value.trim()) {
                this.classList.remove('field-error');
                this.classList.add('field-valid');
            } else {
                this.classList.add('field-error');
                this.classList.remove('field-valid');
            }
        });
        
        field.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('field-error');
            }
        });
    });
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
}

// Telefon numarası validasyonu
function validatePhoneNumber() {
    const phoneField = document.getElementById('advisorPhone');
    if (!phoneField || !phoneField.value) return true; // Telefon zorunlu değil
    
    const phone = phoneField.value;
    const isValid = /^90[0-9]{10}$/.test(phone);
    
    if (!isValid && phone.length > 0) {
        phoneField.classList.add('field-error');
        showNotification('Geçersiz telefon formatı. Örnek: 905551234567', 'error');
        return false;
    } else {
        phoneField.classList.remove('field-error');
        phoneField.classList.add('field-valid');
        return true;
    }
}

// Location functions
function updateDistrictOptions() {
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');
    const neighborhoodSelect = document.getElementById('neighborhood');
    
    if (!citySelect || !districtSelect || !neighborhoodSelect) return;
    
    const selectedCity = citySelect.value;
    districtSelect.innerHTML = '<option value="">Seçiniz</option>';
    neighborhoodSelect.innerHTML = '<option value="">Önce ilçe seçiniz</option>';
    
    if (selectedCity && locationData[selectedCity]) {
        Object.keys(locationData[selectedCity]).forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    }
}

function updateNeighborhoodOptions() {
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');
    const neighborhoodSelect = document.getElementById('neighborhood');
    
    if (!citySelect || !districtSelect || !neighborhoodSelect) return;
    
    const selectedCity = citySelect.value;
    const selectedDistrict = districtSelect.value;
    neighborhoodSelect.innerHTML = '<option value="">Seçiniz</option>';
    
    if (selectedCity && selectedDistrict && locationData[selectedCity] && locationData[selectedCity][selectedDistrict]) {
        locationData[selectedCity][selectedDistrict].forEach(neighborhood => {
            const option = document.createElement('option');
            option.value = neighborhood;
            option.textContent = neighborhood;
            neighborhoodSelect.appendChild(option);
        });
    }
}

// Image handling
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Lütfen geçerli bir resim dosyası seçiniz.', 'error');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Resim dosyası 5MB\'dan küçük olmalıdır.', 'error');
        return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImg = document.getElementById('previewImg');
        const imagePreview = document.getElementById('imagePreview');
        
        if (previewImg && imagePreview) {
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
            
            // Add remove button functionality
            const removeBtn = imagePreview.querySelector('.remove-image');
            if (removeBtn) {
                removeBtn.onclick = function() {
                    const input = document.getElementById('listingImage');
                    if (input) input.value = '';
                    imagePreview.style.display = 'none';
                    previewImg.src = '';
                };
            }
        }
    };
    reader.readAsDataURL(file);
}

// UI State Management
function showLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'flex';
    if (errorMessage) errorMessage.style.display = 'none';
    if (formContainer) formContainer.style.display = 'none';
}

function showError(message) {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'flex';
    if (formContainer) formContainer.style.display = 'none';
    
    if (message) {
        const errorText = errorMessage.querySelector('p');
        if (errorText) {
            errorText.textContent = message;
        }
    }
}

function showForm() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
    if (formContainer) formContainer.style.display = 'block';
}

function showLoginRequired() {
    console.log('🔐 Login gerekli, UI gösteriliyor');
    
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'flex';
    if (formContainer) formContainer.style.display = 'none';
    
    // Error mesajını login mesajı olarak güncelle
    const errorText = errorMessage?.querySelector('p');
    if (errorText) {
        errorText.innerHTML = `
            Yeni ilan oluşturmak için giriş yapmanız gerekiyor.<br><br>
            <button onclick="handleLogin()" class="login-required-btn">
                🔑 Google ile Giriş Yap
            </button>
        `;
    }
    
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

console.log('✅ Yeni ilan sayfası modülü başarıyla yüklendi');