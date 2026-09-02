import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Good } from 'src/app/interfaces/good.interface';
import { GoodsService } from 'src/app/services/goods.service';

@Component({
  selector: 'app-goods',
  templateUrl: './goods.component.html',
  styleUrls: ['./goods.component.css']
})
export class GoodsComponent implements OnInit {

  @ViewChild('image') image: ElementRef;
  imagePreview: string | null = null;
  hasImage = false;
  isUploading = false;

  constructor(private gs: GoodsService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.toastr.error('Image size must be less than 2MB');
        this.hasImage = false;
        return;
      }

      this.hasImage = true;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.hasImage = false;
      this.imagePreview = null;
    }
  }

  addNewGood(form: NgForm) {
    const files = (this.image?.nativeElement as HTMLInputElement)?.files;
    const image = files && files[0] ? files[0] : null;

    if (!image) {
      this.toastr.warning('Please select an image for the product');
      return;
    }

    const name = (<Good>form.value).name;
    const price = (<Good>form.value).price;

    this.isUploading = true;
    
    // Compress image before uploading
    this.compressImage(image, (compressedFile) => {
      this.gs.addNewGood(name, price, compressedFile)
        .then(() => {
          this.isUploading = false;
          this.toastr.success('The item has successfully added to the catalog');
          this.router.navigateByUrl('/');
        })
        .catch((err) => {
          this.isUploading = false;
          this.toastr.error(err?.message || 'Failed to add the product. Please try again.');
        });
    });
  }

  compressImage(file: File, callback: (compressedFile: File) => void): void {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: any) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if image is too large
        if (width > 1200) {
          height = (height * 1200) / width;
          width = 1200;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.7 quality
        canvas.toBlob(
          (blob: Blob | null) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
              callback(compressedFile);
            }
          },
          'image/jpeg',
          0.7
        );
      };
    };
  }
}
