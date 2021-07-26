import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  public user!: firebase.default.User;
  constructor(private auth: AngularFireAuth) {
    this.auth.authState.subscribe((user) => {
      if (this.user == null && user != null) {
        this.user = user;
      } else if (this.user != null) {
        console.log(`Hello + ${this.user.displayName}`);
      }
    });
  }
  public async signInWithGoogle() {
    let provider = new firebase.default.auth.GoogleAuthProvider();
    return await this.auth.signInWithPopup(provider);
  }
}