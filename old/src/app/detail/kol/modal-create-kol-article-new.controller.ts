import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';
import { each, merge } from 'lodash';

export class modalCreateKOLArticleNewController {
  /*
  zhenyong:
  NOTE 别的模块也需要「添加文章」，目前模板用到几个 resolve 数据
  kol.wechat_id 表示有没有微信 id
  $routeParams.show_edit 表示是否编辑
  现在 hack 模拟这些数据，如果模板有修改就要小心
   */
  static openForAddArticle(
    wechat_id: string,
    init_form_data?: { title: string },
  ) {
    const $uibModal: any = angular
      .element(document.body)
      .injector()
      .get('$uibModal');
    return $uibModal.open({
      animation: true,
      template: require('./modal-create-kol-article-new.html'),
      controller: 'modalCreateKOLArticleNewController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        init_form_data: () => init_form_data,
        article_id: () => 0,
        routeParams: () => ({ show_edit: 0 }),
        kol: () => ({ wechat_id }),
      },
    });
  }

  form_data: any = {};
  static $inject = [
    '$uibModalInstance',
    '$routeParams',
    'article_id',
    'dataService',
    'kol',
    'init_form_data',
  ];
  constructor(
    private $uibModalInstance: any,
    private $routeParams: any,
    private article_id: string,
    private dataService: IDataService,
    private kol: string,
    private init_form_data: string,
  ) {
    article_id && this.getArticleById();
    init_form_data && merge(this.form_data, init_form_data);
  }

  get modalTitle() {
    return !this.article_id || ~~this.article_id === 0 ? '添加文章' : '编辑文章';
  }

  gotoAddWechatId() {
    this.$uibModalInstance.close(null);
  }

  ok() {
    this.form_data.article_type = 1;
    this.form_data.from_type = 1;
    this.$uibModalInstance.close(
      merge({}, this.form_data, {
        start_time: this.form_data.start_time / 1000,
      }),
    );
  }

  cancel() {
    console.log('!');
    this.$uibModalInstance.dismiss('cancel');
  }

  private getArticleById() {
    this.dataService
      .kol_mgr_articleGet({
        article_id: this.article_id,
      })
      .then(res => {
        const {
          kol_id,
          article_id,
          floor_level,
          title,
          start_time,
          url,
          from_type,
          from_collection_id,
          act_order,
          act_gmv,
          is_new,
          from_article_id,
        } = res.data.article_info;
        this.form_data = {
          kol_id,
          article_id,
          floor_level,
          title,
          url,
          from_type,
          from_collection_id,
          act_order,
          act_gmv,
          is_new,
          from_article_id,
          start_time: new Date(start_time * 1000),
        };
      });
  }
}
