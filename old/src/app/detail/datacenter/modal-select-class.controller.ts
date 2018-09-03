import * as _ from 'lodash';;
import { debug } from 'util';

export class modalSelectClassController {
  static $inject: string[] = [
    '$uibModalInstance',
    'selected_class',
    'class_list',
  ];
  isSelected = 'false';
  constructor(
    private $uibModalInstance: any,
    private selected_class: Array<any>,
    private class_list: Array<any>,
  ) {
    selected_class.length &&
      _.forEach(selected_class, v => (v.selected = true));
  }

  ok: () => void = () => this.$uibModalInstance.close(this.selected_class);
  // ok: () => void = () => console.log(this.selected_class);

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');

  onSelect: (ivhNode: any, ivhIsSelected: boolean, ivhTree: any) => void = (
    ivhNode,
    ivhIsSelected,
    ivhTree,
  ) => {
    /* this.isSelected = true; */
    if (ivhIsSelected) this.selected_class.push(ivhNode);
    else {
      const i = _.findIndex(
        this.selected_class,
        o => o.class_id === ivhNode.class_id,
      );
      this.selected_class.splice(i, 1);
    }
  };

  onSelectSingle: (ivhNode: any, ivhIsSelected: boolean, ivhTree: any) => void = (
    ivhNode,
    ivhIsSelected,
    ivhTree,
  ) => {
    this.selected_class = [ivhNode];
  };

  select: () => any = () => {
    console.log(1);
  };
}
