import {
  Component,
  OnInit,
  Output,
  Input,
  OnDestroy,
  forwardRef,
  ViewChild,
  EventEmitter,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { find, map, get, indexOf, isEmpty } from 'lodash';
import { BiService } from '../../services/bi.service';
import { bizAccessChecker } from '../../../../utils/permission-helper';
@Component({
  selector: 'app-bi-right-nav',
  templateUrl: './right-nav.component.html',
  styleUrls: ['./right-nav.component.less'],
})
export class BiRightNavComponent implements OnInit {
  @Input() label;
  @Input() href;
  powerAccess = false;

  constructor(private biService: BiService) {}

  ngOnInit() {
    this.powerAccess = bizAccessChecker.isKol();
  }
}
