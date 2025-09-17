import { Header } from '../../components/header/header';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { TuiNavigation } from '@taiga-ui/layout';
import { Navigation } from '../../components/navigation/navigation';
import { TranslatePipe } from '@ngx-translate/core';
import { TuiButton } from '@taiga-ui/core';
import { ReactiveFormsModule } from '@angular/forms';
import type { PieceColorType } from '@/app/types/chess-square.type';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-game-page',
  imports: [
    Header,
    TuiNavigation,
    Navigation,
    TranslatePipe,
    TuiButton,
    ReactiveFormsModule,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  public chosenColor = signal<PieceColorType>('black');
  protected readonly store = inject(Store);

  protected setColor(event: Event): void {
    const target = event.target;
    if (
      target instanceof HTMLInputElement &&
      (target.value === 'black' || target.value === 'white')
    ) {
      this.chosenColor.set(target.value);
    }
  }
}
