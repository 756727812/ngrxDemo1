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
  OnChanges,
  NgZone,
} from '@angular/core';
import { find, map, get, indexOf, isEmpty } from 'lodash';
import { BiService } from '../../services/bi.service';
import { bizAccessChecker } from '../../../../utils/permission-helper';

const TIPS_MAP = {
  TRADE_SUMMARY: '',
};

@Component({
  selector: 'app-bi-btn-export',
  templateUrl: './btn-export.component.html',
  styleUrls: ['./btn-export.component.less'],
})
export class BiBtnExport implements OnInit {
  @Input() name: string;
  @Input() params: object | string[];
  url: string;
  constructor(private biService: BiService, private zone: NgZone) {}

  ngOnInit() {
    this.renderUrl();
  }

  renderUrl() {
    this.url = this.params
      ? this.biService.genDownloadUrl(this.name, this.params)
      : '';
  }

  ngOnChanges(change) {
    if (change.params) {
      this.renderUrl();
    }
  }
}
