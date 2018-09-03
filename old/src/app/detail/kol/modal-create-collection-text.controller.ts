import { IDataService } from '../../services/data-service/data-service.interface'
import { ISeeModalService } from '../../services/see-modal/see-modal.interface'
import * as angular from 'angular'

export class modalCreateCollectionTextController {
  form_data: any
  can_reset_head: number
  can_reset_bandner: number
  //'show_edit'
  static $inject = ['$uibModalInstance', '$routeParams', 'id', 'title', 'name', 'dataService', 'seeModal', 'Notification']
  constructor(
    private $uibModalInstance: any,
    private $routeParams: any,
    //private show_edit: string,
    private id: string,
    private title: string,
    private name: string,
    private dataService: IDataService,
    private seeModal: ISeeModalService,
    private Notification: any
  ) {
    this.can_reset_bandner = 0;
    this.can_reset_head = 0;
    id && this.getCollectionById()
    //show_edit = $routeParams['show_edit'] || '0' 
  }

  ok() {
    this.$uibModalInstance.close(this.form_data);
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel')
  }

  resetBanner() {
    this.seeModal.confirm('确认提示', '确认要重置商城背景图？重置后立即生效', () => {
      var params = {
        id: this.form_data.id,
        kol_info_u_banner: '/s/p/public_v2/447/74d/p6x/z8irmswg0wg4ks88gsso8wooko.jpg',
      }
      return this.dataService.collection_collectionSet({
        collection_info: JSON.stringify(params)
      }).then(res => {
        this.Notification.success('重置背景图成功')
        this.form_data.kol_info_u_banner = '/s/p/public_v2/447/74d/p6x/z8irmswg0wg4ks88gsso8wooko.jpg';
        this.can_reset_bandner = 0;
      })
    }, () => {

    })
  }

  resetHead() {
    this.seeModal.confirm('确认提示', '确认要重置头像？重置后立即生效', () => {
      var params = {
        id: this.form_data.id,
        kol_info_u_heading: '',
      }
      return this.dataService.collection_collectionSet({
        collection_info: JSON.stringify(params)
      }).then(res => {
        this.Notification.success('重置头像成功')
        this.form_data.kol_info_u_heading = '';
        this.can_reset_head = 0;
      })
    }, () => {

    })
  }

  private getCollectionById() {
    this.dataService.collection_collectionGet({
      id: this.id
    }).then(res => {
      if (res.data.collection_info.kol_info_u_banner !== '' && res.data.collection_info.kol_info_u_banner !== '/s/p/public_v2/447/74d/p6x/z8irmswg0wg4ks88gsso8wooko.jpg') {
        this.can_reset_bandner = 1;
      }
      if (res.data.collection_info.kol_info_u_heading !== '') {
        this.can_reset_head = 1;
      }
      console.log(res);
      let {
        id,
        title_seckill,
        title_recommend,
        title_more,
        kol_u_id,
        kol_info_u_name,
        kol_info_u_desc,
        kol_info_u_heading,
        kol_info_u_banner
      } = res.data.collection_info
      this.form_data = {
        id,
        title_seckill,
        title_recommend,
        title_more,
        kol_u_id,
        kol_info_u_name,
        kol_info_u_desc,
        kol_info_u_heading,
        kol_info_u_banner
      }
    })
  }

  uploadHeading(res, size) {
    if (res.result === 1) {
      this.form_data.kol_info_u_heading = res.data;
    } else this.Notification.dataError(res.msg);
  }

  uploadBanner(res, size) {
    if (res.result === 1) {
      this.form_data.kol_info_u_banner = res.data;
    } else this.Notification.dataError(res.msg);
  }
}

