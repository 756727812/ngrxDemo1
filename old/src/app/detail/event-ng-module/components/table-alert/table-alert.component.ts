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
  selector: 'app-event-table-alert',
  templateUrl: './table-alert.component.html',
  styleUrls: ['./table-alert.component.less'],
})
export class EventTableAlertComponent implements OnInit {
  @Input() hasSelectedAll: boolean = false;
  @Input() selectedCount: number = 0;
  @Output() checkedAll: EventEmitter<any> = new EventEmitter<any>();
  @Output() clearChecked: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {}

  clear() {
    this.clearChecked.emit();
  }
  checkAll() {
    this.checkedAll.emit();
  }
}
