import { TuiMainComponent } from '@taiga-ui/layout';
import { Header } from '@/app/components/header/header';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Navigation } from '@/app/components/navigation/navigation';

@Component({
  selector: 'app-rating-page',
  imports: [Header, Navigation, TuiMainComponent],
  templateUrl: './rating-page.html',
  styleUrl: './rating-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingPage {}
