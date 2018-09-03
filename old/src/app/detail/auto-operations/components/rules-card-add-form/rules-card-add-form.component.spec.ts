import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RulesCardAddFormComponent } from './rules-card-add-form.component';

describe('RulesCardAddFormComponent', () => {
  let component: RulesCardAddFormComponent;
  let fixture: ComponentFixture<RulesCardAddFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RulesCardAddFormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RulesCardAddFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
