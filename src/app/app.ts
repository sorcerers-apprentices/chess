import { RouterModule } from '@angular/router';
import { Component, inject } from '@angular/core';
import { TUI_DARK_MODE, TuiRoot } from '@taiga-ui/core';

@Component({
  imports: [RouterModule, TuiRoot],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly darkMode = inject(TUI_DARK_MODE);
}
