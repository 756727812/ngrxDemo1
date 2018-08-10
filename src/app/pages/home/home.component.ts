import { Component, OnInit } from '@angular/core';
import { CommonService } from "../../service/common.service"

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private commonservice:CommonService) { }

  ngOnInit() {
    
  }

  go(){
    this.commonservice.send_data("a");
  }

}
