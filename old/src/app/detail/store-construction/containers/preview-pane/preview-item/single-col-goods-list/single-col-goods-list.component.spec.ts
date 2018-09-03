import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleColGoodsListComponent } from './single-col-goods-list.component';

describe('SingleColGoodsListComponent', () => {
  let component: SingleColGoodsListComponent;
  let fixture: ComponentFixture<SingleColGoodsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleColGoodsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleColGoodsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
