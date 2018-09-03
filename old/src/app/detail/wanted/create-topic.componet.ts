declare let UE: any;
/**
 * 创建专题
 */
import * as angular from 'angular';

export const createTopic = {
  controller: createTopicController,
  template: require('./create-topic.template.html'),
};
createTopicController.$inject = [
  '$scope',
  '$location',
  'dataService',
  '$routeParams',
  'Upload',
  'Notification',
  '$timeout',
  '$http',
];
function createTopicController(
  $scope,
  $location,
  dataService,
  $routeParams,
  Upload,
  Notification,
  $timeout,
  $http,
) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  $scope.formData = {
    collection_id: 0,
    relate_cir_id: 0,
  };

  // UEDITOR相关配置
  const editor = UE.getEditor('myEditor', {
    //这里可以选择自己需要的工具按钮名称,此处仅选择如下五个
    /*toolbars: [[
      'fullscreen', 'source', '|', 'undo', 'redo', '|',
      'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
      'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
      'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
      'directionalityltr', 'directionalityrtl', 'indent', '|',
      'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
      'link', 'unlink', 'anchor', '|', 'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
      'emotion', 'scrawl', 'insertvideo', 'music', 'attachment', 'map', 'gmap', 'insertframe', 'insertcode', 'webapp', 'pagebreak', 'template', 'background', '|',
      'horizontal', 'date', 'time', 'spechars', 'snapscreen', 'wordimage', '|',
      'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols', 'charts', '|',
      'print', 'preview', 'searchreplace', 'help', 'drafts'
      ]],*/
    toolbars: [['fullscreen', 'source', '|', 'undo', 'redo']],
    //focus时自动清空初始化时的内容
    autoClearinitialContent: true,
    //关闭elementPath
    elementPathEnabled: false,
    //默认的编辑区域高度
    initialFrameHeight: 300,
  });

  $scope.uploadFiles = function(files) {
    if (files && files.length) {
      Upload.upload({
        url: '/api/item/uploadFiles',
        data: {
          images: files,
        },
      }).then(
        function(res) {
          $scope.imageFiles = res.data.data;
          angular.forEach($scope.imageFiles, function(image) {
            editor.execCommand('insertimage', {
              src: '//img-qn.seecsee.com' + image,
            });
          });
        },
        function(res) {
          if (res.status > 0) {
            alert(res.data);
          }
        },
      );
    }
  };

  $scope.upProgress = {};
  $scope.uploadVideo = function(file, index) {
    if (file) {
      let _token,
        _videourl,
        Qiniu_UploadUrl = '//up.qiniu.com';
      $scope.uploadVideoFlag = true;
      $http.get('/api/topic/getUploadVideoToken').success(function(res) {
        if (res.result == 1) {
          _token = res.data.token;
          _videourl = res.data.file_name;
          $scope.formData['content' + index + '_con_video'] = _videourl;
          $scope.contentData[index - 1].con_video = _videourl;
          $timeout(function() {
            $('#content' + index + '_con_video').val(_videourl);
          });
          Upload.upload({
            url: Qiniu_UploadUrl,
            data: {
              token: _token,
              file,
            },
          }).then(
            function(res) {
              Notification.success('视频上传成功，服务器正在转码！');
              $scope.formData['content' + index + '_debug_video'] =
                res.data.persistentId + '|' + res.data.key;
              $scope.uploadVideoFlag = false;
              $scope.formData['content' + index + '_con_video_duration'] =
                res.data.avinfo_duration;
            },
            function(res) {},
            function(evt) {
              const progressPercentage = 100.0 * (evt.loaded / evt.total);
              $scope.upProgress[index] =
                progressPercentage + '% ' + evt.config.data.file.name;
            },
          );
        }
      });
    }
  };

  $scope.cir_id = $routeParams.cir_id; //圈子ID
  $scope.formData.cir_id = $routeParams.cir_id; //圈子ID
  // 解析编辑器中的文字和图片,放入$scope.contentData中
  $scope.contentData = [];
  $scope.getContent = function() {
    if ($scope.contentData.length) {
      $scope.contentData = [];
    }
    //过滤其他html，只保留img标签
    const delHtmlTag = function(htmlstr) {
      return htmlstr
        .replace(/<(?!img)[^>]+?>/gi, '')
        .replace(/\&amp\;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/, '>');
    };

    const htmlstr = editor.getPlainTxt();
    const temp = '<div></div>';
    //temp.innerHTML = delHtmlTag(htmlstr);
    //var doms = temp.contents();
    const str = delHtmlTag(htmlstr);
    const tmp = str.split(/\">|\/>/);
    tmp.pop();
    tmp.map(function(item) {
      const start = item.indexOf('src') + 5;
      const obj = {
        text: item.slice(0, item.indexOf('<img')),
        con_imgurl: item
          .slice(start, item.indexOf('"', start))
          .replace(/\&amp\;/gi, '&'),
        con_video: '',
      };
      $scope.contentData.push(obj);
    });
    if ($scope.contentData.length) {
      // 显示批量添加
      $scope.showBatchAction = true;
    }
    $scope.change($scope.contentData.length);
    $scope.formData.contentNum = $scope.contentData.length;
    $scope.idArr = [];
    for (let i = 1; i <= $scope.contentData.length; i++) {
      $scope.idArr.push('content' + i);
      $scope.formData['content' + i + '_img'] =
        $scope.contentData[i - 1].con_imgurl;
      $scope.formData['content' + i + '_text'] = $scope.contentData[i - 1].text;
      $scope.formData['content' + i + '_con_video'] =
        $scope.contentData[i - 1].con_video;
      //$scope.uploadContentImgArr
    }
    // 品类默认选中'全套'
    $scope.selectedItem = $scope.categoryData[10];
  };

  // 批量操作
  $scope.equalOne = function() {
    $scope.selectedItem = $scope.selectedItemOne;
    $scope.selectedItemSub = $scope.selectedItemOneSub.replace(/\s+/g, '');
  };
  $scope.equalTwo = function() {
    $scope.selectedItem1 = $scope.selectedItemTwo;
    $scope.selectedItem1Sub = $scope.selectedItemTwoSub.replace(/\s+/g, '');
  };
  $scope.equalThree = function() {
    $scope.selectedItem2 = $scope.selectedItemThree;
    $scope.selectedItem2Sub = $scope.selectedItemThreeSub.replace(/\s+/g, '');
  };

  dataService
    .topic_get_api_url()
    .then(res => ($scope.api_url = res.data.api_url));

  dataService.seller_getSellerUser().then(res => {
    $scope.users = res.data;
    $scope.formData.u_id = $scope.users[0].u_id;
  });

  //创建专题
  $scope.createTopic = function(action) {
    if (action == 1) {
      if (confirm('确定发布专题？？')) {
        createTopic1(action);
      }
    } else {
      createTopic1(action);
    }
  };
  const createTopic1 = function(action) {
    let content_flag = false;
    let img_flag = false;
    getData();
    $scope.formData.action = action;

    if (!$scope.formData.name) {
      Notification.warn('请先填写专题名称！');
      return false;
    }
    if (!$scope.tagsKeywords) {
      Notification.warn('请填写关键词!');
      return;
    }
    if ($scope.tagsKeywords && $scope.tagsKeywords.length > 5) {
      Notification.warn('请精简你的关键词个数!');
      return;
    }
    if ($scope.tagsKeywords) {
      $scope.formData.keyword = $scope.tagsKeywords
        .map(function(item) {
          return item.text;
        })
        .toString()
        .replace(/,/g, '|');
    }
    if (!$scope.formData.banner) {
      Notification.warn('请先上传专题封面！');
      return false;
    }
    if (!$scope.formData.desc) {
      Notification.warn('请先填写专题引言！');
      return false;
    }
    if (!$scope.formData.contentNum) {
      Notification.warn('请选择内容个数');
      return false;
    } else {
      for (let i = 1; i <= $scope.formData.contentNum; i++) {
        if (!$scope.formData['content' + i + '_text']) {
          content_flag = true;
          break;
        } else {
          if (!$scope.formData['content' + i + '_img']) {
            img_flag = true;
            break;
          }
        }
      }
    }
    // if (img_flag) {
    //   Notification.warn('请上传专题内容' + i + '的图片');
    //   return false;
    // }
    const _param = {
      topic_info: JSON.stringify($scope.formData),
    };
    //创建专题
    switch (action) {
      case 1:
        dataService.topic_addTopic(_param).then(res => {
          Notification.success('创建专题成功！！');
          $location
            .url('/wanted/myCircle/circleInfo')
            .search({
              cir_id: $scope.cir_id,
            })
            .hash('topic');
        });
        break;
      case 2:
        dataService.topic_addTopic(_param).then(res => {
          Notification.success('保存草稿成功！！');
          $location
            .url('/wanted/myCircle/circleInfo')
            .search({
              cir_id: $scope.cir_id,
              flag: 1,
            })
            .hash('topic');
        });
        break;
      case 3:
        //TODO 生成二维码，手机扫描可以预览
        dataService.topic_addTopic(_param).then(res => {
          Notification.success(res.msg);
          window.open($scope.api_url + '?id=' + res.data.topic_id);
        });
        break;
    }
  };
  //接收数据

  const getData = function() {
    // 用来保存content的ID
    $scope.contentArr = [0];
    for (let i = 1; i <= 100; i++) {
      $scope.contentArr[i] = 'content' + i;
    }
    //console.warn($scope.contentArr)
    angular.forEach($scope.contentArr, function(contentItem) {
      if (contentItem) {
        // 排除contentArr[0]=0
        if (document.getElementById(contentItem)) {
          $scope.formData[contentItem + '_text'] = document.getElementById(
            contentItem,
          )['value'];
          // $scope.formData[contentItem + '_id'] = document.getElementById(contentItem+'_id').value;
          if (document.getElementById(contentItem + '_class1')) {
            const ele = document.getElementById(contentItem + '_class1');
            const index = ele['selectedIndex'];
            $scope.formData[contentItem + '_class1'] =
              ele['options'][index].text;
            $scope.formData[contentItem + '_style1'] = document.getElementById(
              contentItem + '_style1',
            )['value'];
            $scope.formData[contentItem + '_oriurl1'] = document.getElementById(
              contentItem + '_oriurl1',
            )['value'];
            $scope.formData[contentItem + '_desc1'] = document.getElementById(
              contentItem + '_desc1',
            )['value'];
            //$scope.formData[contentItem+'_ques1'] = document.getElementById(contentItem+"_ques1")['value'];
          }
          if (document.getElementById(contentItem + '_class2')) {
            const ele = document.getElementById(contentItem + '_class2');
            const index = ele['selectedIndex'];
            $scope.formData[contentItem + '_class2'] =
              ele['options'][index].text;
            $scope.formData[contentItem + '_style2'] = document.getElementById(
              contentItem + '_style2',
            )['value'];
            $scope.formData[contentItem + '_oriurl2'] = document.getElementById(
              contentItem + '_oriurl2',
            )['value'];
            $scope.formData[contentItem + '_desc2'] = document.getElementById(
              contentItem + '_desc2',
            )['value'];
            //$scope.formData[contentItem+'_ques2'] = document.getElementById(contentItem+"_ques2")['value'];
          }
          if (document.getElementById(contentItem + '_class3')) {
            const ele = document.getElementById(contentItem + '_class3');
            const index = ele['selectedIndex'];
            $scope.formData[contentItem + '_class3'] =
              ele['options'][index].text;
            $scope.formData[contentItem + '_style3'] = document.getElementById(
              contentItem + '_style3',
            )['value'];
            $scope.formData[contentItem + '_oriurl3'] = document.getElementById(
              contentItem + '_oriurl3',
            )['value'];
            $scope.formData[contentItem + '_desc3'] = document.getElementById(
              contentItem + '_desc3',
            )['value'];
            //$scope.formData[contentItem+'_ques3'] = document.getElementById(contentItem+"_ques3")['value'];
          }
        }
      }
    });
  };
  //上传专题banner
  $scope.uploadBanner = function(data) {
    if (data.result == 1) {
      $scope.formData.banner = data.data;
    }
  };

  $scope.uploadContentImg0 = function(data) {
    if (data.result == 1) {
      //$scope.contentInsertImg = data.data;
      editor.execCommand('insertimage', {
        src: '//img-qn.seecsee.com' + data.data,
      });
    }
  };
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

  //获得品类
  dataService.topic_getCatetory().then(res => ($scope.categoryData = res.data));
  //内容下拉框改变
  $scope.change = function(x) {
    $scope.formData.contentNum = x;
    $scope.items = [];
    //$scope.contentNum = x;
    for (let i = 0; i < x; i++) {
      $scope.items[i] = i;
    }
  };
}
