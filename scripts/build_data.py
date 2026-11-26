#!/usr/bin/env python3
"""公式サイト ats-japan.com の公開データ（WP REST の GET のみ）から
アプリ用の JSON（data/stock.json, data/cases.json, data/prices.json）を作る。
公式サイトへの書き込みは一切しない。"""
import json, re, html, os, sys, time, urllib.request, urllib.error
from datetime import datetime, timezone, timedelta

BASE = "https://www.ats-japan.com"
API = BASE + "/wp-json/wp/v2"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
JST = timezone(timedelta(hours=9))
UA = "ATS-container-app-data/1.0 (+https://ats-business-hub.github.io/ats-app/)"

CAT_STOCK, CAT_SOLD, CAT_CASES = 109, 93, 75
CAT_NEW, CAT_USED, CAT_CUSTOM, CAT_SHUTTER = 110, 111, 112, 134
CASE_CATS = [(80, "店舗"), (77, "事務所"), (85, "ガレージ"), (76, "離れ・趣味部屋"),
             (81, "倉庫"), (118, "木造"), (88, "その他")]
EXCLUDE = re.compile(r"トレーラー|サウナ|sauna|trailer", re.I)
MAX_CASES = 80


def get(url, tries=3):
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json,text/html"})
            with urllib.request.urlopen(req, timeout=40) as r:
                return r.read().decode("utf-8", "replace"), dict(r.headers)
        except Exception as e:  # noqa
            last = e
            time.sleep(3 * (i + 1))
    raise RuntimeError(f"GET failed: {url}: {last}")


def get_json_pages(path, per_page=100, max_pages=10):
    out = []
    for page in range(1, max_pages + 1):
        sep = "&" if "?" in path else "?"
        body, headers = get(f"{API}/{path}{sep}per_page={per_page}&page={page}")
        data = json.loads(body)
        if not isinstance(data, list):
            break
        out.extend(data)
        total_pages = int(headers.get("X-WP-TotalPages") or headers.get("x-wp-totalpages") or 1)
        if page >= total_pages:
            break
    return out


def text(s):
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", s or "", flags=re.S)
    s = html.unescape(re.sub(r"<[^>]+>", " ", s))
    return re.sub(r"\s+", " ", s).strip()


def image_of(post):
    try:
        fm = post["_embedded"]["wp:featuredmedia"][0]
    except (KeyError, IndexError, TypeError):
        return None
    sizes = (fm.get("media_details") or {}).get("sizes") or {}
    for key in ("gallery", "medium_large", "portfolio", "large", "full"):
        if key in sizes:
            return sizes[key]["source_url"]
    return fm.get("source_url")


def to_int(s):
    return int(s.replace(",", "").replace(" ", ""))


PRICE_PATTERNS = [
    re.compile(r"販売価格\s*／?\s*[¥￥]\s*([\d,]+)\s*(～|〜)?"),
    re.compile(r"[¥￥]\s*([\d,]+)\s*（税込\s*[¥￥]\s*[\d,]+）\s*(～|〜)?"),
    re.compile(r"[¥￥]\s*([\d,]+)\s*（税別）\s*(～|〜)?"),
]


def parse_price(t):
    head = t[:1500]
    for pat in PRICE_PATTERNS:
        m = pat.search(head)
        if m:
            return to_int(m.group(1)), bool(m.group(2))
    return None, False


def parse_size(title):
    m = re.search(r"(\d+(?:\.\d+)?)\s*(?:ft|フィート)", title, re.I)
    size = (m.group(1) + "ft") if m else ""
    if size and re.search(r"ハイキューブ|HC", title):
        size += "HC"
    return size


def kind_of(title):
    for k in ("リーファ", "オープントップ", "フルサイドオープン", "JIS", "JR"):
        if k in title:
            return {"リーファ": "冷凍冷蔵（ユニットなし）", "JIS": "JISコンテナ", "JR": "JRコンテナ"}.get(k, k + "コンテナ")
    if "シャッター" in title:
        return "シャッター付き"
    if "ドア" in title:
        return "ドア付き"
    if "カスタム" in title or "改造" in title:
        return "カスタム"
    return "海上コンテナ"


