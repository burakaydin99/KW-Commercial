// ilan-duzenle.js - Tamamlanmış versiyon

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
let currentListing = null;
let userProfile = null;
let hasUnsavedChanges = false;
let originalImageUrl = null;
let authInitialized = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 İlan düzenleme sayfası başlatılıyor...');
    
    try {
        // Firebase servislerinin yüklenmesini bekle
        await waitForFirebaseServices();
        console.log('✅ Firebase servisleri hazır');
        
        // Event listener'ları kur (auth'dan önce)
        setupEventListeners();
        
        // Auth state'i kontrol et ve bekle
        await initializeAuth();
        console.log('✅ Auth başlatıldı');
        
        // İlanı yükle
        await loadListingForEdit();
        
    } catch (error) {
        console.error('❌ Sayfa başlatma hatası:', error);
        
        // Eğer auth hatası ise, login formunu göster
        if (error.message.includes('Giriş') || error.message.includes('auth')) {
            showLoginRequired();
        } else {
            showError('Sayfa yüklenirken hata oluştu: ' + error.message);
        }
    }
});

// ================================
// FIREBASE SERVICE WAITING
// ================================

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

// ================================
// AUTHENTICATION FUNCTIONS
// ================================

async function initializeAuth() {
    try {
        console.log('🔐 Auth başlatılıyor...');
        
        // Önce mevcut kullanıcıyı kontrol et
        currentUser = window.authService.getCurrentUser();
        console.log('📋 Mevcut kullanıcı kontrolü:', currentUser ? 'Var' : 'Yok');
        
        if (currentUser) {
            console.log('✅ Kullanıcı zaten giriş yapmış:', currentUser.email);
            updateAuthUI(currentUser);
            await loadUserProfile();
            authInitialized = true;
            return;
        }
        
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
            
            // Eğer kullanıcı giriş yaptıysa ve henüz ilan yüklenmediyse, yükle
            if (user && !currentListing) {
                setTimeout(() => {
                    loadListingForEdit();
                }, 500);
            }
        });
        
        // Auth state'in başlatılmasını bekle
        await new Promise((resolve) => {
            const checkAuth = () => {
                if (authInitialized) {
                    resolve();
                } else {
                    setTimeout(checkAuth, 100);
                }
            };
            checkAuth();
        });
        
        // Hala kullanıcı yoksa login gerekli
        if (!currentUser) {
            throw new Error('Giriş yapmanız gerekiyor');
        }
        
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
        
        // Form alanlarını doldur
        populateUserFields();
        
    } catch (error) {
        console.error('❌ Kullanıcı profili yükleme hatası:', error);
        userProfile = null;
    }
}

// Kullanıcı alanlarını doldur
function populateUserFields() {
    if (!userProfile) return;
    
    const advisorNameField = document.getElementById('advisorName');
    const advisorPhoneField = document.getElementById('advisorPhone');
    const advisorEmailField = document.getElementById('advisorEmail');
    
    if (advisorNameField) advisorNameField.value = userProfile.name || '';
    if (advisorPhoneField) advisorPhoneField.value = userProfile.phone || '';
    if (advisorEmailField) advisorEmailField.value = userProfile.email || '';
}

function updateAuthUI(user) {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    
    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (userName) userName.textContent = user.displayName || user.email;
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
    }
}

async function handleLogin() {
    try {
        showSavingIndicator('Giriş yapılıyor...');
        console.log('🔑 Google ile giriş başlatılıyor...');
        
        const result = await window.authService.signInWithGoogle();
        console.log('✅ Giriş başarılı:', result.user.email);
        
        hideSavingIndicator();
        
        // Login başarılı, sayfayı yenile
        window.location.reload();
        
    } catch (error) {
        console.error('❌ Login hatası:', error);
        hideSavingIndicator();
        alert('Giriş yapılırken hata oluştu: ' + error.message);
    }
}

async function handleLogout() {
    try {
        if (hasUnsavedChanges) {
            if (!confirm('Kaydedilmemiş değişiklikleriniz var. Çıkış yapmak istediğinizden emin misiniz?')) {
                return;
            }
        }
        
        await window.authService.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout hatası:', error);
        alert('Çıkış yapılırken hata oluştu: ' + error.message);
    }
}

