import { Component, OnInit } from '@angular/core';
import { Shopping } from 'src/app/interfaces/shopping.interface';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  cart: Shopping[] = []

  constructor(private cs: CartService) { }

  ngOnInit(): void {
    this.cs.getCart().subscribe(changes => {
      this.cart = changes.map(change => {
        let data:any = change.payload.doc.data();
       return {
        id: change.payload.doc.id,
       ...data

      }
    })

  })
}

  delete(index){
    this.cs.delete(this.cart[index].id)
  }

  update(index){
    this.cs.update(this.cart[index].id, this.cart[index].amount)
  }

}
