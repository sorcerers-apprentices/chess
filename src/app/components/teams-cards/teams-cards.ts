import {
  TuiLink,
  TuiTitle,
  TuiButton,
  TuiAppearance,
  TuiAutoColorPipe,
  TuiFallbackSrcPipe,
} from '@taiga-ui/core';
import {
  GITHUB_ANNA_AVATAR,
  GITHUB_ARTEM_AVATAR,
  GITHUB_DARYA_AVATAR,
} from '@/app/constants/avatars.constants';
import {
  GITHUB_ANNA_LINK,
  GITHUB_ARTEM_LINK,
  GITHUB_DARYA_LINK,
} from '@/app/constants/links.constants';
import { TranslatePipe } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { TuiCard, TuiHeader } from '@taiga-ui/layout';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiAvatar, TuiAvatarLabeled, TuiChip } from '@taiga-ui/kit';

@Component({
  selector: 'app-teams-cards',
  imports: [
    TranslatePipe,
    TuiFallbackSrcPipe,
    AsyncPipe,
    TuiAutoColorPipe,
    TuiAppearance,
    TuiCard,
    TuiHeader,
    TuiTitle,
    TuiAvatarLabeled,
    TuiAvatar,
    TuiChip,
    TuiButton,
    TuiLink,
  ],
  templateUrl: './teams-cards.html',
  styleUrl: './teams-cards.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamsCards {
  protected readonly githubAnnaLink = GITHUB_ANNA_LINK;
  protected readonly githubDaryaLink = GITHUB_DARYA_LINK;
  protected readonly githubArtemLink = GITHUB_ARTEM_LINK;

  protected readonly githubAnnaAvatar = GITHUB_ANNA_AVATAR;
  protected readonly githubDaryaAvatar = GITHUB_DARYA_AVATAR;
  protected readonly githubArtemAvatar = GITHUB_ARTEM_AVATAR;

  protected readonly chips = {
    artem: ['CI/CD', 'Refactoring', 'Deploy', 'Features', 'Store', 'Engine'],
    darya: [
      'Backend',
      'API',
      'Features',
      'Routing',
      'Refactoring',
      'UI',
      'Databases',
    ],
    anna: [
      'Features',
      'UI',
      'Testing',
      'Refactoring',
      'Design',
      'Engine',
      'Store',
    ],
  };
}
