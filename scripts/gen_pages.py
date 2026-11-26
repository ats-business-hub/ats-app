#!/usr/bin/env python3
"""アプリの各ページ（静的HTML）を共通のヘッダー・フッター・下部メニューで生成する開発用スクリプト。"""
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SITE = "https://ats-business-hub.github.io/ats-app/"

ICON = {
 "home": '<path d="M3 11.5 12 4l9 7.5"/><path d="M6 10.5V20h12v-9.5"/>',
 "zaiko": '<rect x="3" y="7" width="18" height="12" rx="1.5"/><path d="M3 11h18M8 7V5h8v2"/>',
 "mitsumori": '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18h2M12 18h2"/>',
 "jirei": '<rect x="3" y="4" width="7" height="7" rx="1"/><rect x="14" y="4" width="7" height="7" rx="1"/><rect x="3" y="13" width="7" height="7" rx="1"/><rect x="14" y="13" width="7" height="7" rx="1"/>',
 "soudan": '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
 "kaitori": '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
 "tsuuchi": '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
}
NAV = [("", "home", "ホーム"), ("zaiko/", "zaiko", "在庫"), ("mitsumori/", "mitsumori", "見積もり"),
       ("jirei/", "jirei", "施工事例"), ("soudan/", "soudan", "相談")]


def svg(name):
    return f'<svg viewBox="0 0 24 24" aria-hidden="true">{ICON[name]}</svg>'


def page(path, title, desc, body, current, scripts=(), crumb=None):
    depth = path.count("/")
    r = "../" * depth if depth else "./"
    nav = "\n".join(
        f'<a href="{r}{href}"' + (' aria-current="page"' if key == current else "") + f'>{svg(key)}{label}</a>'
        for href, key, label in NAV)
    crumb_html = f'<p class="muted"><a href="{r}">ホーム</a> ／ {crumb}</p>\n' if crumb else ""
    js = "\n".join(f'<script src="{r}js/{s}" defer></script>' for s in ("config.js", "app.js") + tuple(scripts))
    url = SITE + path
    body = body.replace("{R}", r)
    html = f'''<!DOCTYPE html>
<html lang="ja" data-root="{r}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#0b4f8a">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="ATSコンテナ">
<meta name="application-name" content="ATSコンテナ">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ATS コンテナアプリ">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}img/og.jpg">
<meta property="og:locale" content="ja_JP">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{r}favicon.svg" type="image/svg+xml">
<link rel="icon" href="{r}img/icons/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="{r}img/icons/apple-touch-icon.png">
<link rel="manifest" href="{r}manifest.webmanifest">
<link rel="preconnect" href="https://www.ats-japan.com">
<link rel="stylesheet" href="{r}css/app.css?v=8">
</head>
<body>
<header class="hd">
  <div class="hd-in">
    <a class="logo" href="{r}">
      <img src="{r}img/icons/icon-192.png" alt="" width="36" height="36">
      <span>ATS コンテナアプリ<small>ATS, Japan合同会社</small></span>
    </a>
    <a class="hd-tel" href="tel:0120355272">電話する</a>
  </div>
</header>
<main>
{('<div class="w" style="padding-top:14px">' + crumb_html + body + '</div>') if crumb else body}
</main>
<footer>
  <div class="w">
    <p><strong>ATS, Japan合同会社</strong>（代表 織田篤）</p>
    <ul class="fl">
      <li><a href="https://www.ats-japan.com/">公式サイト</a></li>
      <li><a href="https://www.ats-japan.com/contact/">お問い合わせ</a></li>
      <li><a href="https://www.ats-japan.com/items/">販売中のコンテナ</a></li>
      <li><a href="https://www.ats-japan.com/price/">料金表</a></li>
      <li><a href="{r}kaitori/">買い取り査定</a></li>
      <li><a href="{r}tsuuchi/">入荷のお知らせ</a></li>
      <li><a href="{r}install/">アプリの追加方法</a></li>
    </ul>
    <address>
      〒498-0063 愛知県弥富市東末広（ヤード）<br>
      TEL <a href="tel:0120355272">0120-355-272</a>（フリーダイヤル）／ <a href="tel:0523559565">052-355-9565</a><br>
      メール <a href="mailto:info@ats-japan.com">info@ats-japan.com</a><br>
      営業 10:00〜18:00（土・日・祝 定休）
    </address>
    <p style="color:#9aa3ad;font-size:13px">在庫・施工事例は公式サイト ats-japan.com の掲載内容から自動で更新しています。価格は税別表示です。</p>
  </div>
</footer>
<nav class="bar" aria-label="メインメニュー">
{nav}
</nav>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
{js}
</body>
</html>
'''
    out = os.path.join(ROOT, path, "index.html") if path else os.path.join(ROOT, "index.html")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", out)


