import { Injectable, EventEmitter } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()

export class CommonService {
    public input$: EventEmitter<string> = new EventEmitter<string>();
    public output$: EventEmitter<any> = new EventEmitter<string>();
    constructor(){
        
    }
    private sub = new Subject();
    subject = this.sub.asObservable();

    send_data(a){
        this.sub.next(a);
    }
}