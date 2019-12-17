import { Component } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../confirm-dialog/confirm-dialog.component';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent {
  result: string = '';
  serviceData: any;
  dniLogin: any;
  data: any;

  loading: any = false;

  url: any = "https://1fcf463e.ngrok.io/is_there_dni";


  dniFormControl = new FormControl("", [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(8)
  ]);

  constructor(
    private router: Router,
     public dialog: MatDialog,
     private http: HttpClient) {}


  errorDialogLogin(): void {
    const message = `Usted no se encuentra registrado o su DNI es incorrecto, vuelva a intentarlo.`;
    const dialogData = new ConfirmDialogModel("Acceso Denegado", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "350px",
      data: dialogData,
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
    });
  }

    // Funtion post service
    getDniPost(): Observable<any> {
      this.serviceData = {dni: this.dniLogin}
      return this.http.post(this.url, this.serviceData);
    }

    getService(): void {
      this.loading = true;
      this.getDniPost().subscribe(
        data => {
          this.data = data;
          if(this.data.resultado === 1) {
            this.loading = false;
            this.router.navigate(['/home']);
          } else {
            this.loading = false;
            this.errorDialogLogin();
          }
        },
        error => {
          console.log(error);
          this.loading = false;
          this.errorDialogLogin();
        }
      )
    }

  onRegister() {
    this.router.navigate(['/register']);
  }
}