def tile(href, icon, title, sub, extra=""):
    return f'<li><a class="tile" href="{{R}}{href}">{svg(icon)}<strong>{title}</strong><span>{sub}</span>{extra}</a></li>'


HOME = f'''
<div class="hero">
  <img class="hero-photo" src="./img/stock/hero-20ft-blue.webp" alt="ヤードに置かれた青い20フィートコンテナ" width="960" height="720" fetchpriority="high">
  <div class="w">
    <h1>コンテナの在庫も見積もりも、<br>スマホでさっと。</h1>
    <p class="lead">愛知県弥富市のヤードから、新品・中古コンテナを販売しています。本体のみの販売も行っております。簡易的な加工から特殊加工、ハウス製作まで対応しております。</p>
    <ul class="pills"><li>販売実績1,000本以上</li><li>本体のみOK</li><li>PayPal可</li><li>ヤード引き取り・積込無料</li></ul>
    <a class="newbar" id="newbar" href="./zaiko/" hidden></a>
  </div>
</div>
<div class="w">
  <h2>できること</h2>
  <ul class="tiles">
    {tile("zaiko/", "zaiko", "在庫一覧", "販売中のコンテナを写真と価格で", '<em class="dot" id="tile-new" hidden></em>')}
    {tile("mitsumori/", "mitsumori", "かんたん見積もり", "サイズ・加工・配送先を選ぶだけ")}
    {tile("kaitori/", "kaitori", "写真で買い取り査定", "使わなくなったコンテナを査定")}
    {tile("jirei/", "jirei", "施工事例", "店舗・事務所・ガレージなど")}
    {tile("tsuuchi/", "tsuuchi", "入荷のお知らせ", "新しい在庫にNEWの印がつきます")}
    {tile("soudan/", "soudan", "電話・LINEで相談", "わからないことは気軽にどうぞ")}
  </ul>

  <h2>新しく掲載された在庫</h2>
  <div class="strip" id="home-stock"><p class="muted">読み込んでいます…</p></div>
  <p><a href="./zaiko/">在庫をすべて見る</a></p>

  <div class="box">
    <p style="margin:0"><strong>新品20ft</strong> 本体 ¥398,000（税別／税込 ¥437,800）<br><strong>新品40ft</strong> 本体 ¥768,000〜（税別）<br><span class="muted">送料は別です。ヤードでの引き取りなら積み込みは無料です。</span></p>
  </div>
  <div class="btns two">
    <a class="btn p" href="./mitsumori/">見積もりをしてみる</a>
    <a class="btn o" href="tel:0120355272">0120-355-272 に電話</a>
  </div>

  <h2>最近の施工事例</h2>
  <div class="strip" id="home-cases"></div>
  <p><a href="./jirei/">施工事例をもっと見る</a></p>

  <div class="install hide" id="install-banner">
    <p><strong>ホーム画面に追加</strong>しておくと、次からワンタップで開けます（無料）。</p>
    <div class="btns two">
      <button type="button" class="btn s" id="install-btn">追加する</button>
      <a class="btn o" href="./install/">追加のしかた</a>
    </div>
  </div>
  <div class="qr-pc">
    <p>パソコンでご覧の方は、スマホでQRコードを読み取るとアプリを開けます。</p>
    <img src="./img/qr-ats-app.png" alt="ATSコンテナアプリのQRコード" width="160" height="160">
  </div>
</div>
'''

