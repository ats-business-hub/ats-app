# ATS コンテナアプリ

公開URL: https://ats-business-hub.github.io/ats-app/

ATS, Japan合同会社の無料ウェブアプリ（PWA）です。買い取り入荷の在庫、不要コンテナの買い取り依頼（写真添付）、施工事例をまとめています。公式サイトは [ats-japan.com](https://www.ats-japan.com/)。

## 在庫の更新方法

いまは `inventory.json` を編集してこのリポジトリに推すと、アプリの在庫一覧が更新されます。

| 項目 | 内容 |
|---|---|
| id | 英数字の一意なID |
| title | 商品名 |
| sample | 実在庫なら `false`（または省略）、見本なら `true` |
| size | `10ft` / `12ft` / `20ft` / `40ft` など |
| type | 海上コンテナ、JRコンテナ など |
| condition | 状態 |
| location | 保管場所（例: 愛知県弥富市ヤード） |
| price | 税別の表示用文字列。未定なら `null` |
| price_note | 価格が出せないときの注記 |
| status | 入荷 / 商談中 / サンプル など |
| image | `img/stock/` 以下のファイル名 |
| arrived | 入荷日（任意） |
| notes | 備考 |

写真は `img/stock/` に置き、JSONの `image` を合わせてください。実在庫を載せるときは `sample` を外し、トップの `notice` 文も実在庫向けに直します。

構成の詳細は `/workspace/ats-seo/app/PLAN.md`（社内メモ）を参照。
