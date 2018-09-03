import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentECommerceComponent } from './content-e-commerce.component';

describe('ContentECommerceComponent', () => {
  let component: ContentECommerceComponent;
  let fixture: ComponentFixture<ContentECommerceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContentECommerceComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentECommerceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
