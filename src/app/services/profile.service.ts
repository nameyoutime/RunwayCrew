import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, Query } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import {
  RegistrationProfile,
  ResPaginateProfile,
  UserContribution,
  UserProfile,
} from 'src/models/user-profile.model';
import { UtilsService } from './utils.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { AuthenticationService } from './authentication.service'
import { ShareService } from './share.service';
@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private currentUser?: firebase.default.User;
  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private utils: UtilsService,
    private HttpClient: HttpClient,
    private AuthSv: AuthenticationService,
    private shareSer:ShareService
  ) {
    this.auth.authState.subscribe((state) => {
      if (state != null) {
        this.currentUser = state;
      }
    });
  }

  public async create(registration: RegistrationProfile) {
    let currentTime = Date.now();
    // Prepare user data
    if (!this.currentUser) {
      throw 'Unauthenticated';
    }
    let profile: UserProfile = {
      ...registration,
      uid: this.currentUser.uid,
      email: this.currentUser.email ?? '',
      photoUrl: this.currentUser.photoURL ?? '',
      roles: [],
      profileMetadata: {
        created: currentTime,
        updated: currentTime,
        actor: this.currentUser.email ?? '',
      },
      contribMetadata: {
        created: currentTime,
        updated: currentTime,
        actor: this.currentUser.email ?? '',
      },
      styleUserRead: 'Everyone'
    };
    let contribution: UserContribution = {
      _id: '',
      id: '',
      uid: this.currentUser.uid,
      achievements: [],
      email: this.currentUser.email ?? '',
      credit: 0,
      skills: [],
      exp: 0,

    };
    // Create data

    await this.HttpClient.post(environment.endpoint + 'profile', profile).toPromise()
    await this.HttpClient.post(environment.endpoint + 'contri', profile).toPromise()
    // await this.db.collection('profiles').doc(this.currentUser.uid).set(profile);
    // await this.db
    //   .collection('contributions')
    //   .doc(this.currentUser.uid)
    //   .set(contribution);
  }

  public async update(registration: RegistrationProfile) {
    let currentTime = Date.now();
    // Prepare user data
    if (!this.currentUser) {
      throw 'Unauthenticated';
    }
    // let currentProfile = await this.db
    //   .collection('profiles')
    //   .doc(this.currentUser.uid)
    //   .get()
    //   .toPromise();
    // let updated: UserProfile = <UserProfile>currentProfile.data();
    // updated = {
    //   ...updated,
    //   ...registration,
    //   photoUrl: this.currentUser.photoURL ?? '',
    //   profileMetadata: {
    //     updated: currentTime,
    //   },
    // };

    // await this.db
    //   .collection('profiles')
    //   .doc(this.currentUser.uid)
    //   .update(updated);
    let body = {
      ...registration,
      profileMetadata: {
        updated: currentTime
      }
    }
    await this.HttpClient.put(environment.endpoint + 'profile', body).toPromise().then(res => {console.log(res)
      this.shareSer.openSnackBar("successfully update profile!");
    }).catch((err)=>{
      this.shareSer.openSnackBar("failed to update profile!",false);
    });
  }

  public async updateProfile(profile: UserProfile) {
    // await this.db
    //   .collection('profiles')
    //   .doc(profile.uid)
    //   .update({
    //     ...profile,
    //     profileMetadata: {
    //       ...profile.profileMetadata,
    //       updated: Date.now(),
    //     },
    //   });
    const body = {
      ...profile,
      profileMetadata: {
        updated: Date.now(),
      }
    }
    console.log(body)
    await this.HttpClient.put(environment.endpoint + 'profile', body).toPromise().then(res => {console.log(res)
      this.shareSer.openSnackBar("successfully create achievement!");
    }).catch((err)=>{
      this.shareSer.openSnackBar("failed to create achievement!",false);
    });
  }

  public async get(uid?: string, token?: string): Promise<UserProfile> {
    // let profile = await this.db
    //   .collection('profiles')
    //   .doc(uid ?? this.currentUser?.uid)
    //   .get()
    //   .toPromise();
    // return <UserProfile>profile.data();
    return this.HttpClient.get<UserProfile>(environment.endpoint + `profile/byID?id=${uid}`, {
      headers: new HttpHeaders()
        .set('Authorization', token ?? '')
    }).toPromise()
  }


  public async getUid(uid?: string): Promise<UserProfile> {
    let user = this.HttpClient.get<UserProfile>(environment.endpoint + `profile/uid?uid=${uid}`).toPromise()
    return user
  }

  public getAll(): Observable<UserProfile[]> {
    return this.HttpClient
      .get<UserProfile[]>(environment.endpoint + "profile?pageNum=-1")
  }

  public async isRegistrated(): Promise<boolean> {
    return new Promise((resolve) => {
      this.auth.authState.subscribe(async (state) => {
        if (state) {
          this.currentUser = state;
          let registrated = false;
          let user = await this.HttpClient.get(environment.endpoint + `profile/uid?uid=${state.uid}`).toPromise()
          if (user != null) {
            registrated = true;
          }
          resolve(registrated);
        }
      });
    });
  }

  public async getPaginate(pageSize: number, role: any, pageNum: number): Promise<any> {
    const params = {
      pageSize: pageSize,
      role: role,
      pageNum: pageNum
    }
    let res = await this.HttpClient.get<ResPaginateProfile>(environment.endpoint + 'profile', { params: params}).toPromise()
    return res
  }

}
