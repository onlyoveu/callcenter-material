import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {PhoneNumService} from '../phone-num.service';
import {FormControl, FormGroup} from '@angular/forms';

export interface TaskInfo {
  taskId: string;
  taskName: string;
  callInfos: CallInfo[];
}

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  cstInfo = {
    cstName: '张三三三三三三三三三三三',
    cstBlc: '12345',
    cstState: '开通',
    cstOneFive: '一证五户一证五户一证五户一证五户一证五户一证五户'
  };

  displayedColumns: string[] = ['phone', 'state', 'option'];
  dataSource: MatTableDataSource<CallInfo>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  comResultFrom = new FormGroup({
    comDateTime: new FormControl(''),
    comResult: new FormControl(''),
    comRecord: new FormControl(''),
  });
  taskInfos: TaskInfo[] = [
    {taskId: '1', taskName: '任务1', callInfos: CALL_INFO_DATA_1},
    {taskId: '2', taskName: '任务2', callInfos: CALL_INFO_DATA_2},
    {taskId: '3', taskName: '任务3', callInfos: CALL_INFO_DATA_3}
  ];
  taskInfoSelect: string;

  constructor(private phoneNumService: PhoneNumService) {
  }

  ngOnInit() {
    this.taskInfoSelect = this.taskInfos[0].taskId;
    this.changeTask(this.taskInfoSelect);
  }

  getRows() {
    return this.dataSource.data.length;
  }

  callOut(phone: string) {
    this.phoneNumService.updateSearchAndCallOut(phone);
  }

  onSubmit() {
    console.warn(this.comResultFrom.value);
  }

  changeTask(value: any) {
    console.log(value);
    this.dataSource = new MatTableDataSource<CallInfo>(this.taskInfos.find(task => task.taskId === value).callInfos);
    this.dataSource.paginator = this.paginator;
  }
}

export interface CallInfo {
  phone: string;
  state: string;
}

const CALL_INFO_DATA_1: CallInfo[] = [
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
  {phone: '18612345671', state: '未拨打'},
];
const CALL_INFO_DATA_2: CallInfo[] = [
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
  {phone: '18612345672', state: '未拨打'},
];
const CALL_INFO_DATA_3: CallInfo[] = [
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
  {phone: '18612345673', state: '未拨打'},
];
