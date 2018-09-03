import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-activity-cluster',
  templateUrl: './activity-cluster.component.html',
  styleUrls: ['./activity-cluster.component.less'],
})
export class ActivityClusterComponent implements OnInit, OnDestroy {
  sub: Subscription;
  constructor(private activatedRoute: ActivatedRoute, private router:Router) {}

  ngOnInit() {
    this.sub = this.activatedRoute.fragment.subscribe(fragment => {
      this.currentTab = Number(fragment) - 1;
    });

    this.router.events
      .filter(event => event instanceof NavigationEnd)
      .map(() => this.activatedRoute)
      .map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      })
      .filter(route => route.outlet === 'primary')
      .mergeMap(route => route.data)
      .subscribe((event) => console.log(event['index']));
  //     this.router.events
  // .filter(event => event instanceof NavigationEnd)
  // .map(() => this.activatedRoute)
  // .subscribe((event) => {
  //   console.log('NavigationEnd:', event);
  // });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  tabs = [
    {
      index: 1,
      title: '拼团',
      routeLink: 'collage'
    },
    {
      index: 2,
      title: '秒杀',
      routeLink: 'seckill'
    },
    {
      index: 3,
      title: '满减',
      routeLink: 'full-off'
    },
  ];

  currentTab: number = 0;
  tabChange(index) {
    console.log(index);
    this.currentTab = index;
    location.hash = (index + 1).toString();
  }
  selectChange(e) {
  }
}
