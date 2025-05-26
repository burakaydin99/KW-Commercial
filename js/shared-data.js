// shared-data.js - Tüm sayfalar arasında veri paylaşımı için

// ✅ SHARED DATA MANAGEMENT
function getSharedListings() {
    const stored = localStorage.getItem('kw_listings');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.warn('Error parsing stored listings:', e);
        }
    }
    
    // Default data if nothing stored
    const defaultListings = [
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
            islandParcel: "Ada: 789, Parcel: 12",
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
            islandParcel: "Ada: 321, Parcel: 54",
            zoningStatus: "Ticari",
            createdBy: "123456789",
            createdAt: "2024-01-12T16:45:00.000Z"
        },
        {
            id: 5,
            title: "Sanayi Alanında Satılık Fabrika Binası",
            image: "https://media.istockphoto.com/id/1365029556/tr/foto%C4%9Fraf/interior-of-metalworking-factory-workshop-hangar-modern-industrial-enterprise-production.jpg?s=612x612&w=0&k=20&c=Qqe95Tt7QNKmmDPqsFDXsTxp1pkw1FcDIWzqfgiTO3U=",
            advisor: "Mehmet Kaya",
            portfolioType: "MUSTAKİL BİNA",
            usagePurpose: "SANAYİ-İMALAT",
            city: "Bursa",
            district: "Osmangazi",
            neighborhood: "Organize Sanayi Bölgesi",
            price: 8500000,
            date: "2024-01-08",
            description: "Organize sanayi bölgesinde tam donanımlı fabrika binası. 3000 m² kapalı alan, vinç sistemi mevcut, yükleme rampaları.",
            islandParcel: "Ada: 654, Parcel: 87",
            zoningStatus: "Sanayi",
            createdBy: "456789123",
            createdAt: "2024-01-08T11:20:00.000Z"
        },
        {
            id: 6,
            title: "Deniz Manzaralı Otel Projesi",
            image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/db/cb/76/levent-otel-dis-cephesi.jpg?w=900&h=500&s=1",
            advisor: "Ayşe Çelik",
            portfolioType: "MUSTAKİL BİNA",
            usagePurpose: "TURİZM",
            city: "Antalya",
            district: "Muratpaşa",
            neighborhood: "Lara",
            price: 15000000,
            date: "2024-01-05",
            description: "Denize sıfır konumda 4 yıldızlı otel projesi. 50 odalı otel konsepti, havuz ve spa alanı planlaması mevcut.",
            islandParcel: "Ada: 111, Parcel: 22",
            zoningStatus: "Turizm",
            createdBy: "789123456",
            createdAt: "2024-01-05T13:10:00.000Z"
        },
        {
            id: 7,
            title: "Merkezi Konumda Eğitim Kurumu Binası",
            image: "https://www.baskentosb.org/_uploads/2021041908113143.jpg",
            advisor: "Mustafa Özkan",
            portfolioType: "BİNA KATI VEYA BÖLÜMÜ",
            usagePurpose: "EĞİTİM",
            city: "Ankara",
            district: "Çankaya",
            neighborhood: "Kızılay",
            price: 35000,
            date: "2024-01-03",
            description: "Merkezi konumda eğitim kurumu için uygun geniş alan. 500 m² alan, 8 derslik kapasitesi, laboratuvar imkanı.",
            islandParcel: "Ada: 333, Parcel: 44",
            zoningStatus: "Eğitim",
            createdBy: "321654987",
            createdAt: "2024-01-03T08:30:00.000Z"
        },
        {
            id: 8,
            title: "Hastane Yakını Sağlık Merkezi",
            image: "https://saglik.ibb.istanbul/wp-content/uploads/2022/10/ESENYURT-2-705x446.jpg",
            advisor: "Dr. Zeynep Arslan",
            portfolioType: "BİNA KATI VEYA BÖLÜMÜ",
            usagePurpose: "SAĞLIK",
            city: "İzmir",
            district: "Konak",
            neighborhood: "Alsancak",
            price: 28000,
            date: "2024-01-01",
            description: "Hastane ve üniversite yakınında sağlık merkezi için ideal konum. Modern tıbbi cihaz altyapısı mevcut.",
            islandParcel: "Ada: 555, Parcel: 66",
            zoningStatus: "Sağlık",
            createdBy: "654987321",
            createdAt: "2024-01-01T15:45:00.000Z"
        }
    ];
    
    // Save default data to localStorage
    saveSharedListings(defaultListings);
    return defaultListings;
}

function saveSharedListings(listings) {
    try {
        localStorage.setItem('kw_listings', JSON.stringify(listings));
        console.log('✅ Listings saved to localStorage');
    } catch (e) {
        console.error('❌ Error saving listings:', e);
    }
}

// Function to add new listing
function addSharedListing(listingData) {
    const listings = getSharedListings();
    const newListing = {
        id: listings.length > 0 ? Math.max(...listings.map(l => l.id)) + 1 : 1,
        ...listingData,
        createdBy: getCurrentUserId(),
        createdAt: new Date().toISOString(),
        image: listingData.image || "https://via.placeholder.com/250x200/667eea/ffffff?text=Resim+Yok"
    };
    
    listings.unshift(newListing);
    saveSharedListings(listings);
    return newListing;
}

// Function to update existing listing
function updateSharedListing(listingId, updatedData) {
    const listings = getSharedListings();
    const listingIndex = listings.findIndex(l => l.id === listingId);
    
    if (listingIndex !== -1) {
        listings[listingIndex] = { 
            ...listings[listingIndex], 
            ...updatedData, 
            updatedAt: new Date().toISOString() 
        };
        saveSharedListings(listings);
        return listings[listingIndex];
    }
    return null;
}

// Function to delete listing
function deleteSharedListing(listingId) {
    const listings = getSharedListings();
    const listingIndex = listings.findIndex(l => l.id === listingId);
    
    if (listingIndex !== -1) {
        listings.splice(listingIndex, 1);
        saveSharedListings(listings);
        return true;
    }
    return false;
}

// Helper function to get current user ID
function getCurrentUserId() {
    if (sessionStorage.getItem('mockLoggedIn') === 'true') {
        return '123456789'; // Mock user ID
    }
    return 'anonymous';
}