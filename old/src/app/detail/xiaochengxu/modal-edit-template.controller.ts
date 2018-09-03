import { IDataService } from '../../services/data-service/data-service.interface';

import Injector from '../../utils/injector';

export class modalEditTemplateController {
  static open = function open(id) {
    return Injector.getUibModal().open({
      animation: true,
      template: require('./modal-edit-template.html'),
      controller: modalEditTemplateController,
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        template_info: () =>
          new Promise(resolve => {
            if (id) {
              Injector.getDataService()
                .weixin_getTemplateInfo({ id })
                .then(({ data }) => resolve(data));
            } else {
              resolve({
                id: 0,
                template_id: 0,
                user_version: '',
                user_desc: '',
                type: '0',
              });
            }
          }),
      },
    });
  };

  static $inject: string[] = [
    '$scope',
    '$q',
    '$uibModalInstance',
    'template_info',
    'dataService',
  ];

  typeOptions: {
    tmeplate_type: string;
    tmeplate_str: string;
  }[] = [];

  constructor(
    private $scope: any,
    private $q: ng.IQService,
    private $uibModalInstance: any,
    private template_info: any,
    private dataService: IDataService,
  ) {
    this.getTplTypeOptions();
  }

  getTplTypeOptions() {
    this.dataService.weixin_getTplTypeOptions({}).then(({ data }) => {
      this.typeOptions = data;
    });
  }

  ok() {
    this.$uibModalInstance.close({ template_info: this.template_info });
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }
}
