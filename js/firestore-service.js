// js/firestore-service.js - Düzeltilmiş Firestore database servisi
import { db, storage } from './firebase-config.js';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  where
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

import { auth } from './firebase-config.js';

class FirestoreService {
  constructor() {
    this.listingsCollection = 'listings';
    this.listeners = [];
  }

  // İlanları real-time dinle
  subscribeToListings(callback) {
    const q = query(
      collection(db, this.listingsCollection),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listings = [];
      snapshot.forEach((doc) => {
        listings.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(listings);
    });
    
    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  // Tüm ilanları al
  async getAllListings() {
    try {
      const q = query(
        collection(db, this.listingsCollection),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const listings = [];
      
      querySnapshot.forEach((doc) => {
        listings.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return listings;
    } catch (error) {
      console.error('Error getting listings:', error);
      return [];
    }
  }

  // İlan ekle
  async addListing(listingData) {
    try {
      const docRef = await addDoc(collection(db, this.listingsCollection), {
        ...listingData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('Listing added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding listing:', error);
      throw error;
    }
  }

  // İlan getirme
  async getListing(listingId) {
    try {
      const docRef = doc(db, this.listingsCollection, listingId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        console.log('İlan bulunamadı:', listingId);
        return null;
      }
    } catch (error) {
      console.error('İlan getirme hatası:', error);
      throw error;
    }
  }

 // İlan güncelleme
  async updateListing(listingId, updatedData, imageFile = null) {
    try {
      const docRef = doc(db, this.listingsCollection, listingId);
      
      // Önce mevcut veriyi al
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('İlan bulunamadı');
      }
      
      const currentData = docSnap.data();
      
      // Yeni görsel varsa yükle
      let imageUrl = currentData.imageUrl || currentData.image; // Mevcut görsel URL'ini koru
      
      if (imageFile) {
        console.log('Yeni görsel yükleniyor...');
        
        try {
          // Eski görseli sil (eğer firebase storage'da ise)
          if (imageUrl && imageUrl.includes('firebase')) {
            try {
              const oldImageRef = ref(storage, imageUrl);
              await deleteObject(oldImageRef);
              console.log('Eski görsel silindi');
            } catch (error) {
              console.warn('Eski görsel silinemedi:', error);
            }
          }
          
          // Yeni görseli yükle
          const timestamp = Date.now();
          const fileName = `listings/${listingId}_${timestamp}_${imageFile.name}`;
          const storageRef = ref(storage, fileName);
          
          const uploadResult = await uploadBytes(storageRef, imageFile);
          imageUrl = await getDownloadURL(uploadResult.ref);
          
          console.log('Yeni görsel yüklendi:', imageUrl);
        } catch (storageError) {
          console.error('Görsel yükleme hatası:', storageError);
          // Görsel yüklenemese bile diğer verileri güncelle
        }
      }
      
      // Field mapping - HTML form field'larını Firestore field'larına çevir
      const mappedData = {
        title: updatedData.title,
        date: updatedData.date,
        advisor: updatedData.advisorDetails, // HTML'de advisorDetails -> DB'de advisor
        advisorDetails: updatedData.advisorDetails,
        portfolioType: updatedData.portfolioType,
        usagePurpose: updatedData.usagePurpose,
        city: updatedData.city,
        district: updatedData.district,
        neighborhood: updatedData.neighborhood,
        islandParcel: updatedData.islandParcel || '',
        zoningStatus: updatedData.zoningStatus || '',
        price: updatedData.price,
        description: updatedData.description || '',
        imageUrl: imageUrl,
        image: imageUrl, // Backward compatibility
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.uid
      };
      
      // Firestore'da güncelle
      await updateDoc(docRef, mappedData);
      
      console.log('İlan başarıyla güncellendi:', listingId);
      return true;
      
    } catch (error) {
      console.error('İlan güncelleme hatası:', error);
      throw error;
    }
  }

  // İlan silme
  async deleteListing(listingId) {
    try {
      const docRef = doc(db, this.listingsCollection, listingId);
      
      // Önce mevcut veriyi al (görsel silmek için)
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Görseli sil (eğer firebase storage'da ise)
        const imageUrl = data.imageUrl || data.image;
        if (imageUrl && imageUrl.includes('firebase')) {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
            console.log('İlan görseli silindi');
          } catch (error) {
            console.warn('Görsel silinemedi:', error);
          }
        }
      }
      
      // Dökümanı sil
      await deleteDoc(docRef);
      
      console.log('İlan başarıyla silindi:', listingId);
      return true;
      
    } catch (error) {
      console.error('İlan silme hatası:', error);
      throw error;
    }
  }

  // Kullanıcının ilanlarını al
  async getUserListings(userId) {
    try {
      const q = query(
        collection(db, this.listingsCollection),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const listings = [];
      
      querySnapshot.forEach((doc) => {
        listings.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return listings;
    } catch (error) {
      console.error('Error getting user listings:', error);
      return [];
    }
  }

  // Varsayılan ilanları ekle (ilk kurulum için)
  async seedDefaultListings() {
    try {
      const existingListings = await this.getAllListings();
      
      if (existingListings.length > 0) {
        console.log('Listings already exist, skipping seed');
        return;
      }
      
      const defaultListings = [
        {
          title: "Merkezi Konumda Satılık Ofis",
          image: "https://media.istockphoto.com/id/182188795/tr/foto%C4%9Fraf/modern-office-building-exterior.jpg",
          imageUrl: "https://media.istockphoto.com/id/182188795/tr/foto%C4%9Fraf/modern-office-building-exterior.jpg",
          advisor: "Ahmet Yılmaz",
          advisorDetails: "Ahmet Yılmaz",
          advisorEmail: "ahmet.yilmaz@kwcommercial.com",
          advisorPhone: "905451234567",
          portfolioType: "BİNA KATI VEYA BÖLÜMÜ",
          usagePurpose: "HİZMET OFİS",
          city: "İstanbul",
          district: "Şişli",
          neighborhood: "Mecidiyeköy",
          price: 2500000,
          date: "2024-01-15",
          description: "Merkezi konumda modern ofis alanı. Metro istasyonuna 5 dakika yürüme mesafesinde.",
          islandParcel: "Ada: 123, Parsel: 45",
          zoningStatus: "Ticari",
          createdBy: "default-admin"
        },
        {
          title: "Cadde Üzeri Kiralık Dükkan",
          image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPWGq950txuigG7DfO6bMtCg2X13S5uH5N0A&s",
          imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPWGq950txuigG7DfO6bMtCg2X13S5uH5N0A&s",
          advisor: "Fatma Demir",
          advisorDetails: "Fatma Demir",
          advisorEmail: "fatma.demir@kwcommercial.com", 
          advisorPhone: "905459876543",
          portfolioType: "DÜKKAN-MAĞAZA",
          usagePurpose: "PERAKENDE",
          city: "İstanbul",
          district: "Kadıköy",
          neighborhood: "Moda",
          price: 15000,
          date: "2024-01-10",
          description: "Ana cadde üzerinde kiralık dükkan. Yoğun pedestrian trafiği bulunan lokasyon.",
          islandParcel: "Ada: 456, Parsel: 78",
          zoningStatus: "Ticari",
          createdBy: "default-admin"
        },
        {
          title: "Sanayi Alanında Satılık Arsa",
          image: "https://www.katilimevim.com.tr/wp-content/uploads/shutterstock_2229665975-min-580x350.jpg",
          imageUrl: "https://www.katilimevim.com.tr/wp-content/uploads/shutterstock_2229665975-min-580x350.jpg",
          advisor: "Mehmet Kaya",
          advisorDetails: "Mehmet Kaya",
          advisorEmail: "mehmet.kaya@kwcommercial.com",
          advisorPhone: "905456789012",
          portfolioType: "ARSA",
          usagePurpose: "SANAYİ-İMALAT",
          city: "Bursa",
          district: "Osmangazi",
          neighborhood: "Organize Sanayi",
          price: 5000000,
          date: "2024-01-08",
          description: "Organize sanayi bölgesinde imar izinli arsa. Toplam 2500 m² alan.",
          islandParcel: "Ada: 789, Parsel: 12",
          zoningStatus: "Sanayi",
          createdBy: "default-admin"
        }
      ];
      
      for (const listing of defaultListings) {
        await this.addListing(listing);
      }
      
      console.log('✅ Default listings seeded successfully');
      
    } catch (error) {
      console.error('Error seeding default listings:', error);
    }
  }

  // Tüm listener'ları temizle
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
  }
}

// Singleton instance
export const firestoreService = new FirestoreService();

// Global erişim için
window.firestoreService = firestoreService;