ZAIKO = '''
<h1>在庫一覧</h1>
<p class="lead" style="margin-top:0">公式サイトで販売中のコンテナです。気になる商品は「詳しく見る」から公式サイトのページを開けます。</p>
<div class="filters" id="f-cond" role="group" aria-label="新品・中古">
  <button type="button" data-v="" aria-pressed="true">すべて</button>
  <button type="button" data-v="新品" aria-pressed="false">新品</button>
  <button type="button" data-v="中古" aria-pressed="false">中古</button>
</div>
<div class="filters" id="f-size" role="group" aria-label="サイズ">
  <button type="button" data-v="" aria-pressed="true">全サイズ</button>
  <button type="button" data-v="10" aria-pressed="false">10ft以下</button>
  <button type="button" data-v="12" aria-pressed="false">12・14ft</button>
  <button type="button" data-v="20" aria-pressed="false">20ft</button>
  <button type="button" data-v="40" aria-pressed="false">40ft</button>
</div>
<div class="ctrl">
  <select id="sort" aria-label="並び順">
    <option value="new">新しい順</option>
    <option value="low">価格の安い順</option>
    <option value="high">価格の高い順</option>
  </select>
  <span class="count" id="count"></span>
</div>
<div class="grid rows" id="list"><p class="muted">読み込んでいます…</p></div>
<button type="button" class="btn o more" id="more" hidden>もっと見る</button>
<div class="box">
  <p style="margin:0">中古コンテナは同じ程度の状態のものからお届けします。写真と細かな傷やサビの位置が違うことがあります。在庫は日々動くため、ご注文の前にお電話かお問い合わせでご確認ください。</p>
</div>
<p class="muted" id="updated"></p>
'''

MITSUMORI = '''
<h1>かんたん見積もり</h1>
<p class="lead" style="margin-top:0">サイズと加工、お届け先を選ぶと、おおよその金額がわかります。</p>
<div class="box hl" id="from-item" hidden></div>
<form class="est" id="est" onsubmit="return false">
  <fieldset>
    <legend>1. 新品・中古</legend>
    <div class="seg">
      <label><input type="radio" name="cond" value="new" checked><span>新品</span></label>
      <label><input type="radio" name="cond" value="used"><span>中古</span></label>
    </div>
  </fieldset>
  <fieldset>
    <legend>2. サイズ</legend>
    <div class="seg s3" id="sizes"></div>
    <p class="muted" id="size-note" style="margin:8px 0 0"></p>
  </fieldset>
  <fieldset>
    <legend>3. 加工（必要なものだけ）</legend>
    <div id="opts"></div>
  </fieldset>
  <fieldset>
    <legend>4. お届け先</legend>
    <select id="area" aria-label="お届け先"></select>
    <p class="muted" style="margin:8px 0 0">4tまたは7tユニック車でお届けする場合の目安です。設置場所の道幅や高さによって変わることがあります。</p>
  </fieldset>

  <div class="total" aria-live="polite">
    <div class="row"><span>合計の目安（税別）</span><span class="big" id="t-ex">—</span></div>
    <div class="row sub"><span>税込</span><span id="t-in">—</span></div>
  </div>

  <h2>内訳</h2>
  <table class="lines"><tbody id="lines"></tbody></table>
  <p class="muted">「〜」がついている金額は最低価格の目安です。正式なお見積もりは、設置場所やご希望の仕様を伺ってからお出しします。お支払いはクレジットカード・PayPal・ローンにも対応しています。</p>

  <h2>この内容で相談する</h2>
  <div class="btns">
    <button type="button" class="btn p" id="send-contact">内容をコピーしてお問い合わせへ</button>
    <a class="btn s" id="send-mail" href="mailto:info@ats-japan.com">メールで送る</a>
    <a class="btn o" href="tel:0120355272">0120-355-272 に電話</a>
  </div>
  <p class="muted">「お問い合わせへ」を押すと見積もり内容がコピーされます。公式サイトのお問い合わせフォームの本文に貼り付けて送ってください。</p>
</form>
'''

