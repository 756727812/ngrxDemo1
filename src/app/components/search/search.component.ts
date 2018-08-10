import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../service/common.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.html',
    // providers:[CommonService], // 使用providers 来注入服务
  })
  
  export class SearchComponent {
    constructor(private commonService: CommonService){
        this.commonService.input$.emit('feefwq');
        this.commonService.output$.emit({list:'feefwq'});
    }
  }