import { TuiSubheaderCompactComponent } from '@taiga-ui/layout';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-navigation',
  imports: [TuiSubheaderCompactComponent],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Navigation {}
