import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class ExampleService {
  public supabase = createClient('https://jnwnlprjvevgdxnngxnr.supabase.co', 'sb_publishable_xcVsmJL_0q0lZYtOd55uhg_bMsN2p5h')
}
