import { Component, inject, Input } from '@angular/core';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-typing-indicator',
  templateUrl: './typing-indicator.component.html',
  styleUrls: ['./typing-indicator.component.scss'],
  standalone: true
})
export class TypingIndicatorComponent {

  @Input() contactName: string = '';
  @Input() contactAvatar: string = '';
  _service: ServiceService = inject(ServiceService);

  constructor() { }

}
