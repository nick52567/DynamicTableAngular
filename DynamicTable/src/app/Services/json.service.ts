import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JsonService {

  constructor(private http:HttpClient) { }

  getSampleData(){
    return this.http.get('/assets/SampleJsonData/MOCK_DATA.json');
  }
}
