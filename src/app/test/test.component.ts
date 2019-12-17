// Imports angular
import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";

// Imports external
import { WebcamInitError, WebcamImage } from "ngx-webcam";
import { Subject, Observable } from "rxjs";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements AfterViewInit, OnDestroy {

  @ViewChild("canvasEl", { static: false }) canvasEl: ElementRef;
  private context: CanvasRenderingContext2D;

  constructor(private http: HttpClient) {}

  timer = null;

  // Variable to save service data
  data: any;

  // Variable to save the image in base64
  base64: any;

  // Variable for url
  url: any = "http://192.168.1.7:7003/predict";

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

  // Called after Angular has fully initialized a component's view
  ngAfterViewInit(): void {
  this.timer = setInterval(async () => {
      this.triggerSnapshot();
      this.clean();
      this.draw();
    }, 5000);
  }

  // Funtion post service
  getSeeschweiler(): Observable<any> {
    this.base64 = this.webcamImage.imageAsBase64;
    // console.log(this.base64);
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
    this.context = (this.canvasEl.nativeElement as HTMLCanvasElement).getContext("2d");
    this.context.strokeStyle = "#9bae04";
    this.context.lineWidth = 2;
    this.context.rect(this.x, this.y, this.w, this.h);
    this.context.font = "20px Arial";
    this.context.fillStyle = "#9bae04";
    this.context.fillText("DNI: 70142123", 10, 50);
    this.context.stroke();
    this.context.beginPath();
  }

  public clean(): void {
    console.log("funcion limpiar");
    this.context = (this.canvasEl.nativeElement as HTMLCanvasElement).getContext("2d");
    this.context.clearRect(0, 0, 640, 480);
    this.context.stroke();
  }

  // Funtion active trigger
  public triggerSnapshot(): void {
    this.trigger.next();
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
      error.mediaStreamError && error.mediaStreamError.name === "NotAllowedError"
    ) {
      alert("El acceso a la camara fue denegado!");
    }
  }

  ngOnDestroy(): void {
    if (this.timer) {
      console.log("ngOnDestroy");
      clearInterval(this.timer);
    }
  }

}
