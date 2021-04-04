import { Component, ElementRef, ViewChild, Renderer2, Inject } from "@angular/core";
import { DOCUMENT } from '@angular/common';
declare var cv: any;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  @ViewChild("canvasInput", { static: true })
  canvasInput: ElementRef;
  
  result:string;

  constructor(
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private _document
  ) {}


  ngOnInit() {
    const s = this.renderer2.createElement('script');
    s.type = 'text/javascript';
    s.src = 'https://docs.opencv.org/4.1.1/opencv.js';
    s.text = ``;
    this.renderer2.appendChild(this._document.body, s);
    // this.setImage();
  }

  handleFileInput(e) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = URL.createObjectURL(e.target.files[0]);
    const context: CanvasRenderingContext2D = this.canvasInput.nativeElement.getContext(
      "2d"
    );
    let canvas = document.getElementById(this.canvasInput.nativeElement.id);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0, img.width, img.height);
      this._runTest();
    };        
  }

  private _runTest(): void {
    let inside = 0;
    const samples=1000; 
    const src = window.cv.imread(this.canvasInput.nativeElement.id);  
    let dst = new window.cv.Mat();
    let low = new window.cv.Mat(src.rows, src.cols, src.type(), [0, 0, 0, 0]);
    let high = new window.cv.Mat(src.rows, src.cols, src.type(), [150, 150, 150, 255]);
    window.cv.inRange(src, low, high, src);   
    let canv = document.getElementById(this.canvasInput.nativeElement.id);
    let c = canv.getContext('2d');
    let tmp = c.getImageData(0,0,canv.width,canv.height);
    let dataR = new Uint8Array(canv.width*canv.height); 
    console.log(canv.width,canv.height,dataR,tmp);
    for(let i = 0; i < dataR.length; i++){
      dataR[i] = tmp.data[i*4]; //almacenamos los valores de pixel del canal R
    }
    
    c.fillStyle = "red";
  
    for(let j = 0; j < samples; j++){
      const x = Math.round( Math.random() * canv.width );
      const y = Math.round( Math.random() * canv.height );
      
      if( dataR[y*canv.width+x] > 128 ){
        inside++;
      }		
      c.beginPath();
      c.arc(x,y,1.5,0,2*Math.PI); 
      //(x-coor of the center/circle,y-coor of the center/circle,radius of the circle,
      // , starting angle, in radians, ending angle, in radians)
      c.closePath();
      c.fill();		
    }
    console.log (inside,' puntos inside de ',samples,', el area aprox de la mancha por Monte Carlo Method es: ', ((canv.width*canv.height) * inside/samples), 'px^2'); 
    this.result=`${inside} puntos inside de un total de ${samples}, el area aprox de la mancha por Monte Carlo Method es:  ${((canv.width*canv.height) * inside/samples)} px^2`
    // window.cv.imshow(this.canvasOutput.nativeElement.id, dst);
    src.delete();
    dst.delete();
    // faceCascade.delete();
    // eyeCascade.delete();
    // faces.delete();
    // eyes.delete();
  }
}
