declare let UE: any
/**
 * 编辑专题--已发布
 */
import * as angular from 'angular';
export const editTopicPublished = {
  controller: editTopicPublishedController,
  template: require('./edit-topic-published.template.html')
}

editTopicPublishedController.$inject = ['$scope', '$location', 'dataService', '$routeParams', '$document', '$timeout', 'Notification', 'Upload', '$http'];
function editTopicPublishedController($scope, $location, dataService, $routeParams, $document, $timeout, Notification, Upload, $http) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }
  $scope.topic_info = {};
  $scope.formData = {};
  $scope.topic_id = $routeParams.topic_id;
  $scope.cir_id = $routeParams.cir_id;
  const cir_id = $routeParams.cir_id;
  dataService.seller_getSellerUser().then(res => {
    $scope.users = res.data;
    $scope.formData.u_id = $scope.users ? $scope.users[0].u_id : '0';
  })
  //获得预览url地址
  dataService.topic_get_api_url().then(res => $scope.api_url = res.data.api_url);
  $scope.addOneContent = function() {
    $scope.formData.contentNum += 1;
    const newContent = {
      text: '',
      con_imgurl: ''
    }
    $scope.topic_info.content_info.push(newContent)
  }

  $scope.delOneContent = function(content_id, index) {
    if (window.confirm("确定删除吗?")) {
      $scope.topic_info.content_info.splice(index, 1);
      $scope.formData.contentNum -= 1;
      dataService.topic_delContent({
        topic_id: $scope.topic_id,
        content_id
      }).then(res => Notification.success("删除成功!"))
    }
  }
  $scope.upProgress = {};
  $scope.uploadVideo = function(file, index) {
    if (file) {
      let _token, _videourl, Qiniu_UploadUrl = "//up.qiniu.com";
      $scope.uploadVideoFlag = true;
      dataService.topic_getUploadVideoToken().then(res => {
        _token = res.data.token;
        _videourl = res.data.file_name;
        $scope.formData["content" + index + "_con_video"] = _videourl;
        $timeout(function() {
          $("#content" + index + "_con_video").val(_videourl)
        })
        Upload.upload({
          url: Qiniu_UploadUrl,
          data: {
            token: _token,
            file
          }
        }).then(function(res) {
          $scope.uploadVideoFlag = false;
          Notification.success("视频上传成功，服务器正在转码！")
          $scope.formData["content" + index + "_debug_video"] = res.data.persistentId + "|" + res.data.key;
          $scope.formData["content" + index + "_con_video_duration"] = res.data.avinfo_duration;
        }, function(res) {
        }, function(evt) {
          const progressPercentage = 100.0 * evt.loaded / evt.total;
          $scope.upProgress[index] = progressPercentage + '% ' + evt.config.data.file.name;
        })
      })
    }
  }

  //更新专题
  $scope.updateTopicDetail = function(action) {
    let content_flag = false;
    const img_flag = false;
    $scope.formData.action = action;
    $scope.formData.desc = $scope.topic_info.desc;
    $scope.formData.collection_id = $scope.topic_info.collection_id;
    $scope.formData.relate_cir_id = $scope.topic_info.relate_cir_id;
    $scope.formData.keyword = $scope.tagsKeywords.map(function(item) { return item.text }).toString().replace(/,/g, '|')
    if (!$scope.formData.desc) {
      Notification.warn("请先填写引言");
      return false;
    }
    //更新专题
    switch (action) {
      case 1:
        getData();
        if (!$scope.formData.name) {
          Notification.warn("请先填写标题");
          return false;
        }
        if (!$scope.formData.contentNum) {

        } else {
          for (let i = 1; i <= $scope.formData.contentNum; i++) {
            if (!$scope.formData['content' + i + '_text']) {
              content_flag = true;
              break;
            }
          }
        }
        if (confirm('是否发布专题')) {
          dataService.topic_updateTopicDetail({
            topic_info: JSON.stringify($scope.formData)
          }).then(res => {
            Notification.success('更新专题成功！');
            $location.url('/wanted/myCircle/circleInfo').search({
              cir_id: $scope.cir_id
            }).hash("topic");
          })
        }
        break;
      case 2:
        getData();
        if (!$scope.formData.name) {
          Notification.warn("请先填写标题");
          return false;
        }
        if (!$scope.formData.contentNum) {

        } else {
          for (let i = 1; i <= $scope.formData.contentNum; i++) {
            if (!$scope.formData['content' + i + '_text']) {
              content_flag = true;
              break;
            }
          }
        }
        dataService.topic_updateTopicDetail($scope.formData).then(res => {
          Notification.success('保存草稿成功！！');
          $location.url('/wanted/topicList');
        })
        break
      case 3:
        //TODO 生成二维码，手机扫描可以预览
        getData1();
        if (!$scope.formData.name) {
          Notification.warn("请先填写标题");
          return false;
        }
        if (!$scope.formData.contentNum) {

        } else {
          for (let i = 1; i <= $scope.formData.contentNum; i++) {
            if (!$scope.formData['content' + i + '_text']) {
              content_flag = true;
              break;
            }
          }
        }
        dataService.topic_updateTopicDetail({
          topic_info: JSON.stringify($scope.formData)
        }).then(res => window.open($scope.api_url + '?id=' + res.data.topic_id));
        break;
    }
  };
  let categoryData = [];
  //接收数据
  const getData1 = function() {
    $scope.formData.topic_id = $scope.topic_id;
    $scope.formData.name = document.getElementById('topic_title')['value'];
    if (!$scope.formData.banner) {
      $scope.formData.banner = $scope.topic_info.imgurl;
    }
    const count = $scope.topic_info.content_info.length;
    // 用来保存content的ID
    $scope.contentArr = [0]
    for (let i = 1; i <= count; i++) {
      $scope.contentArr[i] = 'content' + i;
      if (!$scope.formData['content' + i + '_img']) { // 排除已更换图片的内容
        $scope.formData['content' + i + '_img'] = $scope.topic_info.content_info[i - 1].con_imgurl
      }
    }
    //console.warn($scope.contentArr)
    angular.forEach($scope.contentArr, function(contentItem) {
      if (contentItem) { // 排除contentArr[0]=0
        if (document.getElementById(contentItem)) {
          $scope.formData[contentItem + '_text'] = document.getElementById(contentItem)['value'];
          if (document.getElementById(contentItem + "_class1")) {
            const ele = document.getElementById(contentItem + "_class1");
            const index = ele['selectedIndex'];
            $scope.formData[contentItem + '_class1'] = ele['options'][index].text;
            $scope.formData[contentItem + '_style1'] = document.getElementById(contentItem + "_style1")['value'];
            $scope.formData[contentItem + '_oriurl1'] = document.getElementById(contentItem + "_oriurl1")['value'];
            $scope.formData[contentItem + '_desc1'] = document.getElementById(contentItem + "_desc1")['value'];
            //$scope.formData[contentItem+'_ques1'] = document.getElementById(contentItem+"_ques1")['value'];

          }
          if (document.getElementById(contentItem + "_class2")) {
            const ele = document.getElementById(contentItem + "_class2");
            const index = ele['selectedIndex'];
            $scope.formData[contentItem + '_class2'] = ele['options'][index].text;
            $scope.formData[contentItem + '_style2'] = document.getElementById(contentItem + "_style2")['value'];
            $scope.formData[contentItem + '_oriurl2'] = document.getElementById(contentItem + "_oriurl2")['value'];
            $scope.formData[contentItem + '_desc2'] = document.getElementById(contentItem + "_desc2")['value'];
            //$scope.formData[contentItem+'_ques2'] = document.getElementById(contentItem+"_ques2")['value'];
          }
          if (document.getElementById(contentItem + "_class3")) {
            const ele = document.getElementById(contentItem + "_class3");
            const index = ele['selectedIndex'];
            $scope.formData[contentItem + '_class3'] = ele['options'][index].text;
            $scope.formData[contentItem + '_style3'] = document.getElementById(contentItem + "_style3")['value'];
            $scope.formData[contentItem + '_oriurl3'] = document.getElementById(contentItem + "_oriurl3")['value'];
            $scope.formData[contentItem + '_desc3'] = document.getElementById(contentItem + "_desc3")['value'];
            //$scope.formData[contentItem+'_ques3'] = document.getElementById(contentItem+"_ques3").value;
          }
        }
      }
    })
  }
  const getData = function() {
    $scope.formData.topic_id = $scope.topic_id;
    $scope.formData.name = document.getElementById('topic_title')['value'];
    $scope.contentArr = [0];
    const count = $scope.topic_info.content_info.length;
    for (let i = 1; i <= count; i++) {
      $scope.contentArr[i] = 'content' + i;
    }
    //console.warn($scope.contentArr)
    angular.forEach($scope.contentArr, function(contentItem, index) {
      if (contentItem) { // 排除contentArr[0]=0
        if (document.getElementById(contentItem)) {
          $scope.formData[contentItem + '_text'] = document.getElementById(contentItem)['value'];
          $scope.formData[contentItem + '_id'] = document.getElementById(contentItem + '_id')['value'];
          $scope.formData[contentItem + '_con_video'] = document.getElementById(contentItem + '_con_video')['value'];
          $scope.formData[contentItem + '_debug_video'] = $scope.formData[contentItem + "_debug_video"] ? $scope.formData[contentItem + "_debug_video"] : $scope.topic_info.content_info[index - 1].debug_video;
          $scope.formData[contentItem + '_con_video_duration'] = $scope.formData[contentItem + "_con_video_duration"] ? $scope.formData[contentItem + "_con_video_duration"] : $scope.topic_info.content_info[index - 1].con_video_duration;
          if (document.getElementById(contentItem + "_class1")) {
            $scope.formData[contentItem + '_class1'] = document.getElementById(contentItem + "_class1")['value'];
            $scope.formData[contentItem + '_style1'] = document.getElementById(contentItem + "_style1")['value'];
            $scope.formData[contentItem + '_oriurl1'] = document.getElementById(contentItem + "_oriurl1")['value'];
            $scope.formData[contentItem + '_desc1'] = document.getElementById(contentItem + "_desc1")['value'];
            $scope.formData[contentItem + '_ques1'] = document.getElementById(contentItem + "_ques1")['value'];
          }
          if (document.getElementById(contentItem + "_class2")) {
            $scope.formData[contentItem + '_class2'] = document.getElementById(contentItem + "_class2")['value'];
            $scope.formData[contentItem + '_style2'] = document.getElementById(contentItem + "_style2")['value'];
            $scope.formData[contentItem + '_oriurl2'] = document.getElementById(contentItem + "_oriurl2")['value'];
            $scope.formData[contentItem + '_desc2'] = document.getElementById(contentItem + "_desc2")['value'];
            $scope.formData[contentItem + '_ques2'] = document.getElementById(contentItem + "_ques2")['value'];
          }
          if (document.getElementById(contentItem + "_class3")) {
            $scope.formData[contentItem + '_class3'] = document.getElementById(contentItem + "_class3")['value'];
            $scope.formData[contentItem + '_style3'] = document.getElementById(contentItem + "_style3")['value'];
            $scope.formData[contentItem + '_oriurl3'] = document.getElementById(contentItem + "_oriurl3")['value'];
            $scope.formData[contentItem + '_desc3'] = document.getElementById(contentItem + "_desc3")['value'];
            $scope.formData[contentItem + '_ques3'] = document.getElementById(contentItem + "_ques3")['value'];
          }
        }
      }
    })

  }
  //上传专题banner
  $scope.uploadBanner = function(data) {
    if (data.result == 1) {
      $scope.formData.banner = data.data;
    }
  };

  // $scope.uploadContentImg0 = function (data) {
  //   if (data.result == 1) {
  //     //$scope.contentInsertImg = data.data;
  //     editor.execCommand('insertimage', {
  //       src: '//img-qn.seecsee.com' + data.data
  //     });
  //   }
  // };

  //上传内容图片（目前支持50个）
  $scope.uploadContentImg1 = function(data) {
    if (data.result == 1) {
      $scope.formData.content1_img = data.data;
    }
  };
  $scope.uploadContentImg2 = function(data) {
    if (data.result == 1) {
      $scope.formData.content2_img = data.data;
    }
  };
  $scope.uploadContentImg3 = function(data) {
    if (data.result == 1) {
      $scope.formData.content3_img = data.data;
    }
  };
  $scope.uploadContentImg4 = function(data) {
    if (data.result == 1) {
      $scope.formData.content4_img = data.data;
    }
  };
  $scope.uploadContentImg5 = function(data) {
    if (data.result == 1) {
      $scope.formData.content5_img = data.data;
    }
  };
  $scope.uploadContentImg6 = function(data) {
    if (data.result == 1) {
      $scope.formData.content6_img = data.data;
    }
  };
  $scope.uploadContentImg7 = function(data) {
    if (data.result == 1) {
      $scope.formData.content7_img = data.data;
    }
  };
  $scope.uploadContentImg8 = function(data) {
    if (data.result == 1) {
      $scope.formData.content8_img = data.data;
    }
  };
  $scope.uploadContentImg9 = function(data) {
    if (data.result == 1) {
      $scope.formData.content9_img = data.data;
    }
  };
  $scope.uploadContentImg10 = function(data) {
    if (data.result == 1) {
      $scope.formData.content10_img = data.data;
    }
  };
  $scope.uploadContentImg11 = function(data) {
    if (data.result == 1) {
      $scope.formData.content11_img = data.data;
    }
  };
  $scope.uploadContentImg12 = function(data) {
    if (data.result == 1) {
      $scope.formData.content12_img = data.data;
    }
  };
  $scope.uploadContentImg13 = function(data) {
    if (data.result == 1) {
      $scope.formData.content13_img = data.data;
    }
  };
  $scope.uploadContentImg14 = function(data) {
    if (data.result == 1) {
      $scope.formData.content14_img = data.data;
    }
  };
  $scope.uploadContentImg15 = function(data) {
    if (data.result == 1) {
      $scope.formData.content15_img = data.data;
    }
  };
  $scope.uploadContentImg16 = function(data) {
    if (data.result == 1) {
      $scope.formData.content16_img = data.data;
    }
  };
  $scope.uploadContentImg17 = function(data) {
    if (data.result == 1) {
      $scope.formData.content17_img = data.data;
    }
  };
  $scope.uploadContentImg18 = function(data) {
    if (data.result == 1) {
      $scope.formData.content18_img = data.data;
    }
  };
  $scope.uploadContentImg19 = function(data) {
    if (data.result == 1) {
      $scope.formData.content19_img = data.data;
    }
  };
  $scope.uploadContentImg20 = function(data) {
    if (data.result == 1) {
      $scope.formData.content20_img = data.data;
    }
  };
  $scope.uploadContentImg21 = function(data) {
    if (data.result == 1) {
      $scope.formData.content21_img = data.data;
    }
  };
  $scope.uploadContentImg22 = function(data) {
    if (data.result == 1) {
      $scope.formData.content22_img = data.data;
    }
  };
  $scope.uploadContentImg23 = function(data) {
    if (data.result == 1) {
      $scope.formData.content23_img = data.data;
    }
  };
  $scope.uploadContentImg24 = function(data) {
    if (data.result == 1) {
      $scope.formData.content24_img = data.data;
    }
  };
  $scope.uploadContentImg25 = function(data) {
    if (data.result == 1) {
      $scope.formData.content25_img = data.data;
    }
  };
  $scope.uploadContentImg26 = function(data) {
    if (data.result == 1) {
      $scope.formData.content26_img = data.data;
    }
  };
  $scope.uploadContentImg27 = function(data) {
    if (data.result == 1) {
      $scope.formData.content27_img = data.data;
    }
  };
  $scope.uploadContentImg28 = function(data) {
    if (data.result == 1) {
      $scope.formData.content28_img = data.data;
    }
  };
  $scope.uploadContentImg29 = function(data) {
    if (data.result == 1) {
      $scope.formData.content29_img = data.data;
    }
  };
  $scope.uploadContentImg30 = function(data) {
    if (data.result == 1) {
      $scope.formData.content30_img = data.data;
    }
  };
  $scope.uploadContentImg31 = function(data) {
    if (data.result == 1) {
      $scope.formData.content31_img = data.data;
    }
  };
  $scope.uploadContentImg32 = function(data) {
    if (data.result == 1) {
      $scope.formData.content32_img = data.data;
    }
  };
  $scope.uploadContentImg33 = function(data) {
    if (data.result == 1) {
      $scope.formData.content33_img = data.data;
    }
  };
  $scope.uploadContentImg34 = function(data) {
    if (data.result == 1) {
      $scope.formData.content34_img = data.data;
    }
  };
  $scope.uploadContentImg35 = function(data) {
    if (data.result == 1) {
      $scope.formData.content35_img = data.data;
    }
  };
  $scope.uploadContentImg36 = function(data) {
    if (data.result == 1) {
      $scope.formData.content36_img = data.data;
    }
  };
  $scope.uploadContentImg37 = function(data) {
    if (data.result == 1) {
      $scope.formData.content37_img = data.data;
    }
  };
  $scope.uploadContentImg38 = function(data) {
    if (data.result == 1) {
      $scope.formData.content38_img = data.data;
    }
  };
  $scope.uploadContentImg39 = function(data) {
    if (data.result == 1) {
      $scope.formData.content39_img = data.data;
    }
  };
  $scope.uploadContentImg40 = function(data) {
    if (data.result == 1) {
      $scope.formData.content40_img = data.data;
    }
  };
  $scope.uploadContentImg41 = function(data) {
    if (data.result == 1) {
      $scope.formData.content41_img = data.data;
    }
  };
  $scope.uploadContentImg42 = function(data) {
    if (data.result == 1) {
      $scope.formData.content42_img = data.data;
    }
  };
  $scope.uploadContentImg43 = function(data) {
    if (data.result == 1) {
      $scope.formData.content43_img = data.data;
    }
  };
  $scope.uploadContentImg44 = function(data) {
    if (data.result == 1) {
      $scope.formData.content44_img = data.data;
    }
  };
  $scope.uploadContentImg45 = function(data) {
    if (data.result == 1) {
      $scope.formData.content45_img = data.data;
    }
  };
  $scope.uploadContentImg46 = function(data) {
    if (data.result == 1) {
      $scope.formData.content46_img = data.data;
    }
  };
  $scope.uploadContentImg47 = function(data) {
    if (data.result == 1) {
      $scope.formData.content47_img = data.data;
    }
  };
  $scope.uploadContentImg48 = function(data) {
    if (data.result == 1) {
      $scope.formData.content48_img = data.data;
    }
  };
  $scope.uploadContentImg49 = function(data) {
    if (data.result == 1) {
      $scope.formData.content49_img = data.data;
    }
  };
  $scope.uploadContentImg50 = function(data) {
    if (data.result == 1) {
      $scope.formData.content50_img = data.data;
    }
  };
  $scope.uploadContentImg51 = function(data) {
    if (data.result == 1) {
      $scope.formData.content51_img = data.data;
    }
  };
  $scope.uploadContentImg52 = function(data) {
    if (data.result == 1) {
      $scope.formData.content52_img = data.data;
    }
  };
  $scope.uploadContentImg53 = function(data) {
    if (data.result == 1) {
      $scope.formData.content53_img = data.data;
    }
  };
  $scope.uploadContentImg54 = function(data) {
    if (data.result == 1) {
      $scope.formData.content54_img = data.data;
    }
  };
  $scope.uploadContentImg55 = function(data) {
    if (data.result == 1) {
      $scope.formData.content55_img = data.data;
    }
  };
  $scope.uploadContentImg56 = function(data) {
    if (data.result == 1) {
      $scope.formData.content56_img = data.data;
    }
  };
  $scope.uploadContentImg57 = function(data) {
    if (data.result == 1) {
      $scope.formData.content57_img = data.data;
    }
  };
  $scope.uploadContentImg58 = function(data) {
    if (data.result == 1) {
      $scope.formData.content58_img = data.data;
    }
  };
  $scope.uploadContentImg59 = function(data) {
    if (data.result == 1) {
      $scope.formData.content59_img = data.data;
    }
  };
  $scope.uploadContentImg60 = function(data) {
    if (data.result == 1) {
      $scope.formData.content60_img = data.data;
    }
  };
  $scope.uploadContentImg61 = function(data) {
    if (data.result == 1) {
      $scope.formData.content61_img = data.data;
    }
  };
  $scope.uploadContentImg62 = function(data) {
    if (data.result == 1) {
      $scope.formData.content62_img = data.data;
    }
  };
  $scope.uploadContentImg63 = function(data) {
    if (data.result == 1) {
      $scope.formData.content63_img = data.data;
    }
  };
  $scope.uploadContentImg64 = function(data) {
    if (data.result == 1) {
      $scope.formData.content64_img = data.data;
    }
  };
  $scope.uploadContentImg65 = function(data) {
    if (data.result == 1) {
      $scope.formData.content65_img = data.data;
    }
  };
  $scope.uploadContentImg66 = function(data) {
    if (data.result == 1) {
      $scope.formData.content66_img = data.data;
    }
  };
  $scope.uploadContentImg67 = function(data) {
    if (data.result == 1) {
      $scope.formData.content67_img = data.data;
    }
  };
  $scope.uploadContentImg68 = function(data) {
    if (data.result == 1) {
      $scope.formData.content68_img = data.data;
    }
  };
  $scope.uploadContentImg69 = function(data) {
    if (data.result == 1) {
      $scope.formData.content69_img = data.data;
    }
  };
  $scope.uploadContentImg70 = function(data) {
    if (data.result == 1) {
      $scope.formData.content70_img = data.data;
    }
  };
  $scope.uploadContentImg71 = function(data) {
    if (data.result == 1) {
      $scope.formData.content71_img = data.data;
    }
  };
  $scope.uploadContentImg72 = function(data) {
    if (data.result == 1) {
      $scope.formData.content72_img = data.data;
    }
  };
  $scope.uploadContentImg73 = function(data) {
    if (data.result == 1) {
      $scope.formData.content73_img = data.data;
    }
  };
  $scope.uploadContentImg74 = function(data) {
    if (data.result == 1) {
      $scope.formData.content74_img = data.data;
    }
  };
  $scope.uploadContentImg75 = function(data) {
    if (data.result == 1) {
      $scope.formData.content75_img = data.data;
    }
  };
  $scope.uploadContentImg76 = function(data) {
    if (data.result == 1) {
      $scope.formData.content76_img = data.data;
    }
  };
  $scope.uploadContentImg77 = function(data) {
    if (data.result == 1) {
      $scope.formData.content77_img = data.data;
    }
  };
  $scope.uploadContentImg78 = function(data) {
    if (data.result == 1) {
      $scope.formData.content78_img = data.data;
    }
  };
  $scope.uploadContentImg79 = function(data) {
    if (data.result == 1) {
      $scope.formData.content79_img = data.data;
    }
  };
  $scope.uploadContentImg80 = function(data) {
    if (data.result == 1) {
      $scope.formData.content80_img = data.data;
    }
  };
  $scope.uploadContentImg81 = function(data) {
    if (data.result == 1) {
      $scope.formData.content81_img = data.data;
    }
  };
  $scope.uploadContentImg82 = function(data) {
    if (data.result == 1) {
      $scope.formData.content82_img = data.data;
    }
  };
  $scope.uploadContentImg83 = function(data) {
    if (data.result == 1) {
      $scope.formData.content83_img = data.data;
    }
  };
  $scope.uploadContentImg84 = function(data) {
    if (data.result == 1) {
      $scope.formData.content84_img = data.data;
    }
  };
  $scope.uploadContentImg85 = function(data) {
    if (data.result == 1) {
      $scope.formData.content85_img = data.data;
    }
  };
  $scope.uploadContentImg86 = function(data) {
    if (data.result == 1) {
      $scope.formData.content86_img = data.data;
    }
  };
  $scope.uploadContentImg87 = function(data) {
    if (data.result == 1) {
      $scope.formData.content87_img = data.data;
    }
  };
  $scope.uploadContentImg88 = function(data) {
    if (data.result == 1) {
      $scope.formData.content88_img = data.data;
    }
  };
  $scope.uploadContentImg89 = function(data) {
    if (data.result == 1) {
      $scope.formData.content89_img = data.data;
    }
  };
  $scope.uploadContentImg90 = function(data) {
    if (data.result == 1) {
      $scope.formData.content90_img = data.data;
    }
  };
  $scope.uploadContentImg91 = function(data) {
    if (data.result == 1) {
      $scope.formData.content91_img = data.data;
    }
  };
  $scope.uploadContentImg92 = function(data) {
    if (data.result == 1) {
      $scope.formData.content92_img = data.data;
    }
  };
  $scope.uploadContentImg93 = function(data) {
    if (data.result == 1) {
      $scope.formData.content93_img = data.data;
    }
  };
  $scope.uploadContentImg94 = function(data) {
    if (data.result == 1) {
      $scope.formData.content94_img = data.data;
    }
  };
  $scope.uploadContentImg95 = function(data) {
    if (data.result == 1) {
      $scope.formData.content95_img = data.data;
    }
  };
  $scope.uploadContentImg96 = function(data) {
    if (data.result == 1) {
      $scope.formData.content96_img = data.data;
    }
  };
  $scope.uploadContentImg97 = function(data) {
    if (data.result == 1) {
      $scope.formData.content97_img = data.data;
    }
  };
  $scope.uploadContentImg98 = function(data) {
    if (data.result == 1) {
      $scope.formData.content98_img = data.data;
    }
  };
  $scope.uploadContentImg99 = function(data) {
    if (data.result == 1) {
      $scope.formData.content99_img = data.data;
    }
  };
  $scope.uploadContentImg100 = function(data) {
    if (data.result == 1) {
      $scope.formData.content100_img = data.data;
    }
  };
  //内容下拉框改变
  $scope.change = function(x) {
    $scope.formData.currNum = x;
    const content_info = $scope.topic_info.content_info;
    const length = content_info.length;
    if (x > length) {
      for (let i = length; i < x; i++) {
        const content = {
          text: $scope.contentData[i].text,
          con_imgurl: $scope.contentData[i].con_imgurl
        };
        content_info.push(content);

      }
    }
    if (x < length) {
      /*for(var i=1;i<=x-length;i++){
       var content = {};
       content_info.push(content);
       }*/
    }
    $scope.items = [];
    //$scope.contentNum = x;
    for (let j = 0; j < x; j++) {
      $scope.items[j] = j;
    }
  }
  //重置图片
  $scope.resetImage = function(type, index) {
    if (index >= 0) {
      $scope.addItem[type][index] = '';
      for (let i = index, len = $scope.addItem[type].length; i < len - 1; i++) {
        $scope.addItem[type][i] = $scope.addItem[type][i + 1];
      }
      $scope.addItem[type].pop();
      $scope.addItem.item_img_list_index--;
    } else {
      $scope.addItem[type] = '';
    }
  };
  //获得品类
  const getCategory = function() {
    const temp_category = {};
    dataService.topic_getCatetory().then(res => {
      $scope.categoryData = res.data;
      categoryData = res.data;
      categoryData.forEach(function(ele, idx, arr) {
        temp_category[ele.cir_name] = ele.sub_category;
      });
      $scope.styleList = temp_category
    });
  }
  //初始化当前专题
  const init = function() {
    dataService.topic_getTopicDetail({
      topic_id: $scope.topic_id
    }).then(res => {
      $scope.formData.contentNum = res.data.content_info.length;
      $scope.topic_info = res.data;
      $scope.tagsKeywords = res.data.topic_keyword.split('|').map(function(val, key) { return { text: val } })
      getCategory()
    })
  };
  init();
}

