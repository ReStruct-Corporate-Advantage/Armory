import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {DateModule} from '../date/date.module';
import {DateScenarioComponent} from './components/date-scenario/date-scenario.component';
import {NamedScenarioComponent} from './components/named-scenario/named-scenario.component';
import {OtherScenarioComponent} from './components/other-scenario/other-scenario.component';
import {UserScenarioService} from './services/user-scenario.service';

@NgModule({
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        DateModule
    ],
    declarations: [
        DateScenarioComponent,
        NamedScenarioComponent,
        OtherScenarioComponent
    ],
    exports: [
        DateScenarioComponent,
        NamedScenarioComponent,
        OtherScenarioComponent
    ],
    providers: [
        UserScenarioService
    ]
})
export class ScenarioModule {
}
