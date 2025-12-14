# Vocadeck デプロイ手順書

このドキュメントでは、VocadeckをRailway（バックエンド）とVercel（フロントエンド）に無料デプロイする手順を説明します。

## 📋 前提条件

- GitHubアカウント
- Railwayアカウント（GitHubで登録可能）
- Vercelアカウント（GitHubで登録可能）
- コードがGitHubにプッシュ済み

## 🚀 デプロイ手順

### Phase 1: Railway でバックエンドをデプロイ

#### 1. Railway にサインアップ

1. https://railway.app にアクセス
2. "Start a New Project" をクリック
3. "Login with GitHub" でログイン
4. Railwayに必要な権限を許可

#### 2. PostgreSQL データベースを作成

1. ダッシュボードで "New Project" をクリック
2. "Provision PostgreSQL" を選択
3. データベースが自動的に作成されます

#### 3. バックエンドサービスをデプロイ

1. 同じプロジェクト内で "+ New" をクリック
2. "GitHub Repo" を選択
3. `Vocadeck` リポジトリを選択
4. デプロイが開始されます

#### 4. バックエンドの設定

**Settings タブ**:
- **Root Directory**: `backend` に設定
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Variables タブ**で環境変数を追加:
```
DATABASE_URL = (PostgreSQLから自動的にリンクされます)
FRONTEND_URL = (後でVercelのURLを設定)
ENVIRONMENT = production
```

注: `DATABASE_URL`は、PostgreSQLサービスを右クリック→"Connect"→バックエンドサービスを選択で自動リンクできます。

#### 5. バックエンドのURLを取得

1. バックエンドサービスの "Settings" タブを開く
2. "Networking" セクションで "Generate Domain" をクリック
3. 生成されたURL（例: `https://vocadeck-backend.up.railway.app`）をメモ

---

### Phase 2: Vercel でフロントエンドをデプロイ

#### 1. Vercel にサインアップ

1. https://vercel.com にアクセス
2. "Sign Up" をクリック
3. "Continue with GitHub" でログイン

#### 2. プロジェクトをインポート

1. ダッシュボードで "Add New..." → "Project" をクリック
2. `Vocadeck` リポジトリを検索して選択
3. "Import" をクリック

#### 3. プロジェクト設定

**Framework Preset**: Create React App（自動検出）

**Root Directory**: `frontend` に設定

**Build and Output Settings**:
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

**Environment Variables**:
```
REACT_APP_API_URL = https://vocadeck-backend.up.railway.app
```
（RailwayのバックエンドURLを入力）

#### 4. デプロイ

1. "Deploy" をクリック
2. ビルドが完了するまで待ちます（2-3分）
3. デプロイ完了後、URLが表示されます（例: `https://vocadeck.vercel.app`）

---

### Phase 3: CORS設定を更新

#### 1. Railway に戻る

1. バックエンドサービスの "Variables" タブを開く
2. `FRONTEND_URL` を編集
3. VercelのURL（例: `https://vocadeck.vercel.app`）を入力
4. 保存すると自動で再デプロイされます

#### 2. 動作確認

1. VercelのURLにアクセス
2. 単語帳が作成できることを確認
3. 単語が追加できることを確認
4. 暗記カード機能が動作することを確認

---

## 🔧 環境変数一覧

### Railway（バックエンド）

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `DATABASE_URL` | (自動設定) | PostgreSQLの接続URL |
| `FRONTEND_URL` | `https://your-app.vercel.app` | フロントエンドのURL |
| `ENVIRONMENT` | `production` | 本番環境フラグ |

### Vercel（フロントエンド）

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `REACT_APP_API_URL` | `https://your-api.up.railway.app` | バックエンドのURL |

---

## 🔄 更新手順

コードを更新してデプロイする場合:

1. ローカルで変更を加える
2. `git add .`
3. `git commit -m "変更内容"`
4. `git push origin main`
5. **自動的に** Railway と Vercel が再デプロイ

---

## 🐛 トラブルシューティング

### バックエンドが起動しない

**症状**: Railwayのログに "Application failed to respond" と表示される

**解決策**:
1. `requirements.txt`に全ての依存関係があるか確認
2. Start Commandが正しいか確認: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Root Directoryが `backend` になっているか確認

### CORS エラーが出る

**症状**: ブラウザコンソールに "CORS policy" エラーが表示される

**解決策**:
1. RailwayのバックエンドでFRONTEND_URLが正しく設定されているか確認
2. URLの最後にスラッシュ `/` がないことを確認
3. バックエンドを再デプロイ

### データベース接続エラー

**症状**: "could not connect to database" エラー

**解決策**:
1. PostgreSQLサービスとバックエンドサービスが同じプロジェクト内にあるか確認
2. DATABASE_URLが正しくリンクされているか確認
3. Railwayのログでデータベース接続URLを確認

### フロントエンドがバックエンドに接続できない

**症状**: "バックエンドサーバーに接続できません" というアラートが表示される

**解決策**:
1. VercelのREACT_APP_API_URLが正しいか確認
2. バックエンドのURLが有効か確認（ブラウザで直接アクセス）
3. Vercelを再デプロイ

### ビルドエラー

**症状**: Vercelのビルドが失敗する

**解決策**:
1. Root Directoryが `frontend` になっているか確認
2. `package.json`に全ての依存関係があるか確認
3. ローカルで `npm run build` が成功するか確認

---

## 📊 無料枠の制限

### Railway
- 実行時間: 月500時間
- データベース: 500MB
- 制限に達すると自動停止

### Vercel
- ビルド時間: 月6,000分
- 帯域幅: 100GB
- 十分な余裕あり

---

## 🎨 カスタムドメイン設定（オプション）

### Vercel でカスタムドメインを設定

1. ドメインを購入（Google Domains, Namecheapなど）
2. Vercelプロジェクトの "Settings" → "Domains"
3. ドメイン名を入力
4. DNSレコードを更新（Vercelが指示を表示）
5. HTTPSは自動的に設定されます

### Railway でカスタムドメインを設定

1. バックエンドサービスの "Settings" → "Networking"
2. "Custom Domain" でドメインを追加
3. CNAMEレコードを設定
4. Vercelの `REACT_APP_API_URL` を更新

---

## 📝 次のステップ

- [ ] Google Analyticsの追加
- [ ] ユーザー認証の実装
- [ ] データのバックアップ設定
- [ ] パフォーマンスモニタリング（Sentry等）
- [ ] PWA対応（オフライン利用）

---

## 💡 ヒント

- **無料枠で節約**: RailwayのスリープモードをONにすると実行時間を節約できます
- **デプロイ通知**: RailwayとVercelのSlack/Discord連携で通知を受け取れます
- **ログ確認**: 問題が起きたらRailwayとVercelのログを確認しましょう
- **環境変数の管理**: 本番環境の環境変数は絶対にGitにコミットしないでください

---

**デプロイ完了おめでとうございます！** 🎉

質問があれば、GitHubのIssuesで質問してください。

