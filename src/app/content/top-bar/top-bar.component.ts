import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {interval, of, Subscription} from 'rxjs';
import {delay} from 'rxjs/operators';
import {PhoneNumService} from '../phone-num.service';

const CALLER = '10016';
const AGENT_STATE = {
  0: '离线',
  1: '空闲',
  2: '忙碌',
  3: '通话',
  4: '保持',
  5: '整理'
};

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit, OnDestroy {


  constructor(private phoneNumService: PhoneNumService) {
    this.phoneNumSubjection = this.phoneNumService.phoneNum$.subscribe(phoneNum => {
      this.phoneNo.setValue(phoneNum);
    });
  }

  phoneNumSubjection: Subscription;

  /* 搜索框手机号表单 */
  phoneNo: FormControl = new FormControl('');

  /* 坐席状态代码 */
  agentStateCode: number;

  /* 坐席状态名称 */
  agentStateName: string;

  /* 置闲置忙按钮名称 */
  busyBtnName: string;
  /* 置闲置忙按钮禁用 */
  busyBtnDisabled = false;

  /* 保持按钮名称 */
  keepBtnName = '保持';
  /* 保持按钮禁用 */
  keepBtnDisabled = false;

  /* 外拨按钮名称 */
  callOutBtnName = '外拨';
  /* 外拨按钮禁用 */
  callOutBtnDisabled = false;

  /* 计时器 */
  time: string;
  hour: number;
  minute: number;
  second: number;
  timeInterval$: Subscription;
  caller: string;
  called: string;

  /**
   * 格式化时间
   */
  private static formatTime(num: number): string {
    return num >= 10 ? num + '' : '0' + num;
  }

  ngOnInit() {
    console.log('agent sign in auto...');
    // 刚签入时自动置忙
    this.updateStateCodeAndName(2);
    // 5秒后自动置闲
    of(null).pipe(delay(5000)).subscribe(
      x => {
      },
      err => {
      },
      () => {
        this.updateStateCodeAndName(1);
      }
    );
  }

  ngOnDestroy(): void {
    /*取消订阅*/
    this.phoneNumSubjection.unsubscribe();
  }

  updateBusyBtnName(): void {
    if (this.agentStateCode === 1) {
      this.busyBtnName = '置忙';
    } else if (this.agentStateCode === 2 || this.agentStateCode === 5) {
      this.busyBtnName = '置闲';
    }
  }

  /**
   * 更新坐席状态及名称
   * @param stateCode 坐席状态码
   */
  private updateStateCodeAndName(stateCode: number): void {
    this.agentStateCode = stateCode;
    this.agentStateName = AGENT_STATE[this.agentStateCode];
    this.updateBusyBtnName();
    this.updateTime();
    this.busyBtnDisabled = this.agentStateCode === 3 || this.agentStateCode === 4;
    this.keepBtnDisabled = this.agentStateCode !== 3 && this.agentStateCode !== 4;
    this.callOutBtnDisabled = this.agentStateCode !== 1 && this.agentStateCode !== 3;
  }

  /**
   * 根据号码搜索客户信息
   */
  public searchPhoneNo() {
    console.log(`searching phone no ${this.phoneNo.value}`);
  }

  private updateTime() {
    this.clearTime();
    this.setTimeStart();
  }

  /**
   * 清空计时器
   */
  private clearTime() {
    if (this.timeInterval$) {
      this.timeInterval$.unsubscribe();
    }
    this.hour = 0;
    this.minute = 0;
    this.second = 0;
    this.generalTime();
  }

  /**
   * 开启计时器
   */
  private setTimeStart() {
    this.timeInterval$ = interval(1000).subscribe(
      next => {
        if (this.second === 59) {
          this.second = 0;
          if (this.minute === 59) {
            this.minute = 0;
            this.hour += 1;
          } else {
            this.minute += 1;
          }
        } else {
          this.second += 1;
        }
        this.generalTime();
      }
    );
  }

  /**
   * 格式化时间
   */
  private generalTime() {
    this.time = TopBarComponent.formatTime(this.hour)
      + ':' + TopBarComponent.formatTime(this.minute)
      + ':' + TopBarComponent.formatTime(this.second);
  }

  /**
   * 置忙
   */
  setBusy() {
    if (this.agentStateCode === 1) {
      this.updateStateCodeAndName(2);
    } else if (this.agentStateCode === 2 || this.agentStateCode === 5) {
      this.updateStateCodeAndName(1);
    }
    this.updateTime();
    console.log(`set agent ${this.agentStateCode}, ${this.agentStateName}`);
  }

  /**
   * 呼出
   */
  callOut() {
    if (this.agentStateCode === 1) {
      /*设置主被叫*/
      this.caller = CALLER;
      this.called = this.phoneNo.value;
      console.log(`call out ${this.phoneNo.value}`);
      /*设置状态*/
      this.updateStateCodeAndName(3);
      /*设置外拨按钮*/
      this.callOutBtnName = '挂机';
    } else if (this.agentStateCode === 3) {
      /*设置主被叫*/
      this.caller = '';
      this.called = '';
      console.log(`hang up call ${this.phoneNo.value}`);
      /*设置状态*/
      this.updateStateCodeAndName(5);
      /*设置外拨按钮*/
      this.callOutBtnName = '外拨';
    }
  }

  keep() {
    if (this.agentStateCode === 4) {
      this.updateStateCodeAndName(3);
      this.keepBtnName = '保持';
    } else {
      this.updateStateCodeAndName(4);
      this.keepBtnName = '恢复';
    }
  }
}
