import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-preview-group-double-list',
  templateUrl: './double-list.component.html',
  styleUrls: ['./double-list.component.less'],
})
export class PreviewGroupDoubleListComponent {
  @Input() items: any[] = [];

  constructor() {}
}
