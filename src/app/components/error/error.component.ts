import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ErrorComponent {

  @Input() message: string = '';
  @Input() clase: string = '';
  @Input() validation: string = '';
  @Input() control: any = { hasError: () => false, dirty: false, touched: false };

  constructor() { }

}
