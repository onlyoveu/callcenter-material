import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {interval, of, Subscription} from 'rxjs';
import {delay} from 'rxjs/operators';
import {PhoneNumService} from '../phone-num.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {SimpleUser, SimpleUserDelegate, SimpleUserOptions} from 'sip.js/lib/platform/web';
import {UserAgent} from 'sip.js';

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

/**
 * 按钮信息
 */
export interface BtnInfo {
  // 按钮名称
  name: string;
  // 按钮状态
  disabled: boolean;
}

/* 默认主叫 */
const CALLER = '1234';

/* 坐席状态 */
const AGENT_STATE = {
  offline: {
    val: 0,
    des: '离线',
    name: 'offline'
  },
  busy: {
    val: 1,
    des: '忙碌',
    name: 'busy'
  },
  free: {
    val: 2,
    des: '空闲',
    name: 'free'
  },
  ring: {
    val: 3,
    des: '响铃',
    name: 'ring'
  },
  talking: {
    val: 4,
    des: '通话',
    name: 'talking'
  },
  mute: {
    val: 5,
    des: '静音',
    name: 'mute'
  },
  holding: {
    val: 6,
    des: '保持',
    name: 'holding'
  },
  making: {
    val: 7,
    des: '整理',
    name: 'making'
  }
};