// ================================
// LOGIN REQUIRED UI
// ================================

function showLoginRequired() {
    console.log('🔐 Login gerekli, UI gösteriliyor');
    
    hideLoading();
    
    const container = document.getElementById('editContainer');
    const errorDiv = document.getElementById('errorMessage');
    
    if (errorDiv) {
        errorDiv.style.display = 'flex';
        const errorText = errorDiv.querySelector('p');
        if (errorText) {
            errorText.innerHTML = `
                İlan düzenlemek için giriş yapmanız gerekiyor.<br><br>
                <button onclick="handleLogin()" class="login-required-btn">
                    🔑 Google ile Giriş Yap
                </button>
            `;
        }
    }
    
    if (container) container.style.display = 'none';
    
    // Global olarak handleLogin fonksiyonunu erişilebilir yap
    window.handleLogin = handleLogin;
}

// ================================
// EVENT LISTENERS
// ================================

function setupEventListeners() {
    // Auth events
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    // Form events
    const editListingForm = document.getElementById('editListingForm');
    const deleteBtn = document.getElementById('deleteBtn');
    
    if (editListingForm) editListingForm.addEventListener('submit', handleFormSubmit);
    if (deleteBtn) deleteBtn.addEventListener('click', handleDelete);
    
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
    
    // Track changes for unsaved changes warning
    setupChangeTracking();
    
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
        // Ctrl+S to save
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            if (hasUnsavedChanges && editListingForm) {
                editListingForm.dispatchEvent(new Event('submit'));
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
    const phoneField = document.getElementById('advisorPhone');
    if (!phoneField || !phoneField.value) return true;
    
    const phone = phoneField.value;
    const isValid = /^90[0-9]{10}$/.test(phone);
    
    if (!isValid && phone.length > 0) {
        phoneField.classList.add('field-error');
        showTempMessage('Geçersiz telefon formatı. Örnek: 905551234567', 'error');
        return false;
    } else {
        phoneField.classList.remove('field-error');
        phoneField.classList.add('field-updated');
        return true;
    }
}

function setupChangeTracking() {
    const editListingForm = document.getElementById('editListingForm');
    if (!editListingForm) return;
    
    const formElements = editListingForm.querySelectorAll('input:not([readonly]), select, textarea');
    
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

// ================================
// LISTING MANAGEMENT
// ================================

function getListingIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    return id ? id.trim() : null;
}

async function loadListingForEdit() {
    const listingId = getListingIdFromUrl();
    console.log('📋 KW Teknoloji | İlan yükleniyor, ID:', listingId);
    
    if (!listingId) {
        showError('İlan ID\'si bulunamadı.');
        return;
    }

    if (!currentUser) {
        console.log('❌ Kullanıcı giriş yapmamış, login gerekli');
        showLoginRequired();
        return;
    }

    try {
        showLoading();
        
        // Firestore'dan ilan verisini çek
        console.log('📋 KW Teknoloji | ilan yükleniyor:', listingId);
        const listing = await window.firestoreService.getListing(listingId);
        
        console.log('📋 Yüklenen ilan:', listing);
        
        if (!listing) {
            showError('İlan bulunamadı.');
            return;
        }

        // Kullanıcının bu ilanı düzenleme yetkisi var mı kontrol et
        const canEdit = window.authService.canEditListing(listing);
        console.log('🔒 Düzenleme yetkisi:', canEdit);
        
        if (!canEdit) {
            showError('Bu ilanı düzenleme yetkiniz bulunmuyor.');
            return;
        }

        currentListing = listing;
        originalImageUrl = listing.imageUrl || listing.image;
        populateForm(listing);
        showEditForm();
        
    } catch (error) {
        console.error('❌ İlan yükleme hatası:', error);
        showError('İlan yüklenirken hata oluştu: ' + error.message);
    }
}

function populateForm(listing) {
    console.log('📝 Form dolduruluyor:', listing);
    
    // Update page title
    document.title = `Düzenle: ${listing.title} - KW Commercial`;

    // Basic info
    setValue('listingTitle', listing.title);
    setValue('listingDate', listing.date);
    setValue('portfolioType', listing.portfolioType);
    setValue('usagePurpose', listing.usagePurpose);

    // Location info
    setValue('city', listing.city);
    updateDistrictOptions();
    
    // Wait for districts to load, then set district and neighborhood
    setTimeout(() => {
        setValue('district', listing.district);
        updateNeighborhoodOptions();
        
        setTimeout(() => {
            setValue('neighborhood', listing.neighborhood);
        }, 100);
    }, 100);

    setValue('islandParcel', listing.islandParcel || '');
    setValue('zoningStatus', listing.zoningStatus || '');
    setValue('price', listing.price);
    setValue('description', listing.description || '');

    // Handle image - Try both imageUrl and image fields
    const imageUrl = listing.imageUrl || listing.image;
    console.log('🖼️ İlan görseli:', imageUrl);
    
    if (imageUrl && imageUrl.trim() !== '') {
        testImageUrl(imageUrl).then(isWorking => {
            if (isWorking) {
                const currentImg = document.getElementById('currentImg');
                const currentImage = document.getElementById('currentImage');
                if (currentImg && currentImage) {
                    currentImg.src = imageUrl;
                    currentImg.alt = listing.title;
                    currentImage.style.display = 'block';
                    console.log('✅ Mevcut görsel gösterildi');
                }
            } else {
                console.warn('❌ Mevcut görsel URL\'i çalışmıyor:', imageUrl);
                showBrokenImagePlaceholder();
            }
        }).catch(error => {
            console.error('Görsel URL test hatası:', error);
            showBrokenImagePlaceholder();
        });
    } else {
        console.log('ℹ️ Geçerli görsel bulunamadı');
        const currentImage = document.getElementById('currentImage');
        if (currentImage) {
            currentImage.style.display = 'none';
        }
    }
    
    console.log('✅ Form başarıyla dolduruldu');
}

function setValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element && value !== undefined && value !== null) {
        element.value = value;
    }
}

