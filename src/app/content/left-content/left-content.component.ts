import {Component, OnInit} from '@angular/core';
import {ContentTabService} from '../content-tab.service';

@Component({
  selector: 'app-left-content',
  templateUrl: './left-content.component.html',
  styleUrls: ['./left-content.component.css']
})
export class LeftContentComponent implements OnInit {

  constructor(private contentTabService: ContentTabService) {
  }

  ngOnInit() {
  }

  addTab() {
    this.contentTabService.addTab('new');
  }
}
