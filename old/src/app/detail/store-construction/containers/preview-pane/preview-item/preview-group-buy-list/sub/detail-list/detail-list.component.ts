import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-preview-group-detail-list',
  templateUrl: './detail-list.component.html',
  styleUrls: ['./detail-list.component.less'],
})
export class PreviewGroupDetailListComponent {
  @Input() items: any[] = [];

  constructor() {}
}
