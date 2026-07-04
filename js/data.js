/* AUTO-GENERATED fallback bundle */
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
            },
            {
              "t": "I am from the airport.",
              "s": "我來自機場(答非所問)",
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
            },
            {
              "t": "Behind you 在你後面",
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
                "Boarding 登機中",
                "Cancelled 取消"
              ],
              "ok": 0
            },
            {
              "n": 2,
              "q": "The officer said Gate B. GATE = ?",
              "opts": [
                "B",
                "D",
                "F",
                "A"
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
            },
            {
              "t": "I am a taxi driver.",
              "s": "我是計程車司機(答非所問)",
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
            },
            {
              "t": "$5 五元",
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
            },
            {
              "t": "The stadium, please.",
              "s": "沒回答數量",
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
            },
            {
              "t": "Section B, Row 30",
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
                "F",
                "D"
              ],
              "ok": 0
            },
            {
              "n": 2,
              "q": "The seller said Row ?",
              "opts": [
                "12",
                "20",
                "2",
                "21"
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
          "閱讀素養 Reading",
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
              "ok": true
            },
            {
              "t": "No, I am a referee.",
              "ok": false
            },
            {
              "t": "The ticket is forty dollars.",
              "ok": false
            },
            {
              "t": "The stadium is on the left.",
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
                "slept 睡覺",
                "driven 開車"
              ],
              "ok": 0
            },
            {
              "n": 2,
              "q": "13 ___ (隊伍)",
              "opts": [
                "teams 隊伍",
                "tickets 票",
                "seats 座位",
                "planes 飛機"
              ],
              "ok": 0
            },
            {
              "n": 3,
              "q": "billions of ___ (球迷)",
              "opts": [
                "fans 球迷",
                "goals 球門",
                "planes 飛機",
                "coaches 教練"
              ],
              "ok": 0
            }
          ],
          "fb": "克漏字全對!held / teams / fans。"
        },
        {
          "type": "passage",
          "who": "Fan",
          "role": "球迷:2026 黑馬故事",
          "speak": "Have you ever heard of a country called Cape Verde?",
          "title": "The 2026 World Cup Dark Horse: Cape Verde",
          "zh": "2026 世界盃黑馬:維德角(Cabo Verde)",
          "map": "<svg viewBox='0 0 300 150' style='width:100%;border-radius:10px;display:block'><rect width='300' height='150' fill='#a9c7e8'/><path d='M182,0 L300,0 L300,150 L172,150 Q198,112 184,82 Q206,54 190,28 Z' fill='#b8bf88'/><text x='232' y='64' font-size='11' fill='#2b2b2b' font-weight='bold'>W. AFRICA</text><circle cx='70' cy='72' r='4' fill='#d33'/><circle cx='86' cy='62' r='3' fill='#d33'/><circle cx='58' cy='88' r='3' fill='#d33'/><circle cx='80' cy='90' r='4' fill='#d33'/><path d='M178,52 Q120,48 88,68' stroke='#d33' stroke-width='2' fill='none' stroke-dasharray='3 3'/><text x='40' y='120' font-size='11' fill='#12406e' font-weight='bold'>CABO VERDE</text><text x='120' y='38' font-size='9' fill='#12406e'>~570 km</text><text x='12' y='145' font-size='10' fill='#2a5a86' font-style='italic'>ATLANTIC OCEAN</text></svg>",
          "html": "Have you ever heard of a country called <b>Cape Verde</b>? It is a small but beautiful <b>island country</b>. If you look at the map above, you will find it in the ocean on the west of Africa, made of ten islands. It only has about 550,000 people. Although it is small, it caught the world's eyes in the 2026 World Cup.<br><br>Before 2026, few people knew Cape Verde's soccer team, the <b>\"Blue Sharks\"</b>. This was their first time in the World Cup. They were in the same group as Spain, Uruguay, and Saudi Arabia. Nobody thought they could win.<br><br>However, they surprised everyone! They did not lose any of their three games. With the help of their 40-year-old <b>goalkeeper</b>, Vozinha, they tied all three teams and became the smallest country ever to reach the round of 32 — the true <b>\"dark horse\"</b>.<br><br>Next, they played Argentina. The Blue Sharks tied in the first ninety minutes. Although they lost in <b>extra time</b>, they held their heads high and showed the world their <b>resilience</b> and fighting spirit. They show us that nothing is impossible!",
          "vocab": "dark horse 黑馬 · goalkeeper 守門員 · extra time 延長賽/加時賽 · resilience 韌性/不屈不撓"
        },
        {
          "type": "choose",
          "who": "Reading Q1",
          "role": "篇章大意題",
          "en": "What is the reading mostly about?",
          "zh": "這篇文章主要在講什麼?",
          "opts": [
            {
              "t": "How the Blue Sharks surprised the world in the 2026 World Cup.",
              "ok": true
            },
            {
              "t": "Why Cape Verde is a beautiful place for a vacation.",
              "ok": false
            },
            {
              "t": "Who the best soccer player in Cape Verde is.",
              "ok": false
            },
            {
              "t": "How to win a soccer game against a strong team.",
              "ok": false
            }
          ],
          "fbOk": "✅ 對!全文重點是藍鯊隊如何驚艷世界。",
          "fbNo": "❌ 主旨是『藍鯊隊如何在 2026 世界盃讓全世界驚訝』。"
        },
        {
          "type": "choose",
          "who": "Reading Q2",
          "role": "字詞推論題",
          "en": "What does it mean when someone has \"resilience\"?",
          "zh": "有 resilience 是什麼意思?",
          "opts": [
            {
              "t": "They keep fighting and do not give up easily.",
              "ok": true
            },
            {
              "t": "They are lucky enough to win every game.",
              "ok": false
            },
            {
              "t": "They feel angry and sad when they lose.",
              "ok": false
            },
            {
              "t": "They always follow the rules of the game.",
              "ok": false
            }
          ],
          "fbOk": "✅ resilience = 韌性、不輕言放棄。",
          "fbNo": "❌ resilience 指『持續奮戰、不輕易放棄』。"
        },
        {
          "type": "choose",
          "who": "Reading Q3",
          "role": "細節理解題",
          "en": "Which is true about the Blue Sharks from the reading?",
          "zh": "關於藍鯊隊,下列何者正確?",
          "opts": [
            {
              "t": "2026 was their first time playing in the World Cup.",
              "ok": true
            },
            {
              "t": "They lost to Spain and Saudi Arabia in the first round.",
              "ok": false
            },
            {
              "t": "They beat Argentina and moved to the next round.",
              "ok": false
            },
            {
              "t": "They were the largest country to enter the round of 32.",
              "ok": false
            }
          ],
          "fbOk": "✅ 對,2026 是他們首度打進世界盃。",
          "fbNo": "❌ 文中說 2026 是他們第一次打世界盃;對阿根廷是延長賽落敗、且他們是『最小』的國家。"
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
            },
            {
              "t": "How much is the ticket?",
              "s": "問票價(離題)",
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
            },
            {
              "t": "flew backward 往後飛",
              "ok": false
            }
          ],
          "fb": "你親手驗證了:spin 越大 → curve 越明顯。英文 + 物理一次搞懂!"
        }
      ]
    }
  ]
};
