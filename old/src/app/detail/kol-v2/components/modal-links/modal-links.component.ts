import { Component, Input } from '@angular/core';
import { NzModalSubject } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { MicroPageService, ArticleService } from '../../services';
import { IPathsTypes, Article } from '../../models';

const mapPaths = paths => {
  // 文章二维码
  paths.articleQrs = [
    {
      type: 'NORMAL',
      imgUrl: paths.articleAcodeUrl,
      label: '微信扫码预览商品',
      downLoadTitle: '文章-商品小程序码',
    },
  ];
  if (paths.xcxCardImgUrl) {
    paths.articleQrs.unshift({
      type: 'XCX_CARD',
      imgUrl: paths.xcxCardImgUrl,
      label: '小程序卡片配图',
      downLoadTitle: '文章-小程序卡片配图',
    });
  }

  // 微信群二维码
  paths.wxGroupQrs = [
    {
      type: 'NORMAL',
      imgUrl: paths.wxGroupShareAcodeUrl,
      label: '小程序卡片分享',
      downLoadTitle: '微信群-小程序卡片分享',
      warn: '(请勿直接分享此码，需先扫此码，后分享小程序卡片）',
    },
    {
      type: 'NORMAL',
      imgUrl: paths.wxGroupAcodeUrl,
      label: '小程序码分享',
      downLoadTitle: '微信群-小程序码',
    },
  ];

  // 线下渠道
  paths.offlineQrs = [
    {
      type: 'NORMAL',
      imgUrl: paths.scanAcodeUrl,
      downLoadTitle: '线下-商品小程序码',
    },
  ];

  return paths;
};

@Component({
  selector: 'modal-links',
  templateUrl: 'modal-links.component.html',
  styleUrls: ['modal-links.component.less'],
})
export class ModalLinksComponent {
  paths: IPathsTypes;

  @Input()
  set article(article: Article) {
    if (!article) {
      return;
    }
    let srv$: Observable<IPathsTypes>;
    if (Number(article.article_flag) === 1) {
      srv$ = this.articleService
        .getArticleKolLinks({
          articleId: article.article_id,
        })
        .pipe(
          map(paths => ({
            ...paths,
            mallPath: null,
          })),
        );
    } else {
      srv$ = this.articleService.getArticleKolLinksOld({
        kolId: article.kol_id,
        collectionId: article.collection_id,
        xcxUrl: article.url_xiaochengxu,
        articleId: article.article_id,
      });
    }
    srv$.pipe(map(mapPaths)).subscribe(paths => {
      this.paths = paths;
    });
  }

  @Input()
  set micropageId(micropageId: number) {
    if (!micropageId) {
      return;
    }
    this.microPageService
      .getMicroPagePaths({ micropageId })
      .pipe(map(mapPaths))
      .subscribe(paths => {
        this.paths = paths;
      });
  }

  constructor(
    private subject: NzModalSubject,
    private microPageService: MicroPageService,
    private articleService: ArticleService,
  ) {}

  handleCancel(e) {
    this.subject.destroy('onCancel');
  }
}