/* 按钮名称 */
const BTN_NAME = {
  busyBtnName: {
    busy: '置忙',
    free: '置闲'
  },
  callOutBtnName: {
    callOut: '呼出',
    hangUp: '挂断'
  },
  answerBtnName: {
    answer: '应答'
  },
  holdBtnName: {
    holding: '保持',
    unHolding: '恢复'
  },
  muteBtnName: {
    mute: '静音',
    unmute: '解除'
  }
};

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
    },
    onCallHangup: (): void => {
      console.log(`[${this.agentInfo.workno}] Call hangup`);
      this.updateStateCodeAndName(AGENT_STATE.busy.name);

    },
    onCallHold: (held: boolean): void => {
      console.log(`[${this.agentInfo.workno}] Call hold ${held}`);
    },
    onCallReceived: (): void => {
      console.log(`[${this.agentInfo.workno}] received Call`);
      this.updateStateCodeAndName(AGENT_STATE.ring.name);
      this.incomingDialog();
    }
  };

  /* 搜索框手机号表单 */
  phoneNo: FormControl = new FormControl('');

  /* 坐席状态代码 */
  agentStateCode: number;

  /* 坐席状态名称 */
  agentStateName: string;

  /**
   * 置闲置忙按钮
   */
  busyBtn: BtnInfo = {
    name: BTN_NAME.busyBtnName.free,
    disabled: true
  };
  /**
   * 呼出按钮
   */
  callBtn: BtnInfo = {
    name: BTN_NAME.callOutBtnName.callOut,
    disabled: true
  };
  /**
   * 应答按钮
   */
  answerBtn: BtnInfo = {
    name: BTN_NAME.answerBtnName.answer,
    disabled: true
  };
  /**
   * 静音按钮
   */
  muteBtn: BtnInfo = {
    name: BTN_NAME.muteBtnName.mute,
    disabled: true
  };
  /**
   * 保持按钮
   */
  holdBtn: BtnInfo = {
    name: BTN_NAME.holdBtnName.holding,
    disabled: true
  };

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

  /* 铃声 */
  ringAudio: HTMLAudioElement;

  /**
   * 格式化时间
   */
  private static formatTime(num: number): string {
    return num >= 10 ? num + '' : '0' + num;
  }

  ngOnInit() {
    console.log('agent sign in auto...');
    // 初始化坐席状态为0
    this.updateStateCodeAndName(AGENT_STATE.offline.name);
    // 初始化小键盘
    this.sendDtmf();
    // 初始化铃声
    this.ringAudio = new Audio('assets/ring.mp3');
    this.ringAudio.loop = true;
  }

  ngOnDestroy(): void {
    /*取消订阅*/
    this.phoneNumSubjection.unsubscribe();
  }

  /**
   * 更新按钮
   */
  updateBtn() {
    switch (this.agentStateCode) {
      case AGENT_STATE.offline.val:
        this.busyBtn.name = BTN_NAME.busyBtnName.free;
        this.busyBtn.disabled = true;

        this.callBtn.name = BTN_NAME.callOutBtnName.callOut;
        this.callBtn.disabled = true;

        this.answerBtn.name = BTN_NAME.answerBtnName.answer;
        this.answerBtn.disabled = true;

        this.muteBtn.name = BTN_NAME.muteBtnName.mute;
        this.muteBtn.disabled = true;

        this.holdBtn.name = BTN_NAME.holdBtnName.holding;
        this.holdBtn.disabled = true;
        break;
      case AGENT_STATE.busy.val:
        this.busyBtn.name = BTN_NAME.busyBtnName.free;
        this.busyBtn.disabled = false;

        this.callBtn.name = BTN_NAME.callOutBtnName.callOut;
        this.callBtn.disabled = true;

        this.answerBtn.name = BTN_NAME.answerBtnName.answer;
        this.answerBtn.disabled = true;

        this.muteBtn.name = BTN_NAME.muteBtnName.mute;
        this.muteBtn.disabled = true;

        this.holdBtn.name = BTN_NAME.holdBtnName.holding;
        this.holdBtn.disabled = true;
        break;
      case AGENT_STATE.free.val:
        this.busyBtn.name = BTN_NAME.busyBtnName.busy;
        this.busyBtn.disabled = false;

        this.callBtn.name = BTN_NAME.callOutBtnName.callOut;
        this.callBtn.disabled = false;

        this.answerBtn.name = BTN_NAME.answerBtnName.answer;
        this.answerBtn.disabled = true;

        this.muteBtn.name = BTN_NAME.muteBtnName.mute;
        this.muteBtn.disabled = true;

        this.holdBtn.name = BTN_NAME.holdBtnName.holding;
        this.holdBtn.disabled = true;
        break;
      case AGENT_STATE.ring.val:
        this.busyBtn.name = BTN_NAME.busyBtnName.busy;
        this.busyBtn.disabled = true;

        this.callBtn.name = BTN_NAME.callOutBtnName.callOut;
        this.callBtn.disabled = true;

        this.answerBtn.name = BTN_NAME.answerBtnName.answer;
        this.answerBtn.disabled = false;

        this.muteBtn.name = BTN_NAME.muteBtnName.mute;
        this.muteBtn.disabled = true;

        this.holdBtn.name = BTN_NAME.holdBtnName.holding;
        this.holdBtn.disabled = true;
        break;
      case AGENT_STATE.talking.val:
        this.busyBtn.name = BTN_NAME.busyBtnName.free;
        this.busyBtn.disabled = true;

        this.callBtn.name = BTN_NAME.callOutBtnName.hangUp;
        this.callBtn.disabled = false;

        this.answerBtn.name = BTN_NAME.answerBtnName.answer;
        this.answerBtn.disabled = true;

        this.muteBtn.name = BTN_NAME.muteBtnName.mute;
        this.muteBtn.disabled = false;

        this.holdBtn.name = BTN_NAME.holdBtnName.holding;
        this.holdBtn.disabled = false;
        break;
      case AGENT_STATE.mute.val:
        this.busyBtn.name = BTN_NAME.busyBtnName.free;
        this.busyBtn.disabled = true;

        this.callBtn.name = BTN_NAME.callOutBtnName.hangUp;
        this.callBtn.disabled = true;

        this.answerBtn.name = BTN_NAME.answerBtnName.answer;
        this.answerBtn.disabled = true;

        this.muteBtn.name = BTN_NAME.muteBtnName.unmute;
        this.muteBtn.disabled = false;

        this.holdBtn.name = BTN_NAME.holdBtnName.holding;
        this.holdBtn.disabled = true;
        break;
      case AGENT_STATE.holding.val:
        this.busyBtn.name = BTN_NAME.busyBtnName.free;
        this.busyBtn.disabled = true;

        this.callBtn.name = BTN_NAME.callOutBtnName.hangUp;
        this.callBtn.disabled = true;

        this.answerBtn.name = BTN_NAME.answerBtnName.answer;
        this.answerBtn.disabled = true;

        this.muteBtn.name = BTN_NAME.muteBtnName.mute;
        this.muteBtn.disabled = true;

        this.holdBtn.name = BTN_NAME.holdBtnName.unHolding;
        this.holdBtn.disabled = false;
        break;
      case AGENT_STATE.making.val:
        this.busyBtn.name = BTN_NAME.busyBtnName.free;
        this.busyBtn.disabled = false;

        this.callBtn.name = BTN_NAME.callOutBtnName.callOut;
        this.callBtn.disabled = true;

        this.answerBtn.name = BTN_NAME.answerBtnName.answer;
        this.answerBtn.disabled = true;

        this.muteBtn.name = BTN_NAME.muteBtnName.mute;
        this.muteBtn.disabled = true;

        this.holdBtn.name = BTN_NAME.holdBtnName.holding;
        this.holdBtn.disabled = true;
        break;
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
            constraints: {audio: true, video: true},
            remote: {
              video: this.getVideo('remoteVideo'),
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
                // 刚签入时自动置忙
                this.updateStateCodeAndName(AGENT_STATE.busy.name);
                // 5秒后自动置闲
                of(null).pipe(delay(5000)).subscribe(
                  x => {
                  },
                  err => {
                  },
                  () => {
                    this.updateStateCodeAndName(AGENT_STATE.free.name);
                  }
                );
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

  /**
   * 更新坐席状态及名称
   * @param name 坐席状态码
   */
  private updateStateCodeAndName(name: string): void {
    this.agentStateCode = AGENT_STATE[name].val;
    this.agentStateName = AGENT_STATE[name].des;
    console.log(`update angetState=${this.agentStateCode}, agentDes=${this.agentStateName}`);
    this.updateBtn();
    this.updateTime();
  }

  /**
   * 根据号码搜索客户信息
   */
  public searchPhoneNo() {
    console.log(`searching phone no ${this.phoneNo.value}`);
  }

  /* 更新时间 */
  updateTime() {
    if (this.agentStateCode === AGENT_STATE.busy.val
      || this.agentStateCode === AGENT_STATE.free.val
      || this.agentStateCode === AGENT_STATE.ring.val
      || this.agentStateCode === AGENT_STATE.making.val) {
      this.clearTime();
      this.setTimeStart();
    }
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
    if (this.agentStateCode === AGENT_STATE.free.val) {
      this.updateStateCodeAndName(AGENT_STATE.busy.name);
    } else if (this.agentStateCode === AGENT_STATE.busy.val || this.agentStateCode === AGENT_STATE.making.val) {
      this.updateStateCodeAndName(AGENT_STATE.free.name);
    }
  }

  /* 呼出 */
  callOut() {
    if (this.agentStateCode === AGENT_STATE.free.val) {
      /*设置主被叫*/
      this.caller = CALLER;
      this.called = this.phoneNo.value;
      console.log(`call out ${this.phoneNo.value}`);
      /*设置状态*/
      this.updateStateCodeAndName(AGENT_STATE.talking.name);
      this.makeCall();
    } else if (this.agentStateCode === AGENT_STATE.talking.val) {
      /*设置主被叫*/
      this.caller = '';
      this.called = '';
      console.log(`hang up call ${this.phoneNo.value}`);
      /*设置状态*/
      this.updateStateCodeAndName(AGENT_STATE.making.name);
      this.hangupCall();
    }
  }

  /* 呼入 */
  callIn() {
    /*设置状态*/
    this.updateStateCodeAndName(AGENT_STATE.talking.name);
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

  /* 应答对话框 */
  incomingDialog() {
    this.playRing();
    const caller = Object.values(this.simpleUser)[5].incomingInviteRequest.message.from.uri.normal.user;
    /* 设置主被叫 */
    this.caller = caller;
    this.called = this.simpleUser.id;
    const matDialogRef = this.dialog.open(IncomingDialogComponent, {
      data: caller,
      position: {
        top: '5em'
      }
    });
    /* 设置超时 */
    const RING_TIME_OUT = 10000;
    setTimeout(() => {
      matDialogRef.close();
      console.log(`ring time out=${RING_TIME_OUT}, auto reject call, caller=${this.caller}, called=${this.called}`);
    }, RING_TIME_OUT);
    matDialogRef.afterClosed().subscribe(result => {
      this.playRing();
      if (result) {
        /* 接听 */
        this.answerCall();
      } else {
        /* 拒接 */
        this.rejectCall();
      }
    });
  }

  /* 应答 */
  answerCall(): void {
    this.simpleUser
      .answer()
      .then(() => {
        console.log(`[${this.simpleUser.id}] answer call success`);
        this.callIn();
      })
      .catch((error: Error) => {
        console.error(`[${this.simpleUser.id}] answer call failed`);
        console.error(error);
        alert('answer call failed.\n' + error);
      });
  }

  /* 拒接 */
  rejectCall(): void {
    this.simpleUser
      .decline()
      .then(() => {
        console.log(`[${this.simpleUser.id}] reject call success`);
      })
      .catch((error: Error) => {
        console.error(`[${this.simpleUser.id}] reject call failed`);
        console.error(error);
      });
  }

  /* 挂机 */
  hangupCall(): void {
    this.simpleUser.hangup().catch((error: Error) => {
      console.error(`[${this.simpleUser.id}] failed to hangup call`);
      console.error(error);
      alert('Failed to hangup call.\n' + error);
    });
  }

  /* 保持 */
  hold() {
    if (this.agentStateCode === AGENT_STATE.holding.val) {
      this.simpleUser.unhold()
        .then(() => {
          this.updateStateCodeAndName(AGENT_STATE.talking.name);
          console.log(`[${this.simpleUser.id}] unhold call`);
        })
        .catch((error: Error) => {
          console.error(`[${this.simpleUser.id}] failed to unhold call`);
        });
    } else if (AGENT_STATE.talking.val === this.agentStateCode) {
      this.simpleUser.hold()
        .then(() => {
          this.updateStateCodeAndName(AGENT_STATE.holding.name);
          console.log(`[${this.simpleUser.id}] hold call`);
        })
        .catch((error: Error) => {
          console.error(`[${this.simpleUser.id}] failed to hold call`);
        });
    }
  }

  /* 静音 */
  mute() {
    if (this.agentStateCode === AGENT_STATE.talking.val) {
      this.simpleUser.mute();
      this.updateStateCodeAndName(AGENT_STATE.mute.name);
      console.log(`[${this.simpleUser.id}] mute call`);
    } else {
      this.simpleUser.unmute();
      this.updateStateCodeAndName(AGENT_STATE.talking.name);
      console.log(`[${this.simpleUser.id}] unmute call`);
    }
  }

  /* 发送DTMF */
  sendDtmf(): void {
    console.log('init send dtmf success!');
    const keypad = this.getButtons('keypad');
    keypad.forEach((button) => {
      button.addEventListener('click', () => {
        if (this.simpleUser) {
          const tone = button.textContent;
          if (tone) {
            this.simpleUser.sendDTMF(tone).then(() => {
              console.log(`send dtmf=${tone}`);
            });
          }
        }
      });
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

  /* 取视播放器 */
  getVideo(id: string): HTMLVideoElement {
    const el = document.getElementById(id);
    if (!(el instanceof HTMLVideoElement)) {
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

  /**
   * 播放铃声
   */
  playRing() {
    if (this.ringAudio.paused) {
      this.ringAudio.play();
    } else {
      this.ringAudio.pause();
    }
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

/**
 * 来电对话框
 */
@Component({
  selector: 'app-incoming-dialog',
  templateUrl: './incoming-dialog.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class IncomingDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<IncomingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
