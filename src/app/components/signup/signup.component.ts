import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/interfaces/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  errorMessage: string = ''

  constructor(private as: AuthService, private us: UserService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
  }
signup(form){
  let data: User = form.value;
  this.as.signup(data.email, data.password)
  .then(result => {
    this.errorMessage = ''
    this.us.addNewUser(result.user.uid, data.name, data.address).then(() => {
      this.toastr.success('You have successfuly created your account!')
      this.router.navigate(['/'])
    })
  })
  .catch(err => {
    this.errorMessage = err.message
  })
}
}
