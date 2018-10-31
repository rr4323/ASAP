import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule }        from '@angular/platform-browser';
import { FormsModule }          from '@angular/forms';
import { SearchComponent } from './search/search.component';
import { AppComponent } from '../app/app.component';
import { RoutingComponent } from './routing/routing.component';
import { TrafficComponent } from './traffic/traffic.component';
import { HomeComponent } from './home/home.component'

const routes : Routes = [
  { path: 'search', component: SearchComponent },
  { path: 'route', component: RoutingComponent },
  { path: 'traffic', component: TrafficComponent },
  { path: 'home', component: HomeComponent  }

];
@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]

})

export class AppRoutingModule {}
