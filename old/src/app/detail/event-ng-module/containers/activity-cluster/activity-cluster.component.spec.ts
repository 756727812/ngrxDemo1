import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityClusterComponent } from './activity-cluster.component';

describe('ActivityClusterComponent', () => {
  let component: ActivityClusterComponent;
  let fixture: ComponentFixture<ActivityClusterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActivityClusterComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityClusterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
