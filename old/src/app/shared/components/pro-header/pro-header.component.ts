import {
  Component,
  OnInit,
  Input,
  ContentChild,
  TemplateRef,
  ElementRef,
} from '@angular/core';

export type HeaderPath = {
  title: string;
  link?: string;
};

@Component({
  selector: 'pro-header',
  templateUrl: 'pro-header.component.html',
  styleUrls: ['./pro-header.component.less'],
  preserveWhitespaces: false,
})
export class ProHeaderComponent implements OnInit {
  @Input() title: string;
  /** 导航信息数组 */
  @Input() paths: HeaderPath[] = [];

  @ContentChild('action') action: TemplateRef<any>;

  @ContentChild('status') status: TemplateRef<any>;

  @ContentChild('content') content: TemplateRef<any>;

  @ContentChild('extra') extra: TemplateRef<any>;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    (this.el.nativeElement as HTMLElement).classList.add(
      'content__title',
      'pro-header',
    );
  }
}
