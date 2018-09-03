// namespace seego.fashion {
// const version: number = +new Date()
import { IDataService } from '../../services/data-service/data-service.interface'
import { INotificationService } from '../../services/notification/notification.interface'
import { ISeeModalService } from '../../services/see-modal/see-modal.interface'
import * as _ from 'lodash';
import * as moment from 'moment';
import * as md5 from 'md5';
export class fashionService {

  static $inject = ['$uibModal', '$q', '$rootScope', 'Notification', 'seeModal', '$location', 'dataService']

  constructor(
    private $uibModal,
    private $q: ng.IQService,
    private $rootScope: ng.IRootScopeService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $location: ng.ILocationService,
    private dataService: IDataService
  ) { }

  fashionDetail(item) {
    this.$uibModal.open({
      animation: true,
      template: require('./modal-material-detail.html'),
      controller: 'modalMaterialDetailController',
      controllerAs: 'vm',
      size: 'md',
      resolve: {
        item: () => item
      }
    })
  }

  applyNewLib(catalogs, uid, type) {
    const datas = { data: catalogs, type: (type || '') };
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-apply-new-lib.html'),
      controller: 'modalApplyNewLibController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        catalogs: () => datas
      }
    })
    return modalInstance.result.then(params => {
      _.assign(params, {
        uid: uid || 0,
        skey: md5('Seeu_' + moment().format('YYYY-MM-DD')),
      })
      return this.dataService.crawler_add_new_required(params).then(res => {
        this.Notification.success('提交成功！')
        this.$rootScope.$broadcast('addNewStatus', true)
      })
      // this.$rootScope.$broadcast('materialList', params);
    })
  }

  applyCustomLib(catalogs, uid) {
    const datas = { data: catalogs, uid };
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-apply-custom-lib.html'),
      controller: 'modalApplyCustomLibController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'lg',
      resolve: {
        catalogs: () => datas
      }
    })
  }

  addToFavorite(item_id, uid) {
    return this.dataService.crawler_addToFavoriteList({
      skey: md5('Seeu_' + moment().format('YYYY-MM-DD')),
      uid: uid || 0,
      item_id,
    }).then(res => this.Notification.success('收藏成功！'))
  }

  removeFavoriteItem(item_id, uid, cb) {
    this.seeModal.confirm('取消收藏', '确定要取消收藏吗？', () => {
      this.dataService.crawler_removeFavoriteItem({
        skey: md5('Seeu_' + moment().format('YYYY-MM-DD')),
        uid: uid || 0,
        item_id
      }).then(res => {
        this.Notification.success('取消收藏成功！')
        cb && cb();
      })
    })
  }

  generateWish(desc, img_url) {
    this.$location.path('/wanted/publish-article').search({
      'from': 'fashion',
      title: encodeURIComponent(desc),
      img_url: encodeURIComponent(img_url),
    })
  }

  getPlatform(uid) {
    return this.dataService.crawler_getPlatform({ uid }).then(res => res.data)
  }

  getCatalog() {
    return this.dataService.crawler_getCatalog().then(res => res.data)
  }

  getUid() {
    if (this.$rootScope['uid']) {
      return this.$q.when(this.$rootScope['uid']);
    } else {
      return this.dataService.seller_getSellerDetail().then(res => res.data.user_info.u_id || 0)
    }
  }

  addGoodsModal() {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-item-add-list.html'),
      controller: 'modalItemAddListController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
    })
    return modalInstance.result.then(ids =>
      this.dataService.data_api_materialAddItems({
        ids,
        is_v2: 1,
      }).then(res => {
        this.Notification.success('提交成功！')
        return ids
      })
    )
  }

  //单品库：添加品牌
  addBrandModal(kol_brand_id) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-brand-add-list.html'),
      controller: 'modalBrandAddListController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        kol_brand_id: () => kol_brand_id
      }
    })
    if (kol_brand_id > 0) {
      return modalInstance.result.then(params => {
        return this.dataService.data_api_materialBrandSet({
          kol_brand_info: JSON.stringify(params)
        }).then(res => {
          this.Notification.success('编辑品牌成功')
        })
      })
    } else {
      return modalInstance.result.then(params => {
        return this.dataService.data_api_materialBrandAdd({
          kol_brand_info: JSON.stringify(params)
        }).then(res => {
          this.Notification.success('创建品牌成功')
        })
      })
    }
  }

  //删除
  materialBrandDelete(kol_brand_id, cb) {
    this.seeModal.confirm('删除榜单', '确认要删除榜单吗？', () => {
      this.dataService.data_api_materialBrandDelete({
        kol_brand_id
      }).then(res => {
        this.Notification.success('删除榜单成功')
        cb && cb();
      })
    })
  }

  materialSupplyPrice(item_id, supply_price_start, supply_price_end) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-edit-supply-price.html'),
      controller: 'modalEditSupplyPriceController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        supply_price_start: () => supply_price_start,
        supply_price_end: () => supply_price_end
      }
    })
    return modalInstance.result.then(params =>
      this.dataService.data_api_materialSupplyPrice({
        item_id,
        start_price: params.start_price,
        end_price: params.end_price,
      }).then(res => {
        this.Notification.success('修改供货价格成功！')
        return params
      })
    )
  }

  materialFavorItemAdd(item_id, del) {
    return this.dataService.data_api_materialFavorItemAdd({
      item_id,
      del,
    }).then(res => {
      this.Notification.success(`${del === 1 ? '取消' : '收藏'}成功！`);
      return item_id
    })
  }
}

//   angular
//     .module('seego.fashion')
//     .service('fashionService', fashionService)
// }
