// add-listing.js - Yeni ilan ekleme sayfası için (Güncellenmiş)

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
const addListingForm = document.getElementById('addListingForm');
const advisorNameInput = document.getElementById('advisorName');

// Form elements
const listingDateInput = document.getElementById('listingDate');
const citySelect = document.getElementById('city');
const districtSelect = document.getElementById('district');
const neighborhoodSelect = document.getElementById('neighborhood');
const listingImageInput = document.getElementById('listingImage');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');

// Authentication state
let isLoggedIn = false;
let currentUser = null;
let advisorData = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Add listing page loaded');
    
    // Firebase servislerinin yüklenmesini bekle
    await waitForFirebaseServices();
    
    // Auth state'i kontrol et
    await initializeAuth();
    
    setupEventListeners();
    setupLocationSelects();
    setCurrentDate();
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

// Authentication functions
async function initializeAuth() {
    try {
        // Auth state'i dinle
        window.authService.onAuthStateChange(async (user) => {
            currentUser = user;
            isLoggedIn = !!user;
            
            if (user) {
                showUserInfo(user);
                await loadAdvisorData(user.email);
                console.log('User logged in for adding listing:', user.email);
            } else {
                hideUserInfo();
                showLoginRequired();
                console.log('User not logged in for adding listing');
            }
        });
        
        // Mevcut kullanıcıyı kontrol et
        currentUser = window.authService.getCurrentUser();
        if (currentUser) {
            isLoggedIn = true;
            showUserInfo(currentUser);
            await loadAdvisorData(currentUser.email);
        } else {
            showLoginRequired();
        }
        
    } catch (error) {
        console.error('Auth initialization error:', error);
        showLoginRequired();
    }
}

// Danışman bilgilerini Google Sheet'ten yükle
async function loadAdvisorData(email) {
    try {
        console.log('🔄 Danışman bilgileri yükleniyor:', email);
        const memberData = await window.authService.getMemberData(email);
        
        if (memberData) {
            advisorData = {
                name: memberData.name || memberData.email,
                phone: memberData.phone || '',
                email: memberData.email || email
            };
            
            // Danışman adını form alanına doldur
            if (advisorNameInput) {
                advisorNameInput.value = advisorData.name;
            }
            
            console.log('✅ Danışman bilgileri yüklendi:', advisorData);
        } else {
            console.log('❌ Danışman bilgileri bulunamadı');
            if (advisorNameInput) {
                advisorNameInput.value = 'Bilinmeyen Danışman';
            }
        }
    } catch (error) {
        console.error('❌ Danışman bilgileri yükleme hatası:', error);
        if (advisorNameInput) {
            advisorNameInput.value = 'Yükleme hatası';
        }
    }
}

function showUserInfo(user) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (userInfo) userInfo.style.display = 'flex';
    if (userName) userName.textContent = user.displayName || user.email;
}

function hideUserInfo() {
    if (loginBtn) loginBtn.style.display = 'block';
    if (userInfo) userInfo.style.display = 'none';
}

function showLoginRequired() {
    if (addListingForm) {
        addListingForm.style.display = 'none';
    }
    
    // Login gerekli mesajı göster
    const container = document.querySelector('.form-container');
    if (container) {
        const existingMessage = container.querySelector('.login-required-message');
        if (!existingMessage) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'login-required-message';
            messageDiv.style.cssText = `
                text-align: center;
                padding: 40px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                margin-top: 20px;
            `;
            messageDiv.innerHTML = `
                <h3 style="color: #667eea; margin-bottom: 15px;">Giriş Gerekli</h3>
                <p style="color: #666; margin-bottom: 20px;">İlan eklemek için önce giriş yapmanız gerekiyor.</p>
                <button onclick="handleLogin()" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                ">🔑 Google ile Giriş Yap</button>
            `;
            container.appendChild(messageDiv);
        }
    }
}

async function handleLogin() {
    try {
        const result = await window.authService.signInWithGoogle();
        if (result.user) {
            console.log('✅ Login successful');
            // Sayfa yeniden yüklenecek ve kullanıcı bilgileri otomatik gelecek
            window.location.reload();
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        alert('Giriş yapılırken hata oluştu: ' + error.message);
    }
}

async function handleLogout() {
    try {
        await window.authService.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Çıkış yapılırken hata oluştu: ' + error.message);
    }
}

// Event listeners
function setupEventListeners() {
    // Auth events
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    // Form events
    if (addListingForm) addListingForm.addEventListener('submit', handleFormSubmit);
    
    // Location events
    if (citySelect) citySelect.addEventListener('change', updateDistrictOptions);
    if (districtSelect) districtSelect.addEventListener('change', updateNeighborhoodOptions);
    
    // Image upload event
    if (listingImageInput) listingImageInput.addEventListener('change', handleImageUpload);
}

// Location setup
function setupLocationSelects() {
    updateDistrictOptions();
}

function updateDistrictOptions() {
    const selectedCity = citySelect ? citySelect.value : '';
    if (districtSelect) {
        districtSelect.innerHTML = '<option value="">Seçiniz</option>';
    }
    if (neighborhoodSelect) {
        neighborhoodSelect.innerHTML = '<option value="">Önce ilçe seçiniz</option>';
    }
    
    if (selectedCity && locationData[selectedCity]) {
        Object.keys(locationData[selectedCity]).forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            if (districtSelect) districtSelect.appendChild(option);
        });
    }
}

