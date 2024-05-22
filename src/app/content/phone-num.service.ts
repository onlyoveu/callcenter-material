import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhoneNumService {
  // Observable string sources
  private phoneNumSource = new Subject<string>();
  // Observable string streams
  phoneNum$ = this.phoneNumSource.asObservable();

  /**
   * 更新搜索框并呼出
   * @param phoneNum 手机号
   */
  updateSearchAndCallOut(phoneNum: string) {
    this.phoneNumSource.next(phoneNum);
    this.callOut(phoneNum);
  }

  /**
   * 呼出
   * @param phoneNum 手机号
   */
  private callOut(phoneNum: string) {
    console.log(`call out ${phoneNum}`);
  }
}
