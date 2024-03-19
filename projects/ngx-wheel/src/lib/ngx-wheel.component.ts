import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  Output,
  EventEmitter,
} from '@angular/core';
export interface Item {
  text: string;
  fillStyle: string;
  id: any;
}
export enum TextAlignment {
  INNER = 'inner',
  OUTER = 'outer',
  CENTER = 'center',
}

export enum TextOrientation {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  CURVED = 'curved',
}

@Component({
  selector: 'ngx-wheel',
  template: `
    <canvas
      (click)="!disableSpinOnClick && spin()"
      id="canvas"
      [width]="width"
      [height]="height + 40"
    >
          Canvas not supported, use another browser.
    </canvas>
  `,
  styles: [],
})
export class NgxWheelComponent implements OnInit, AfterViewInit {
  constructor() {}

  @Input() height: number;
  @Input() idToLandOn: any;
  @Input() width: number;
  @Input() items: Item[];
  @Input() spinDuration: number;
  @Input() spinAmount: number;
  @Input() innerRadius: number;
  @Input() pointerStrokeColor: string;
  @Input() pointerFillColor: string;
  @Input() disableSpinOnClick: boolean;
  @Input() textOrientation: TextOrientation;
  @Input() textAlignment: TextAlignment;
  @Input() borderColor: string = '#5b006b';

  @Output() onSpinStart: EventEmitter<any> = new EventEmitter();
  @Output() onSpinComplete: EventEmitter<any> = new EventEmitter();

  wheel: any;
  completedSpin: boolean = false;
  isSpinning: boolean = false;

  reset() {
    this.wheel.stopAnimation(false);
    this.wheel.rotationAngle = 0;
    this.wheel.ctx.clearRect(
      0,
      0,
      this.wheel.ctx.canvas.width,
      this.wheel.ctx.canvas.height
    );
    this.isSpinning = false;
    this.completedSpin = false;
    this.ngAfterViewInit();
  }

  ngOnInit(): void {}

  spin() {
    if (this.completedSpin || this.isSpinning) return;
    this.isSpinning = true;
    this.onSpinStart.emit(null);
    const segmentToLandOn = this.wheel.segments
      .filter((x) => !!x)
      .find(({ id }) => this.idToLandOn === id);
    const segmentTheta = segmentToLandOn.endAngle - segmentToLandOn.startAngle;
    this.wheel.animation.stopAngle =
      segmentToLandOn.endAngle - segmentTheta / 4;
    // Start the spin animation
    this.wheel.startAnimation();

    // Redraw inner wheel animation, border circle, and pointer continuously during the spin animation
    const draw = () => {
      const ctx = this.wheel.ctx;
      ctx.clearRect(0, 0, this.width, this.height); // Clear the canvas

      // Draw inner wheel animation
      this.wheel.draw();

      // Draw border circle
      this.drawBorderCircle();

      // Draw pointer
      this.drawPointer();

      if (this.isSpinning) {
        requestAnimationFrame(draw);
      }
    };

    draw();
    // Set a timeout to mark spin as completed
    setTimeout(() => {
      this.completedSpin = true;
      this.onSpinComplete.emit(null);
    }, this.spinDuration * 1000);
  }
  ngAfterViewInit() {
    const segments = this.items;
    // Initialize the wheel

    // @ts-ignore
    this.wheel = new Winwheel({
      numSegments: segments.length,
      segments,
      innerRadius: this.innerRadius || 0,
      outerRadius: this.height / 2 - 20,

      centerY: this.height / 2 + 20,
      textOrientation: this.textOrientation,
      textAligment: this.textAlignment,

      drawText: true, // Set to true if you want to draw text in the segments.

      animation: {
        type: 'spinToStop', // Type of animation.
        duration: this.spinDuration, // How long the animation is to take in seconds.
        spins: this.spinAmount, // The number of complete 360 degree rotations the wheel is to do.
      },
    });

    // Bind the drawPointer method
    // @ts-ignore
    TweenMax.ticker.addEventListener('tick', this.drawPointer.bind(this));
    // @ts-ignore

    // Draw the border circle initially
    this.drawBorderCircle();
  }

  ngOnDestroy() {
    // @ts-ignore
    TweenMax.ticker.removeEventListener('tick');
  }
  // Draw the border circle
  drawBorderCircle() {
    const ctx = this.wheel.ctx;
    const centerX = this.width / 2;
    const centerY = this.height / 2 + 20;
    const outerRadius = this.height / 2 - 20;
    const innerRadius = outerRadius - 10; // Adjust the inner border thickness as needed
    const outer = outerRadius + 10;
    // Draw  border
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 28;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw inner border
    ctx.strokeStyle = '#f1662e'; // Orange color
    ctx.lineWidth = 5; // Adjust the inner border thickness as needed
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw outer border
    ctx.strokeStyle = '#f1662e'; // Orange color
    ctx.lineWidth = 5; // Adjust the inner border thickness as needed
    ctx.beginPath();
    ctx.arc(centerX, centerY, outer, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw another inner border
    ctx.strokeStyle = 'gold'; // Change color as desired
    ctx.lineWidth = 10; // Adjust the inner border thickness as needed
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 300, 0, 2 * Math.PI);
    ctx.stroke();

    //Fill the wheel hole
    ctx.strokeStyle = '#5b006b'; // Change color as desired
    ctx.lineWidth = 16; // Adjust the inner border thickness as needed
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 300, 0, 2 * Math.PI);
    ctx.stroke();

    const numBalls = 15;
    const ballRadius = 6;
    const angleIncrement = (2 * Math.PI) / numBalls;

    // Set shadow properties for all balls
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#f5c625';

    // Draw small light balls inside the circle
    for (let i = 0; i < numBalls; i++) {
      const angle = i * angleIncrement;
      const x = centerX + outerRadius * Math.cos(angle);
      const y = centerY + outerRadius * Math.sin(angle);

      ctx.fillStyle = '#f4bd27'; // Change color as desired
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Reset shadow properties
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  }

  drawPointer() {
    let c = this.wheel.ctx;
    const pointerTopY = 52; // Adjust the top y-coordinate of the pointer
    const pointerBottomY = 92; // Adjust the bottom y-coordinate of the pointer

    // Create pointer.
    if (c) {
      c.save();
      c.lineWidth = 5;
      c.strokeStyle = this.pointerStrokeColor;
      c.fillStyle = this.pointerFillColor;
      c.beginPath();
      c.moveTo(this.width / 2 - 20, pointerTopY);
      c.lineTo(this.width / 2 + 20, pointerTopY);
      c.lineTo(this.width / 2, pointerBottomY);
      c.lineTo(this.width / 2 - 20, pointerTopY);
      c.stroke();
      c.fill();
      c.restore();
    }
  }
}
