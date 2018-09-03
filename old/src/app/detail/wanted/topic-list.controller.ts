/**
 * 专题列表
 */
import * as angular from 'angular';
export {
  topicListController
}
topicListController.$inject = ['$scope', '$location', '$routeParams', 'dataService', 'seeModal', 'Notification', '$timeout'];
function topicListController($scope, $location, $routeParams, dataService, seeModal, Notification, $timeout) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.topicList = [];
  $scope.isActive1 = true;
  $scope.isActive = false;
  $scope.draft_falg = false;
  $scope.use_falg = true;
  $scope.edit_button_flag = false;
  const flag = $routeParams.flag; //保存草稿之后跳转标示
  const cir_id = $routeParams.cir_id; //保存草稿之后跳转标示
  if (flag && flag == 1) {
    //草稿专题列表
    dataService.topic_searchTopicList({
      topicStatus: 4,
      cir_id
    }).then(res => {
      $scope.draft_falg = true;
      $scope.use_falg = false;
      $scope.isActive1 = false;
      $scope.isActive = true;
      $scope.topicList = res.data
    });
  } else {
    //已发布专题列表
    const params = $routeParams.cir_id ? {
      cir_id: $routeParams.cir_id
    } : {};

    dataService.topic_getTopicList(params).then(res => {
      $scope.topicList = res.data.topicList
      $scope.http_host = res.data.http_host
    })
  }
  dataService.topic_get_api_url()
    .then(res => $scope.api_url = res.data.api_url)
  //搜索专题
  $scope.searchTopicList = function(action) {
    switch (action) {
      //搜索
      case 1:
        dataService.topic_searchTopicList($scope.searchData).then(res => $scope.topicList = res.data)
        break;
      //草稿箱列表
      case 2:
        dataService.topic_searchTopicList({
          topicStatus: 4,
          cir_id
        }).then(res => {
          $scope.draft_falg = true;
          $scope.use_falg = false;
          $scope.edit_button_flag = true;
          $scope.isActive1 = false;
          $scope.isActive = true;
          //获得参数
          $scope.topicList = res.data
        })
        break;
      //已发布列表
      case 3:
        dataService.topic_searchTopicList({
          topicStatus: 2,
          cir_id
        }).then(res => {
          $scope.draft_falg = false;
          $scope.use_falg = true;
          $scope.edit_button_flag = false;
          $scope.isActive1 = true;
          $scope.isActive = false;
          //获得参数
          $scope.topicList = res.data;
        });
        break;
    }
  };
  //删除专题
  $scope.delTopic = function(topic_id) {
    seeModal
      .confirmP('删除专题', '确定删除该专题？')
      .then(() => dataService.topic_delTopic({ topic_id }).then(res => {
        Notification.success('删除成功！')
        return $scope.searchTopicList(3)
      }))
  };
  // 删除草稿箱专题
  $scope.delDraftTopic = function(id) {
    seeModal
      .confirmP('删除专题', '确定删除该草稿专题？')
      .then(() => dataService.topic_delDraftTopic({ topic_id: id }).then(res => {
        Notification.success('删除成功！');
        return $scope.searchTopicList(2)
      }))
  }
  //发布专题
  $scope.updateTopic = function(topic_id) {
    seeModal
      .confirmP('发布专题', '确定发布该草稿专题？')
      .then(() => dataService.topic_updateDraftTopic({ topic_id }).then(res => {
        Notification.success('发布成功')
        $location.url('/wanted/myCircle/circleInfo').search({
          cir_id,
          flag: 0
        }).hash("topic")
      }))
  };
}

