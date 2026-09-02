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
    this.gs.addNewGood(name, price, image)
      .then(() => {
        this.isUploading = false;
        this.toastr.success('The item has successfully added to the catalog');
        this.router.navigateByUrl('/');
      })
      .catch((err) => {
        this.isUploading = false;
        this.toastr.error(err?.message || 'Failed to add the product. Please try again.');
      });
  }
}
