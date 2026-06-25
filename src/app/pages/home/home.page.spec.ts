import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePage } from './home.page';
import { ServiceService } from 'src/app/services/service.service';
import { AnimationController, ModalController } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ServiceService', ['openModal', 'url']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        { provide: ServiceService, useValue: serviceSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
        AnimationController
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open modal on abrirModalPublication', async () => {
    await component.abrirModalPublication();
    expect(serviceSpy.openModal).toHaveBeenCalled();
  });

  it('should call vibrate on tab change when navigator supports it', async () => {
    if (typeof navigator.vibrate !== 'function') {
      pending('navigator.vibrate not available in this browser');
      return;
    }
    spyOn(navigator, 'vibrate').and.stub();
    const event = { tab: 'messages' };
    await component.onTabChange(event);
    expect(navigator.vibrate).toHaveBeenCalledWith(10);
  });
});
