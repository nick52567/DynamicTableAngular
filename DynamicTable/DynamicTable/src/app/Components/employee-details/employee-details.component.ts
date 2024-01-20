import { Component } from '@angular/core';
import { JsonService } from 'src/app/Services/json.service';

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.scss']
})
export class EmployeeDetailsComponent {

  public tableColumns:string[]=['ID','Name','DOB'];
  public emplData: any[]=[{ID:'1',Name:'Nikhil',DOB:'26'},{ID:2,Name:'Ajay',DOB:'30'},]
  public pageSize = Number(1);
  public pageSizeOptions: number[]=[3,10,20]
  public dateFormat = String('dd-MM-yyyy');

  constructor(private _srvJson:JsonService){}

  ngOnInit(): void {
    this._srvJson.getEmpData().subscribe((res:any)=>{
     this.emplData = res.map((emp: { [x: string]: string | number | Date; })=>{
      emp['DOB'] = new Date(emp['DOB'])
      return emp;
     });
    })
  }
}
