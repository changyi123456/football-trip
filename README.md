# World Cup Trip · 世足英文沈浸之旅

第一人稱英文沈浸式跨領域課程。你**搭機出發**去看 2026 世界盃,從機場、街道、售票口到看台,全程用**英文**闖關(NPC 對話、聽力發音、看板/球票閱讀、單字拖放),最後在球場邊用英文搞懂**一個足球物理祕密**(旋轉→彎曲,國中定性版)。沒有關卡選單——場景從飛機艙第一視角一站接一站連續推進。

## 🚀 如何啟動

**方法 A(最簡單):直接雙擊 `index.html`。**
內建 `js/data.js` 內嵌備援,雙擊(file://)也能正常跑(仍需連網載入 Three.js,建議 Chrome / Edge)。

**方法 B(開發用,推薦):本機伺服器。**
若你要編輯 `data/*.json` 並即時生效,用伺服器開啟才會讀到最新 JSON:

```bash
cd worldcup-trip
python3 -m http.server 8000
```

然後瀏覽器打開 **http://localhost:8000**。

> 沒有 Python 也可用:`npx serve` 或 VS Code 的 **Live Server** 擴充。

### 載入邏輯
`index.html` 開啟時會**先試著 `fetch` 讀 `data/*.json`**;若被 file:// 擋下,就**自動改用 `js/data.js` 內嵌備援**。所以雙擊也能玩,伺服器則能即時讀 JSON。

### 編輯 JSON 後(方法 A 使用者請注意)
`js/data.js` 是從 `data/*.json` 產生的快照。若你改了 JSON 又想用**雙擊**看到更新,請重新產生一次:

```bash
cd worldcup-trip
node -e 'const fs=require("fs");const c=JSON.parse(fs.readFileSync("data/config.json"));const s=c.scenes.map(p=>JSON.parse(fs.readFileSync(p)));fs.writeFileSync("js/data.js","window.WC_BUNDLE = "+JSON.stringify({config:c,scenes:s},null,2)+";\n")'
```

(用方法 B 伺服器開啟則不需要這步。)

## 📁 專案結構

```
worldcup-trip/
├── index.html            入口(載入 Three.js + 後製 + 模組)
├── css/style.css         全部樣式
├── js/
│   ├── engine.js         3A 級第一人稱 Three.js 引擎(天空穹頂、軟陰影、
│   │                     ACES 色調、體育場人群、泛光、環境反射、物理射門)
│   └── game.js           流程控制:JSON 載入、搭機過場、對話/評量、存檔
└── data/
    ├── config.json       旅程設定與場景清單、護照章
    └── scenes/
        ├── 00-airport.json   機場入境(對話 + 看板填空)
        ├── 01-city.json      前往球場(問路 + 單字拖放)
        ├── 02-ticket.json    售票口(交易對話 + 聽力)
        ├── 03-stands.json    看台聊天(球迷對話 + 短文克漏字)
        └── 04-secret.json    香蕉球的祕密(英文提問 + 1 個物理概念)
```

## ✏️ 如何改內容

直接編輯 `data/scenes/*.json` 即可,不用碰程式。每個場景是一串 `beats`,支援型別:

| type | 用途 |
|------|------|
| `say` | NPC 說一句(自動英文語音) |
| `choose` | 英文對話分支選擇 |
| `listen` | 聽力:聽英文再選答案 |
| `fill` | 看板/球票閱讀填空 |
| `cloze` | 短文克漏字 |
| `match` | 英文單字拖放配對 |
| `physics` | 香蕉球互動 + 觀察題 |

新增場景:在 `data/scenes/` 放一個 JSON,並加進 `config.json` 的 `scenes` 陣列即可。

## 🌆 真實場景(360 環景照片)

每個場景會載入 **Poly Haven 的真實 360° HDR 環景照片**(CC0 授權,免費可商用)當背景與光照來源,讓第一視角看出去就是真實的機場 / 街道 / 球場:

| 場景 | 環景 |
|------|------|
| 機場 | Rostock-Laage Airport |
| 街道 | Wide Street 01 |
| 售票 / 球場 | Stadium 01 |
| 看台 | Orlando Stadium |

- 需連網載入(每張約 1.5 MB 的 1k HDR)。載入失敗會**自動退回內建幾何場景**,不會壞掉。
- 授權:Poly Haven,CC0,無需標註。

## 🎓 教學對應

- **英文(主)**:情境對話、聽力、發音、閱讀素養、字彙——皆為國中程度。
- **物理(輔,1 概念)**:旋轉造成彎曲(Magnus 效應國中定性版),用英文情境帶入、親手操作驗證。
- 每站蓋護照章、計分,進度自動存於瀏覽器本機。
