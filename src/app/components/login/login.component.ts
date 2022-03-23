import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email;
  password;

  constructor(private as: AuthService, private toastr: ToastrService, private router: Router) { }

  ngOnInit(): void {
  }

  login(form){
    let data = form.value;
    this.as.login(data.email, data.password).then(result => {
    this.toastr.success('You have successfuly login to your account!')
    this.router.navigateByUrl('/')
  })
  .catch(err => {
      this.toastr.error(err)
    })
  }


  // login() {
  //   this.as
  //     .login({ email: this.email, password: this.password })
  //     .subscribe(
  //       (data: any) => {
  //         this.as.isLogin = true;
  //         this.as.isAdmin = data.isAdmin;

  //         localStorage.setItem('token', data.token);
  //         localStorage.setItem('isAdmin', data.isAdmin);

  //         this.toastr.success('login successfuly!');

  //         this.router.navigateByUrl('/');
  //       },
  //       (err) => {
  //         this.toastr.error(err.error);
  //       }
  //     );
  // }
}
