import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-typing-indicator',
  templateUrl: './typing-indicator.component.html',
  styleUrls: ['./typing-indicator.component.scss'],
  standalone: true
})
export class TypingIndicatorComponent  implements OnInit {

  @Input() contactName: string = '';
  @Input() contactAvatar: string = '';

  constructor() { }

  ngOnInit() {}

}
