import { Component,OnInit } from '@angular/core';
import { JsonService } from 'src/app/Services/json.service';

@Component({
  selector: 'app-organization-details',
  templateUrl: './organization-details.component.html',
  styleUrls: ['./organization-details.component.scss']
})
export class OrganizationDetailsComponent implements OnInit {
  
  public tableColumns: string[] = ['select','ID', 'Companies', 'Location','Field'];
  public emplData: any[] = [{ ID: 1, Companies: 'TCS', Location: 'New Delhi',Field:'Conglomaret' },
   { ID: 2, Companies: 'NVidea', Location: 'Noida',Field:'Conglomaret' },
   { ID: 3, Companies: 'NCR', Location: 'Noida',Field:'Conglomaret' }]
  public pageSize = Number(1);
  public pageSizeOptions: number[]=[3,10,20]

  constructor(private _srvJson:JsonService) {}

  ngOnInit(): void {
    this._srvJson.getSampleData().subscribe((res:any)=>{
     this.emplData = res;
    })
  }
  getRowSelection(event:any){
    const row = event;
    console.log(row);
  }
}
