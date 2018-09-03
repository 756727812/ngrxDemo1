import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import * as angular from 'angular';
import * as md5 from 'md5';;
import * as _ from 'lodash';;

export const fashionSelectedGoods = {
  template: require('./fashion-selected-goods.template.html'),
  controller: selectedGoodsController,
};

selectedGoodsController.$inject = ['$routeParams', '$q', '$location', 'fashionService', 'dataService', '$log', 'seeModal', 'Notification'];
function selectedGoodsController($routeParams: ng.route.IRouteParamsService, $q: ng.IQService, $location: ng.ILocationService, fashionService, dataService: IDataService, $log: ng.ILogService, seeModal: ISeeModalService, Notification: INotificationService) {
  const $ctrl = this;
  const page = $routeParams.page || 1;

  $ctrl.searchForm = {
    keyword: $routeParams.keyword,
  };
  $ctrl.submitSearch = submitSearch;
  $ctrl.selectedChanged = selectedChanged;
  $ctrl.selectedChangedAll = selectedChangedAll;
  $ctrl.materialFavorItemCancel = materialFavorItemCancel;
  $ctrl.materialFavorItemCancelAll = materialFavorItemCancelAll;
  $ctrl.deleteItem = deleteItem;
  $ctrl.onAddWarehouseSuccess = () => materialFavorItemList();
  $ctrl.onSellGoodsSuccess = () => materialFavorItemList();

  $ctrl.$onInit = activate;

  $ctrl.is_checked_all = false;
  $ctrl.check_ids = '';
  $ctrl.cur_id = '';
  $ctrl.cur_sign = '';

  function activate() {
    dataService.checkShopStatus({ url: $location.path(), status: '' });

    const promises = [materialFavorItemList()];
    return $q.all(promises).then(function () {
      $log.info('选品库视图激活！');
    });
  }

  function deleteItem(item_id) {
    dataService.item_deleteItem({ item_id }).then(() => Notification.success());
  }

  function submitSearch() {
    $location.search(angular.extend({}, $location.search(), $ctrl.searchForm));
  }

  function selectedChangedAll() {
    _.forEach($ctrl.selected_goods_list, (v, i) => {
      v.is_checked = $ctrl.is_checked_all;
    });

    $ctrl.selectedChanged();
  }

  function selectedChanged() {
    $ctrl.check_ids = '';
    _.forEach($ctrl.selected_goods_list, (v, i) => {
      if (v.is_checked) {
        if ($ctrl.check_ids != '') {
          $ctrl.check_ids += ',';
        }
        $ctrl.check_ids += v.item_id;
      }
    });
    console.log('choice:', $ctrl.check_ids);
  }

  function materialFavorItemList() {
    const params = {
      page,
      page_size: 20,
      keyword: $ctrl.searchForm.keyword,
      is_v2: 1,
    };
    return dataService.data_api_materialFavorItemList(params).then(function (res) {
      $ctrl.selected_goods_list = res.data.list;
      $ctrl.total_items = res.data.count;
      $ctrl.cur_id = res.data.backend_id;
      $ctrl.cur_sign = md5('xx!@$8789seel!#0' + Number($ctrl.cur_id));
      _.forEach($ctrl.selected_goods_list, (v, i) => {
        v.is_checked = false;
      });
      return $ctrl.selected_goods_list;
    });
  }

  function materialFavorItemCancelAll() {
    seeModal.confirm('确认提示', '确认要批量取消收藏', () => {
      fashionService.materialFavorItemAdd($ctrl.check_ids, 1).then(function () {
        dataService.updateFavourCount({});
        return activate();
      });
    },               () => {

    });
  }

  function materialFavorItemCancel(item_id) {
    seeModal.confirm('确认提示', '确认要取消收藏该商品', () => {
      fashionService.materialFavorItemAdd(item_id, 1).then(function () {
        dataService.updateFavourCount({});
        return activate();
      });
    },               () => {

    });
  }
}
// })();
