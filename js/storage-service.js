// js/storage-service.js - Firebase Storage servisi
import { storage, auth } from './firebase-config.js';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

class StorageService {
  constructor() {
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  }

  // Dosya validasyonu
  validateFile(file) {
    const errors = [];
    
    if (!file) {
      errors.push('Dosya seçilmedi');
      return errors;
    }
    
    // Dosya tipi kontrolü
    if (!this.allowedTypes.includes(file.type)) {
      errors.push('Sadece JPG, PNG ve WebP formatları desteklenir');
    }
    
    // Dosya boyutu kontrolü
    if (file.size > this.maxFileSize) {
      errors.push('Dosya boyutu 5MB\'dan küçük olmalıdır');
    }
    
    return errors;
  }

  // Dosya adı oluştur
  generateFileName(file, userId) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    return `${userId}_${timestamp}_${randomString}.${extension}`;
  }

  // Resim upload et
  async uploadImage(file, folder = 'listings', onProgress = null) {
    try {
      // Kullanıcı kontrolü
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Dosya yüklemek için giriş yapmanız gerekiyor');
      }
      
      // Dosya validasyonu
      const errors = this.validateFile(file);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      
      // Dosya adı oluştur
      const fileName = this.generateFileName(file, user.uid);
      const filePath = `${folder}/${user.uid}/${fileName}`;
      
      // Storage referansı
      const storageRef = ref(storage, filePath);
      
      // Progress tracking ile upload
      if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            // Progress callback
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(Math.round(progress));
            },
            // Error callback
            (error) => {
              console.error('Upload error:', error);
              reject(error);
            },
            // Success callback
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log('Upload successful:', downloadURL);
                resolve({
                  url: downloadURL,
                  path: filePath,
                  name: fileName
                });
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      } else {
        // Progress tracking olmadan upload
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        console.log('Upload successful:', downloadURL);
        return {
          url: downloadURL,
          path: filePath,
          name: fileName
        };
      }
      
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  // Resmi sil
  async deleteImage(imagePath) {
    try {
      if (!imagePath) {
        throw new Error('Resim yolu belirtilmedi');
      }
      
      // URL'den path çıkar (eğer tam URL verilmişse)
      let path = imagePath;
      if (imagePath.includes('firebasestorage.googleapis.com')) {
        // Firebase Storage URL'sinden path çıkarma logic'i
        const urlParts = imagePath.split('/o/')[1];
        if (urlParts) {
          path = decodeURIComponent(urlParts.split('?')[0]);
        }
      }
      
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      
      console.log('Image deleted successfully:', path);
      return true;
      
    } catch (error) {
      console.error('Image deletion error:', error);
      // Dosya bulunamadı hatası normal olabilir
      if (error.code === 'storage/object-not-found') {
        console.log('Image not found, may already be deleted');
        return true;
      }
      throw error;
    }
  }

  // Resmi yeniden boyutlandır (client-side)
  async resizeImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Boyut hesaplama
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Resmi çiz
        ctx.drawImage(img, 0, 0, width, height);
        
        // Blob oluştur
        canvas.toBlob(resolve, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // Base64'den File objesine çevir
  base64ToFile(base64String, fileName = 'image.jpg') {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], fileName, { type: mime });
  }
}

// Singleton instance
export const storageService = new StorageService();

// Global erişim için
window.storageService = storageService;