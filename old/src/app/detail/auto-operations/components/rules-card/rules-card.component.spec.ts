import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RulesCardComponent } from './rules-card.component';

describe('RulesCardComponent', () => {
  let component: RulesCardComponent;
  let fixture: ComponentFixture<RulesCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RulesCardComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RulesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
