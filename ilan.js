// Location data (same as main page)
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

// Form elements
const listingDateInput = document.getElementById('listingDate');
const citySelect = document.getElementById('city');
const districtSelect = document.getElementById('district');
const neighborhoodSelect = document.getElementById('neighborhood');
const listingImageInput = document.getElementById('listingImage');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');

// Authentication state - using session storage
let isLoggedIn = false;
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    setupEventListeners();
    setupLocationSelects();
    setCurrentDate();
});

// Authentication functions
function initializeAuth() {
    // Check if user is already logged in using sessionStorage
    if (sessionStorage.getItem('mockLoggedIn') === 'true') {
        currentUser = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            id: '123456789'
        };
        isLoggedIn = true;
        showUserInfo();
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
    // Simulate Google login
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
}

function logout() {
    currentUser = null;
    isLoggedIn = false;
    sessionStorage.removeItem('mockLoggedIn');
    hideUserInfo();
    alert('Çıkış yapıldı!');
}

// Event listeners
function setupEventListeners() {
    // Auth events
    loginBtn.addEventListener('click', mockLogin);
    logoutBtn.addEventListener('click', logout);
    
    // Form events
    addListingForm.addEventListener('submit', handleFormSubmit);
    
    // Location events
    citySelect.addEventListener('change', updateDistrictOptions);
    districtSelect.addEventListener('change', updateNeighborhoodOptions);
    
    // Image upload event
    listingImageInput.addEventListener('change', handleImageUpload);
}

// Location setup
function setupLocationSelects() {
    // City select is already populated in HTML
    updateDistrictOptions();
}

function updateDistrictOptions() {
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

// Set current date as default
function setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    listingDateInput.value = today;
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
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Remove image preview
function removeImage() {
    listingImageInput.value = '';
    imagePreview.style.display = 'none';
    previewImg.src = '';
}

// Form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Check if user is logged in
    if (!isLoggedIn) {
        alert('İlan eklemek için giriş yapmanız gerekiyor.');
        return;
    }
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Collect form data
    const formData = new FormData(addListingForm);
    const listingData = {
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
        image: previewImg.src || null
    };
    
    // Save listing
    saveListing(listingData);
}

// Form validation
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
    
    for (const fieldName of requiredFields) {
        const field = document.getElementById(fieldName);
        if (!field.value.trim()) {
            alert(`Lütfen ${field.previousElementSibling.textContent} alanını doldurunuz.`);
            field.focus();
            return false;
        }
    }
    
    // Validate price
    const price = parseInt(document.getElementById('price').value);
    if (isNaN(price) || price <= 0) {
        alert('Lütfen geçerli bir fiyat giriniz.');
        document.getElementById('price').focus();
        return false;
    }
    
    return true;
}

// Save listing (using in-memory storage for demo)
function saveListing(listingData) {
    try {
        // Show success message
        alert('İlan başarıyla eklendi! (Demo modunda)');
        
        // Log the data for demo purposes
        console.log('New listing data:', listingData);
        
        // Reset form
        resetForm();
        
        // Redirect to main page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('Error saving listing:', error);
        alert('İlan kaydedilirken bir hata oluştu. Lütfen tekrar deneyiniz.');
    }
}

// Reset form
function resetForm() {
    addListingForm.reset();
    imagePreview.style.display = 'none';
    previewImg.src = '';
    districtSelect.innerHTML = '<option value="">Önce il seçiniz</option>';
    neighborhoodSelect.innerHTML = '<option value="">Önce ilçe seçiniz</option>';
    setCurrentDate();
}

// Price formatting (add thousand separators as user types)
document.getElementById('price').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value) {
        // Add thousand separators for display (but keep actual value as number)
        const formatted = new Intl.NumberFormat('tr-TR').format(parseInt(value));
        // Don't update the input value to avoid cursor jumping
    }
});

// Auto-resize textarea
document.getElementById('description').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

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