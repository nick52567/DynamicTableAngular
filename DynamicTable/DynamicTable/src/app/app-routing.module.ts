import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './Components/homepage/homepage.component';
import { EmployeeDetailsComponent } from './Components/employee-details/employee-details.component';
import { OrganizationDetailsComponent } from './Components/organization-details/organization-details.component';

const routes: Routes = [
  { path:'',component:HomepageComponent},
  { path:'employee-page',component:EmployeeDetailsComponent},
  { path: 'organization-details',component:OrganizationDetailsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
