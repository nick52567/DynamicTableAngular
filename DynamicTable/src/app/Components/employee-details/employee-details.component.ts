import { Component } from '@angular/core';

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.scss']
})
export class EmployeeDetailsComponent {

  public tableColumns:string[]=['ID','Name','Age'];
  public emplData: any[]=[{ID:'1',Name:'Nikhil',Age:'26'},{ID:2,Name:'Ajay',Age:'30'},]
  public pageSize = Number(1);
  public pageSizeOptions: number[]=[1,10,20]

  constructor(){}

}
