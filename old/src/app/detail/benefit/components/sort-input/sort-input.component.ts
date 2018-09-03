import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'sort-input',
  templateUrl: './sort-input.component.html',
  styleUrls: ['./sort-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortInputComponent {
  isFold: boolean = true;
  @Input() sort: number | string | null = 0;
  @Output() sortChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() sortChange1: EventEmitter<any> = new EventEmitter<any>();
  @Input() isDisabled: boolean = false;
  @Input() isBenefit: boolean = false;

  toggle() {
    this.isFold = !this.isFold;
  }

  saveData(rawValue) {
    this.isFold = true;
    const srcValue = this.sort;
    if (!rawValue || isNaN(rawValue)) {
      this.sort = srcValue;
      this.sortChange.emit(-1);
      return;
    }
    const value = parseInt(rawValue, 10);
    if (`${value}`.length > 10) {
      this.sort = srcValue;
      return this.sortChange.emit(-2);
    }
    if (value >= 0) {
      this.sort = value;
      if (this.isBenefit) {
        return this.sortChange1.emit({ target: this, data: value });
      }
      this.sortChange.emit(this.sort);
    }
  }
}