KAITORI = '''
<h1>写真で買い取り査定</h1>
<p class="lead" style="margin-top:0">使わなくなったコンテナやプレハブを買い取ります。引き取りは全国に対応しています。写真を送っていただければ、現地に行く前におおよその査定ができます。</p>
<ol class="steps">
  <li><strong>写真を撮る</strong>全体（前後左右）、扉を開けた内部、床、傷やサビが気になるところ。2〜5枚あれば十分です。</li>
  <li><strong>下のメモを作る</strong>サイズや置き場所を入れてコピーしておくと、フォームの入力がすぐ終わります。</li>
  <li><strong>公式サイトのフォームで送る</strong>メモを貼り付けて、写真を添付して送信します（JPEG・PNG・HEIC、最大5枚）。</li>
  <li><strong>査定結果のご連絡</strong>内容を確認して、お電話かメールでご連絡します。</li>
</ol>
<div class="box memo">
  <p style="margin:0 0 4px"><strong>査定用メモ</strong>（入力は任意です）</p>
  <label for="k-type">品目</label>
  <select id="k-type"><option>海上コンテナ</option><option>JRコンテナ</option><option>冷凍・冷蔵コンテナ</option><option>プレハブ・ユニットハウス</option><option>その他</option></select>
  <label for="k-size">サイズ</label>
  <select id="k-size"><option>わからない</option><option>10ft</option><option>12ft</option><option>20ft</option><option>20ftハイキューブ</option><option>40ft</option><option>40ftハイキューブ</option><option>その他</option></select>
  <label for="k-qty">数量</label>
  <input id="k-qty" type="number" min="1" value="1" inputmode="numeric">
  <label for="k-pref">置いてある場所（都道府県・市区町村）</label>
  <input id="k-pref" type="text" placeholder="例：愛知県名古屋市港区">
  <label for="k-cond">状態</label>
  <select id="k-cond"><option>使用中・問題なし</option><option>少しサビや凹みがある</option><option>サビや雨漏りがある</option><option>わからない</option></select>
  <label for="k-note">搬出の条件・その他</label>
  <textarea id="k-note" placeholder="例：前の道は4m、トラックが横付けできます"></textarea>
  <div class="btns two">
    <button type="button" class="btn s" id="k-copy">メモをコピー</button>
    <a class="btn p" id="k-go" href="https://www.ats-japan.com/kaitori/">フォームを開く</a>
  </div>
</div>
<p>フォームがうまく使えないときは、<a href="mailto:info@ats-japan.com?subject=%E8%B2%B7%E3%81%84%E5%8F%96%E3%82%8A%E6%9F%BB%E5%AE%9A%E3%81%AE%E4%BE%9D%E9%A0%BC">info@ats-japan.com</a> に写真を添付して送っていただいても大丈夫です。</p>
<div class="btns two">
  <a class="btn o" href="tel:0120355272">電話で相談する</a>
  <a class="btn o" href="{R}soudan/">ほかの相談方法</a>
</div>
'''

JIREI = '''
<h1>施工事例</h1>
<p class="lead" style="margin-top:0">これまでに手がけたコンテナハウスや倉庫の一部です。写真をタップすると、公式サイトで詳しい内容を見られます。</p>
<div class="filters" id="cats" role="group" aria-label="用途"></div>
<div class="grid g2" id="list"><p class="muted">読み込んでいます…</p></div>
<button type="button" class="btn o more" id="more" hidden>もっと見る</button>
<p><a href="https://www.ats-japan.com/gallery/">公式サイトの施工事例一覧へ</a></p>
'''

