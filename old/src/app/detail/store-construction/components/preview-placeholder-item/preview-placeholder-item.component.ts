import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-preview-placeholder-item',
  templateUrl: './preview-placeholder-item.component.html',
  styleUrls: ['./preview-placeholder-item.component.less'],
})
export class PreviewPlaceholderItemComponent implements OnInit {
  @Input() width: number;
  @Input() imgHeight: number;
  @Input() bottomBarH: number = 22;
  @Input() dir: string = 'v';

  constructor() {}

  ngOnInit() {}
}
