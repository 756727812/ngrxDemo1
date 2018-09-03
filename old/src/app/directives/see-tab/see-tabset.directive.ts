seeTabsetController.$inject = ['$scope', '$location', '$routeParams'];
/* @Inject */
function seeTabsetController($scope: ng.IScope, $location, $routeParams) {
  var self = this;
  self.tabs = [];

  self.isUseHash = function() {
    return this.useHash !== false
  }

  self.addTab = function addTab(tab) {
    // 默认使用 hash 表示当前选中 tab
    const useHash = this.isUseHash()
    // TODO watch scope.activeType
    const initType = this.isUseHash() ? $location.hash() : this.activeType

    self.tabs.push(tab);
    if (initType && tab.type == initType) {
      self.tabs.forEach(tabs => tabs.active = false)
      tab.active = true;
    }
    if (!initType) {
      self.tabs[0].active = true;
      if (!useHash) {
        this.activeType = self.tabs[0].type
      }
    }
  };

  self.select = function(selectedTab) {
    const doSel = () => {
      if (this.isUseHash()) {
        $location.search(Object.assign($location.search(), { page: 1 })).hash(selectedTab.type)
      } else {
        self.tabs.forEach(tab => tab.active = false)
        selectedTab.active = true
      }
    }
    let result = null
    /*
     selectedTab.select 返回 true 或者 undefined 表示直接选择 tab，返回 false 表示拒绝选择
     如果返回 promise ，则 resolve 后再选择 tab
     */
    if (selectedTab.select) {
      result = selectedTab.select({ target: { type: selectedTab.type } })
    }
    if (result === false) {
      return
    } else if (result && result.then) {
      result.then(doSel)
      return
    }
    doSel()
  };
}

export default function seeTabset() {
  // Usage:
  // <see-tabset see-access="Super-Admin See-Admin Elect-Admin">
  //   <see-tab heading="浏览热度榜" type="1"></see-tab>
  //   <see-tab heading="销量热度榜" type="2"></see-tab>
  // </see-tabset>
  var directive: ng.IDirective = {
    restrict: 'E',
    transclude: true,
    scope: {
      useHash: '<', // 默认 true：使用 url hash 表示选中的 tab
      activeType: '=', // 当 useHash 为 false 时，表示选中 tab 的 type
      persParam: '=',
      vertical: '=',
      justified: '='
    },
    template: require('./see-tabset.template.html'),
    bindToController: true,
    controllerAs: 'seeTabset',
    controller: seeTabsetController,
  };

  return directive;
}
