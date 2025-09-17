import { Header } from '../../components/header/header';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiNavigation } from '@taiga-ui/layout';
import { Navigation } from '../../components/navigation/navigation';
import type { PieceColorType } from '@/app/types/chess-square.type';

@Component({
  selector: 'app-game-page',
  imports: [Header, TuiNavigation, Navigation],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected value: PieceColorType | null = null;
  protected items = ['white', 'black'];
}
