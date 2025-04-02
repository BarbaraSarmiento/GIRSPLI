//src/app/components/motion/motion.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MotionService } from './Services/motion.service';
import { MotionData } from './Model/MotionData.model';
import { SplineViewer } from '@splinetool/viewer';
import { NgModule } from '@angular/core';

import { Application } from '@splinetool/runtime';
@Component({
  selector: 'app-motion',
  templateUrl: './motion.component.html',
  imports: [],
  styleUrl: './motion.component.scss',
  
})
export class MotionComponent implements OnInit, OnDestroy, AfterViewInit {
  private splineIframe?: HTMLIFrameElement;
  constructor(private motionS: MotionService, private ngZone: NgZone) {}
  @ViewChild('splineCanvas', { static: true }) canvasRef!: ElementRef;
 
  motionData: MotionData = { 
    acceleration: { x: 0, y: 0, z: 0 },
    rotation: { alpha: 0, beta: 0, gamma: 0 },
    angle: 0
  };
  ngOnInit(): void {
    this.motionS.startMotionDetection((data: MotionData) => {
      setTimeout(() => {
        this.motionData = data;
        console.log('Motion Data (delayed):', this.motionData);
      }, 2000);
    });
    const canvas: any = document.getElementById('canvas3d');

 // start the application and load the scene
 const spline = new Application(canvas);
 spline.load('https://prod.spline.design/1SxBH6hIQXxZKD0t/scene.splinecode');
 
  }

  ngOnDestroy(): void {
    
    this.motionS.stopMotionDetection();
  }

 


  ngAfterViewInit() {
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (event) => {
        this.ngZone.run(() => {
          this.motionData.rotation = {
            alpha: event.alpha || 0,
            beta: event.beta || 0,
            gamma: event.gamma || 0
          };

          // Calcula el ángulo de inclinación usando beta (eje Y)
          this.motionData.angle = Math.atan2(
            Math.sin((event.beta || 0) * Math.PI / 180),
            Math.cos((event.beta || 0) * Math.PI / 180)
          ) * (180 / Math.PI);

          this.rotateCanvas();
        });
      });
    }
  }

  rotateCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('3d');
    if (!ctx) return;

    const { alpha, beta, gamma } = this.motionData.rotation || { alpha: 0, beta: 0, gamma: 0 };

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia el canvas

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Aplica rotaciones basadas en los valores del giroscopio
    ctx.rotate((beta * Math.PI) / 180); // Inclinación (eje Y)
    ctx.rotate((gamma * Math.PI) / 180); // Balanceo (eje X)
    ctx.rotate((alpha * Math.PI) / 180); // Orientación (eje Z)

    // Dibuja un rectángulo como referencia
    ctx.fillStyle = 'blue';
    ctx.fillRect(-50, -50, 100, 100);

    ctx.restore();
  }
  
}