// ================================
// LOCATION FUNCTIONS
// ================================

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

// ================================
// IMAGE HANDLING
// ================================

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Lütfen geçerli bir resim dosyası seçiniz.');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Resim dosyası 5MB\'dan küçük olmalıdır.');
        return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImg = document.getElementById('previewImg');
        const imagePreview = document.getElementById('imagePreview');
        const currentImage = document.getElementById('currentImage');
        
        if (previewImg && imagePreview) {
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
            if (currentImage) currentImage.style.display = 'none';
            hasUnsavedChanges = true;
        }
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    const listingImageInput = document.getElementById('listingImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const currentImage = document.getElementById('currentImage');
    
    if (listingImageInput) listingImageInput.value = '';
    if (imagePreview) imagePreview.style.display = 'none';
    if (previewImg) previewImg.src = '';
    
    // Show current image again if it exists
    if (originalImageUrl && currentImage) {
        currentImage.style.display = 'block';
    }
    
    hasUnsavedChanges = true;
}

function testImageUrl(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
        
        // 5 saniye timeout
        setTimeout(() => resolve(false), 5000);
    });
}

function showBrokenImagePlaceholder() {
    const currentImg = document.getElementById('currentImg');
    const currentImage = document.getElementById('currentImage');
    
    if (currentImg && currentImage) {
        currentImg.src = "https://via.placeholder.com/200x150/f0f0f0/999999?text=Görsel+Bulunamadı";
        currentImg.alt = "Görsel bulunamadı";
        currentImage.style.display = 'block';
        
        // Kullanıcıya bilgi ver
        const errorMsg = document.createElement('p');
        errorMsg.className = 'image-error';
        errorMsg.textContent = 'Orijinal görsel bulunamadı. Lütfen yeni bir görsel yükleyiniz.';
        
        // Varolan error mesajını kaldır
        const existingError = currentImage.querySelector('.image-error');
        if (existingError) {
            existingError.remove();
        }
        
        currentImage.appendChild(errorMsg);
    }
}

// ================================
// FORM SUBMISSION
// ================================

