import {Component, OnInit} from '@angular/core';
import {HomePageComponent} from './home-page/home-page.component';
import {CallRecordComponent} from './call-record/call-record.component';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {
  toolBars = [
    {title: '首页', iconName: 'home', routerLink: 'home-page', appComponent: HomePageComponent},
    {title: '外呼通话记录', iconName: 'storage', routerLink: 'call-record', appComponent: CallRecordComponent},
    {title: '问卷记录', iconName: 'insert_chart', routerLink: '', appComponent: HomePageComponent},
    {title: '知识检索', iconName: 'insert_drive_file', routerLink: 'home-page', appComponent: HomePageComponent}
  ];
  selected: number;
  tabs: string[] = [];

  constructor() {
  }

  ngOnInit() {
    this.addTab(this.toolBars[0].title);
  }

  addTab(title: string) {
    if (this.tabs.indexOf(title) > -1) {
      this.selected = this.tabs.indexOf(title);
    } else {
      this.tabs.push(title);
      this.selected = this.tabs.length - 1;
    }
  }

  removeTab(index: number) {
    this.tabs.splice(index, 1);
  }
}
