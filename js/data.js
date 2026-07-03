/* AUTO-GENERATED fallback bundle — lets index.html run by double-click (file://).
   Source of truth is data/*.json; regenerate after editing (see README). */
window.WC_BUNDLE = {
  "config": {
    "title": "World Cup Trip · 世足英文沈浸之旅",
    "version": "2.0",
    "stamps": [
      "🛂 Immigration",
      "🚕 City",
      "🎟️ Ticket",
      "🏟️ Stands",
      "⚽ The Secret"
    ],
    "scenes": [
      "data/scenes/00-airport.json",
      "data/scenes/01-city.json",
      "data/scenes/02-ticket.json",
      "data/scenes/03-stands.json",
      "data/scenes/04-secret.json"
    ]
  },
  "scenes": [
    {
      "id": 0,
      "key": "airport",
      "icon": "🛂",
      "name": "Airport Immigration",
      "zh": "機場入境",
      "env": "airport",
      "tags": [
        [
          "對話 Dialogue",
          "eng"
        ],
        [
          "看板閱讀 Reading",
          "mech"
        ]
      ],
      "beats": [
        {
          "type": "say",
          "who": "Officer",
          "role": "海關官員",
          "en": "Welcome! May I see your passport, please?",
          "zh": "歡迎!請給我看你的護照。"
        },
        {
          "type": "choose",
          "who": "Officer",
          "role": "海關官員",
          "en": "What is the purpose of your visit?",
          "zh": "你來訪的目的是什麼?",
          "opts": [
            {
              "t": "I'm here to watch the World Cup.",
              "s": "我是來看世界盃的。",
              "ok": true
            },
            {
              "t": "I am a football.",
              "s": "我是一顆足球。(文法對但語意錯)",
              "ok": false
            },
            {
              "t": "Yes, thank you very much.",
              "s": "答非所問",
              "ok": false
            }
          ],
          "fbOk": "Perfect answer! 目的講清楚,官員點頭放行。",
          "fbNo": "官員一臉困惑——purpose 問的是『目的』,要說你來做什麼。"
        },
        {
          "type": "listen",
          "who": "Officer",
          "role": "海關官員",
          "en": "Enjoy your stay. Gate B is on your left.",
          "zh": "祝你玩得愉快。B 登機門在你左邊。",
          "q": "Which way is Gate B?",
          "qz": "B 門在哪個方向?",
          "opts": [
            {
              "t": "On the left 在左邊",
              "ok": true
            },
            {
              "t": "On the right 在右邊",
              "ok": false
            },
            {
              "t": "Upstairs 在樓上",
              "ok": false
            }
          ],
          "fbOk": "聽對了!left = 左邊。",
          "fbNo": "再聽一次:on your LEFT。"
        },
        {
          "type": "fill",
          "who": "Sign",
          "role": "入境看板",
          "intro": "Read the airport board and fill the blanks.",
          "introZh": "讀機場看板,填入正確資訊。",
          "sign": [
            [
              "FLIGHT",
              "WC 2026"
            ],
            [
              "FROM",
              "Taipei"
            ],
            [
              "STATUS",
              "___1___"
            ],
            [
              "GATE",
              "___2___"
            ]
          ],
          "blanks": [
            {
              "n": 1,
              "q": "The plane has arrived. STATUS = ?",
              "opts": [
                "Arrived 已抵達",
                "Delayed 誤點",
                "Boarding 登機中"
              ],
              "ok": 0
            },
            {
              "n": 2,
              "q": "The officer said Gate B. GATE = ?",
              "opts": [
                "B",
                "D",
                "F"
              ],
              "ok": 0
            }
          ],
          "fb": "看板讀懂了!Arrived = 已抵達,Gate B。"
        }
      ]
    },
    {
      "id": 1,
      "key": "city",
      "icon": "🚕",
      "name": "To the Stadium",
      "zh": "前往球場",
      "env": "street",
      "tags": [
        [
          "問路對話 Dialogue",
          "eng"
        ],
        [
          "單字拖放 Match",
          "mech"
        ]
      ],
      "beats": [
        {
          "type": "say",
          "who": "Taxi Driver",
          "role": "計程車司機",
          "en": "Hop in! Where are you going?",
          "zh": "上車吧!你要去哪?"
        },
        {
          "type": "choose",
          "who": "You → Driver",
          "role": "你對司機說",
          "en": "Tell the driver your destination.",
          "zh": "告訴司機你的目的地。",
          "opts": [
            {
              "t": "To the stadium, please.",
              "s": "請到體育場。",
              "ok": true
            },
            {
              "t": "I want to eat a stadium.",
              "s": "我想吃一座體育場。(語意錯)",
              "ok": false
            },
            {
              "t": "The stadium is very big.",
              "s": "沒講要去哪",
              "ok": false
            }
          ],
          "fbOk": "👍 清楚!'To the ___, please.' 是點目的地的萬用句。",
          "fbNo": "要用 'To the stadium, please.' 直接說目的地。"
        },
        {
          "type": "listen",
          "who": "Taxi Driver",
          "role": "司機",
          "en": "It's about ten minutes away. That'll be fifteen dollars.",
          "zh": "大約十分鐘車程,車資十五元。",
          "q": "How much is the fare?",
          "qz": "車資多少?",
          "opts": [
            {
              "t": "$15 十五元",
              "ok": true
            },
            {
              "t": "$50 五十元",
              "ok": false
            },
            {
              "t": "$10 十元",
              "ok": false
            }
          ],
          "fbOk": "對!fifteen = 15。",
          "fbNo": "fifteen(15)不是 fifty(50)喔,注意重音。"
        },
        {
          "type": "match",
          "who": "Stadium",
          "role": "球場單字",
          "intro": "Drag each English word to the right part of the stadium.",
          "introZh": "把英文單字拖到球場對應位置。",
          "pairs": [
            {
              "w": "goalkeeper",
              "zh": "守門員"
            },
            {
              "w": "referee",
              "zh": "裁判"
            },
            {
              "w": "stadium",
              "zh": "體育場"
            },
            {
              "w": "ticket",
              "zh": "門票"
            }
          ],
          "fb": "全部配對成功!這些是進場必備字。"
        }
      ]
    },
    {
      "id": 2,
      "key": "ticket",
      "icon": "🎟️",
      "name": "Buying a Ticket",
      "zh": "售票口",
      "env": "concourse",
      "tags": [
        [
          "交易對話 Dialogue",
          "eng"
        ],
        [
          "聽力 Listening",
          "mech"
        ]
      ],
      "beats": [
        {
          "type": "say",
          "who": "Seller",
          "role": "售票員",
          "en": "Hi! How many tickets would you like?",
          "zh": "嗨!你要幾張票?"
        },
        {
          "type": "choose",
          "who": "You → Seller",
          "role": "你回答",
          "en": "You want two tickets.",
          "zh": "你想要兩張票。",
          "opts": [
            {
              "t": "Two tickets, please.",
              "s": "請給我兩張票。",
              "ok": true
            },
            {
              "t": "I have two eyes.",
              "s": "我有兩隻眼睛。(離題)",
              "ok": false
            },
            {
              "t": "Two o'clock, please.",
              "s": "兩點鐘(答錯)",
              "ok": false
            }
          ],
          "fbOk": "🎫 完美!'Number + noun, please.' 就能點數量。",
          "fbNo": "要說 'Two tickets, please.'。"
        },
        {
          "type": "listen",
          "who": "Seller",
          "role": "售票員",
          "en": "Two tickets are forty dollars. Your seats are in Section C, Row 12.",
          "zh": "兩張票四十元。座位在 C 區第 12 排。",
          "q": "Where are your seats?",
          "qz": "你的座位在哪?",
          "opts": [
            {
              "t": "Section C, Row 12  C區12排",
              "ok": true
            },
            {
              "t": "Section D, Row 20",
              "ok": false
            },
            {
              "t": "Section A, Row 2",
              "ok": false
            }
          ],
          "fbOk": "聽力滿分!Section C, Row 12。",
          "fbNo": "再聽:Section C, Row twelve。"
        },
        {
          "type": "fill",
          "who": "Ticket",
          "role": "你的球票",
          "intro": "Check your printed ticket. Fill the blanks.",
          "introZh": "核對你的球票,填空。",
          "sign": [
            [
              "MATCH",
              "World Cup 2026"
            ],
            [
              "SECTION",
              "___1___"
            ],
            [
              "ROW",
              "___2___"
            ],
            [
              "PRICE",
              "$40 / 2 tickets"
            ]
          ],
          "blanks": [
            {
              "n": 1,
              "q": "The seller said Section ?",
              "opts": [
                "C",
                "A",
                "F"
              ],
              "ok": 0
            },
            {
              "n": 2,
              "q": "The seller said Row ?",
              "opts": [
                "12",
                "20",
                "2"
              ],
              "ok": 0
            }
          ],
          "fb": "票面資訊正確,快進場!"
        }
      ]
    },
    {
      "id": 3,
      "key": "stands",
      "icon": "🏟️",
      "name": "In the Stands",
      "zh": "看台聊天",
      "env": "stands",
      "tags": [
        [
          "球迷對話 Dialogue",
          "eng"
        ],
        [
          "短文克漏字 Cloze",
          "mech"
        ]
      ],
      "beats": [
        {
          "type": "say",
          "who": "Fan",
          "role": "鄰座球迷",
          "en": "Hey! First time at the World Cup?",
          "zh": "嘿!第一次來看世界盃嗎?"
        },
        {
          "type": "choose",
          "who": "You → Fan",
          "role": "你回答",
          "en": "Answer the friendly fan.",
          "zh": "回應熱情的球迷。",
          "opts": [
            {
              "t": "Yes, I'm so excited!",
              "s": "對啊,我超興奮!",
              "ok": true
            },
            {
              "t": "No, I am a referee.",
              "s": "不,我是裁判。(說謊離題)",
              "ok": false
            },
            {
              "t": "The ticket is forty dollars.",
              "s": "答非所問",
              "ok": false
            }
          ],
          "fbOk": "🙌 自然!'I'm so excited!' 表達情緒很道地。",
          "fbNo": "回答 yes/no + 感受最自然,例如 'Yes, I'm so excited!'。"
        },
        {
          "type": "cloze",
          "who": "Fan",
          "role": "球迷分享小知識",
          "intro": "The fan tells you the World Cup story. Fill the missing words.",
          "introZh": "球迷跟你講世界盃小故事,選出正確的字填空。",
          "text": [
            "The first World Cup was ",
            {
              "b": 1
            },
            " in 1930 in Uruguay.",
            " Only 13 ",
            {
              "b": 2
            },
            " joined because travel was hard.",
            " Today, billions of ",
            {
              "b": 3
            },
            " watch and celebrate together!"
          ],
          "blanks": [
            {
              "n": 1,
              "q": "was ___ (舉辦)",
              "opts": [
                "held 舉辦",
                "eaten 吃掉",
                "slept 睡覺"
              ],
              "ok": 0
            },
            {
              "n": 2,
              "q": "13 ___ (隊伍)",
              "opts": [
                "teams 隊伍",
                "tickets 票",
                "seats 座位"
              ],
              "ok": 0
            },
            {
              "n": 3,
              "q": "billions of ___ (球迷)",
              "opts": [
                "fans 球迷",
                "goals 球門",
                "planes 飛機"
              ],
              "ok": 0
            }
          ],
          "fb": "克漏字全對!held / teams / fans。"
        }
      ]
    },
    {
      "id": 4,
      "key": "secret",
      "icon": "⚽",
      "name": "The Banana Secret",
      "zh": "香蕉球的祕密",
      "env": "pitch",
      "tags": [
        [
          "英文提問 Ask in English",
          "eng"
        ],
        [
          "物理定性 1 concept",
          "phy"
        ]
      ],
      "beats": [
        {
          "type": "say",
          "who": "Coach",
          "role": "場邊教練",
          "en": "Did you see that free kick? The ball CURVED around the wall!",
          "zh": "看到那記自由球了嗎?球彎繞過人牆!"
        },
        {
          "type": "choose",
          "who": "You → Coach",
          "role": "你用英文問",
          "en": "Ask the coach the science question.",
          "zh": "用英文問出科學問題。",
          "opts": [
            {
              "t": "Why did the ball curve?",
              "s": "球為什麼會彎?(正確提問)",
              "ok": true
            },
            {
              "t": "Where can I buy a hot dog?",
              "s": "熱狗在哪買?(離題)",
              "ok": false
            },
            {
              "t": "The ball is a stadium.",
              "s": "語意錯",
              "ok": false
            }
          ],
          "fbOk": "好問題!'Why did the ball curve?' — 我們來親手試試看。",
          "fbNo": "想學物理,要先問對問題:'Why did the ball curve?'"
        },
        {
          "type": "say",
          "who": "Coach",
          "role": "教練解說",
          "en": "When the ball SPINS, the air moves faster on one side. That side has lower push, so the ball bends toward it. That's the secret!",
          "zh": "當球旋轉時,一側的空氣跑得比較快、推力較小,球就往那側彎。這就是祕密!(國中定性版 Magnus 效應)"
        },
        {
          "type": "physics",
          "who": "Try it",
          "role": "親手實驗",
          "intro": "Add SIDE-SPIN and curve the ball around the wall into the goal.",
          "introZh": "加入側旋,讓球彎繞過人牆、射進球門。",
          "q": "When you increased the SPIN, the ball…",
          "qz": "當你增加旋轉時,球…",
          "opts": [
            {
              "t": "curved more 彎得更多",
              "ok": true
            },
            {
              "t": "went straight 變直線",
              "ok": false
            },
            {
              "t": "stopped 停住",
              "ok": false
            }
          ],
          "fb": "你親手驗證了:spin 越大 → curve 越明顯。英文 + 物理一次搞懂!"
        }
      ]
    }
  ]
};
