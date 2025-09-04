import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TuiRoot } from '@taiga-ui/core';
import { ExampleService } from './shared/services/example.service';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
  imports: [RouterModule, TuiRoot, JsonPipe, AsyncPipe],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  public exampleService = inject(ExampleService);

  f = this.exampleService.supabase.auth.signInAnonymously();
}
