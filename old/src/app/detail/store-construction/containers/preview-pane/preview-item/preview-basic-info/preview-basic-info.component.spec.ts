import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewBasicInfoComponent } from './preview-basic-info.component';

describe('PreviewBasicInfoComponent', () => {
  let component: PreviewBasicInfoComponent;
  let fixture: ComponentFixture<PreviewBasicInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewBasicInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewBasicInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