function updateNeighborhoodOptions() {
    const selectedCity = citySelect ? citySelect.value : '';
    const selectedDistrict = districtSelect ? districtSelect.value : '';
    if (neighborhoodSelect) {
        neighborhoodSelect.innerHTML = '<option value="">Seçiniz</option>';
    }
    
    if (selectedCity && selectedDistrict && locationData[selectedCity] && locationData[selectedCity][selectedDistrict]) {
        locationData[selectedCity][selectedDistrict].forEach(neighborhood => {
            const option = document.createElement('option');
            option.value = neighborhood;
            option.textContent = neighborhood;
            if (neighborhoodSelect) neighborhoodSelect.appendChild(option);
        });
    }
}

// Set current date as default
function setCurrentDate() {
    if (listingDateInput) {
        const today = new Date().toISOString().split('T')[0];
        listingDateInput.value = today;
    }
}

// Image upload handling
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
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
            if (previewImg && imagePreview) {
                previewImg.src = e.target.result;
                imagePreview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
}

// Remove image preview
function removeImage() {
    if (listingImageInput) listingImageInput.value = '';
    if (imagePreview) imagePreview.style.display = 'none';
    if (previewImg) previewImg.src = '';
}

// Form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    console.log('New listing form submitted');
    
    // Check if user is logged in
    if (!isLoggedIn) {
        alert('İlan eklemek için giriş yapmanız gerekiyor.');
        return;
    }
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    try {
        // Show saving indicator
        const submitBtn = event.target.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.textContent = 'Kaydediliyor...';
            submitBtn.disabled = true;
        }
        
        // Collect form data
        const formData = new FormData(addListingForm);
        const listingData = {
            title: formData.get('listingTitle'),
            date: formData.get('listingDate'),
            advisor: advisorData ? advisorData.name : 'Bilinmeyen Danışman',
            advisorDetails: advisorData ? advisorData.name : 'Bilinmeyen Danışman',
            advisorPhone: advisorData ? advisorData.phone : '',
            advisorEmail: advisorData ? advisorData.email : '',
            portfolioType: formData.get('portfolioType'),
            usagePurpose: formData.get('usagePurpose'),
            city: formData.get('city'),
            district: formData.get('district'),
            neighborhood: formData.get('neighborhood'),
            islandParcel: formData.get('islandParcel') || '',
            zoningStatus: formData.get('zoningStatus') || '',
            price: parseInt(formData.get('price')),
            description: formData.get('description') || '',
            createdBy: currentUser.uid
        };
        
        console.log('New listing data:', listingData);
        
        // Handle image if present
        const imageFile = listingImageInput && listingImageInput.files ? listingImageInput.files[0] : null;
        
        // Save to Firestore
        const listingId = await window.firestoreService.addListing(listingData);
        
        // Upload image if present
        if (imageFile && window.storageService) {
            try {
                const uploadResult = await window.storageService.uploadImage(imageFile, 'listings');
                await window.firestoreService.updateListing(listingId, { 
                    imageUrl: uploadResult.url,
                    image: uploadResult.url 
                });
            } catch (imageError) {
                console.warn('Image upload failed:', imageError);
                // İlan kaydedildi ama görsel yüklenemedi
            }
        }
        
        // Show success message
        alert('İlan başarıyla eklendi!');
        
        // Reset form
        resetForm();
        
        // Redirect to main page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('Error saving listing:', error);
        alert('İlan kaydedilirken bir hata oluştu: ' + error.message);
        
        // Reset submit button
        const submitBtn = event.target.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.textContent = 'İlanı Kaydet';
            submitBtn.disabled = false;
        }
    }
}

// Form validation
function validateForm() {
    const requiredFields = [
        'listingTitle',
        'listingDate',
        'portfolioType',
        'usagePurpose',
        'city',
        'district',
        'neighborhood',
        'price'
    ];
    
    for (const fieldName of requiredFields) {
        const field = document.getElementById(fieldName);
        if (!field || !field.value.trim()) {
            const label = field ? field.previousElementSibling : null;
            const labelText = label ? label.textContent : fieldName;
            alert(`Lütfen ${labelText} alanını doldurunuz.`);
            if (field) field.focus();
            return false;
        }
    }
    
    // Validate price
    const priceField = document.getElementById('price');
    const price = parseInt(priceField ? priceField.value : 0);
    if (isNaN(price) || price <= 0) {
        alert('Lütfen geçerli bir fiyat giriniz.');
        if (priceField) priceField.focus();
        return false;
    }
    
    return true;
}

// Reset form
function resetForm() {
    if (addListingForm) addListingForm.reset();
    if (imagePreview) imagePreview.style.display = 'none';
    if (previewImg) previewImg.src = '';
    if (districtSelect) districtSelect.innerHTML = '<option value="">Önce il seçiniz</option>';
    if (neighborhoodSelect) neighborhoodSelect.innerHTML = '<option value="">Önce ilçe seçiniz</option>';
    setCurrentDate();
    
    // Danışman adını tekrar doldur
    if (advisorData && advisorNameInput) {
        advisorNameInput.value = advisorData.name;
    }
}

// Navigation
function goHome() {
    window.location.href = 'index.html';
}

// Price formatting
const priceField = document.getElementById('price');
if (priceField) {
    priceField.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value) {
            const formatted = new Intl.NumberFormat('tr-TR').format(parseInt(value));
            // Don't update the input value to avoid cursor jumping
        }
    });
}

// Auto-resize textarea
const descriptionField = document.getElementById('description');
if (descriptionField) {
    descriptionField.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

// Form validation feedback
document.querySelectorAll('input[required], select[required]').forEach(field => {
    field.addEventListener('blur', function() {
        if (!this.value.trim()) {
            this.style.borderColor = '#ff4757';
        } else {
            this.style.borderColor = '#e1e5e9';
        }
    });
    
    field.addEventListener('input', function() {
        if (this.value.trim()) {
            this.style.borderColor = '#52c41a';
        }
    });
});

// Global functions
window.removeImage = removeImage;
window.handleLogin = handleLogin;
window.goHome = goHome;