import { Header } from '../../components/header/header';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiNavigation } from '@taiga-ui/layout';
import { Navigation } from '../../components/navigation/navigation';

@Component({
  selector: 'app-game-page',
  imports: [Header, TuiNavigation, Navigation],
  templateUrl: './sign-up-page.html',
  styleUrl: './sign-up-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpPage {}
