import { Component, OnInit, Input } from '@angular/core';
import { PreviewItemComponent } from '../preview-item.component';

@Component({
  selector: 'app-preview-magic-cube',
  templateUrl: './preview-magic-cube.component.html',
  styleUrls: ['./preview-magic-cube.component.less'],
})
export class PreviewMagicCubeComponent extends PreviewItemComponent {
  constructor() {
    super();
  }

  ngOnInit() {}

  selectedStyles(item, i, size) {
    const obj = item.rectangle;
    const _unitSize = 369 / Number(size);
    const left = _unitSize * obj.x1;
    const top = _unitSize * obj.y1;
    const width = _unitSize * (obj.x2 - obj.x1);
    const height = _unitSize * (obj.y2 - obj.y1);
    const style = {
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      height: `${height}px`,
      lineHeight: `${height}px`,
      backgroundColor: item.imgUrl ? '#fff' : '',
      cw: width,
      ch: height,
    };
    return style;
  }

  defaultImgStyle(item) {
    const { x1, x2, y1, y2 } = item.rectangle;
    const x = x2 - x1;
    const y = y2 - y1;
    if (!item.imgUrl) {
      if (y > x) {
        return {
          width: '100%',
        };
      } else {
        return {
          height: '100%',
        };
      }
    }
  }
}
