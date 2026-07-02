import { Injectable, forwardRef, Inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import { Subject, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpRequestService } from './http/http-request.service';
import { User } from '../_models/user';

interface LoginInfo {
    loggedIn: any;
    email: any;
    userId: any;
}

@Injectable()
export class AuthenticationService implements OnInit {
    public loginInfo: BehaviorSubject<LoginInfo>;



    constructor(private http: HttpClient, private httpRequestService: HttpRequestService, private router: Router){
        let currentUser = JSON.parse(localStorage.getItem('heroUser'));

        if(currentUser == null){
            this.loginInfo = new BehaviorSubject<LoginInfo>({ loggedIn: false, email: "", userId: 0 });
        }
        else {
            this.loginInfo = new BehaviorSubject<LoginInfo>({ loggedIn: true, email: currentUser.email, userId: currentUser.userId }) 
            //console.log(currentUser);
        }
      
    }
    ngOnInit(){

    }
    login(params: any): Observable<any> {
        return this.httpRequestService.login(params)
            .map(res => {
                let user = res.json();
                if (user && user.id) {
                    //console.log(params.email)
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    this.loginInfo.next({ loggedIn: true, email: params.email, userId: user.userId });
                    localStorage.setItem('heroUser', JSON.stringify({email: params.email, userId: user.userId, token: user.id }));
                }

                return user;
            });
    }
    autoLoginAfterVerify(email){
        this.loginInfo.next({ loggedIn: true, email: email, userId: 0 });
        localStorage.removeItem('heroUser');
        localStorage.setItem('heroUser', JSON.stringify({email: email}));
              
    }
    resetPasswordWithEmail(params: any): Observable<any> {
        return this.httpRequestService.resetPasswordWithEmail(params);
    }

    public get isAuthenticated() {

        return typeof this.loginInfo != "undefined" ? this.loginInfo.value.loggedIn : false;
    }

    public get LoginInfo() {        
        return typeof this.loginInfo != "undefined" ? this.loginInfo.value : null;
    }

    logout() {
        this.loginInfo.next({ loggedIn: false, email: "" , userId: 0});
        localStorage.removeItem('heroUser');
        this.router.navigate([""])
    }
}