TSUUCHI = '''
<h1>入荷のお知らせ</h1>
<p class="lead" style="margin-top:0">新しいコンテナが掲載されたら、アプリを開いたときにお知らせします。</p>
<ol class="steps">
  <li><strong>アプリを開くだけ</strong>前回見たあとに増えた在庫には「NEW」の印がつき、ホームにも件数が出ます。</li>
  <li><strong>気になる条件を選ぶ</strong>下で選んだ条件に合う在庫だけを数えます。何も選ばなければ、すべての在庫が対象です。</li>
</ol>
<div class="box">
  <p style="margin:0 0 8px"><strong>新品・中古</strong></p>
  <div class="chk" id="w-cond">
    <label><input type="checkbox" value="新品">新品</label>
    <label><input type="checkbox" value="中古">中古</label>
  </div>
  <p style="margin:14px 0 8px"><strong>サイズ</strong></p>
  <div class="chk" id="w-size">
    <label><input type="checkbox" value="10">10ft以下</label>
    <label><input type="checkbox" value="12">12・14ft</label>
    <label><input type="checkbox" value="20">20ft</label>
    <label><input type="checkbox" value="40">40ft</label>
  </div>
  <p class="muted" id="w-status" style="margin:12px 0 0"></p>
</div>
<div class="box" id="push-box" hidden>
  <p style="margin:0 0 8px"><strong>スマホに通知を出す（Androidのみ・試験中）</strong></p>
  <p class="muted" style="margin:0 0 8px">ホーム画面に追加したアプリでは、1日に1回ほど在庫を確認して、新しい在庫があれば通知します。端末の設定によっては届かないこともあります。</p>
  <button type="button" class="btn s" id="push-on" style="width:100%">通知をオンにする</button>
</div>
<div class="box" id="line-box" hidden>
  <p style="margin:0 0 8px"><strong>LINEで入荷情報を受け取る</strong></p>
  <a class="btn p" id="line-link" href="#" style="width:100%">LINEで友だち追加</a>
</div>
<p>入荷の予定や、探しているサイズがあるときは、お電話で聞いていただくのがいちばん確実です。</p>
<div class="btns two">
  <a class="btn p" href="tel:0120355272">0120-355-272 に電話</a>
  <a class="btn o" href="{R}zaiko/">在庫を見る</a>
</div>
'''

SOUDAN = '''
<h1>電話・LINEで相談</h1>
<p class="lead" style="margin-top:0">サイズ選びや置き場所、加工の内容など、決まっていなくても大丈夫です。お気軽にご相談ください。</p>
<div class="grid">
  <a class="big-tel" href="tel:0120355272">0120-355-272<small>フリーダイヤル（無料）</small></a>
  <a class="big-tel s" href="tel:0523559565">052-355-9565<small>こちらの番号でも受け付けています</small></a>
</div>
<p class="muted">受付時間 10:00〜18:00（土・日・祝は定休）</p>
<div class="box" id="line-box" hidden>
  <p style="margin:0 0 8px"><strong>LINEで相談する</strong></p>
  <a class="btn p" id="line-link" href="#" style="width:100%">LINEで友だち追加</a>
</div>
<h2>フォーム・メール</h2>
<div class="btns">
  <a class="btn s" href="https://www.ats-japan.com/contact/">お問い合わせフォーム（公式サイト）</a>
  <a class="btn o" href="mailto:info@ats-japan.com">info@ats-japan.com にメール</a>
</div>
<h2>ヤード（引き取り・見学）</h2>
<div class="box">
  <p style="margin:0">〒498-0063 愛知県弥富市東末広<br>ヤードでの引き取りなら、積み込みは無料です。見学をご希望の方は、事前にお電話ください。</p>
  <p style="margin:8px 0 0"><a href="https://www.google.com/maps/search/?api=1&amp;query=%E6%84%9B%E7%9F%A5%E7%9C%8C%E5%BC%A5%E5%AF%8C%E5%B8%82%E6%9D%B1%E6%9C%AB%E5%BA%83">地図を開く</a></p>
</div>
<h2>ATS, Japanについて</h2>
<ul>
  <li>コンテナの販売実績は1,000本以上です。</li>
  <li>本体のみの販売も行っております。簡易的な加工から特殊加工、ハウス製作まで対応しております。</li>
  <li>お支払いはPayPalにも対応しています。</li>
</ul>
'''

