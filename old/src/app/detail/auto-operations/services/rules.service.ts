import { Injectable } from '@angular/core';
import { _HttpClient } from '@shared/services';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

const wrapCatchError = (ob: Observable<see.ICommonResponse<any>>) => {
  return ob.pipe(
    catchError((error: any) => {
      return Observable.throw(error.json ? error.json() : error);
    }),
  );
};

interface IAddRule {
  rule_id: number;
  rule_name: string;
}

interface IUpdateRule {
  ruleId: number;
  ruleName: string;
  status: number;
}

@Injectable()
export class RulesService {
  constructor(private http: _HttpClient) {}

  // 添加规则
  addRule(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(this.http.post(`/dapi/ao/rule/addrule`, { body }));
  }

  // 查询规则默认值
  getTplRule(): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(this.http.post(`/dapi/ao/rule/default`, {}));
  }

  // 查询规则列表
  getRuleList(): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(this.http.post(`/dapi/ao/rule/rulelist`, {}));
  }

  // 更新规则
  updateRule(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(this.http.post(`/dapi/ao/rule/ruleupdate`, { body }));
  }

  // 查询所有关联规则的kol
  getKolList(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(this.http.post(`/dapi/ao/kol/allkol`, { body }));
  }

  // 移除kol的关联规则
  removeKol(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(this.http.post(`/dapi/ao/kol/removekol`, { body }));
  }

  // 根据ruleId获取商品子页面原数据
  findsubpageruleid(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post(`/dapi/ao/decorate/findsubpageruleid`, { body }),
    );
  }

  // 获取商品分组配置原数据
  findgrouprankoriginaldata(): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post(`/dapi/ao/decorate/findgrouprankoriginaldata`, {}),
    );
  }

  // 规则详细信息
  ruleinfobyid(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post(`/dapi/ao/rule/ruleinfobyid`, { body }),
    );
  }

  // 提交规则
  submitdecorate(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post(`/dapi/ao/decorate/submitdecorate`, { body }),
    );
  }

  // 树状图接口
  classtree(): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(this.http.post(`/dapi/ao/kol/classtree`, {}));
  }

  // 获得当前规则选中三级分类
  ruletreebyid(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post(`/dapi/ao/kol/ruletreebyid`, { body }),
    );
  }

  // 获取拼团基础信息
  findgroupinfo(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post(`/dapi/ao/decorate/findgroupinfo`, { body }),
    );
  }

  // 获取规则成员列表
  kolforrule(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(this.http.post(`/dapi/ao/kol/kolforrule`, { body }));
  }

  // kol列表
  kollist(): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(this.http.post(`/dapi/ao/kol/kollist`, { body: {} }));
  }

  // 上传kol头图
  uploadkolheadimage(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post(`/dapi/ao/kol/uploadkolheadimage`, { body }),
    );
  }

  // 恢复默认接口
  reback(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(this.http.post(`/dapi/ao/kol/reback`, { body }));
  }

  // 添加成员
  addmember(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(this.http.post(`/dapi/ao/kol/addmember`, { body }));
  }

  // 移除kol的关联规则
  removeKol_body(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(this.http.post(`/dapi/ao/kol/removekol`, { body }));
  }

  // 重试装修接口
  tryagain(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(this.http.post(`/dapi/ao/kol/tryagain`, { body }));
  }
}
