// js/auth-service.js - Authentication servisi (Permissions güncellemesi)
import { auth, googleProvider } from './firebase-config.js';
import { signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Google Sheets API URL - Üyelik kontrolü için
const MEMBERSHIP_API_URL = 'https://opensheet.elk.sh/1QqwexvGN3OxHeKBPIJtSRKcNls7m3KW-mCBu0nqOrbo/KWC';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.userRole = null;
    this.authCallbacks = [];
    
    // Auth state değişikliklerini dinle
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        this.loadUserRole(user.email);
      } else {
        this.userRole = null;
      }
      this.notifyAuthCallbacks(user);
    });
  }

  // Auth state callback'ler
  onAuthStateChange(callback) {
    this.authCallbacks.push(callback);
  }

  notifyAuthCallbacks(user) {
    this.authCallbacks.forEach(callback => callback(user));
  }

  // Google ile giriş
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log('Google login successful:', user.email);
      
      // Üyelik kontrolü yap
      const memberData = await this.getMemberData(user.email);
      
      if (!memberData || memberData.status !== 'active') {
        // Üye değilse logout yap ve hata ver
        await this.signOut();
        throw new Error('Bu email adresi sisteme kayıtlı değil veya aktif değil. Lütfen yöneticinizle iletişime geçiniz.');
      }
      
      // Role bilgisini yükle
      this.userRole = memberData.role || 'user';
      console.log('✅ User role:', this.userRole);
      
      return {
        user,
        memberData,
        role: this.userRole
      };
      
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // Kullanıcı rolünü yükle
  async loadUserRole(email) {
    try {
      const memberData = await this.getMemberData(email);
      this.userRole = memberData?.role || 'user';
      console.log('👤 User role loaded:', this.userRole);
    } catch (error) {
      console.error('Error loading user role:', error);
      this.userRole = 'user'; // Default role
    }
  }

  // Üye verilerini al
  async getMemberData(email) {
    try {
      const response = await fetch(MEMBERSHIP_API_URL);
      const members = await response.json();
      
      const member = members.find(m => 
        m.email && m.email.toLowerCase() === email.toLowerCase()
      );
      
      return member || null;
    } catch (error) {
      console.error('Member data fetch error:', error);
      return null;
    }
  }

  // ✅ İlan düzenleme yetkisi kontrolü
  canEditListing(listing) {
    if (!this.currentUser) {
      return false;
    }
    
    // Admin hepsini düzenleyebilir
    if (this.userRole === 'admin') {
      console.log('✅ Admin can edit everything');
      return true;
    }
    
    // Kullanıcı sadece kendi ilanlarını düzenleyebilir
    const canEdit = listing.createdBy === this.currentUser.uid;
    console.log(`🔒 Edit permission for listing ${listing.id}:`, canEdit, 
               `(createdBy: ${listing.createdBy}, currentUser: ${this.currentUser.uid})`);
    return canEdit;
  }

  // ✅ İlan silme yetkisi kontrolü
  canDeleteListing(listing) {
    if (!this.currentUser) {
      return false;
    }
    
    // Admin hepsini silebilir
    if (this.userRole === 'admin') {
      console.log('✅ Admin can delete everything');
      return true;
    }
    
    // Kullanıcı sadece kendi ilanlarını silebilir
    const canDelete = listing.createdBy === this.currentUser.uid;
    console.log(`🗑️ Delete permission for listing ${listing.id}:`, canDelete,
                `(createdBy: ${listing.createdBy}, currentUser: ${this.currentUser.uid})`);
    return canDelete;
  }

  // ✅ Admin kontrolü
  isAdmin() {
    return this.userRole === 'admin';
  }

  // ✅ Kullanıcı bilgilerini formatla
  getUserInfo() {
    if (!this.currentUser) return null;
    
    return {
      uid: this.currentUser.uid,
      email: this.currentUser.email,
      name: this.currentUser.displayName,
      photoURL: this.currentUser.photoURL,
      role: this.userRole
    };
  }

  // Çıkış
  async signOut() {
    try {
      await signOut(auth);
      this.userRole = null;
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Mevcut kullanıcıyı al
  getCurrentUser() {
    return this.currentUser;
  }

  // Login durumu kontrolü
  isLoggedIn() {
    return !!this.currentUser;
  }

  // Telefon formatı düzenleme
  formatPhoneNumber(phone) {
    if (!phone) return '';
    
    // Sadece rakamları al
    let cleaned = phone.replace(/\D/g, '');
    
    // 90 ile başlamıyorsa ekle
    if (!cleaned.startsWith('90')) {
      if (cleaned.startsWith('0')) {
        cleaned = '90' + cleaned.substring(1);
      } else {
        cleaned = '90' + cleaned;
      }
    }
    
    return cleaned;
  }

  // WhatsApp linki oluştur
  createWhatsAppLink(phone, message) {
    const formattedPhone = this.formatPhoneNumber(phone);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  }
}

// Singleton instance
export const authService = new AuthService();

// Global erişim için
window.authService = authService;