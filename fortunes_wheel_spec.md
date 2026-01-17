# 命運之輪 (Fortune's Wheel) 軟體設計說明書 (SDD) 與 行為驅動開發 (BDD) 規格

## 1. 簡介 (Introduction)
本文件依據 `fortune_wheel_game.txt` 之規則，將「命運之輪」賭場遊戲轉化為軟體開發規格。本系統包含七款基於 D&D 風格的博弈遊戲。

## 2. 軟體設計說明 (SDD)

### 2.1 系統架構 (System Architecture)
-   **前端框架**: Vanilla JavaScript (ES6+), HTML5, Tailwind CSS。
-   **狀態管理**: `App` class 負責維護全域變數 (`leaves`, `hp`) 與路由。
-   **模組化設計**: 每個遊戲為獨立 Class (e.g., `SlotsGame`, `LokiGame`)，繼承或實作統一介面 `render()`, `setup()`, `reset()`。

### 2.2 遊戲邏輯規格 (Game Logic Specifications)

#### A. 獎品老虎機 (Slot Machines)
*   **輸入**: 1 刃藤葉 (普通) / 2 刃藤葉 (刃藤版) / 10 刃藤葉 (高級)。
*   **核心機制**: 擲 3 顆 D6。
*   **判定邏輯**:
    *   **獨一無二**: 3 顆點數皆不同 -> 沒收籌碼。
    *   **雙重命中**: 2 顆點數相同 -> 獲得對應獎勵 (視為小獎)。
    *   **頭獎**: 3 顆點數相同 -> 獲得 Jackpot (刃藤版有專屬賠率表)。
    *   **魔冢時間**: 點數組合為 {2, 4, 6} -> 下次免費 Spin。

#### B. 賭命骨骰 (Dead Hand's Dice)
*   **參與者**: 玩家 vs NPC (1D4 人)。
*   **流程**:
    1.  NPC 決定骰數 (DM 邏輯)。
    2.  玩家輸入骰數 (任意 D6)。
    3.  擲骰。
*   **判定**:
    *   若骰出 `1` -> **淘汰 (Bust)**。
    *   若全員淘汰 -> **荷官通殺 (House Wins)**。
    *   存活者比總和 (Sum) -> 最大者獨得底池。平手則比 `6` 的數量。

#### C. 渥利達馬拉的獎賞 (Olidammara’s Bounty)
*   **核心**: 1 顆 D20 (荷官本人)。
*   **每日彩金 (Daily Prep)**: 系統啟動時擲 3D20 產生一組數字 (e.g. 6,15,10 -> 6151)。
*   **下注選項**:
    *   數字區 (2-18): 賠率 1:20。
    *   單雙區 (Odd/Even): 賠率 1:2。 (1, 20 除外)。
    *   寶箱區 (1, 20): 互斥下注。
*   **寶箱判定**:
    *   擲出 `1` 或 `20` -> 觸發 Bonus Roll。
    *   (20, 20) -> 獲得紅寶箱彩金。
    *   (1, 1) -> 獲得黑寶箱物品。

#### D. 微觀競技場 (Micro Arena)
*   **實體**: 5 名角鬥士 (Imp D4, Dwarf D6, Human D8, Giant D10, Dragon D12)。
*   **賠率**: D4(1:30) > D6(1:15) > D8(1:10) > D10(1:5) > D12(1:3)。
*   **判定**: 擲骰取最大值者勝。

#### E. 靈吸怪的慾望 (Illithid’s Desire)
*   **類型**: Blackjack 變體 (目標 20 點)。
*   **流程**: 雙方各擲 2D10。玩家可加骰 (Hit) 直至停手 (Stand) 或爆牌 (>20)。荷官 < 17 強制加骰。
*   **特殊規則**:
    *   **Perfect Mind**: 起手 10+10 -> 賠率 1:5 + 補滿 HP。
    *   **平手**: 賠率 1:2。
    *   **爆牌**: 輸掉籌碼 + 扣除 (注額/2) HP。

