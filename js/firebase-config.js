// firebase-config.js - Gerçek Firebase config ile

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Gerçek Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChhuGhfkPE9pADV5Zd2SabrG-CCaupxCY",
  authDomain: "kw-commercial-91c95.firebaseapp.com",
  projectId: "kw-commercial-91c95",
  storageBucket: "kw-commercial-91c95.firebasestorage.app",
  messagingSenderId: "200293837431",
  appId: "1:200293837431:web:45de6886b5883436d13472",
  measurementId: "G-RSE2R3HN3X"
};

// Firebase'i başlat
let app, auth, db, storage, googleProvider;

try {
  console.log('🔄 Firebase başlatılıyor...');
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Google Auth Provider konfigürasyonu
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  
  console.log('✅ Firebase başarıyla başlatıldı');
  console.log('📊 Project ID:', firebaseConfig.projectId);
  
  // Test Firestore bağlantısı
  // Bu Firestore'un çalışıp çalışmadığını test eder
  
} catch (error) {
  console.error('❌ Firebase başlatma hatası:', error);
  
  // Hata durumunda kullanıcıya bilgi ver
  document.addEventListener('DOMContentLoaded', function() {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff4757;
      color: white;
      padding: 15px 25px;
      border-radius: 12px;
      z-index: 9999;
      font-family: Arial, sans-serif;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    `;
    errorDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 18px;">⚠️</span>
        <div>
          <div><strong>Firebase Bağlantı Hatası</strong></div>
          <div style="font-size: 0.9em; opacity: 0.9;">Lütfen internet bağlantınızı kontrol edin</div>
        </div>
      </div>
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  });
}

// Firestore Security Rules uyarısı
console.log('🔒 Firestore Security Rules kontrol edin:');
console.log('   Şu kurallar gerekli:');
console.log('   - Authentication required for read/write');
console.log('   - User can only edit their own listings');

export { auth, db, storage, googleProvider };

// Global olarak erişilebilir yap (eski kodlar için)
window.auth = auth;
window.db = db;
window.storage = storage;