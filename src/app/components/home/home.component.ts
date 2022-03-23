import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Good } from 'src/app/interfaces/good.interface';
import { CartService } from 'src/app/services/cart.service';
import { GoodsService } from 'src/app/services/goods.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  goods: Good[] = []
  goodsObservable: Subscription
  add: number = -1

  constructor(private gs: GoodsService, private cs: CartService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.goodsObservable = this.gs.getAllGoods().subscribe(data => {
      this.goods = data
    });
  }

  ngOnDestroy(){
    this.goodsObservable.unsubscribe();
  }

  addToCart(index: number){
    this.add = +index
  }

  buy(amount: number){
    let selectedGood = this.goods[this.add];
    let data = {
      name: selectedGood.name,
      amount: +amount,
      price: selectedGood.price,
      photoUrl: selectedGood.photoUrl
    };
    this.cs.addToCart(data).then(() => {
      this.add = -1
    });
    this.toastr.success('The item has successfully added to your cart');
  }
}
