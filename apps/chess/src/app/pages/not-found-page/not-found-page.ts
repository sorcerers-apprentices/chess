import { Router } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';
import { RoutePath } from '../../app.routes';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  TuiBlockStatusComponent,
  TuiBlockStatusDirective,
} from '@taiga-ui/layout';

@Component({
  selector: 'app-not-found-page',
  imports: [TuiBlockStatusComponent, TuiBlockStatusDirective, TuiButton],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {
  private readonly router = inject(Router);

  protected onBackHomePage(): void {
    this.router.navigate([RoutePath.main]);
  }
}
