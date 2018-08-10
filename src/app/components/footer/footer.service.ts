import {Injectable} from '@angular/core';

@Injectable()
export class FooterService {
    getPlanets(){//在服务里写一个方法
        return Promise.resolve({"page":1});
    }
}