// ilan-duzenle.js - İlan düzenleme sayfası için temiz versiyon

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
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const editContainer = document.getElementById('editContainer');
const editListingForm = document.getElementById('editListingForm');
const deleteBtn = document.getElementById('deleteBtn');

// Form elements
const listingImageInput = document.getElementById('listingImage');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const currentImage = document.getElementById('currentImage');
const currentImg = document.getElementById('currentImg');
const citySelect = document.getElementById('city');
const districtSelect = document.getElementById('district');
const neighborhoodSelect = document.getElementById('neighborhood');

// State variables
let isLoggedIn = false;
let currentUser = null;
let currentListing = null;
let hasUnsavedChanges = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Edit page loaded');
    initializeAuth();
    setupEventListeners();
    loadListingForEdit();
});

// ================================
// AUTHENTICATION FUNCTIONS
// ================================

function initializeAuth() {
    if (sessionStorage.getItem('mockLoggedIn') === 'true') {
        currentUser = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            id: '123456789'
        };
        isLoggedIn = true;
        showUserInfo();
        console.log('User authenticated for editing');
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
    window.location.reload();
}

function logout() {
    currentUser = null;
    isLoggedIn = false;
    sessionStorage.removeItem('mockLoggedIn');
    hideUserInfo();
    alert('Çıkış yapıldı!');
    window.location.href = 'index.html';
}

// ================================
// EVENT LISTENERS
// ================================