async function handleFormSubmit(event) {
    event.preventDefault();
    console.log('💾 Form gönderiliyor');
    
    if (!validateForm()) {
        return;
    }
    
    try {
        showSavingIndicator('Kaydediliyor...');
        
        const formData = new FormData(event.target);
        const listingImageInput = document.getElementById('listingImage');
        
        // Kullanıcı bilgilerini güncelle
        const userData = {
            name: formData.get('advisorName'),
            phone: formData.get('advisorPhone'),
            email: currentUser.email // Email değişmez
        };
        
        // Kullanıcı profilini güncelle
        await window.userService.createOrUpdateUserProfile(userData);
        console.log('✅ Kullanıcı profili güncellendi');
        
        // İlan verilerini güncelle
        const updatedData = {
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
            description: formData.get('description') || ''
        };
        
        // Görsel işleme
        let imageFile = null;
        if (listingImageInput && listingImageInput.files && listingImageInput.files[0]) {
            imageFile = listingImageInput.files[0];
        }
        
        console.log('📄 Güncellenecek veri:', updatedData);
        console.log('🖼️ Yeni görsel dosyası:', imageFile ? 'Var' : 'Yok');
        
        // Firestore'da güncelle
        await window.firestoreService.updateListing(currentListing.id, updatedData, imageFile);
        
        hasUnsavedChanges = false;
        showSavingIndicator('Değişiklikler kaydedildi!', 'success');
        
        setTimeout(() => {
            window.location.href = `ilan-detay.html?id=${currentListing.id}`;
        }, 1500);
        
    } catch (error) {
        console.error('❌ Güncelleme hatası:', error);
        showSavingIndicator('Kaydetme sırasında hata oluştu: ' + error.message, 'error');
    }
}

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
            alert(`Lütfen ${labelText} alanını doldurunuz.`);
            return false;
        }
    }
    
    // Validate advisor name length
    const nameField = document.getElementById('advisorName');
    if (nameField && nameField.value) {
        if (nameField.value.length < 2 || nameField.value.length > 50) {
            nameField.classList.add('field-error');
            nameField.focus();
            alert('Danışman adı 2-50 karakter arasında olmalıdır.');
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
        alert('Lütfen geçerli bir fiyat giriniz.');
        return false;
    }
    
    return true;
}

// ================================
// DELETE FUNCTIONALITY
// ================================

async function handleDelete() {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
        return;
    }
    
    if (!confirm('Son kez soruyorum: İlanı kalıcı olarak silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        showSavingIndicator('Siliniyor...');
        
        // Yetki kontrolü
        if (!window.authService.canDeleteListing(currentListing)) {
            throw new Error('Bu ilanı silme yetkiniz bulunmuyor');
        }
        
        // Firestore'dan sil
        await window.firestoreService.deleteListing(currentListing.id);
        
        hasUnsavedChanges = false;
        showSavingIndicator('İlan silindi!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Silme hatası:', error);
        showSavingIndicator('Silme sırasında hata oluştu: ' + error.message, 'error');
    }
}

// ================================
// UI FUNCTIONS
// ================================

function showLoading() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    const editContainer = document.getElementById('editContainer');
    
    if (loadingSpinner) loadingSpinner.style.display = 'flex';
    if (errorMessage) errorMessage.style.display = 'none';
    if (editContainer) editContainer.style.display = 'none';
}

function hideLoading() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) loadingSpinner.style.display = 'none';
}

function showError(message) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    const editContainer = document.getElementById('editContainer');
    
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'flex';
    if (editContainer) editContainer.style.display = 'none';
    
    if (message) {
        const errorText = errorMessage.querySelector('p');
        if (errorText) {
            errorText.textContent = message;
        }
    }
}

function showEditForm() {
    console.log('✅ Edit formu gösteriliyor');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    const editContainer = document.getElementById('editContainer');
    
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
    if (editContainer) editContainer.style.display = 'block';
}

function showSavingIndicator(message, type = '') {
    // Remove existing indicator
    const existingIndicator = document.querySelector('.saving-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Create new indicator
    const indicator = document.createElement('div');
    indicator.className = `saving-indicator ${type}`;
    indicator.textContent = message;
    
    document.body.appendChild(indicator);
    
    // Animate in
    setTimeout(() => {
        indicator.style.opacity = '1';
        indicator.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto hide after delay (except for errors)
    if (type !== 'error') {
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.style.opacity = '0';
                indicator.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.remove();
                    }
                }, 300);
            }
        }, type === 'success' ? 2000 : 3000);
    }
}// Animate in
    setTimeout(() => {
        indicator.style.opacity = '1';
        indicator.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto hide after delay (except for errors)
    if (type !== 'error') {
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.style.opacity = '0';
                indicator.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.remove();
                    }
                }, 300);
            }
        }, type === 'success' ? 2000 : 3000);
    }


