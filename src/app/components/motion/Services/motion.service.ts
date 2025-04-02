//src/app/components/motion/Services/motion.service.ts
import { Injectable } from '@angular/core';
import { Motion } from '@capacitor/motion';
import { PluginListenerHandle } from '@capacitor/core';
import { MotionData } from '../Model/MotionData.model';



@Injectable({
  providedIn: 'root'
})
export class MotionService {
  private accelListener?: PluginListenerHandle;
  private gyroListener?: PluginListenerHandle;

  constructor() { }

  async startMotionDetection(callback: (data: MotionData) => void) {
    const motionData: MotionData = {};

    this.accelListener = await Motion.addListener('accel', (event) => {
      motionData.acceleration = event.acceleration;
      // Calcular el ángulo de inclinación utilizando el acelerómetro
      const x = event.acceleration.x;
      const y = event.acceleration.y;
      const z = event.acceleration.z;

      // Calculamos el ángulo (en grados)
      const angle = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);

      // Pasamos los datos de aceleración y el ángulo calculado
      motionData.angle = angle;
      callback(motionData);
    });

    // Listener para los datos del giroscopio
    this.gyroListener = await Motion.addListener('orientation', (event) => {
      motionData.rotation = {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma
      };
      callback(motionData);
    });
  }


  async stopMotionDetection() {
    if (this.accelListener) {
      await this.accelListener.remove();
    }
    if (this.gyroListener) {
      await this.gyroListener.remove();
    }
  }
}
