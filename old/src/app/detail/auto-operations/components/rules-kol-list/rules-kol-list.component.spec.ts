import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RulesKolListComponent } from './rules-kol-list.component';

describe('RulesKolListComponent', () => {
  let component: RulesKolListComponent;
  let fixture: ComponentFixture<RulesKolListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RulesKolListComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RulesKolListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
