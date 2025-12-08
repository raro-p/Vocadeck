# Vocadeck - Ver 1.0

Vocadeckは、モダンなグラスモーフィズムデザインを採用した単語学習アプリケーションです。青と白を基調とした洗練されたUIで、効率的な単語学習をサポートします。

## 主な機能

### 単語管理
- 複数の単語帳（ノートブック）を作成・管理
- 単語の追加・編集・削除
- 単語帳ごとの単語管理

### 暗記カード機能
- 単語→意味、意味→単語の双方向学習
- 順番/ランダム表示の切り替え
- 進捗状況の記録（正解数、不正解数、マスター状態）
- 自動カード進行機能

### 復習機能
- 間違えた単語のみを復習
- 進捗状況に基づいた効率的な学習

### 学習履歴
- 日々の学習統計の記録
- グラフによる視覚的な進捗確認
- セッションごとの学習時間と成果の追跡

## 技術スタック

### バックエンド
- **Python 3.x**
- **FastAPI** - RESTful APIフレームワーク
- **SQLAlchemy** - ORM
- **SQLite** - データベース
- **Uvicorn** - ASGIサーバー

### フロントエンド
- **React** - UIライブラリ
- **JavaScript (ES6+)**
- **Chart.js** - グラフ表示
- **CSS3** - グラスモーフィズムデザイン

## セットアップ

### 必要な環境
- Python 3.8以上
- Node.js 14以上
- npm または yarn

### インストール手順

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd word_app
```

2. **バックエンドのセットアップ**
```bash
cd backend
pip install -r requirements.txt
```

3. **フロントエンドのセットアップ**
```bash
cd ../frontend
npm install
```

### 起動方法

#### Windows（推奨）
ルートディレクトリで `start.bat` を実行すると、バックエンドとフロントエンドが自動的に起動します。

#### 手動起動

**バックエンド**
```bash
cd backend
uvicorn main:app --reload
```

**フロントエンド**
```bash
cd frontend
npm start
```

アプリケーションは `http://localhost:3000` でアクセスできます。

## プロジェクト構造

```
word_app/
├── backend/
│   ├── main.py              # FastAPIアプリケーション
│   ├── models.py            # データベースモデル
│   ├── database.py          # データベース接続設定
│   ├── migrate_db.py        # データベースマイグレーション
│   ├── migrate_notebook.py # ノートブック機能マイグレーション
│   ├── requirements.txt     # Python依存関係
│   └── words.db            # SQLiteデータベース（自動生成）
├── frontend/
│   ├── src/
│   │   ├── App.js          # メインアプリケーション
│   │   ├── App.css         # スタイルシート
│   │   └── components/    # Reactコンポーネント
│   ├── package.json        # Node.js依存関係
│   └── public/            # 静的ファイル
├── README.md              # このファイル
└── start.bat             # 起動スクリプト（Windows）
```

## データベーススキーマ

### Notebooks（単語帳）
- `id`: 主キー
- `name`: 単語帳名
- `created_at`: 作成日時

### Words（単語）
- `id`: 主キー
- `word`: 単語
- `meaning`: 意味
- `notebook_id`: 単語帳ID（外部キー）
- `correct_count`: 正解数
- `wrong_count`: 不正解数
- `last_studied`: 最終学習日時
- `mastered`: マスター状態

### StudySessions（学習セッション）
- `id`: 主キー
- `start_time`: 開始時刻
- `end_time`: 終了時刻
- `duration_seconds`: 学習時間（秒）
- `correct_count`: 正解数
- `wrong_count`: 不正解数
- `words_studied`: 学習単語数

### DailyStats（日々の統計）
- `id`: 主キー
- `date`: 日付
- `study_time_seconds`: 学習時間（秒）
- `words_studied`: 学習単語数
- `correct_count`: 正解数
- `wrong_count`: 不正解数
- `accuracy_rate`: 正答率

## API エンドポイント

### 単語帳（Notebooks）
- `GET /api/notebooks` - 単語帳一覧取得
- `POST /api/notebooks` - 単語帳作成
- `PUT /api/notebooks/{id}` - 単語帳更新
- `DELETE /api/notebooks/{id}` - 単語帳削除

### 単語（Words）
- `GET /api/words?notebook_id={id}` - 単語一覧取得
- `GET /api/words/{id}` - 単語詳細取得
- `POST /api/words` - 単語作成
- `PUT /api/words/{id}` - 単語更新
- `DELETE /api/words/{id}` - 単語削除
- `PUT /api/words/{id}/progress` - 進捗更新
- `GET /api/words/wrong-only?notebook_id={id}` - 間違えた単語取得

### セッション（Sessions）
- `POST /api/sessions` - セッション作成
- `PUT /api/sessions/{id}` - セッション更新
- `GET /api/sessions/latest` - 最新セッション取得

### 統計（Stats）
- `GET /api/stats/daily?days={days}` - 日々の統計取得

## デザイン

Vocadeckは、グラスモーフィズムデザインを採用しています：
- 半透明のガラスのような背景
- 柔らかい影とボーダー
- 青と白を基調とした落ち着いたカラーパレット
- スムーズなアニメーションとトランジション

## ライセンス

このプロジェクトは個人利用を目的としています。

## バージョン履歴

### Ver 1.0 (2024)
- 初回リリース
- 基本的な単語管理機能
- 暗記カード機能
- 復習機能
- 学習履歴機能
- 複数単語帳対応
- グラスモーフィズムデザイン
