import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {interval, of, Subscription} from 'rxjs';
import {delay} from 'rxjs/operators';
import {PhoneNumService} from '../phone-num.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {SimpleUser, SimpleUserDelegate, SimpleUserOptions} from 'sip.js/lib/platform/web';
import {UserAgent} from 'sip.js';

/* 默认主叫 */
const CALLER = '1234';

/* 坐席状态 */
const AGENT_STATE = {
  offline: {
    val: 0,
    des: '离线'
  }, free: {
    val: 1,
    des: '空闲'
  }, busy: {
    val: 2,
    des: '忙碌'
  }, talking: {
    val: 3,
    des: '通话'
  }, keeping: {
    val: 4,
    des: '保持'
  }, making: {
    val: 5,
    des: '整理'
  }, mute: {
    val: 6,
    des: '静音'
  }
};

/* 按钮名称 */
const BTN_NAME = {
  busyBtnName: {
    setBusy: '置忙',
    setFree: '置闲'
  },
  keepBtnName: {
    setKeeping: '保持',
    setUnKeeping: '恢复'
  },
  callOutBtnName: {
    setCallOut: '呼出',
    setHangUp: '挂断'
  },
  muteBtnName: {
    setMute: '静音',
    setHangUp: '挂断'
  }
};

/* 坐席信息 */
export interface AgentInfo {
  // wss服务器地址
  wssServer: string;
  // 账号
  username: string;
  // 姓名
  name: string;
  // 工号
  workno: string;
  // 密码
  pwd: string;
}

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit, OnDestroy {


  constructor(private phoneNumService: PhoneNumService, public dialog: MatDialog) {
    this.phoneNumSubjection = this.phoneNumService.phoneNum$.subscribe(phoneNum => {
      this.phoneNo.setValue(phoneNum);
    });
  }

  phoneNumSubjection: Subscription;

  /* 坐席信息 */
  agentInfo: AgentInfo = {
    wssServer: '',
    username: '',
    name: '',
    workno: '',
    pwd: ''
  };
  /* user agent */
  simpleUser: SimpleUser;
  // SimpleUser delegate
  simpleUserDelegate: SimpleUserDelegate = {
    onCallCreated: (): void => {
      console.log(`[${this.agentInfo.workno}] Call created`);
    },
    onCallAnswered: (): void => {
      console.log(`[${this.agentInfo.workno}] Call answered`);
      this.callIn();
    },
    onCallHangup: (): void => {
      console.log(`[${this.agentInfo.workno}] Call hangup`);
      this.updateStateCodeAndName(AGENT_STATE.busy.val);

    },
    onCallHold: (held: boolean): void => {
      console.log(`[${this.agentInfo.workno}] Call hold ${held}`);
      this.updateStateCodeAndName(AGENT_STATE.keeping.val);

    },
    onCallReceived: (): void => {
      console.log(`[${this.agentInfo.workno}] received Call`);
      this.answerCall();
    }
  };

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
  /* dtmf 隐藏显示*/
  dialpadHidden = true;

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
    this.sendDtmf();
  }

  ngOnDestroy(): void {
    /*取消订阅*/
    this.phoneNumSubjection.unsubscribe();
  }

  /* 更新置闲置忙按钮 */
  updateBusyBtnName(): void {
    if (this.agentStateCode === AGENT_STATE.free.val) {
      this.busyBtnName = '置忙';
    } else if (this.agentStateCode === AGENT_STATE.busy.val || this.agentStateCode === AGENT_STATE.making.val) {
      this.busyBtnName = '置闲';
    }
  }

  /* 更新呼出按钮 */
  updateCallOuntBtnName(): void {
    if (this.agentStateCode === AGENT_STATE.talking.val) {
      this.busyBtnName = '挂机';
    } else if (this.agentStateCode === AGENT_STATE.busy.val || this.agentStateCode === AGENT_STATE.making.val) {
      this.busyBtnName = '呼叫';
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
    this.busyBtnDisabled = this.agentStateCode === AGENT_STATE.talking.val || this.agentStateCode === AGENT_STATE.keeping.val;
    this.keepBtnDisabled = this.agentStateCode !== AGENT_STATE.talking.val && this.agentStateCode !== AGENT_STATE.keeping.val;
    this.callOutBtnDisabled = this.agentStateCode !== AGENT_STATE.free.val && this.agentStateCode !== AGENT_STATE.talking.val;
  }

  /**
   * 根据号码搜索客户信息
   */
  public searchPhoneNo() {
    console.log(`searching phone no ${this.phoneNo.value}`);
  }

  /* 更新时间 */
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

  /* 呼出 */
  callOut() {
    if (this.agentStateCode === AGENT_STATE.free.val) {
      /*设置主被叫*/
      this.caller = CALLER;
      this.called = this.phoneNo.value;
      console.log(`call out ${this.phoneNo.value}`);
      /*设置状态*/
      this.updateStateCodeAndName(3);
      /*设置外拨按钮*/
      this.callOutBtnName = '挂机';
      this.makeCall();
    } else if (this.agentStateCode === AGENT_STATE.talking.val) {
      /*设置主被叫*/
      this.caller = '';
      this.called = '';
      console.log(`hang up call ${this.phoneNo.value}`);
      /*设置状态*/
      this.updateStateCodeAndName(AGENT_STATE.making.val);
      /*设置外拨按钮*/
      this.callOutBtnName = '外拨';
      this.hangupCall();
    }
  }


  /* 呼入 */
  callIn() {
    /*设置主被叫*/
    this.caller = this.simpleUser.id;
    this.called = this.agentInfo.workno;
    console.log(`call out ${this.phoneNo.value}`);
    /*设置状态*/
    this.updateStateCodeAndName(AGENT_STATE.talking.val);
    /*设置外拨按钮*/
    this.callOutBtnName = '挂机';
  }

  /* 保持 */
  keep() {
    if (this.agentStateCode === AGENT_STATE.keeping.val) {
      this.simpleUser.unhold()
        .then(() => {
          this.updateStateCodeAndName(AGENT_STATE.talking.val);
          this.keepBtnName = '保持';
        })
        .catch((error: Error) => {
          console.error(`[${this.simpleUser.id}] failed to hold call`);
        });
    } else {
      this.simpleUser.hold()
        .then(() => {
          this.updateStateCodeAndName(AGENT_STATE.keeping.val);
          this.keepBtnName = '恢复';
        })
        .catch((error: Error) => {
          console.error(`[${this.simpleUser.id}] failed to hold call`);
        });
    }
  }

  /** 注册 */
  openRegisterDialog(): void {
    const matDialogRef = this.dialog.open(RegisterDialogComponent, {
      width: '300px',
      data: {
        wssServer: 'wss://192.168.200.21:7443',
        workno: '1002',
        pwd: '1234'
      }
    });
    matDialogRef.afterClosed().subscribe(result => {
      console.log(`register ${JSON.stringify(result)}`);
      if (result) {
        /* 注册信息 */
        const myURI = 'sip:' + result.workno + '@' + result.wssServer.replace('wss://', '');
        const simpleUserOptions: SimpleUserOptions = {
          aor: myURI,
          delegate: this.simpleUserDelegate,
          media: {
            remote: {
              audio: this.getAudio('remoteAudio')
            }
          },
          userAgentOptions: {
            authorizationUsername: result.workno,
            authorizationPassword: result.pwd,
            displayName: result.workno,
            uri: UserAgent.makeURI(myURI)
          }
        };
        this.simpleUser = new SimpleUser(result.wssServer, simpleUserOptions);
        /* 连接websocket */
        this.simpleUser
          .connect()
          .then(() => {
            console.log(`[${this.simpleUser.id}] connect success`);
            /* 连接成功后注册 */
            this.simpleUser
              .register()
              .then(() => {
                this.agentInfo.wssServer = result.wssServer;
                this.agentInfo.workno = result.workno;
                this.agentInfo.pwd = result.pwd;
                console.log(`[${this.simpleUser.id}] register success, register info=${JSON.stringify(result)}, angentInfo=${JSON.stringify(this.agentInfo)}`);
              })
              .catch((error: Error) => {
                console.error(`[${this.simpleUser.id}] failed to register`);
                console.error(error);
                alert(`[${this.simpleUser.id}] failed to register.\n` + error);
              });
          })
          .catch((error: Error) => {
            console.error(`[${this.simpleUser.id}] failed to connect`);
            console.error(error);
            alert('Failed to connect.\n' + error);
          });
      }
    });
  }

  /* 外呼 */
  makeCall(): void {
    const uri = 'sip:' + this.phoneNo.value + '@' + this.agentInfo.wssServer.replace('wss://', '');
    this.simpleUser.call(uri)
      .then(() => {
        console.log(`[${this.simpleUser.id}] success to place call`);
      })
      .catch((error: Error) => {
        console.error(`[${this.simpleUser.id}] failed to place call`);
        console.error(error);
        alert('Failed to place call.\n' + error);
      });
  }

  /* 应答 */
  answerCall(): void {
    this.simpleUser
      .answer()
      .then(() => {
        console.log(`[${this.simpleUser.id}] answer call success`);
      })
      .catch((error: Error) => {
        console.error(`[${this.simpleUser.id}] answer call failed`);
        console.error(error);
        alert('answer call failed.\n' + error);
      });
  }

  /* 发送DTMF */
  sendDtmf(): void {
    if (this.simpleUser) {
      console.log('init send dtmf success!');
      const keypad = this.getButtons('keypad');
      keypad.forEach((button) => {
        button.addEventListener('click', () => {
          const tone = button.textContent;
          if (tone) {
            this.simpleUser.sendDTMF(tone).then(() => {
              console.log(`send dtmf=${tone}`);
            });
          }
        });
      });
    }
  }

  /* 挂机 */
  hangupCall(): void {
    this.simpleUser.hangup().catch((error: Error) => {
      console.error(`[${this.simpleUser.id}] failed to hangup call`);
      console.error(error);
      alert('Failed to hangup call.\n' + error);
    });
  }

  /* 取音频播放器 */
  getAudio(id: string): HTMLAudioElement {
    const el = document.getElementById(id);
    if (!(el instanceof HTMLAudioElement)) {
      throw new Error(`Element "${id}" not found or not an audio element.`);
    }
    return el;
  }

  /* 取button */
  getButtons(id: string): Array<HTMLButtonElement> {
    const els = document.getElementsByClassName(id);
    if (!els.length) {
      throw new Error(`Elements "${id}" not found.`);
    }
    const buttons: Array<HTMLButtonElement> = [];
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      if (!(el instanceof HTMLButtonElement)) {
        throw new Error(`Element ${i} of "${id}" not a button element.`);
      }
      buttons.push(el);
    }
    return buttons;
  }

  /* 显示隐藏拨号面板 */
  showDialpad() {
    this.dialpadHidden = !this.dialpadHidden;
  }
}

/**
 * 注册对话框
 */
@Component({
  selector: 'app-register-dialog',
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class RegisterDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RegisterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AgentInfo) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
