import { Component, EventEmitter, Input, OnChanges, Output, Pipe, PipeTransform, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSelect } from '@angular/material/select';
type ValueTypes = string | number | Date;
@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss']
})
export class DynamicTableComponent implements OnChanges {

  @Input() columns: string[] = [];
  @Input() tableData: Record<string,ValueTypes>[] = [];
  @Input() pageSize = Number(0);
  @Input() pageSizeOptions: number[] = [];
  @Output() sendRowSelection: EventEmitter<Record<string,ValueTypes>[]> = new EventEmitter<Record<string,ValueTypes>[]>();
 
  private filterDictionary = new Map<string, ValueTypes[]>();
  public keyValuePairs: { [key: string]: ValueTypes[] } = {};
  public dataSource = new MatTableDataSource<Record<string,ValueTypes>>([]);
  public selectionModel = new SelectionModel<Record<string,ValueTypes>>(true, []);
  public showPage = Boolean(false);

  @ViewChild(MatSort, { static: false })
  set sort(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild(MatPaginator,{static:false}) 
  set pgn(paginator: MatPaginator){
    this.dataSource.paginator = paginator;
  }
  public myControl = new FormControl('');
  public filterFormControl = new FormControl();
  public searchText = String('');
  public form!: FormGroup;
  @ViewChildren(MatSelect) selectRefs!: QueryList<MatSelect>;

  constructor(private fb:FormBuilder) {
    this.form = this.fb.group({});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.columns.length !== 0 && this.tableData.length !== 0) {
      this.dataSource = new MatTableDataSource(this.tableData);
      this.showPage = true;
    }
  }
  getDistinctColumnValues(column: string) {
    const removedKeyValue = new Map<string, ValueTypes[]>(this.filterDictionary);
    this.filterDictionary.delete(column);
    const res = this.tableData.filter((item) => {
      for (const [key, filterValue] of this.filterDictionary.entries()) {
        if (item.hasOwnProperty(key) && filterValue.includes(item[key])) {
          continue;
        }
        if (filterValue && filterValue.length > 0) {
          const itemValue = item[key];
          if (!filterValue.includes(itemValue)) {
            return false;
          }
        }
      }
      return true;
    })
    removedKeyValue.forEach((value, key) => {
      this.filterDictionary.set(key, value);
    })
    return [...new Set(res.map(item => item[column]))];
  }
  selection(event: string|number, column: string) {
    this.addValue(column, event)
  }
  addValue(key: string, value: string|number) {
    if (!this.keyValuePairs[key] && !this.form.contains(key)) {
      this.keyValuePairs[key] = []; // Initialize the array if it doesn't exist
      this.form.addControl(key,new FormControl(''))
    }
    const index = this.keyValuePairs[key].indexOf(value)
    if(index > -1)this.keyValuePairs[key].splice(index,1)
    else
    this.keyValuePairs[key].push(value); // Push the value to the array
    this.form.controls[key].setValue(this.keyValuePairs[key]);
  }
  applyFilter(column:string) {
    if (!this.keyValuePairs[column]) {this.keyValuePairs[column]=[]}
    this.filterDictionary.set(column, this.keyValuePairs[column])
    this.dataSource.data = this.tableData.filter(item => {
      return Array.from(this.filterDictionary.entries()).every(([key, value]) => {
        if (value.length === 0) {
          return true;
        }
        const itemValue = item[key].toString();
        return value.some(value => itemValue === value.toString());
      })
    })
  }
  searchValues(columnName: string) {
    const columnData = [...new Set(this.tableData.map(item => item[columnName]))]
    const res = columnData.filter((item) => item.toString().toLowerCase().includes(this.searchText.toLowerCase()));
    return res
  }
  getControl(key:string){
    return this.form.controls[key] as FormControl
  }

  clearFilter(column:string){
    this.filterDictionary.delete(column);
    this.keyValuePairs[column] = [];
    const control = this.getControl(column);
    control.setValue([]);
    this.applyFilter(column);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selectionModel.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if(!this.isAllSelected()){
      this.dataSource.data.forEach(row => this.selectionModel.select(row));
    }
    else{
      this.selectionModel.clear();
    }
    this.sendRowSelection.emit(this.selectionModel.selected);
  }
  toggleSelect(index:number) {
    if(this.columns.includes('select')) index =  index -1
    const selectElement = this.selectRefs.toArray()[index];
    if (selectElement) {
      if (!selectElement.panelOpen) {
        selectElement.open();
      } else {
        selectElement.close();
      }
    }

  }
}
@Pipe({
  name: 'searchValue',
})
export class SearchValuePipe implements PipeTransform {
  transform(data: any, searchText: string) {
    if (!data?.length) return searchText;
    return data.filter((item: string) => {
      return (
        item.toString().toLowerCase().indexOf(searchText.toLowerCase()) > -1
      );
    });
  }
}