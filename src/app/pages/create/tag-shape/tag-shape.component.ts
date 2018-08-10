import { Component, Output, EventEmitter } from '@angular/core';
import { CommonService } from "../../../service/common.service"

@Component({
 selector: 'app-tag-shape',
 templateUrl: './tag-shape.component.html',
 styleUrls: ['./tag-shape.component.css']
})
export class TagShapeComponent {
 tagShape: string;
 @Output() selectShapeEvent = new EventEmitter();

 constructor(private comService:CommonService) { 
   this.comService.subject.subscribe(res=>console.log(res));
 }

 selectShape(shape: string) {
   this.selectShapeEvent.emit(shape);
 }

}