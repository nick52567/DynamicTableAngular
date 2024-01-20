import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent {
  @ViewChild('contentToToggle') contentToToggle!: ElementRef;

  ngAfterViewInit(){
    this.contentToToggle.nativeElement.style.display = 'none';
  }

  onFilterToggle() {
    if (this.contentToToggle.nativeElement.style.display === 'none') {
      this.contentToToggle.nativeElement.style.display = 'block';
    } else {
      this.contentToToggle.nativeElement.style.display = 'none';
    }
  }
}
