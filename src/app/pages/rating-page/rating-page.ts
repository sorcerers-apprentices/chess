import { TranslatePipe } from '@ngx-translate/core';
import { Header } from '@/app/components/header/header';
import { TuiAppearance, TuiButton, TuiTitle } from '@taiga-ui/core';
import { RatingTable } from '@/app/components/rating-table/rating-table';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TuiCardLarge, TuiHeader, TuiMainComponent } from '@taiga-ui/layout';

@Component({
  selector: 'app-rating-page',
  imports: [
    Header,
    TuiMainComponent,
    TuiHeader,
    TuiTitle,
    TranslatePipe,
    RatingTable,
    TuiAppearance,
    TuiCardLarge,
    TuiButton,
  ],
  templateUrl: './rating-page.html',
  styleUrl: './rating-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingPage {
  protected readonly isShowDescription = signal<boolean>(false);

  protected showDescription(): void {
    this.isShowDescription.set(!this.isShowDescription());
  }
}
