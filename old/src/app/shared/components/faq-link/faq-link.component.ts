import { Component, OnInit, Input } from '@angular/core';
import { flatMap, find } from 'lodash';
import faqConfig from 'app/detail/faq/const';

const flatSubItems = flatMap(
  faqConfig.list,
  (item: any) =>
    item.items &&
    item.items.map(sub => {
      sub.pid = item.id;
      return sub;
    }),
);

@Component({
  selector: 'faq-link',
  template: `<a class="faq-href-a" [href]="href" target="_blank"><ng-content></ng-content></a>`,
  styles: [
    `
    :host ::ng-deep .faq-href-a{
      cursor: pointer;
      width: 100%;
      height: 100%;
    }
  `,
  ],
})
export class FaqLinkComponent {
  href: string;
  @Input()
  set name(name: string) {
    const subItem = find(flatSubItems, { name });
    if (subItem) {
      const { title, href } = subItem;
      this.href = `/help-doc.html?title=${encodeURIComponent(
        title,
      )}&src=${encodeURIComponent(href)}`;
    }
  }
  @Input()
  set folderName(folderName: string) {
    const item = find(faqConfig.list, (item: any) => item.name === folderName);
    if (item) {
      this.href = `/faq#${item.id}`;
    }
  }

  constructor() {}
}
