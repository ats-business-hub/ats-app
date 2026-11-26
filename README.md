# ATS コンテナアプリ

公開URL: https://ats-business-hub.github.io/ats-app/

ATS, Japan合同会社の無料ウェブアプリ（PWA）です。公式サイトは [ats-japan.com](https://www.ats-japan.com/)。

## 機能
| ページ | 内容 |
|---|---|
| `/zaiko/` | 在庫一覧。公式サイトの「販売中の商品一覧」カテゴリ（ID 109、売り切れ 93 は除外）から写真・価格を表示し、各商品ページへリンク |
| `/mitsumori/` | かんたん見積もり。本体価格は公式 `/price/` の公開値（`data/prices.json`）、加工・送料は固定の目安額。税別と税込を表示 |
| `/kaitori/` | 写真で買い取り査定。手順と査定用メモ（コピー）→ 公式 `/kaitori/` のフォームへ |
| `/jirei/` | 施工事例。公式サイトの「施工実績」カテゴリ（ID 75）の新しい順80件 |
| `/tsuuchi/` | 入荷のお知らせ。前回からの新着に NEW 表示（端末内に保存）。対応端末（Android の Chrome でホーム画面に追加した場合）は定期確認で通知 |
| `/soudan/` | 電話・フォーム・メール。LINE は `js/config.js` の `lineUrl` を入れると表示 |
| `/install/` | ホーム画面への追加方法と QR コード |

## データの自動更新
`.github/workflows/update-data.yml` が6時間ごとに `scripts/build_data.py` を実行し、公式サイトの WP REST API（公開 GET のみ）から
`data/stock.json`・`data/cases.json`・`data/prices.json` を作り直して、変更があればコミットします。手動実行は Actions の「Run workflow」。
公式サイトへ書き込むことはありません。取得に失敗したときは前回のデータをそのまま使います。トレーラーハウスとサウナの記事は載せません。

## ページの作り直し
共通のヘッダー・フッターは `scripts/gen_pages.py` で生成しています。文言を変えたら `python3 scripts/gen_pages.py` を実行してください。
`sw.js` の `CACHE` の番号を上げると、利用者の端末のキャッシュも入れ替わります。
