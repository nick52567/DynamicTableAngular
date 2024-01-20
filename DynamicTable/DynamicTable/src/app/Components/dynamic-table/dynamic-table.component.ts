import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, Pipe, PipeTransform, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
type ValueTypes = string | number | Date;
@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss']
})
export class DynamicTableComponent implements OnChanges {

  @Input() columns: string[] = [];
  @Input() tableData: Record<string, ValueTypes>[] = [];
  @Input() pageSize = Number(0);
  @Input() pageSizeOptions: number[] = [];
  @Input() dateFormat: string = '';
  @Output() sendRowSelection: EventEmitter<Record<string, ValueTypes>[]> = new EventEmitter<Record<string, ValueTypes>[]>();
  @ViewChildren('contentToToggle') contentToToggle!: QueryList<ElementRef>;

  private filterDictionary = new Map<string, ValueTypes[]>();
  public keyValuePairs: { [key: string]: ValueTypes[] } = {};
  public dataSource = new MatTableDataSource<Record<string, ValueTypes>>([]);
  public selectionModel = new SelectionModel<Record<string, ValueTypes>>(true, []);
  public showPage = Boolean(false);

  @ViewChild(MatSort, { static: false })
  set sort(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild(MatPaginator, { static: false })
  set pgn(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }
  public filterFormControl = new FormControl();
  public searchText = String('');

  public ngAfterViewInit() {
    // Set display: none for all divs after the view has been initialized
    this.closeFilterBox();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes && this.columns.length !== 0 && this.tableData.length !== 0) {
      this.dataSource = new MatTableDataSource(this.tableData);
      this.showPage = true;
    }
  }
  //**Function call to get filter column data */
  public getDistinctColumnValues(column: string) {
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
    return this.sortFilterData([...new Set(res.map(item => item[column]))]);
  }
  //**Function call to sort filter column data */
  private sortFilterData(filterDate: ValueTypes[]) {
    if (filterDate.length === 0) {
      return filterDate;
    }
    else if (filterDate.every((item) => typeof item === 'string')) {
      return filterDate.sort((a, b) => (a as string).localeCompare(b as string));
    }
    else if (filterDate.every((item) => typeof item === 'number')) {
      return filterDate.sort((a, b) => (a as number) - (b as number));
    }
    else if (filterDate.every((item) => item instanceof Date)) {
      return filterDate.sort((a, b) => {
        if (a < b) { return -1 };
        if (a > b) { return 1 };
        return 0;
      });
    }
    else {
      return [];
    }
  }
  //**Function to add value into key value pairs */
  public selection(event: ValueTypes, column: string) {
    this.addValue(column, event)
  }
  //**Nested Fnction to add value into key value pairs */
  private addValue(key: string, value: ValueTypes) {
    if (!this.keyValuePairs[key]) {
      this.keyValuePairs[key] = []; // Initialize the array if it doesn't exist
    }
    const index = this.keyValuePairs[key].indexOf(value)
    if (index > -1) this.keyValuePairs[key].splice(index, 1)
    else
      this.keyValuePairs[key].push(value); // Push the value to the array
    console.log(this.filterDictionary.get(key))
  }
  //**Function to check selected filter values */
  public isSelectedFilterValue(key:string,value:ValueTypes){
    return this.keyValuePairs[key]?.includes(value);
  }
  //**Function to check filter active then update icon */
  public isFilterActive(key:string){
    return this.keyValuePairs[key]?.length === 0 || this.keyValuePairs[key] === undefined ? 'filter_alt':'filter_alt_off'
  }
  //**Function to apply filter */
  public applyFilter(column: string) {
    if (!this.keyValuePairs[column]) { this.keyValuePairs[column] = [] }
    this.filterDictionary.set(column, [...this.keyValuePairs[column]])
    this.dataSource.data = this.tableData.filter(item => {
      return Array.from(this.filterDictionary.entries()).every(([key, value]) => {
        if (value.length === 0) {
          return true;
        }
        const itemValue = item[key].toString();
        return value.some(value => itemValue === value.toString());
      })
    });
    this.closeFilterBox();
  }
  //**Function to reset filter */
  public clearFilter(column: string) {
    this.filterDictionary.delete(column);
    this.keyValuePairs[column] = [];
    this.searchText = '';
    this.applyFilter(column);
    this.closeFilterBox();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  public isAllSelected() {
    const numSelected = this.selectionModel.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  //**Function to check if value is instance of Date */
  public valueIsInstanceOfDate(value: ValueTypes) {
    return value instanceof Date;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  public masterToggle() {
    if (!this.isAllSelected()) {
      this.dataSource.data.forEach(row => this.selectionModel.select(row));
    }
    else {
      this.selectionModel.clear();
    }
    this.sendRowSelection.emit(this.selectionModel.selected);
  }
  //**Function to toggle filter */
  public onFilterToggle(index: number) {
    if(this.columns.includes('select')){
      index = index -1;
    }
    this.contentToToggle.toArray().forEach((elementRef, i) => {
      if (i !== index) {
        elementRef.nativeElement.style.display = 'none';
      }
    });
    const clickedDiv = this.contentToToggle.toArray()[index];
    if (clickedDiv.nativeElement.style.display === 'none') {
      clickedDiv.nativeElement.style.display = 'block';
    } else {
      clickedDiv.nativeElement.style.display = 'none';
    }
    this.searchText = '';
  }
  private closeFilterBox(){
    if (this.contentToToggle.length) {
      this.contentToToggle.forEach((elementRef: ElementRef) => {
        elementRef.nativeElement.style.display = 'none';
      });
    }
  }
  //** Function  // If there are filter values for the key, filter out values not in filterDictionary */
  private removeValuesNotInFilterDictionary() {
    for (const key in this.keyValuePairs) {
      if (this.keyValuePairs.hasOwnProperty(key)) {
        const filterValues = this.filterDictionary.get(key);
        
        if (filterValues) {
          this.keyValuePairs[key] = this.keyValuePairs[key].filter(value =>
            filterValues.includes(value)
          );
        } else {
          delete this.keyValuePairs[key] 
        }
      }
    }
  }
  public handleClick(event:Event){
    event.stopPropagation();
  }
  @HostListener('document:click', ['$event.target'])
  public onClick(): void {
    this.removeValuesNotInFilterDictionary();
    this.closeFilterBox();
  }
}
@Pipe({
  name: 'searchValue',
})
export class SearchValuePipe implements PipeTransform {
  constructor(private datePipe: DatePipe) { }
  transform(data: ValueTypes[], searchText: string, dateFormat?: string) {
    if (!data?.length) return [];
    return data.filter((item: ValueTypes) => {
      if (item instanceof Date && dateFormat) {
        // Convert the date to a string in the specified format
        const dateString = this.datePipe.transform(item, dateFormat);
        return dateString && dateString.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
      } else {
        return item?.toString().toLowerCase().indexOf(searchText.toLowerCase()) > -1;
      }
    });
  }
}