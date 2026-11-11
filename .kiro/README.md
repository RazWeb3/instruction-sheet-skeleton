# .kiro 下書き一式（Kiroween 2026 / Instruction-Sheet Skeleton）

作成：2026-11-11（Muse 下書き）／ 正本：同フォルダ `実行指示書.md`（§2〜§8）
状態：Raz の確認待ち。リポジトリ未作成のため、ここは**下書き置き場**。Raz がリポジトリを作ったら、この中身をそのままリポジトリ直下の `.kiro/` へコピーする（`.gitignore` に入れないこと）。

## 使い方

1. Raz が GitHub に公開リポジトリを作成する（`instruction-sheet-skeleton`、ホスティング GitHub Pages — 2026-11-11 決定済み）。
2. この `.kiro-draft/` の中身を `<repo>/.kiro/` へコピーする。
3. Kiro でリポジトリを開き、spec の順に実装させる：`core` → `player` → `board`。実装の前に spec を書く順番を逆にしない（審査項目 Technological Implementation の証跡になるため）。
4. Kiro のフックは下書きに「形だけ」置いていない。`specs/core/tasks.md` の指示どおり、Kiro のフック UI で実際に設定したものだけを記録する。設定していないフックを提出文に書かない。

## 含まれているもの

- `steering/product.md` — 製品の定義・狙い・守る制約
- `steering/tech.md` — 技術方針（ビルドなし静的サイト、DOM 非依存の core、PBT）
- `steering/structure.md` — リポジトリ構成
- `specs/core/` — 骨格4機能（コーデック／検証／保存／共通UI）の requirements / design / tasks
- `specs/player/` — アプリ1 Pack Player（listening-pack）の requirements / design / tasks
- `specs/board/` — アプリ2 Memory Board（memory-board）の requirements / design / tasks

## 決定事項（2026-11-11 Raz 決定）

- リポジトリ名とホスティング：`instruction-sheet-skeleton`、GitHub Pages
- 動画のナレーション：個人側の Muse のナレーション音声を使う（そちらでセットアップ済み）
- Best Startup Project へのチェック：提出時に判断する
- Bonus Blog：投稿しない

## 守る制約（実行指示書 §4 の再掲）

- アプリ内に AI / LLM の API を組み込まない。生成は常にアプリの外。
- Sokqa / Personal Dashboard のコードを流用しない。新規コードのみ。
- `/.kiro` はリポジトリ直下、gitignore しない。LICENSE（MIT）を GitHub に検出される形で置く。
- スコープ凍結：実行指示書 §3 に書いた機能以外を足さない。
- 提出物は英語。アプリURLは審査期間終了（2027-01-29）まで無料でテスト可能な状態を維持する。
