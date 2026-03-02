import {
  Component,
  NO_ERRORS_SCHEMA,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Header } from '@/app/components/header/header';
import { TUI_DARK_MODE } from '@taiga-ui/core';
import { signal } from '@angular/core';

// Заглушка Sidebar
@Component({
  standalone: true,
  selector: 'app-sidebar',
  template: '<div data-testid="sidebar-stub"></div>',
})
class SidebarStub {}

describe('Header (template + darkMode)', () => {
  let fixture: ComponentFixture<Header>;
  let component: Header;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // без Header и без Sidebar!
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(Header, {
        set: {
          imports: [SidebarStub],
          template: `
<header tuiNavigationHeader class="header">
  <button
    title="Menu"
    tuiIconButton
    tuiNavigationDrawer
    type="button"
    [(open)]="open"
  >
    <app-sidebar />
  </button>
  <span tuiNavigationLogo>
    <span tuiFade>Chess Game</span>
    <tui-badge>online</tui-badge>
  </span>
  <button
    appearance="action-grayscale"
    size="s"
    tuiIconButton
    type="button"
    [iconStart]="icon()"
    [style.border-radius.%]="100"
    (click)="darkMode.set(!darkMode())"
  ></button>
</header>
          `,
          // В исходнике singular: styleUrl — обнуляем именно его
          styleUrl: undefined,
          styles: [],
          schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
          providers: [
            {
              provide: TUI_DARK_MODE,
              useValue: signal(false),
            },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('renders Chess Game title', () => {
    const el = fixture.debugElement.query(
      By.css('span[tuiNavigationLogo] span'),
    );
    expect(el.nativeElement.textContent).toContain('Chess Game');
  });

  it('renders online badge', () => {
    const badge = fixture.debugElement.query(By.css('tui-badge'));
    expect(badge.nativeElement.textContent).toContain('online');
  });

  it('has menu button with tuiNavigationDrawer', () => {
    const btn = fixture.debugElement.query(
      By.css('button[tuiNavigationDrawer]'),
    );
    expect(btn).toBeTruthy();
  });

  it('renders sidebar inside drawer button', () => {
    const sidebar = fixture.debugElement.query(
      By.css('[data-testid="sidebar-stub"]'),
    );
    expect(sidebar).toBeTruthy();
  });

  it('toggles darkMode signal on button click', () => {
    const btn = fixture.debugElement.query(
      By.css('button[appearance="action-grayscale"]'),
    ).nativeElement;

    expect(component.darkMode()).toBe(false);
    btn.click();
    fixture.detectChanges();
    expect(component.darkMode()).toBe(true);
  });
});
