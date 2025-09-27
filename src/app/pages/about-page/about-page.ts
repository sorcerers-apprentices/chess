import { TuiTitle } from '@taiga-ui/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Header } from '@/app/components/header/header';
import { TuiHeader, TuiMainComponent } from '@taiga-ui/layout';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Navigation } from '@/app/components/navigation/navigation';
import { TeamsCards } from '@/app/components/teams-cards/teams-cards';
import { ProjectDescription } from '@/app/components/project-description/project-description';

@Component({
  selector: 'app-about-page',
  imports: [
    Header,
    Navigation,
    TuiMainComponent,
    TuiHeader,
    TuiTitle,
    TranslatePipe,
    ProjectDescription,
    TeamsCards,
  ],
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {}
