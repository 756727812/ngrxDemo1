import { flatMap, find } from 'lodash';
import faqConfig from './const';
const flatSubItems = flatMap(
  faqConfig.list,
  (item: any) =>
    item.items &&
    item.items.map(sub => {
      sub.pid = item.id;
      return sub;
    }),
);
import { getDocPageHref } from './helper';

export class Controller {
  name: string;
  folderName: string;
  href: string;

  $onInit() {
    if (this.folderName) {
      const item = find(
        faqConfig.list,
        (item: any) => item.name === this.folderName,
      );
      if (item) {
        this.href = `/faq#${item.id}`;
      }
    } else if (this.name) {
      const subItem = find(flatSubItems, { name: this.name });
      if (subItem) {
        const { title, href } = subItem;
        this.href = `/help-doc.html?title=${encodeURIComponent(
          title,
        )}&src=${encodeURIComponent(href)}`;
      }
    }
  }
}

export const faqLink: ng.IComponentOptions = {
  template: `<a class="faq-href-a" ng-href="{{$ctrl.href}}" target="_blank"><ng-transclude/></a>`,
  controller: Controller,
  transclude: true,
  bindings: {
    name: '@',
    folderName: '@',
  },
};
