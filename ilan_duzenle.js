// Location data (same as other pages)
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

// Mock listings data (same as script.js)
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
    }
];

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

// Authentication state
let isLoggedIn = false;
let currentUser = null;
let currentListing = null;
let originalData = null;
let hasUnsavedChanges = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Edit page DOM loaded');
    initializeAuth();
    setupEventListeners();
    loadListingForEdit();
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
        console.log('User authenticated for editing');
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
    
    // Reload the page to check permissions again
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

// Event listeners
function setupEventListeners() {
    loginBtn.addEventListener('click', mockLogin);
    logoutBtn.addEventListener('click', logout);
    
    // Form events
    editListingForm.addEventListener('submit', handleFormSubmit);
    deleteBtn.addEventListener('click', handleDelete);
    
    // Location events
    citySelect.addEventListener('change', updateDistrictOptions);
    districtSelect.addEventListener('change', updateNeighborhoodOptions);
    
    // Image upload event
    listingImageInput.addEventListener('change', handleImageUpload);
    
    // Track changes
    setupChangeTracking();
    
    // Warn about unsaved changes
    window.addEventListener('beforeunload', function(e) {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'Kaydedilmemiş değişiklikleriniz var. Sayfadan ayrılmak istediğinizden emin misiniz?';
        }
    });
}

// Change tracking
function setupChangeTracking() {
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

// Get listing ID from URL
function getListingIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id'));
}

// Load listing for editing - NO ownership check
function loadListingForEdit() {
    const listingId = getListingIdFromUrl();
    console.log('Loading listing for edit, ID:', listingId);
    
    if (!listingId) {
        showError('İlan ID\'si bulunamadı.');
        return;
    }

    // Check authentication
    if (!isLoggedIn) {
        showError('İlan düzenlemek için giriş yapmanız gerekiyor.');
        return;
    }

    // Simulate loading delay
    setTimeout(() => {
        const listing = listings.find(l => l.id === listingId);
        console.log('Found listing for edit:', listing);
        
        if (!listing) {
            showError('İlan bulunamadı.');
            return;
        }

        // NO ownership check - any logged in user can edit any listing
        console.log('User can edit this listing');
        currentListing = listing;
        originalData = { ...listing };
        populateForm(listing);
        showEditForm();
    }, 800);
}

// Populate form with listing data
function populateForm(listing) {
    console.log('Populating form with listing data');
    
    // Update page title
    document.title = `Düzenle: ${listing.title} - KW Commercial`;

    // Basic info
    document.getElementById('listingTitle').value = listing.title;
    document.getElementById('listingDate').value = listing.date;
    document.getElementById('advisorDetails').value = listing.advisor;
    document.getElementById('portfolioType').value = listing.portfolioType;
    document.getElementById('usagePurpose').value = listing.usagePurpose;

    // Location info
    document.getElementById('city').value = listing.city;
    updateDistrictOptions();
    
    // Wait for districts to load, then set district and neighborhood
    setTimeout(() => {
        document.getElementById('district').value = listing.district;
        updateNeighborhoodOptions();
        
        setTimeout(() => {
            document.getElementById('neighborhood').value = listing.neighborhood;
        }, 100);
    }, 100);

    document.getElementById('islandParcel').value = listing.islandParcel || '';
    document.getElementById('zoningStatus').value = listing.zoningStatus || '';

    // Price and description
    document.getElementById('price').value = listing.price;
    document.getElementById('description').value = listing.description || '';

    // Show current image if exists
    if (listing.image && listing.image !== "https://via.placeholder.com/250x200/667eea/ffffff?text=Resim+Yok") {
        currentImg.src = listing.image;
        currentImage.style.display = 'block';
    }
}

// Location setup functions
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
            currentImage.style.display = 'none'; // Hide current image when new one is selected
        };
        reader.readAsDataURL(file);
    }
}

// Remove image preview
function removeImage() {
    listingImageInput.value = '';
    imagePreview.style.display = 'none';
    previewImg.src = '';
    
    // Show current image again if it exists
    if (currentListing && currentListing.image && currentListing.image !== "https://via.placeholder.com/250x200/667eea/ffffff?text=Resim+Yok") {
        currentImage.style.display = 'block';
    }
}

