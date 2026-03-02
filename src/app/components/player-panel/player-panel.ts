import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-player-panel',
  imports: [TranslatePipe],
  templateUrl: './player-panel.html',
  styleUrl: './player-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPanel {
  public readonly color = input.required<'white' | 'black'>();
  protected readonly queenIcons = {
    white: 'assets/img/chess-piece/white/wQ.svg',
    black: 'assets/img/chess-piece/black/bQ.svg',
  };
  protected readonly icon = computed(() => this.queenIcons[this.color()]);
  protected readonly label = computed(() =>
    this.color() === 'white' ? 'White' : 'Black',
  );
}
