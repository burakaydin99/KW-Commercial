// ilan-duzenle.js - Auth sorunları düzeltilmiş versiyon

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
        if (window.authService && window.firestoreService) {
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
            authInitialized = true;
            return;
        }
        
        // Auth state değişikliklerini dinle
        window.authService.onAuthStateChange((user) => {
            console.log('👤 Auth state değişti:', user ? user.email : 'Çıkış yapıldı');
            currentUser = user;
            updateAuthUI(user);
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
                <button onclick="handleLogin()" style="
                    background: #4285f4; 
                    color: white; 
                    border: none; 
                    padding: 10px 20px; 
                    border-radius: 5px; 
                    cursor: pointer;
                    margin-top: 10px;
                ">🔑 Google ile Giriş Yap</button>
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
            goBack();
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

function setupChangeTracking() {
    const editListingForm = document.getElementById('editListingForm');
    if (!editListingForm) return;
    
    const formElements = editListingForm.querySelectorAll('input, select, textarea');
    
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
    console.log('📋 İlan yükleniyor, ID:', listingId);
    
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
        console.log('🔄 Firestore\'dan ilan yükleniyor:', listingId);
        const listing = await window.firestoreService.getListing(listingId);
        
        console.log('📄 Yüklenen ilan:', listing);
        
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

    // Basic info - Flexible field mapping
    setValue('listingTitle', listing.title);
    setValue('listingDate', listing.date);
    setValue('advisorDetails', listing.advisorDetails || listing.advisor); // Try both field names
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
        errorMsg.style.color = '#ff4757';
        errorMsg.style.fontSize = '0.9rem';
        errorMsg.style.marginTop = '5px';
        errorMsg.textContent = 'Orijinal görsel bulunamadı. Lütfen yeni bir görsel yükleyiniz.';
        
        // Varolan error mesajını kaldır
        const existingError = currentImage.querySelector('.image-error');
        if (existingError) {
            existingError.remove();
        }
        
        errorMsg.className = 'image-error';
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
        
        // Güncellenen veri
        const updatedData = {
            title: formData.get('listingTitle'),
            date: formData.get('listingDate'),
            advisorDetails: formData.get('advisorDetails'),
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
        showSavingIndicator('Kaydetme sırasında hata oluştu!', 'error');
    }
}

function validateForm() {
    const requiredFields = [
        'listingTitle',
        'listingDate', 
        'advisorDetails',
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
        showSavingIndicator('Silme sırasında hata oluştu!', 'error');
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
    
    // Apply styles
    indicator.style.position = 'fixed';
    indicator.style.top = '20px';
    indicator.style.right = '20px';
    indicator.style.padding = '15px 25px';
    indicator.style.borderRadius = '25px';
    indicator.style.fontWeight = '500';
    indicator.style.zIndex = '1000';
    indicator.style.opacity = '0';
    indicator.style.transform = 'translateY(-20px)';
    indicator.style.transition = 'all 0.3s ease';
    
    // Set colors based on type
    if (type === 'success') {
        indicator.style.background = '#52c41a';
        indicator.style.color = 'white';
    } else if (type === 'error') {
        indicator.style.background = '#ff4757';
        indicator.style.color = 'white';
    } else {
        indicator.style.background = '#667eea';
        indicator.style.color = 'white';
    }
    
    document.body.appendChild(indicator);
    
    // Show indicator
    setTimeout(() => {
        indicator.style.opacity = '1';
        indicator.style.transform = 'translateY(0)';
    }, 100);
    
    // Hide indicator after delay (except for loading states)
    if (type !== '') {
        setTimeout(() => {
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.remove();
                }
            }, 300);
        }, 3000);
    }
}

function hideSavingIndicator() {
    const indicator = document.querySelector('.saving-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// ================================
// NAVIGATION
// ================================

function goBack() {
    if (hasUnsavedChanges) {
        if (!confirm('Kaydedilmemiş değişiklikleriniz var. Sayfadan ayrılmak istediğinizden emin misiniz?')) {
            return;
        }
    }
    
    // Check if there's history to go back to
    if (document.referrer && document.referrer.includes(window.location.hostname)) {
        window.history.back();
    } else {
        // Fallback to listing detail or main page
        if (currentListing) {
            window.location.href = `ilan-detay.html?id=${currentListing.id}`;
        } else {
            window.location.href = 'index.html';
        }
    }
}

// ================================
// GLOBAL FUNCTIONS (for HTML onclick handlers)
// ================================

// Make functions globally available for HTML onclick handlers
window.goBack = goBack;
window.removeImage = removeImage;
window.handleLogin = handleLogin;

console.log('✅ İlan düzenleme sayfası hazır');