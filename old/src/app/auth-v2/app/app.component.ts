import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as bowser from 'bowser';

@Component({
  selector: 'auth',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
  isMobile: boolean = bowser.mobile;

  constructor(private router: Router) {
    this.isMobile && document.body.classList.add('mobile');
    router.events.subscribe(event => {
      // 针对angular路由自动删除auth.html暂时特殊处理下
      if (
        location.pathname.indexOf('auth.html') === -1 &&
        history &&
        history.replaceState
      ) {
        const url = location.href.replace('#!', 'auth.html#!');
        history.replaceState(null, '', url);
      }
    });
  }

  ngOnInit() {
    /**
     * 打印安全提示
     */
    if (process.env.NODE_ENV === 'production') {
      console.log(
        '%c \u5b89\u5168\u8b66\u544a\uff01',
        'font-size:50px;color:red;-webkit-text-fill-color:red;-webkit-text-stroke: 1px black;',
      );
      console.log(
        '%c \u6b64\u6d4f\u89c8\u5668\u529f\u80fd\u4e13\u4f9b\u5f00\u53d1\u8005\u4f7f\u7528\u3002' +
          '\u82e5\u67d0\u4eba\u8ba9\u60a8\u5728\u6b64\u590d\u5236\u7c98\u8d34\u67d0\u5185\u5bb9' +
          '\u4ee5\u542f\u7528\u67d0\u0020\u0053\u0065\u0065\u0067\u006f\u0020\u540e\u53f0\u529f' +
          '\u80fd\u6216\u201c\u5165\u4fb5\u201d\u67d0\u4eba\u5e10\u6237\uff0c\u6b64\u4e3a\u6b3a' +
          '\u8bc8\uff0c\u4f1a\u4f7f\u5bf9\u65b9\u83b7\u6743\u8fdb\u5165\u60a8\u7684\u0020\u0053' +
          '\u0065\u0065\u0067\u006f\u0020\u540e\u53f0\u5e10\u6237\uff0c\u7ed9\u60a8\u9020\u6210' +
          '\u635f\u5931\u3002',
        'font-size: 20px;color:#333',
      );
    }
  }
}
