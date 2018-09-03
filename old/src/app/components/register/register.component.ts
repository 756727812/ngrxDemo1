const version: number = +new Date();

export class registerController {
  type: string;

  static $inject: string[] = [];
  constructor() {
    this.type = this.getUrlParameter('type') || 'xiaodianpu';
  }

  private getUrlParameter: (sParam) => string = sParam => {
    let sPageURL = decodeURIComponent(window.location.search.substring(1)),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : sParameterName[1];
      }
    }
  }
}

export const register: ng.IComponentOptions = {
  controller: registerController,
  template: require('./register.template.html'),
};
