import {
  Component,
  OnInit,
  AfterContentInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-event-table-alert-v2',
  templateUrl: './table-alert-v2.component.html',
  styleUrls: ['./table-alert-v2.component.less'],
})
export class EventTableAlertV2Component implements OnInit {
  @Input() selectedCount: number = 0;
  @Output() clearChecked: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {}

  clear() {
    this.clearChecked.emit();
  }
}