function hideSavingIndicator() {
    const indicator = document.querySelector('.saving-indicator');
    if (indicator) {
        indicator.style.opacity = '0';
        indicator.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
            }
        }, 300);
    }
}

function showTempMessage(message, type = 'info') {
    // Remove existing temp messages
    const existingMessages = document.querySelectorAll('.temp-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const msgElement = document.createElement('div');
    msgElement.className = `temp-message ${type}`;
    msgElement.textContent = message;
    
    document.body.appendChild(msgElement);
    
    // Animate in
    setTimeout(() => {
        msgElement.style.opacity = '1';
    }, 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (msgElement.parentNode) {
            msgElement.style.opacity = '0';
            setTimeout(() => {
                if (msgElement.parentNode) {
                    msgElement.remove();
                }
            }, 300);
        }
    }, 3000);
}

// ================================
// UTILITY FUNCTIONS
// ================================

function goHome() {
    if (hasUnsavedChanges) {
        if (!confirm('Kaydedilmemiş değişiklikleriniz var. Ana sayfaya dönmek istediğinizden emin misiniz?')) {
            return;
        }
    }
    window.location.href = 'index.html';
}

function formatPrice(price) {
    if (!price || isNaN(price)) return '0';
    return new Intl.NumberFormat('tr-TR').format(price);
}

function formatPhoneNumber(phone) {
    if (!phone) return '';
    
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as +90 (5XX) XXX XX XX
    if (cleaned.length === 12 && cleaned.startsWith('90')) {
        const areaCode = cleaned.substring(2, 5);
        const first = cleaned.substring(5, 8);
        const second = cleaned.substring(8, 10);
        const third = cleaned.substring(10, 12);
        return `+90 (${areaCode}) ${first} ${second} ${third}`;
    }
    
    return phone; // Return original if format doesn't match
}

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

// ================================
// KEYBOARD SHORTCUTS INFO
// ================================

function showKeyboardShortcuts() {
    const shortcuts = [
        'Ctrl + S: Kaydet',
        'Esc: Ana sayfaya dön',
        'Tab: Sonraki alan',
        'Shift + Tab: Önceki alan'
    ];
    
    const shortcutInfo = shortcuts.join('\n');
    alert('Klavye Kısayolları:\n\n' + shortcutInfo);
}

// ================================
// GLOBAL FUNCTIONS (for HTML onclick events)
// ================================

// Global olarak erişilebilir fonksiyonlar
window.goHome = goHome;
window.removeImage = removeImage;
window.showKeyboardShortcuts = showKeyboardShortcuts;

// ================================
// ERROR HANDLING
// ================================

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global JavaScript hatası:', event.error);
    showTempMessage('Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.', 'error');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('İşlenmeyen Promise hatası:', event.reason);
    showTempMessage('Bir işlem tamamlanamadı. Lütfen tekrar deneyin.', 'error');
});

// ================================
// PERFORMANCE OPTIMIZATION
// ================================

// Debounced input handlers for better performance
const debouncedPhoneInput = debounce(handlePhoneInput, 300);
const debouncedValidatePhone = debounce(validatePhoneNumber, 500);

// ================================
// BROWSER COMPATIBILITY
// ================================

// Check for required browser features
function checkBrowserCompatibility() {
    const requiredFeatures = [
        'fetch',
        'Promise',
        'localStorage',
        'addEventListener'
    ];
    
    const unsupportedFeatures = requiredFeatures.filter(feature => 
        typeof window[feature] === 'undefined'
    );
    
    if (unsupportedFeatures.length > 0) {
        alert(`Tarayıcınız bu uygulamayı tam olarak desteklemiyor. 
               Eksik özellikler: ${unsupportedFeatures.join(', ')}
               Lütfen tarayıcınızı güncelleyin.`);
        return false;
    }
    
    return true;
}

// ================================
// INITIALIZATION CHECK
// ================================

// Check browser compatibility on load
if (!checkBrowserCompatibility()) {
    console.error('❌ Tarayıcı uyumluluğu sorunu');
}

console.log('✅ İlan düzenleme modülü başarıyla yüklendi');