#### F. 龍吼骰 (Dragon Roar Dice)
*   **類型**: Craps 變體 (2D6)。
*   **下注**: 屠龍者 (Pass) / 詛咒 (Don't Pass)。
*   **Phase 1 (Come Out)**:
    *   7, 11: 屠龍勝 (1:3)。
    *   2, 3, 12: 屠龍敗 (-HP 1D4)。
    *   4,5,6,8,9,10: 建立 Point (逆鱗)。
*   **Phase 2 (Hunt)**:
    *   擲出 Point: 屠龍勝 (1:3)。
    *   擲出 7: 屠龍敗 (-HP 2D6)。

#### G. 洛基的獰笑 (Loki’s Grin)
*   **骰子**: D8。
*   **結構**: 玩家 (2命骰) + 荷官 (2命骰) + 公共 (4運骰)。
*   **惡作劇**: 玩家可選擇重擲 0-3 顆「己方命骰」或「公開運骰」。
*   **結算**: 2+4 選 5 顆組成最佳牌型。
*   **牌型**: 五神 > 四相 > 連鎖 > 雙蛇 > 三謊言 > 雙面 > 單面 > 無序。

---

## 3. 行為驅動開發 (BDD) - Gherkin Syntax

以下使用 Gherkin 語法定義各遊戲的核心行為場景。

### 3.1 獎品老虎機 (Slots)

```gherkin
Feature: Razorvine Slot Machine
  As a high-stakes gambler
  I want to play the Razorvine version
  So that I can win massive payouts

  Scenario: Razorvine Jackpot (66666)
    Given 玩家選擇 "刃藤模式" (Cost: 2)
    When 玩家擲出 "6, 6, 6"
    Then 系統應顯示 "刃藤爆發！"
    And 玩家獲得 66666 刃藤葉

  Scenario: Modron Time Trigger
    Given 玩家處於任意模式
    When 玩家擲出 "2, 4, 6" (任意順序)
    Then 系統應顯示 "魔冢時間 (Modron Time)"
    And 玩家下次拉桿應免費
```

### 3.2 賭命骨骰 (Dead Hand)

```gherkin
Feature: Dead Hand Elimination
  As a player
  I want to avoid rolling a 1
  So that I stay in the game

  Scenario: Immediate Bust
    Given 玩家決定擲 5 顆骰子
    When 擲骰結果包含至少一個 "1" (例如: 3, 4, 1, 6, 2)
    Then 玩家狀態應變更為 "淘汰 (BUST)"
    And 玩家失去該局注碼

  Scenario: House Wins All
    Given 玩家擲出 "1"
    And 所有 NPC 皆擲出 "1"
    Then 系統應判定 "荷官通殺 (House Wins)"
    And 無人獲得底池
```

### 3.3 渥利達馬拉 (Olidammara)

```gherkin
Feature: Olidammara's Chests
  As a player
  I want to open the treasure chests
  So that I can win the daily jackpot

  Scenario: Red Chest Unlock
    Given 玩家下注 "紅寶箱(20)"
    And 當日彩金設定為 6151
    When 第一次擲出 "20"
    Then 觸發 "Bonus Roll"
    When 第二次擲出 "20"
    Then 玩家獲得 6151 刃藤葉
```

### 3.4 靈吸怪 (Illithid)

```gherkin
Feature: Perfect Mind
  As a player
  I want to roll a perfect 20
  So that I can heal and win big

  Scenario: Perfect Mind Implementation
    Given 玩家下注 100 刃藤葉
    When 玩家起手擲出 "10, 10"
    Then 顯示 "完美心靈 (Perfect Mind)"
    And 玩家獲得 500 刃藤葉 (1:5)
    And 玩家 HP 恢復至 100%
```

### 3.5 龍吼骰 (Dragon Roar)

```gherkin
Feature: Dragon Damage Phases
  As a DM
  I want the dragon to deal correct damage
  So that players fear the hunt

  Scenario: Phase 1 Damage (Come Out)
    Given 遊戲處於 "出擊階段"
    And 玩家下注 "屠龍者"
    When 擲出 "2" (手滑失誤)
    Then 玩家輸掉注碼
    And 玩家受到 1D4 點傷害

  Scenario: Phase 2 Damage (Hunt)
    Given 遊戲處於 "狩獵階段"
    And 玩家下注 "屠龍者"
    When 擲出 "7" (狂怒之焰)
    Then 玩家輸掉注碼
    And 玩家受到 2D6 點傷害
```

### 3.6 洛基的獰笑 (Loki)

```gherkin
Feature: Loki's Prank
  As a trickster
  I want to reroll dice
  So that I can improve my hand

  Scenario: Using Prank
    Given 玩家處於 "惡作劇階段"
    And 場面上有運骰 "1, 2" 和 玩家命骰 "3, 4"
    When 玩家選擇重擲 "運骰1" 和 "命骰1"
    Then 該兩顆骰子應重新隨機生成數值
    And 遊戲進入 "跟注/攤牌" 流程
```

---

## 4. 測試範本 (Test Templates)

請使用以下表格格式記錄測試結果。

### 4.1 功能測試表 (Functional Test Log)

| 測試編號 | 遊戲模組 | 測試場景 (Scenario) | 輸入數據 (Inputs) | 預期結果 (Expected) | 實際結果 (Actual) | 狀態 (Pass/Fail) | 備註 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Slots | Razorvine Jackpot | Mode=Razorvine, Dice=[6,6,6] | Win 66666 Leaves | Verified Logic | **Pass** | Code Check OK |
| TC-02 | Slots | Modron Time | Dice=[2,6,4] | Trigger Modron Event | Verified Logic | **Pass** | Code Check OK |
| TC-03 | DeadHand | Player Bust | Dice=[1,5,6] | Status: Bust | Verified Logic | **Pass** | Code Check OK |
| TC-04 | Olidammara | Red Chest Win | Bet=20, Roll1=20, Roll2=20 | Win Daily Jackpot | Async Fixed | **Pass** | Race Condition Fixed |
| TC-05 | MicroArena | Odds Calc | Bet=10 on Dragon(1:3), Win | Payout=30 | Verified Logic | **Pass** | Code Check OK |
| TC-06 | Illithid | Perfect Mind | Hand=[10,10] | Win x5 + Full Heal | Verified Logic | **Pass** | Code Check OK |
| TC-07 | DragonRoar | Phase 2 Damage | Phase=Hunt, Roll=7 | Lose Bet + 2D6 Dmg | Verified Logic | **Pass** | Code Check OK |
| TC-08 | Loki | Five Gods Hand | Hand=[8,8,8,8,8] | Rank 1 (Top Win) | Syntax Fixed | **Pass** | HTML Typo Fixed |

### 4.2 邊界測試表 (Edge Case Log)

| 測試編號 | 描述 | 預期行為 | 測試結果 |
| :--- | :--- | :--- | :--- |
| EC-01 | 刃藤葉餘額不足時下注 | 顯示錯誤訊息，不扣款 | **Pass** (All Games) |
| EC-02 | 生命值歸零時的處理 | 觸發 Game Over 或阻擋遊玩 | **Pass** (Script.js) |
| EC-03 | 洛基惡作劇選擇超過 3 顆骰子 | 系統阻止選擇第 4 顆 | **Pass** (Static Check) |
| EC-04 | 渥利達馬拉同時下注寶箱與數字 | 系統阻止互斥下注 | **Pass** (Static Check) |

### 4.3 UI/UX 檢查表

- [x] 所有遊戲背景圖是否正確載入？ (Assets Verified)
- [x] 刃藤葉與生命值更新是否即時？ (Logic Verified)
- [x] 勝利/失敗的特效與文字是否清晰？ (CSS Classes Fixed)
- [ ] 手機版面是否破圖？ (Pending Device Test)
- [x] 按鈕回饋 (Hover/Active) 是否正常？ (Tailwind Classes OK)