INSTALL = '''
<h1>アプリの追加方法</h1>
<p class="lead">このアプリは無料のウェブアプリです。アプリストアからダウンロードする必要はありません。下のアドレス（QRコード）を開けば、iPhoneでもAndroidでもそのまま使えます。</p>
<div class="box hl">
  <p><strong>アプリのアドレス</strong><br>
  <a href="https://ats-business-hub.github.io/ats-app/">https://ats-business-hub.github.io/ats-app/</a></p>
  <div class="qr-pc" style="display:block">
    <img src="{R}img/qr-ats-app.png" alt="ATSコンテナアプリのQRコード" width="200" height="200" style="width:200px;height:200px">
  </div>
</div>
<h2>iPhone / iPad（Safari）</h2>
<ol>
  <li>Safariで上のアドレスを開きます。</li>
  <li>画面下（または上）の共有ボタンをタップします。</li>
  <li>「ホーム画面に追加」を選んで、追加します。</li>
</ol>
<h2>Android（Chrome）</h2>
<ol>
  <li>Chromeで上のアドレスを開きます。</li>
  <li>「アプリをインストール」か、メニューの「ホーム画面に追加」を選びます。</li>
  <li>表示されないときは、下の「追加する」ボタンを押してください。</li>
</ol>
<h2>パソコン</h2>
<p>Chrome や Edge では、アドレスバーの右にあるインストールのアイコンから追加できます。スマホで使うときは、QRコードを読み取ってください。</p>
<div class="install hide" id="install-banner">
  <p><strong>ホーム画面に追加</strong>しておくと、次からワンタップで開けます（無料）。</p>
  <div class="btns"><button type="button" class="btn s" id="install-btn">追加する</button></div>
</div>
<div class="btns">
  <a class="btn p" href="{R}">アプリを開く</a>
  <a class="btn o" href="https://www.ats-japan.com/">公式サイトを見る</a>
</div>
'''

D = "ATS, Japan合同会社のコンテナアプリ。"
page("", "ATS コンテナアプリ｜在庫・見積もり・買い取り査定・施工事例",
     D + "新品・中古コンテナの在庫と価格、かんたん見積もり、写真で買い取り査定、施工事例をスマホで見られます。", HOME, "home", ("home.js",))
page("zaiko/", "在庫一覧｜ATS コンテナアプリ", D + "公式サイトで販売中の新品・中古コンテナを、写真と価格で一覧にしています。", ZAIKO, "zaiko", ("zaiko.js",), "在庫一覧")
page("mitsumori/", "かんたん見積もり｜ATS コンテナアプリ", D + "サイズ・加工・お届け先を選ぶと、コンテナのおおよその金額がわかります。", MITSUMORI, "mitsumori", ("mitsumori.js",), "かんたん見積もり")
page("kaitori/", "写真で買い取り査定｜ATS コンテナアプリ", D + "使わなくなったコンテナやプレハブを、写真で査定します。引き取りは全国対応です。", KAITORI, "", ("kaitori.js",), "写真で買い取り査定")
page("jirei/", "施工事例｜ATS コンテナアプリ", D + "店舗・事務所・ガレージ・倉庫など、コンテナハウスの施工事例です。", JIREI, "jirei", ("jirei.js",), "施工事例")
page("tsuuchi/", "入荷のお知らせ｜ATS コンテナアプリ", D + "新しく掲載されたコンテナの在庫をお知らせします。", TSUUCHI, "", ("tsuuchi.js",), "入荷のお知らせ")
page("soudan/", "電話・LINEで相談｜ATS コンテナアプリ", D + "コンテナのご相談はお電話・フォーム・メールで受け付けています。", SOUDAN, "soudan", (), "電話・LINEで相談")
page("install/", "アプリの追加方法｜ATS コンテナアプリ", "ATSコンテナアプリをホーム画面に追加する方法です。無料で、アプリストアからのダウンロードは不要です。", INSTALL, "", (), "追加方法")
