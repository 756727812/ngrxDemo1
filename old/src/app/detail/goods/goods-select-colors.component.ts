import './goods-select-colors.less'

export class GoodsSelectColorsCongroller implements ng.IComponentController {
  static $inject = []
  value: any
  attrs: any
  isShowPop: boolean = false
  id: string = `goods-select-colors-pop-${Math.floor(Math.random() * 1000)}`
  onSelect: Function

  constructor(

  ) { }

  $onInit() {
  }

  $postLink() {

    // $('body').click((event) => {
    //   const p = $(event.target)
    //   const that = $(`#${this.id}`)
    //   console.log(p)
    //   console.log(p.siblings('.goods-select-colors-pop'))
    //   console.log(p.parents('.goods-select-colors-pop').length)
    //   // if (p.is(that)) {
    //   //   that.show()
    //   // }
    //   if (p.hasClass('goods-select-colors-input')) {
    //     p.closest('.goods-select-colors-pop').show()
    //   }

    //   if(!p.parents('.goods-select-colors-pop').length && !p.is('.goods-select-colors-input')) {
    //     // $(".modalDialog").hide();
    //     console.log(1)
    //     that.hide()
    //   }
    // })
  }

  handleSelect: (key: string) => any = key => this.onSelect({ key })
}

export const goodsSelectColors: ng.IComponentOptions = {
  template: require('./goods-select-colors.template.html'),
  controller: GoodsSelectColorsCongroller,
  bindings: {
    attrs: '<',
    value: '<',
    disabled: '<',
    onSelect: '&'
  }
}
