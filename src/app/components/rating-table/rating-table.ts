import {
  signal,
  inject,
  Component,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TuiLoader } from '@taiga-ui/core';
import type { OnInit } from '@angular/core';
import { TuiTable } from '@taiga-ui/addon-table';
import { NgTemplateOutlet } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import type { UserData } from '@/app/services/user-supabase.service';
import { UserSupabaseService } from '@/app/services/user-supabase.service';

type UserWithRankType = {
  rank: number;
} & UserData;

@Component({
  selector: 'app-rating-table',
  imports: [TuiTable, TranslatePipe, TuiLoader, NgTemplateOutlet],
  templateUrl: './rating-table.html',
  styleUrl: './rating-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingTable implements OnInit {
  protected readonly users = signal<UserData[]>([]);
  protected readonly loading = signal<boolean>(true);
  protected readonly usersWithRanks = computed<UserWithRankType[]>(() =>
    this.calculateUsersWithRanks(this.users()),
  );

  private readonly api = inject(UserSupabaseService);

  public async ngOnInit(): Promise<void> {
    try {
      const userData = await this.api.fetchUsers();
      this.users.set(userData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private calculateUsersWithRanks(users: UserData[]): UserWithRankType[] {
    const sortedUsers = [...users].sort((a, b) => b.elo - a.elo);

    let currentRank = 1;
    let previousElo: number | null = null;

    return sortedUsers.map((user, index) => {
      if (previousElo !== null && user.elo < previousElo) {
        currentRank = index + 1;
      }

      previousElo = user.elo;

      return {
        ...user,
        rank: currentRank,
      };
    });
  }
}
