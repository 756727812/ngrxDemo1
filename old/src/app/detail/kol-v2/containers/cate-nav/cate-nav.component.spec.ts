import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CateNavComponent } from './cate-nav.component';

describe('CateNavComponent', () => {
  let component: CateNavComponent;
  let fixture: ComponentFixture<CateNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CateNavComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CateNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
