import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { AudioRecordingService } from "../audio-recording.service";
import { Router } from "@angular/router";

// Imports external
import { WebcamInitError, WebcamImage } from "ngx-webcam";
import { Subject, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";


import { MatDialog } from '@angular/material';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../confirm-dialog/confirm-dialog.component';


@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"]
})
export class RegisterComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("canvasEl", { static: false }) canvasEl: ElementRef;
  private context: CanvasRenderingContext2D;

  isLinear = true;
  CameraView = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  dniRegister: number;

  serviceData: any;

  isRecording = false;
  recordedTime;
  blobUrl;

  //webcam

  // Variable to save service data
  data: any;
  dataRespuesta: any;

  // Variable to save the image in base64
  base64: any;

  // Variable for url
  // url: any = "http://192.168.1.7:7003/predict";
  // url: any = "https://041e9354.ngrok.io/is_there_dni";
  // url: any = "https://e89b199a.ngrok.io/recognition";
  url: any = "https://1fcf463e.ngrok.io/add_user";


  // Service position variable
  ymin: any;
  xmin: any;
  xmax: any;
  ymax: any;

  // Position variable of the figure
  w: any;
  h: any;

  // Position variable X, Y with respect to the total size
  x: any;
  y: any;

  // Webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();

  // Latest snapshot
  public webcamImage: WebcamImage = null;

  timer = null;
  btnCamera = true;

  buttonTimer: any;
  imageArray = [];

  loading: any = false;

  result: string = '';

  constructor(
    private _formBuilder: FormBuilder,
    private audioRecordingService: AudioRecordingService,
    private sanitizer: DomSanitizer,
    private router: Router,
    public dialog: MatDialog,
    private http: HttpClient
  ) {
    this.audioRecordingService.recordingFailed().subscribe(() => {
      this.isRecording = false;
    });

    this.audioRecordingService.recordingFailed().subscribe(() => {
      this.isRecording = false;
    });

    this.audioRecordingService.getRecordedTime().subscribe(time => {
      this.recordedTime = time;
    });

    this.audioRecordingService.getRecordedBlob().subscribe(data => {
      console.log(data);
      this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(data.blob)
      );
    });
  }

  ngAfterViewInit(): void {
    // setInterval(async () => {
    // this.triggerSnapshot();
    // this.clean();
    // this.draw();
    // }, 5000);
  }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ["", Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: [""]
    });
    this.thirdFormGroup = this._formBuilder.group({
      thirdCtrl: [""]
    });
  }

  // Funtion post service
  getSeeschweiler(): Observable<any> {
    this.base64 = this.webcamImage.imageAsBase64;
    console.log(this.base64);
    return this.http.post(this.url, this.base64);
  }

  // Subscribe function obtains service data by subscribing
  // To the calling function
  public getService(): void {
    this.getSeeschweiler().subscribe(
      // Image mirror
      // this.x = (this.xmin * 640);
      data => {
        this.data = data;

        //esto es lo que trae el servicio
        this.ymin = this.data[0].ymin;
        this.xmin = this.data[0].xmin;
        this.xmax = this.data[0].xmax;
        this.ymax = this.data[0].ymax;

        // esto es los valores respecto al tamaño de la imagen que usamos para pintar el rectangulo
        this.w = Math.round((this.xmax - this.xmin) * 640);
        this.h = Math.round((this.ymax - this.ymin) * 480);
        this.x = Math.round((1 - this.xmax) * 640);
        this.y = Math.round(this.ymin * 480);
      }
    );
  }

  // Function obtains the position and draws the figure
  public draw(): void {
    console.log("funcion pintar");
    this.getService();
    this.context = (this.canvasEl
      .nativeElement as HTMLCanvasElement).getContext("2d");
    this.context.strokeStyle = "green";
    this.context.lineWidth = 2;
    this.context.rect(this.x, this.y, this.w, this.h);
    this.context.stroke();
    this.context.beginPath();
  }

  public clean(): void {
    console.log("funcion limpiar");
    this.context = (this.canvasEl
      .nativeElement as HTMLCanvasElement).getContext("2d");
    this.context.clearRect(0, 0, 640, 480);
    this.context.stroke();
  }

  // Funtion active trigger
  public triggerSnapshot(): void {
    this.trigger.next();
  }

  onOpenCamera() {
    console.log("camera view");
    this.CameraView = true;
  }

  onCloseCamera() {
    console.log("camera close");
    this.CameraView = false;
  }

  onImageToService() {
    console.log("obteniendo 5 imagenes...");
    this.btnCamera = false;
    this.buttonTimer = 5;

    this.timer = setInterval(async () => {
      if (this.buttonTimer <= 1) {
        this.stopTimer();
        this.btnCamera = true;
      }
      this.triggerSnapshot();
      this.base64 = this.webcamImage.imageAsBase64;
      this.buttonTimer--;
      console.log("array:", this.imageArray.push(this.webcamImage.imageAsBase64));
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  // Observable to activate image capture
  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  // Event get image from camera
  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
  }

  // Funtion catch error camera
  public handleInitError(error: WebcamInitError): void {
    if (
      error.mediaStreamError &&
      error.mediaStreamError.name === "NotAllowedError"
    ) {
      alert("El acceso a la camara fue denegado!");
    }
  }

  startRecording() {
    if (!this.isRecording) {
      this.isRecording = true;
      this.audioRecordingService.startRecording();
    }
  }

  abortRecording() {
    if (this.isRecording) {
      this.isRecording = false;
      this.audioRecordingService.abortRecording();
    }
  }

  stopRecording() {
    if (this.isRecording) {
      this.audioRecordingService.stopRecording();
      this.isRecording = false;
    }
  }

  clearRecordedData() {
    this.blobUrl = null;
  }

  getIntercorp(): Observable<any> {
    //this.serviceData2 = {
    //  dni: this.dniRegister,
    //  audio: this.audioRecordingService.valueRecoder.leftchannel,
    //  imagenes: this.imageArray
    //};
    this.serviceData = {dni: this.dniRegister, imagenes: this.imageArray, audio: this.audioRecordingService.valueRecoder.leftchannel,};
    console.log(this.url, this.serviceData)
    return this.http.post(this.url, this.serviceData);
  }

  //igual trata de buscar lo mismo de cors policy pero a nivel de tu container porfa asi vemos si lo arreglamos por front o back ok

  onModal() {
    console.log("open modal");
    this.confirmDialogRegister();
    // console.log("data para el servicio:", this.serviceData);
    this.router.navigate(["/login"]);
  }


  confirmDialogRegister(): void {
    console.log("resultados");
    const message = `El registro fue exitoso, ya puede acceder a la verificación.`;
    const dialogData = new ConfirmDialogModel("Usuario Registrado", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "350px",
      data: dialogData,
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
    });
  }

  errorDialogRegister(): void {
    const message = `Error del servidor.`;
    const dialogData = new ConfirmDialogModel("No se pudo conectar", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "350px",
      data: dialogData,
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
    });
  }


  getServiceIntercorp(): void {
    this.loading = true;
    this.getIntercorp().subscribe(
      dataRespuesta => {
        this.dataRespuesta = dataRespuesta;
        console.log(this.dataRespuesta);
        if(this.dataRespuesta.resultado === 1) {
          this.loading = false;
          this.confirmDialogRegister();
          this.router.navigate(['/login']);
        } else {
          this.loading = false;
          this.errorDialogRegister();
        }
      },
      error => {
        console.log(error);
        this.loading = false;
        this.errorDialogRegister();
      }
    )
  }

  ngOnDestroy(): void {
    this.abortRecording();
    this.stopTimer();
  }
}
