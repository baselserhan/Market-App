import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';


@Injectable({
  providedIn: 'root',
})
export class GoodsService {

  constructor(private fs: AngularFirestore, private storage: AngularFireStorage) { }

  getAllGoods() {
    return this.fs.collection('goods').snapshotChanges().pipe(
      // Map to include both document data and ID
    );
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

  deleteProduct(productId: string) {
    return new Promise((resolve, reject) => {
      this.fs.collection('goods').doc(productId).get().subscribe({
        next: (doc) => {
          const data: any = doc.data();
          // Delete the image from storage if it exists
          if (data?.photoUrl) {
            const imageUrl = data.photoUrl;
            // Extract the file path from the download URL
            try {
              const imageRef = this.storage.refFromURL(imageUrl);
              imageRef.delete().subscribe({
                next: () => {
                  // Image deleted, now delete the document
                  this.fs.collection('goods').doc(productId).delete()
                    .then(resolve)
                    .catch(reject);
                },
                error: () => {
                  // If image deletion fails, still delete the document
                  this.fs.collection('goods').doc(productId).delete()
                    .then(resolve)
                    .catch(reject);
                }
              });
            } catch (error) {
              // If parsing URL fails, just delete the document
              this.fs.collection('goods').doc(productId).delete()
                .then(resolve)
                .catch(reject);
            }
          } else {
            // No image URL, just delete the document
            this.fs.collection('goods').doc(productId).delete()
              .then(resolve)
              .catch(reject);
          }
        },
        error: reject
      });
    });
  }

  updateProductImage(productId: string, newImage: File) {
    return new Promise((resolve, reject) => {
      if (!newImage) {
        return reject(new Error('Image file is required'));
      }

      // Check file size (max 2MB after compression)
      if (newImage.size > 2 * 1024 * 1024) {
        return reject(new Error('Image size exceeds 2MB limit'));
      }

      // First, get the current product to delete the old image
      this.fs.collection('goods').doc(productId).get().subscribe({
        next: (doc) => {
          const data: any = doc.data();
          
          // Delete old image from storage if it exists
          if (data?.photoUrl) {
            const oldImageUrl = data.photoUrl;
            try {
              const oldImageRef = this.storage.refFromURL(oldImageUrl);
              oldImageRef.delete().subscribe({
                next: () => {
                  // Old image deleted, upload new image
                  this.uploadNewImage(productId, newImage, resolve, reject);
                },
                error: () => {
                  // If old image deletion fails, still upload new image
                  this.uploadNewImage(productId, newImage, resolve, reject);
                }
              });
            } catch (error) {
              // If parsing URL fails, just upload new image
              this.uploadNewImage(productId, newImage, resolve, reject);
            }
          } else {
            // No old image, just upload new one
            this.uploadNewImage(productId, newImage, resolve, reject);
          }
        },
        error: reject
      });
    });
  }

  private uploadNewImage(productId: string, image: File, resolve: any, reject: any) {
    const filePath = `goods/${Date.now()}_${image.name}`;
    const ref = this.storage.ref(filePath);

    ref.put(image).then(() => {
      ref.getDownloadURL().subscribe({
        next: (photoUrl) => {
          this.fs.collection('goods').doc(productId).update({
            photoUrl,
            updatedAt: new Date()
          }).then(resolve).catch(reject);
        },
        error: reject
      });
    }).catch((error) => {
      reject(new Error('Upload failed: ' + error.message));
    });
  }
}
