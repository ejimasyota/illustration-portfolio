# 余白のアトリエ — イラスト・漫画ポートフォリオ

Astroで生成しGitHub Pagesへ配信する静的サイトです。投稿には無料のPages CMSオンライン版を使います。自分でAPサーバーやDBを運用する必要はありません。

## 含まれる機能

- イラスト・漫画をまとめた作品一覧、タグ絞り込み、テキスト検索
- 複数画像を持つ作品ページ、画像別説明、ページ移動、画像拡大（Escapeで閉じる）
- おすすめ作品と表示順、サイト掲載の切り替え
- プロフィール、メール・SNSリンク、参考絵師のXリンク集
- Pages CMSの日本語入力フォーム（`.pages.yml`）
- WebPの閲覧画像とサムネイルの自動生成（EXIF情報は変換時に除去）
- レスポンシブ表示、代替テキスト、OGP、404ページ
- GitHub Actionsによる自動ビルドと公開

**サンプル4作品は表示確認用のオリジナルのベクター図案です。あなたの作品ではありません。初回公開前に差し替え、または管理画面で掲載をオフにしてください。** 参考絵師一覧は空で開始します。

## ローカルで動かす

Node.js 22の最新版とnpmが必要です。

```sh
npm ci
npm run dev
```

表示されたlocalhost URLを開きます。ローカルの作品データ・画像を直接変更した場合は、開発サーバーを再起動して画像とデータを再生成してください。普段の投稿はCMSで行います。

```sh
npm test
npm run build
npm run check
npm run preview
```

`dist/` が公開物です。`content/`、`src/generated/` を直接配信しないでください。

## 初回のGitHub Pages設定

1. GitHubで公開リポジトリを作成します（GitHub FreeのPagesを利用する構成）。
2. このプロジェクトの全ソースを`main`ブランチへ入れます。`node_modules/`、`dist/`、`public/media/`、`src/generated/`は不要です。**隠しファイルの`.pages.yml`、`.github/`、`.gitignore`と`package-lock.json`を含めてください。** GitHub Desktopからフォルダをリポジトリとして追加してPublishする方法でも構いません。
3. リポジトリの **Settings → Pages → Build and deployment → Source** で **GitHub Actions** を選択します。
4. **Actions → Deploy portfolio to GitHub Pages → Run workflow** を実行します。最初のpushがPages設定前で失敗していた場合も、この操作でやり直せます。
5. 成功後、Settings → Pagesに公開URLが表示されます。

ワークフローはGitHub PagesのURLとベースパスを自動取得します。`https://ユーザー.github.io/リポジトリ名/`形式とユーザーサイトに対応しています。独自ドメインもPages側の設定を変更して再ビルドしてください。

ローカルでサブパスを検証する場合（PowerShell）：

```powershell
$env:SITE_URL = "https://YOUR-NAME.github.io"
$env:BASE_PATH = "/YOUR-REPOSITORY/"
npm run build
npm run preview
```

`.env.example`は設定値の例です。このプロジェクトではシェル環境変数またはActionsから値を渡します。

## 管理画面の接続

1. https://app.pagescms.org/ を開きます。
2. GitHubでログインし、Pages CMSのGitHub Appに対象リポジトリへのアクセスを許可します。
3. 対象リポジトリと`main`ブランチを選びます。
4. `.pages.yml`が読み込まれ、「作品」「プロフィール・サイト設定」「参考絵師」が表示されます。
5. まずプロフィールのサイト名・作者名・説明・著作権名を変更します。

公開サイトの`/admin/`はCMSへの案内ページです。実際のログイン・アップロード・保存はPages CMS側で行います。公開HTMLにトークンやAPIシークレットを埋め込む必要はありません。認証済みCMSとの接続テストには、実際のGitHubリポジトリと利用者のログインが必要です。

## 作品を投稿する

1. 「作品」で新規作成します。
2. 作品URL（例：`spring-letter`）、タイトル、制作日を入力します。URLは半角英小文字・数字・ハイフンで、作品ごとに別の値にします。
3. 「画像・漫画のページ」に画像を追加し、代替テキストと説明文を入力します。リスト順がページ順になります。
4. 必要なら表紙画像・タグ・表示順・おすすめを指定します。表紙を省略すると最初の画像を使います。
5. 「サイトに掲載する」をオンにして保存します。
6. Actionsが成功すると反映されます。失敗時は前回成功したサイトが残ります。Actionsのログに対象ファイルとエラーを表示します。

おすすめ作品が先、次に表示順の小さい順、同値なら制作日の新しい順です。参考絵師も管理フォームのリスト順に表示します。メール・SNS・制作環境などの任意項目は空欄にできます。

画像はJPG / PNG / WebP / AVIFをアップロードしてください。公開用に書き出した画像（目安：長辺2000〜3000px、数MB以下）を推奨します。高解像度の原稿やPSD・CLIPは手元で保管してください。80メガピクセル超の入力は処理を拒否します。SVGは同梱サンプルにのみ利用し、CMSでのアップロード対象には含めていません。

## 保存場所と公開範囲

```text
content/
  settings.json       プロフィール・サイト設定
  artists.json        参考絵師
  works/*.json        1作品1ファイル
  media/              CMSからアップロードした画像
src/
  pages/              公開ページ
  layouts/            共通レイアウト
  styles/             デザイン
  generated/          自動生成データ（Git対象外）
public/media/         自動生成WebP（Git対象外）
scripts/              検証・画像変換
.pages.yml            CMSフォーム
.github/workflows/    自動公開
```

「サイトに掲載する」をオフにした作品のページは生成しません。画像も、公開作品から参照されているものだけを書き出します。

**公開リポジトリの画像・文章・Git履歴は誰でも見られます。サイト非掲載は秘密の下書き保存ではありません。** 削除してもGit履歴や外部キャッシュに残る可能性があります。非公開の下書き保存は別構成が必要です。

GitHub Pagesは公開サイト1GBまで、転送量は月100GBのソフト制限があります。画像の更新履歴でリポジトリ容量も増えるため、大量投稿前に容量を確認してください。外部ストレージ連携は本実装に含めていません。

## デザイン変更

基本の色と書体は`src/styles/global.css`冒頭のCSS変数で変更できます。日本語WebフォントはGoogle Fontsから読み込み、取得できない場合は端末のフォントにフォールバックします。日常の作品・リンク・プロフィール更新ではコード変更は不要です。

## 公式ドキュメント

- https://pagescms.org/docs/
- https://docs.astro.build/en/guides/deploy/github/
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
