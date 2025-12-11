import { Component } from '@angular/core';

import { HeroComponent } from './component/hero/hero.component';
import { FeatureComponent } from './component/feature/feature.component';
import { SkillComponent } from './component/skill/skill.component';
import { ExperienceComponent } from './component/experience/experience.component';
import { ProjectComponent } from './component/project/project.component';
import { NavbarComponent } from './component/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeroComponent,
    FeatureComponent,
    SkillComponent,
    ExperienceComponent,
    ProjectComponent,
    NavbarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'my-folio';
}
