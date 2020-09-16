import { TestBed, ComponentFixture, getTestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import {
  DebugElement,
  NO_ERRORS_SCHEMA,
  OnInit,
  Component,
  ViewChild,
  ViewContainerRef,
  Compiler,
  NgModule,
} from '@angular/core';
import { BrowserModule, By } from '@angular/platform-browser';
import { NgxTippyDirective } from '../lib/ngx-tippy.directive';
import { NgxTippyService } from '../lib/ngx-tippy.service';
import { NgxTippyProps } from '../lib/ngx-tippy.interfaces';
import { fakeInstance } from '../fixtures/tippy-instance.fixture';

const commonStyles = [
  `
    .test {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 120px;
      padding: 40px;
      background-color: #f9f8f5;
      font-family: 'Open Sans', sans-serif;
    }

    .test__btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      background-image: linear-gradient(120deg, #54d182 0%, #3db9f5 100%);
      color: #fff;
      font-weight: 600;
      font-size: 14px;
      font-family: 'Open Sans', sans-serif;
      cursor: pointer;
    }
  `,
];

/** Wrapper component */
@Component({
  selector: 'tippy-test',
  template: `<div #container></div>`,
})
class TestInlineComponent {
  @ViewChild('container', { read: ViewContainerRef, static: true }) container: ViewContainerRef;

  constructor(private compiler: Compiler) {}

  ngOnInit() {}

  public addComponent(template: string, styles: string[], properties: any = {}) {
    @Component({ template, styles })
    class TemplateComponent {}

    @NgModule({ declarations: [TemplateComponent, NgxTippyDirective] })
    class TemplateModule {}

    const moduleComponentFactories = this.compiler.compileModuleAndAllComponentsSync(TemplateModule);
    const factory = moduleComponentFactories.componentFactories.find(
      (component) => component.componentType === TemplateComponent
    );
    const component = this.container.createComponent(factory);
    Object.assign(component.instance, properties);
  }
}

describe('Directive: NgxTippyDirective', () => {
  let injector: TestBed;
  let fixture: ComponentFixture<TestInlineComponent>;
  let component: TestInlineComponent;
  let tooltipDebugEl: DebugElement;
  let tippyService: any;

  beforeEach(async () => {
    const tippyServiceSpy = jasmine.createSpyObj('NgxTippyService', [
      'setInstance',
      'getInstance',
      'getInstances',
      'show',
      'hide',
      'hideWithInteractivity',
      'disable',
      'enable',
      'setProps',
      'setContent',
      'setTriggerTarget',
      'unmount',
      'clearDelayTimeouts',
      'destroy',
      'setDefaultProps',
      'showAll',
      'hideAll',
    ]);

    TestBed.configureTestingModule({
      imports: [BrowserModule],
      declarations: [TestInlineComponent],
      providers: [{ provide: NgxTippyService, useValue: tippyServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        injector = getTestBed();
        fixture = injector.createComponent(TestInlineComponent);
        component = fixture.componentInstance;
        tippyService = injector.inject(NgxTippyService);
      });
  });

  it('Should create wrapper component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy('Wrapper component does not created');
  });

  it('Should show tooltip on hover', () => {
    component.addComponent(
      `
      <div class="test">
        <button
          class="test__btn"
          ngxTippy
          data-tippy-content="Tooltip content"
          [tippyProps]="{
            appendTo: 'parent'
          }"
        >
          Element with tooltip
        </button>
      </div>
      `,
      commonStyles
    );

    fixture.detectChanges();
    tooltipDebugEl = fixture.debugElement.query(By.directive(NgxTippyDirective));
    tooltipDebugEl.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    const tooltip = fixture.debugElement.query(By.css('div[data-tippy-root]'));

    expect(tooltip).toBeTruthy('Tooltip does not created');
  });

  it('Should show tooltip on click ', () => {
    component.addComponent(
      `
      <div class="test">
        <button
          class="test__btn"
          ngxTippy
          data-tippy-content="Tooltip content"
          [tippyProps]="{
            appendTo: 'parent',
            trigger: 'click'
          }"
        >
          Element with tooltip
        </button>
      </div>
      `,
      commonStyles
    );

    fixture.detectChanges();
    tooltipDebugEl = fixture.debugElement.query(By.directive(NgxTippyDirective));
    tooltipDebugEl.nativeElement.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    const tooltip = fixture.debugElement.query(By.css('div[data-tippy-root]'));

    expect(tooltip).toBeTruthy('Tooltip does not created');
  });

  it('Should apply props passed through data attribute', fakeAsync(() => {
    component.addComponent(
      `
      <div class="test">
        <button
          class="test__btn"
          ngxTippy
          data-tippy-content="Tooltip content"
          [tippyProps]="{
            appendTo: 'parent',
            arrow: false,
            duration: 500
          }"
        >
          Element with tooltip
        </button>
      </div>
      `,
      commonStyles
    );

    fixture.detectChanges();
    tooltipDebugEl = fixture.debugElement.query(By.directive(NgxTippyDirective));
    tooltipDebugEl.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    const tippyBox = fixture.debugElement.query(By.css('.tippy-box'));

    let tooltipDuration: string;
    setTimeout(() => {
      tooltipDuration = tippyBox.nativeElement.style.transitionDuration;
    }, 500);
    tick(500);

    expect(tooltipDuration).toBeTruthy('Transition duration is not set');
    expect(tooltipDuration).toBe('500ms', 'Wrong transition duration value');
  }));

  it('Should apply props passed through binding from component', () => {
    component.addComponent(
      `
      <div class="test">
        <button
          class="test__btn"
          ngxTippy
          data-tippy-content="Tooltip content"
          [tippyProps]="props"
        >
          Element with tooltip
        </button>
      </div>
      `,
      commonStyles,
      {
        props: {
          appendTo: 'parent',
          arrow: false,
          theme: 'light',
        },
      }
    );

    fixture.detectChanges();
    tooltipDebugEl = fixture.debugElement.query(By.directive(NgxTippyDirective));
    tooltipDebugEl.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    const tippyBox = fixture.debugElement.query(By.css('.tippy-box'));
    const tooltipArrow = fixture.debugElement.query(By.css('.tippy-arrow'));
    const tooltipBgColor = getComputedStyle(tippyBox.nativeElement).backgroundColor;

    expect(tooltipArrow).toBeNull('Tooltip must be without arrow');
    expect(tooltipBgColor).toBe('rgb(255, 255, 255)', 'Background color must be white');
  });

  it('Should apply content passed through data attribute', () => {
    component.addComponent(
      `
      <div class="test">
        <button
          class="test__btn"
          ngxTippy
          data-tippy-content="Tooltip content passed through data attribute"
          [tippyProps]="{
            appendTo: 'parent'
          }"
        >
          Element with tooltip
        </button>
      </div>
      `,
      commonStyles
    );

    fixture.detectChanges();
    tooltipDebugEl = fixture.debugElement.query(By.directive(NgxTippyDirective));
    tooltipDebugEl.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    const tooltipContent = fixture.debugElement.query(By.css('.tippy-content'));

    expect(tooltipContent.nativeElement.textContent).toBe('Tooltip content passed through data attribute');
  });

  it('Should apply content passed inline through content prop', () => {
    component.addComponent(
      `
      <div class="test">
        <button
          class="test__btn"
          ngxTippy
          [tippyProps]="{
            appendTo: 'parent',
            allowHTML: true,
            content: '<p>Tooltip <strong>HTML</strong> content</p>'
          }"
        >
          Element with tooltip
        </button>
      </div>
      `,
      commonStyles
    );

    fixture.detectChanges();
    tooltipDebugEl = fixture.debugElement.query(By.directive(NgxTippyDirective));
    tooltipDebugEl.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    const tooltipContent = fixture.debugElement.query(By.css('.tippy-content'));
    const tooltipContentInnerHTML = tooltipContent.nativeElement.innerHTML;
    expect(tooltipContentInnerHTML).toContain('<p>', 'Tag "<p>" is not found');
    expect(tooltipContentInnerHTML).toBe(
      '<p>Tooltip <strong>HTML</strong> content</p>',
      'Content does not match passed content'
    );
  });

  it('Should apply content passed through binding from component', () => {
    const content = 'Content from component';
    component.addComponent(
      `
      <div class="test">
        <button
          class="test__btn"
          ngxTippy
          [tippyProps]="props"
        >
          Element with tooltip
        </button>
      </div>
      `,
      commonStyles,
      {
        props: {
          appendTo: 'parent',
          content: content,
        },
      }
    );

    fixture.detectChanges();
    tooltipDebugEl = fixture.debugElement.query(By.directive(NgxTippyDirective));
    tooltipDebugEl.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    const tooltipContent = fixture.debugElement.query(By.css('.tippy-content'));
    expect(tooltipContent.nativeElement.innerText).toBe(content);
  });

  it('Should call getInstance method', () => {
    component.addComponent(
      `
      <div class="test">
        <button
          class="test__btn"
          ngxTippy
          tippyName="tippy-content"
          data-tippy-content="Tooltip content"
          [tippyProps]="{
            appendTo: 'parent'
          }"
        >
          Element with tooltip
        </button>
      </div>
      `,
      commonStyles
    );

    fixture.detectChanges();
    tooltipDebugEl = fixture.debugElement.query(By.directive(NgxTippyDirective));
    tooltipDebugEl.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    tippyService.getInstance.and.returnValue(fakeInstance);
    const instance = tippyService.getInstance('tippy-content');

    expect(tippyService.getInstance).toHaveBeenCalledTimes(1);
    expect(tippyService.getInstance).toHaveBeenCalledWith('tippy-content');
    expect(instance).toBe(fakeInstance, 'Returned instance is wrong');
  });

  it('Should call setProps method', () => {
    component.addComponent(
      `
      <div class="test">
        <button
          class="test__btn"
          ngxTippy
          data-tippy-content="Tooltip content"
          [tippyProps]="{
            appendTo: 'parent'
          }"
        >
          Element with tooltip
        </button>
      </div>
      `,
      commonStyles
    );

    fixture.detectChanges();
    tooltipDebugEl = fixture.debugElement.query(By.directive(NgxTippyDirective));
    tooltipDebugEl.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    tippyService.setProps('tippy-content', 'New props');
    expect(tippyService.setProps).toHaveBeenCalledTimes(1);
    expect(tippyService.setProps).toHaveBeenCalledWith('tippy-content', 'New props');
  });

  it('Should apply template passed through directive reference', () => {
    component.addComponent(
      `
      <div class="test">
        <button
          class="test__btn"
          [ngxTippy]="tippyTemplate"
          tippyName="content-9"
          [tippyProps]="{
            allowHTML: true,
            appendTo: 'parent',
            interactive: true
          }"
        >
          Element with tooltip
        </button>

        <div class="template" #tippyTemplate>
          <h4 class="template__caption">Caption</h4>
          <p class="template__description">Some content</p>
          <button class="template__action" (click)="onTemplateClick($event)">Action</button>
        </div>
      </div>
      `,
      commonStyles,
      {
        onTemplateClick(event: MouseEvent) {
          console.log(event);
        },
      }
    );

    fixture.detectChanges();
    tooltipDebugEl = fixture.debugElement.query(By.directive(NgxTippyDirective));
    tooltipDebugEl.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    const tooltipContent = fixture.debugElement.query(By.css('.tippy-content'));
    const templateWrapper = tooltipContent.query(By.css('div'));
    const templateAction = tooltipContent.query(By.css('button'));

    expect(templateWrapper).toBeTruthy('Template does not created');
    expect(templateWrapper.nativeElement).toHaveClass('template', 'Template  have not appropriate class');

    expect(templateAction).toBeTruthy('Button within template does not created');
    expect(templateAction.nativeElement).toHaveClass('template__action', 'Button  have not appropriate class');

    spyOn(console, 'log');
    templateAction.nativeElement.dispatchEvent(new MouseEvent('click'));

    expect(console.log).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledTimes(1);
  });
  it('Should apply class names', () => {
    component.addComponent(
      `
      <div class="test">
        <button
          class="test__btn"
          ngxTippy
          data-tippy-content="Tooltip content"
          [tippyProps]="{
            appendTo: 'parent'
          }"
          tippyClassName="custom another-class"
        >
          Element with tooltip
        </button>
      </div>
      `,
      commonStyles
    );

    fixture.detectChanges();
    tooltipDebugEl = fixture.debugElement.query(By.directive(NgxTippyDirective));
    tooltipDebugEl.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    const tippyBoxWithClasses = fixture.debugElement.query(By.css('.tippy-box.custom.another-class'));
    expect(tippyBoxWithClasses).toBeTruthy('Classes were not applied');
    expect(tippyBoxWithClasses.nativeElement).toHaveClass('custom', 'Tippy box does not contain passed "custom" class');
    expect(tippyBoxWithClasses.nativeElement).toHaveClass(
      'another-class',
      'Tippy box does not contain passed "another-class" class'
    );
  });
});