def build_stock():
    posts = get_json_pages(f"posts?categories={CAT_STOCK}&_embed=wp:featuredmedia")
    items = []
    for p in posts:
        title = text(p["title"]["rendered"])
        cats = p.get("categories", [])
        if CAT_SOLD in cats or EXCLUDE.search(title) or re.search(r"売り切れ|SOLD", title, re.I):
            continue
        t = text(p["content"]["rendered"])
        price, from_ = parse_price(t)
        cond = "新品" if (CAT_NEW in cats or "新品" in title) else ("中古" if (CAT_USED in cats or "中古" in title) else "")
        items.append({
            "id": p["id"],
            "title": title,
            "url": p["link"],
            "image": image_of(p),
            "condition": cond,
            "size": parse_size(title),
            "kind": kind_of(title),
            "price": price,
            "price_from": from_,
            "date": p["date"][:10],
            "modified": p["modified"][:10],
        })
    items.sort(key=lambda x: (x["date"], x["id"]), reverse=True)
    return items


def case_category(cats):
    for cid, name in CASE_CATS:
        if cid in cats:
            return name
    return "その他"


def build_cases():
    posts = get_json_pages(f"posts?categories={CAT_CASES}&_embed=wp:featuredmedia&_fields=id,link,title,date,categories,_links,_embedded",
                           per_page=50, max_pages=4)
    items = []
    for p in posts:
        title = text(p["title"]["rendered"])
        img = image_of(p)
        if not img or EXCLUDE.search(title):
            continue
        m = re.search(r"[（(]([^（）()]*?(?:都|道|府|県)[^（）()]*)[）)]\s*$", title)
        items.append({
            "id": p["id"],
            "title": title,
            "url": p["link"],
            "image": img,
            "category": case_category(p.get("categories", [])),
            "location": m.group(1) if m else "",
            "date": p["date"][:10],
        })
        if len(items) >= MAX_CASES:
            break
    return items


PRICE_KEYS = {
    "used_10ft": r"中古海上コンテナ\s*10ft\s*[¥￥]([\d,]+)",
    "used_12ft": r"中古海上コンテナ\s*12ft\s*[¥￥]([\d,]+)",
    "used_jr12ft": r"中古JRコンテナ\s*12ft\s*[¥￥]([\d,]+)",
    "used_20ft": r"中古海上コンテナ\s*20ft\s*[¥￥]([\d,]+)",
    "used_20ftHC": r"中古海上コンテナ\s*20ftHC\s*[¥￥]([\d,]+)",
    "used_40ft": r"中古海上コンテナ\s*40ft\s*[¥￥]([\d,]+)",
    "used_40ftHC": r"中古海上コンテナ\s*40ftHC\s*[¥￥]([\d,]+)",
    "new_10ft": r"新品海上コンテナ\s*10ft\s*[¥￥]([\d,]+)",
    "new_12ft": r"新品海上コンテナ\s*12ft\s*[¥￥]([\d,]+)",
    "new_20ft": r"新品海上コンテナ\s*20ft\s*[¥￥]([\d,]+)",
    "new_20ftHC": r"新品海上コンテナ\s*20ftHC\s*[¥￥]([\d,]+)",
    "new_40ft": r"新品海上コンテナ\s*40ft\s*[¥￥]([\d,]+)",
    "new_40ftHC": r"新品海上コンテナ\s*40ftHC\s*[¥￥]([\d,]+)",
}


def build_prices():
    body, _ = get(BASE + "/price/")
    t = text(body)
    out = {}
    for k, pat in PRICE_KEYS.items():
        m = re.search(pat, t)
        if m:
            out[k] = to_int(m.group(1))
    return out


def write(name, payload):
    path = os.path.join(OUT, name)
    old = None
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            try:
                old = json.load(f)
            except Exception:
                old = None
    if old and old.get("items") == payload.get("items"):
        print(f"{name}: no change")
        return
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"{name}: written ({len(payload['items'])})")


def main():
    os.makedirs(OUT, exist_ok=True)
    now = datetime.now(JST).strftime("%Y-%m-%d %H:%M")
    errors = 0
    for name, fn, minimum in (("stock.json", build_stock, 5), ("cases.json", build_cases, 10), ("prices.json", build_prices, 8)):
        try:
            items = fn()
        except Exception as e:
            print(f"{name}: ERROR {e}", file=sys.stderr)
            errors += 1
            continue
        if len(items) < minimum:
            print(f"{name}: too few items ({len(items)}), keeping previous file", file=sys.stderr)
            errors += 1
            continue
        write(name, {"updated": now, "source": BASE + "/", "items": items})
    return 1 if errors == 3 else 0


if __name__ == "__main__":
    sys.exit(main())
