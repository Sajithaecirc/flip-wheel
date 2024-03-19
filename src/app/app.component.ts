import { Component, ViewChild } from '@angular/core';
import {
  NgxWheelComponent,
  TextAlignment,
  TextOrientation,
} from 'projects/ngx-wheel/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  @ViewChild(NgxWheelComponent, { static: false }) wheel;

  seed = [...Array(10).keys()];
  idToLandOn: any;
  items: any[];
  textOrientation: TextOrientation = TextOrientation.HORIZONTAL;
  textAlignment: TextAlignment = TextAlignment.OUTER;

  ngOnInit() {
    this.idToLandOn = this.seed[Math.floor(Math.random() * this.seed.length)];
    const purpleColor = '#580252';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(50, 450, 520, 50);
    gradient.addColorStop(0, '#f1662e');
    gradient.addColorStop(1, '#f5c625');

    this.items = this.seed.map((value, index) => ({
      fillStyle: index % 2 === 0 ? purpleColor : gradient, // Alternate between purple and gradient based on index
      text: `Prize ${value}`,
      id: value,
      textFillStyle: 'white',
      textFontSize: '16',
    }));
  }

  reset() {
    this.wheel.reset();
  }
  before() {
    alert('Your wheel is about to spin');
  }

  async spin(prize) {
    this.idToLandOn = prize;
    await new Promise((resolve) => setTimeout(resolve, 0));
    this.wheel.spin();
  }

  after() {
    alert('You have been bamboozled');
  }
}
