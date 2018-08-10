import { Component, OnInit } from '@angular/core';
import { FooterService } from './footer.service';
import { CommonService } from '../../service/common.service';
// 接口返回数据格式
export class Result {
  error: any; // 错误时返回的信息
}
@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  providers:[FooterService], // 使用providers 来注入服务
})

export class FooterComponent implements OnInit{
    planets:any;
    description : string='All Rights Reserved. ';
    // static $inject:string[] = ["$window","$location"];
    constructor(
      private commonService: CommonService,
      private footerService: FooterService,
    ){
      this.commonService.input$.subscribe((data)=>{
        console.log(data);
      });
      console.log(this);

      console.log(footerService);
      this.getPlanets();
      
    }
    ngOnInit(){

    }
    getPlanets():void{  //4
      this.footerService.getPlanets().then((planets:any)=>{
        this.planets = planets;
        console.log(this.planets);
      });
    }
    mytest():Result{  //4
      return {
        error:"fe"
      }
    }
}