function setupEventListeners() {
    // Auth events
    if (loginBtn) loginBtn.addEventListener('click', mockLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    // Form events
    if (editListingForm) editListingForm.addEventListener('submit', handleFormSubmit);
    if (deleteBtn) deleteBtn.addEventListener('click', handleDelete);
    
    // Location events
    if (citySelect) citySelect.addEventListener('change', updateDistrictOptions);
    if (districtSelect) districtSelect.addEventListener('change', updateNeighborhoodOptions);
    
    // Image upload event
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
    return parseInt(urlParams.get('id'));
}

function loadListingForEdit() {
    const listingId = getListingIdFromUrl();
    console.log('Loading listing for edit, ID:', listingId);
    
    if (!listingId) {
        showError('İlan ID\'si bulunamadı.');
        return;
    }

    if (!isLoggedIn) {
        showError('İlan düzenlemek için giriş yapmanız gerekiyor.');
        return;
    }

    // Simulate loading delay
    setTimeout(() => {
        // Get fresh data from shared storage
        const listings = getSharedListings();
        const listing = listings.find(l => l.id === listingId);
        console.log('Found listing for edit:', listing);
        
        if (!listing) {
            showError('İlan bulunamadı.');
            return;
        }

        currentListing = listing;
        populateForm(listing);
        showEditForm();
    }, 800);
}


// ilan-duzenle.js içindeki populateForm fonksiyonunu güncelleyin

function populateForm(listing) {
    console.log('Populating form with listing data:', listing);
    
    // Update page title
    document.title = `Düzenle: ${listing.title} - KW Commercial`;

    // Basic info
    setValue('listingTitle', listing.title);
    setValue('listingDate', listing.date);
    setValue('advisorDetails', listing.advisor);
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

    // ✅ Görsel işleme - Daha dikkatli
    console.log('Current listing image:', listing.image);
    
    if (listing.image && listing.image.trim() !== '' && listing.image !== "https://via.placeholder.com/250x200/667eea/ffffff?text=Resim+Yok") {
        // Test if image URL is still working
        testImageUrl(listing.image).then(isWorking => {
            if (isWorking) {
                // Görsel çalışıyor, göster
                if (currentImg && currentImage) {
                    currentImg.src = listing.image;
                    currentImg.alt = listing.title;
                    currentImage.style.display = 'block';
                    console.log('✅ Current image displayed successfully');
                }
            } else {
                // Görsel çalışmıyor, placeholder göster
                console.warn('❌ Current image URL is broken:', listing.image);
                showBrokenImagePlaceholder();
            }
        }).catch(error => {
            console.error('Error testing image URL:', error);
            showBrokenImagePlaceholder();
        });
    } else {
        console.log('No valid image found');
        if (currentImage) {
            currentImage.style.display = 'none';
        }
    }
}

// ✅ Görsel URL'inin çalışıp çalışmadığını test etme fonksiyonu
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

// ✅ Bozuk görsel için placeholder göster
function showBrokenImagePlaceholder() {
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
        if (previewImg) {
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
            if (currentImage) currentImage.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    if (listingImageInput) listingImageInput.value = '';
    if (imagePreview) imagePreview.style.display = 'none';
    if (previewImg) previewImg.src = '';
    
    // Show current image again if it exists
    if (currentListing && currentListing.image && 
        currentListing.image !== "https://via.placeholder.com/250x200/667eea/ffffff?text=Resim+Yok" &&
        currentImage) {
        currentImage.style.display = 'block';
    }
}

// ================================
// FORM SUBMISSION
// ================================


// ✅ Form submission'da görsel kontrolü
function handleFormSubmit(event) {
    event.preventDefault();
    console.log('Form submitted');
    
    if (!validateForm()) {
        return;
    }
    
    showSavingIndicator('Kaydediliyor...');
    
    // Simulate save delay
    setTimeout(() => {
        try {
            const formData = new FormData(editListingForm);
            
            // ✅ Görsel belirleme - Öncelik sırası
            let finalImage = currentListing.image; // Varsayılan: mevcut görsel
            
            if (previewImg && previewImg.src && previewImg.src.startsWith('data:')) {
                // Yeni görsel yüklenmişse onu kullan
                finalImage = previewImg.src;
                console.log('✅ Using new uploaded image');
            } else if (currentImg && currentImg.src && !currentImg.src.includes('placeholder') && !currentImg.src.includes('Görsel+Bulunamadı')) {
                // Mevcut görsel varsa ve placeholder değilse onu kullan
                finalImage = currentImg.src;
                console.log('✅ Using existing image');
            } else {
                // Hiçbiri yoksa placeholder
                finalImage = "https://via.placeholder.com/250x200/667eea/ffffff?text=Resim+Yok";
                console.log('⚠️ Using placeholder image');
            }
            
            const updatedData = {
                title: formData.get('listingTitle'),
                date: formData.get('listingDate'),
                advisor: formData.get('advisorDetails'),
                portfolioType: formData.get('portfolioType'),
                usagePurpose: formData.get('usagePurpose'),
                city: formData.get('city'),
                district: formData.get('district'),
                neighborhood: formData.get('neighborhood'),
                islandParcel: formData.get('islandParcel') || '',
                zoningStatus: formData.get('zoningStatus') || '',
                price: parseInt(formData.get('price')),
                description: formData.get('description') || '',
                image: finalImage
            };
            
            console.log('Updated data with image:', updatedData.image.substring(0, 50) + '...');
            
            // Update using shared storage
            const success = updateSharedListing(currentListing.id, updatedData);
            
            if (success) {
                hasUnsavedChanges = false;
                showSavingIndicator('Değişiklikler kaydedildi!', 'success');
                
                setTimeout(() => {
                    window.location.href = `ilan-detay.html?id=${currentListing.id}`;
                }, 1500);
            } else {
                throw new Error('Update failed');
            }
            
        } catch (error) {
            console.error('Error updating listing:', error);
            showSavingIndicator('Kaydetme sırasında hata oluştu!', 'error');
        }
    }, 1000);
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

function handleDelete() {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
        return;
    }
    
    if (!confirm('Son kez soruyorum: İlanı kalıcı olarak silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    showSavingIndicator('Siliniyor...');
    
    setTimeout(() => {
        try {
            const success = deleteSharedListing(currentListing.id);
            
            if (success) {
                showSavingIndicator('İlan silindi!', 'success');
                hasUnsavedChanges = false;
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                throw new Error('Delete failed');
            }
            
        } catch (error) {
            console.error('Error deleting listing:', error);
            showSavingIndicator('Silme sırasında hata oluştu!', 'error');
        }
    }, 1000);
}

// ================================
// UI FUNCTIONS
// ================================

function showError(message) {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'block';
    if (editContainer) editContainer.style.display = 'none';
    
    if (message) {
        const errorText = errorMessage.querySelector('p');
        if (errorText) {
            errorText.textContent = message;
        }
    }
}

function showEditForm() {
    console.log('Showing edit form');
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
// GLOBAL FUNCTIONS (for onclick handlers in HTML)
// ================================

// Make functions globally available for HTML onclick handlers
window.goBack = goBack;
window.removeImage = removeImage;