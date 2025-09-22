import { TuiMainComponent } from '@taiga-ui/layout';
import { Header } from '@/app/components/header/header';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Navigation } from '@/app/components/navigation/navigation';

@Component({
  selector: 'app-about-page',
  imports: [Header, Navigation, TuiMainComponent],
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {}
