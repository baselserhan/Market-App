import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Market';
  isUser: boolean = false;

  constructor(private as: AuthService, private router: Router){ }

  ngOnInit(): void {
    this.as.user.subscribe(user => {
      if (user) {
        this.isUser = true
        this.as.userId = user.uid
      }
      else {
        this.isUser = false
        this.as.userId = ''
      }
    })
  }

  logout(){
    this.as.logout().then(() => {
      this.router.navigateByUrl('/')
    });
  }

}
