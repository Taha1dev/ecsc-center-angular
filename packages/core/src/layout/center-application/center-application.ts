import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppToaster } from '@workspace/ui';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppToaster],
  templateUrl: './center-application.html',
})
export class CenterApplication {}
