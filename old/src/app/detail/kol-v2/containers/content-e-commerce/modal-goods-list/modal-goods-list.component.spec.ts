import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalGoodsListComponent } from './modal-goods-list.component';

describe('ModalGoodsListComponent', () => {
  let component: ModalGoodsListComponent;
  let fixture: ComponentFixture<ModalGoodsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalGoodsListComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalGoodsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
