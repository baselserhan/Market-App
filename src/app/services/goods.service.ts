import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';


@Injectable({
  providedIn: 'root',
})
export class GoodsService {

  constructor(private fs: AngularFirestore, private storage: AngularFireStorage) { }

  getAllGoods() {
    return this.fs.collection('goods').valueChanges();
  }

  addNewGood(name: string, price: number, image: File) {
    return new Promise((resolve, reject) => {
      if (!image) {
        return reject(new Error('Image file is required'));
      }

      // Check file size (max 2MB after compression)
      if (image.size > 2 * 1024 * 1024) {
        return reject(new Error('Image size exceeds 2MB limit'));
      }

      const filePath = `goods/${Date.now()}_${image.name}`;
      const ref = this.storage.ref(filePath);
      
      ref.put(image).then((snapshot) => {
        ref.getDownloadURL().subscribe({
          next: (photoUrl) => {
            this.fs.collection('goods').add({
              name,
              price,
              photoUrl,
              uploadedAt: new Date()
            }).then(resolve).catch(reject);
          },
          error: reject
        });
      }).catch((error) => {
        reject(new Error('Upload failed: ' + error.message));
      });
    });
  }
}
