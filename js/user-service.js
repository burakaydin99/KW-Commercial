// js/user-service.js - Kullanıcı bilgileri yönetimi için Firestore servisi
import { db, auth } from './firebase-config.js';
import { 
  collection, 
  doc, 
  getDoc,
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

class UserService {
  constructor() {
    this.usersCollection = 'users';
  }

  // Kullanıcı profili oluştur/güncelle
  async createOrUpdateUserProfile(userData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Kullanıcı giriş yapmamış');
      }

      const userRef = doc(db, this.usersCollection, user.uid);
      
      // Mevcut kullanıcı verilerini al
      const existingUserDoc = await getDoc(userRef);
      const existingData = existingUserDoc.exists() ? existingUserDoc.data() : {};

      // Telefon numarası formatını kontrol et
      if (userData.phone) {
        userData.phone = this.formatPhoneNumber(userData.phone);
        if (!this.validatePhoneNumber(userData.phone)) {
          throw new Error('Geçersiz telefon numarası formatı. Format: 90XXXXXXXXXX');
        }
      }

      // İsim kontrolü
      if (userData.name) {
        if (userData.name.length < 2 || userData.name.length > 50) {
          throw new Error('İsim 2-50 karakter arasında olmalıdır');
        }
      }

      // Güncellenecek veri
      const updateData = {
        ...existingData,
        ...userData,
        email: user.email, // Email değiştirilemez
        updatedAt: serverTimestamp()
      };

      // İlk kez oluşturuluyorsa
      if (!existingUserDoc.exists()) {
        updateData.createdAt = serverTimestamp();
        updateData.uid = user.uid;
      }

      await setDoc(userRef, updateData, { merge: true });
      
      console.log('✅ User profile updated:', updateData);
      return updateData;
      
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  }

  // Kullanıcı profilini al
  async getUserProfile(userId = null) {
    try {
      const targetUserId = userId || auth.currentUser?.uid;
      if (!targetUserId) {
        throw new Error('Kullanıcı ID bulunamadı');
      }

      const userRef = doc(db, this.usersCollection, targetUserId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data()
        };
      } else {
        console.log('User profile not found, returning null');
        return null;
      }
      
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      throw error;
    }
  }

  // Telefon numarası formatını düzenle
  formatPhoneNumber(phone) {
    if (!phone) return '';
    
    // Sadece rakamları al
    let cleaned = phone.replace(/\D/g, '');
    
    // 90 ile başlamıyorsa ekle
    if (!cleaned.startsWith('90')) {
      if (cleaned.startsWith('0')) {
        cleaned = '90' + cleaned.substring(1);
      } else if (cleaned.startsWith('5')) {
        cleaned = '90' + cleaned;
      } else {
        cleaned = '90' + cleaned;
      }
    }
    
    return cleaned;
  }

  // Telefon numarası validasyonu
  validatePhoneNumber(phone) {
    if (!phone) return true; // Telefon zorunlu değil
    
    // Türkiye format: 90XXXXXXXXXX (12 karakter)
    const phoneRegex = /^90[0-9]{10}$/;
    return phoneRegex.test(phone);
  }

  // Email validasyonu
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Kullanıcı bilgilerini senkronize et (Google Sheet'ten gelen veriyle birleştir)
  async syncUserWithGoogleSheet(googleSheetData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Kullanıcı giriş yapmamış');
      }

      // Mevcut Firestore verilerini al
      const firestoreProfile = await this.getUserProfile();
      
      // Google Sheet'ten gelen verilerle birleştir (Firestore öncelikli)
      const syncedData = {
        name: firestoreProfile?.name || googleSheetData?.name || user.displayName || '',
        phone: firestoreProfile?.phone || googleSheetData?.phone || '',
        email: user.email, // Email her zaman Google'dan
        role: googleSheetData?.role || 'user',
        status: googleSheetData?.status || 'active'
      };

      // Firestore'da güncelle
      await this.createOrUpdateUserProfile(syncedData);
      
      console.log('✅ User data synced with Google Sheet');
      return syncedData;
      
    } catch (error) {
      console.error('❌ Error syncing user data:', error);
      throw error;
    }
  }

  // WhatsApp linki oluştur
  createWhatsAppLink(phone, message = '') {
    const formattedPhone = this.formatPhoneNumber(phone);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  }

  // Kullanıcı istatistikleri
  async getUserStats(userId = null) {
    try {
      const targetUserId = userId || auth.currentUser?.uid;
      if (!targetUserId) {
        throw new Error('Kullanıcı ID bulunamadı');
      }

      // Bu kullanıcının ilanlarını say (firestore-service'den çekilecek)
      // Şimdilik basit return
      return {
        totalListings: 0,
        activeListings: 0,
        views: 0
      };
      
    } catch (error) {
      console.error('❌ Error getting user stats:', error);
      return {
        totalListings: 0,
        activeListings: 0,
        views: 0
      };
    }
  }
}

// Singleton instance
export const userService = new UserService();

// Global erişim için
window.userService = userService;