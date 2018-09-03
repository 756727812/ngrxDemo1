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
  selector: 'see-quick-jumper',
  templateUrl: './quick-jumper.component.html',
  styleUrls: ['./quick-jumper.component.less'],
})
export class SeeQuickJumperComponent implements OnInit {
  @Input() maxPage: number = 0;
  @Output() quickJumperFun: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {}

  _quickJumperFun = event => {
    const newPage = +event.target.value;
    if (
      event.keyCode === 13 &&
      Number.isInteger(newPage) &&
      newPage > 0 &&
      newPage <= this.maxPage
    ) {
      this.quickJumperFun.emit(newPage);
    }
  };
}
