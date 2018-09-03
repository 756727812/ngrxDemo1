import { IDataService } from '../../services/data-service/data-service.interface'
import { ISeeModalService } from '../../services/see-modal/see-modal.interface'
import * as angular from 'angular'
import * as _ from 'lodash';

export class modalConfigController {
  list_config: Array<any>
  is_edit: number
  index: number
  //'show_edit'
  static $inject = ['$uibModalInstance', '$routeParams', 'api_info', 'dataService', 'seeModal']
  constructor(
    private $uibModalInstance: any,
    private $routeParams: any,
    private api_info: any,
    private dataService: IDataService,
    private seeModal: ISeeModalService
  ) {
    this.index = 0;
    this.is_edit = 0;
    this.list_config = this.api_info.list_config;
    /*  界面测试时用
    for(var i=1;i<10;i++){
      this.list_config.push(
        {
          config_id:i,
          api_id:this.api_info.api_id,
          type:i,
          minutes:i,
          num:i,
          num_warning:i,
          is_edit: 0,
        }
      )
    }*/

    _.forEach(this.list_config, (v, i) => {
      this.list_config[i].is_edit = 0;
      this.list_config[i].index = this.index++;
    })

  }

  startEdit(config, is_edit) {
    config.is_edit = is_edit;
  }

  saveEdit(config) {
    if (config.config_id == 0) {
      this.dataService.security_configAdd({
        api_id: this.api_info.api_id,
        type: config.type,
        minutes: config.minutes,
        num: config.num,
      }).then(res => {
        config.is_edit = 0;
        config.config_id = res.data.config_id;
        this.is_edit = 1;
      })
    } else {
      this.dataService.security_configSet({
        config_info: JSON.stringify({
          config_id: config.config_id,
          type: config.type,
          minutes: config.minutes,
          num: config.num,
        })
      }).then(res => {
        config.is_edit = 0;
        this.is_edit = 1;
      })
    }

  }

  setConfigIngore(config, name, title, is_ingore) {
    this.seeModal.confirmP(name, title)
      .then(() => this.dataService.security_configSet({
        config_info: JSON.stringify({
          config_id: config.config_id,
          is_ingore,
        })
      }).then(res => {
        this.is_edit = 1;
        config.is_ingore = is_ingore;
      }))
  }

  newConfig() {
    this.index++;
    this.list_config.push(
      {
        config_id: 0,
        api_id: this.api_info.api_id,
        type: '',
        minutes: 0,
        num: 0,
        num_warning: 0,
        is_edit: 1,
        index: this.index,
        is_ingore: 1,
      }
    );
  }

  ok() {
    this.$uibModalInstance.close({ is_edit: this.is_edit });
  }


  cancel() {
    this.$uibModalInstance.close({ is_edit: this.is_edit });
  }

}


