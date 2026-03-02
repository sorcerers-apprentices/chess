import {
  RS_SCHOOL_LINK,
  ANGULAR_COURSE_LINK,
} from '@/app/constants/links.constants';
import { TranslatePipe } from '@ngx-translate/core';
import { TuiCard, TuiHeader } from '@taiga-ui/layout';
import { TuiAppearance, TuiLink, TuiTitle } from '@taiga-ui/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-project-description',
  imports: [
    TuiAppearance,
    TuiCard,
    TuiHeader,
    TuiTitle,
    TuiLink,
    TranslatePipe,
  ],
  templateUrl: './project-description.html',
  styleUrl: './project-description.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDescription {
  protected readonly rssLink = RS_SCHOOL_LINK;
  protected readonly angularCourseLink = ANGULAR_COURSE_LINK;
}
