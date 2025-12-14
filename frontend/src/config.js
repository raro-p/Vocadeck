// API URLを環境変数から取得
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// デバッグ用（開発時にAPIのURLを確認）
if (process.env.NODE_ENV === 'development') {
  console.log('API URL:', API_URL);
}