// Form submission
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
            // Collect form data
            const formData = new FormData(editListingForm);
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
                image: previewImg.src || currentListing.image
            };
            
            console.log('Updated data:', updatedData);
            
            // Update listing in mock data
            const listingIndex = listings.findIndex(l => l.id === currentListing.id);
            if (listingIndex !== -1) {
                listings[listingIndex] = { 
                    ...listings[listingIndex], 
                    ...updatedData, 
                    updatedAt: new Date().toISOString() 
                };
                console.log('Listing updated successfully');
            }
            
            hasUnsavedChanges = false;
            showSavingIndicator('Değişiklikler kaydedildi!', 'success');
            
            // Redirect to listing detail page after a short delay
            setTimeout(() => {
                window.location.href = `ilan-detay.html?id=${currentListing.id}`;
            }, 1500);
            
        } catch (error) {
            console.error('Error updating listing:', error);
            showSavingIndicator('Kaydetme sırasında hata oluştu!', 'error');
        }
    }, 1000);
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
    
    // Clear previous error styles
    document.querySelectorAll('.field-error').forEach(field => {
        field.classList.remove('field-error');
    });
    
    for (const fieldName of requiredFields) {
        const field = document.getElementById(fieldName);
        if (!field.value.trim()) {
            field.classList.add('field-error');
            alert(`Lütfen ${field.previousElementSibling.textContent} alanını doldurunuz.`);
            field.focus();
            return false;
        }
    }
    
    // Validate price
    const price = parseInt(document.getElementById('price').value);
    if (isNaN(price) || price <= 0) {
        document.getElementById('price').classList.add('field-error');
        alert('Lütfen geçerli bir fiyat giriniz.');
        document.getElementById('price').focus();
        return false;
    }
    
    return true;
}

// Delete listing
function handleDelete() {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
        return;
    }
    
    if (!confirm('Son kez soruyorum: İlanı kalıcı olarak silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    showSavingIndicator('Siliniyor...');
    
    // Simulate delete delay
    setTimeout(() => {
        try {
            // Remove from mock data
            const listingIndex = listings.findIndex(l => l.id === currentListing.id);
            if (listingIndex !== -1) {
                listings.splice(listingIndex, 1);
                console.log('Listing deleted successfully');
            }
            
            showSavingIndicator('İlan silindi!', 'success');
            hasUnsavedChanges = false;
            
            // Redirect to main page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            console.error('Error deleting listing:', error);
            showSavingIndicator('Silme sırasında hata oluştu!', 'error');
        }
    }, 1000);
}

// Show/hide functions
function showError(message) {
    loadingSpinner.style.display = 'none';
    errorMessage.style.display = 'block';
    editContainer.style.display = 'none';
    
    if (message) {
        const errorText = errorMessage.querySelector('p');
        if (errorText) {
            errorText.textContent = message;
        }
    }
}

function showEditForm() {
    console.log('Showing edit form');
    loadingSpinner.style.display = 'none';
    errorMessage.style.display = 'none';
    editContainer.style.display = 'block';
}

// Navigation functions
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

// Saving indicator
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
    
    // Show indicator
    setTimeout(() => {
        indicator.classList.add('show');
    }, 100);
    
    // Hide indicator after delay (except for loading states)
    if (type !== '') {
        setTimeout(() => {
            indicator.classList.remove('show');
            setTimeout(() => {
                indicator.remove();
            }, 300);
        }, 3000);
    }
}

// Auto-resize textarea
document.getElementById('description').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Price formatting
document.getElementById('price').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value) {
        // Don't format while typing to avoid cursor issues
        this.setAttribute('data-formatted', new Intl.NumberFormat('tr-TR').format(parseInt(value)));
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl+S to save
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        if (hasUnsavedChanges) {
            editListingForm.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape to go back
    if (event.key === 'Escape') {
        goBack();
    }
});