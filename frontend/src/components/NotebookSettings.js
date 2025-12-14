import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const COLOR_PRESETS = [
  { id: 'blue', name: '青', front: 'linear-gradient(135deg, #4A90E2 0%, #2196F3 100%)', back: 'linear-gradient(135deg, #64B5F6 0%, #90CAF9 100%)' },
  { id: 'green', name: '緑', front: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)', back: 'linear-gradient(135deg, #81C784 0%, #A5D6A7 100%)' },
  { id: 'orange', name: 'オレンジ', front: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)', back: 'linear-gradient(135deg, #FFB74D 0%, #FFCC80 100%)' },
  { id: 'purple', name: '紫', front: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)', back: 'linear-gradient(135deg, #BA68C8 0%, #CE93D8 100%)' },
  { id: 'red', name: '赤', front: 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)', back: 'linear-gradient(135deg, #EF5350 0%, #E57373 100%)' },
  { id: 'teal', name: 'ティール', front: 'linear-gradient(135deg, #009688 0%, #26A69A 100%)', back: 'linear-gradient(135deg, #26A69A 0%, #4DB6AC 100%)' },
];

function NotebookSettings({ notebookId, onSettingsChange }) {
  const [settings, setSettings] = useState({
    exclude_mastered: false,
    default_direction: 'word-to-meaning',
    default_order: 'sequential',
    card_colors: {
      front: 'blue',
      back: 'light-blue'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (notebookId) {
      fetchSettings();
    }
  }, [notebookId]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notebook-settings?notebook_id=${notebookId}`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('設定の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings };
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      newSettings[parent] = { ...newSettings[parent], [child]: value };
    } else {
      newSettings[key] = value;
    }
    setSettings(newSettings);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/notebook-settings?notebook_id=${notebookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });
      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        if (onSettingsChange) {
          onSettingsChange(updatedSettings);
        }
        showMessage('設定を保存しました', 'success');
      } else {
        const errorData = await response.json().catch(() => ({ detail: '不明なエラー' }));
        console.error('設定の保存に失敗しました:', response.status, errorData);
        showMessage(`設定の保存に失敗しました: ${errorData.detail || response.statusText}`, 'error');
      }
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      showMessage(`設定の保存に失敗しました: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetProgress = async () => {
    if (!window.confirm('この単語帳の全単語の正解・不正解数をリセットしますか？この操作は取り消せません。')) {
      return;
    }
    
    setResetting(true);
    try {
      const response = await fetch(`${API_URL}/api/notebooks/${notebookId}/reset-progress`, {
        method: 'POST',
      });
      if (response.ok) {
        showMessage('進捗をリセットしました', 'success');
        // ページをリロードして単語リストを更新
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showMessage('進捗のリセットに失敗しました', 'error');
      }
    } catch (error) {
      console.error('進捗のリセットに失敗しました:', error);
      showMessage('進捗のリセットに失敗しました', 'error');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return <div className="settings-loading">設定を読み込んでいます...</div>;
  }

  if (!notebookId) {
    return <div className="settings-empty">単語帳を選択してください</div>;
  }

  const selectedColorPreset = COLOR_PRESETS.find(p => p.id === settings.card_colors.front) || COLOR_PRESETS[0];

  return (
    <div className="notebook-settings">
      <h2>単語帳設定</h2>
      
      {message.text && (
        <div className={`settings-message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="settings-section">
        <h3>学習設定</h3>
        
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.exclude_mastered}
              onChange={(e) => handleSettingChange('exclude_mastered', e.target.checked)}
            />
            マスターした単語を除外する
          </label>
        </div>

        <div className="setting-item">
          <label>カードの方向</label>
          <div className="setting-options">
            <label>
              <input
                type="radio"
                name="direction"
                value="word-to-meaning"
                checked={settings.default_direction === 'word-to-meaning'}
                onChange={(e) => handleSettingChange('default_direction', e.target.value)}
              />
              単語→意味
            </label>
            <label>
              <input
                type="radio"
                name="direction"
                value="meaning-to-word"
                checked={settings.default_direction === 'meaning-to-word'}
                onChange={(e) => handleSettingChange('default_direction', e.target.value)}
              />
              意味→単語
            </label>
          </div>
        </div>

        <div className="setting-item">
          <label>カードの順番</label>
          <div className="setting-options">
            <label>
              <input
                type="radio"
                name="order"
                value="sequential"
                checked={settings.default_order === 'sequential'}
                onChange={(e) => handleSettingChange('default_order', e.target.value)}
              />
              登録順
            </label>
            <label>
              <input
                type="radio"
                name="order"
                value="random"
                checked={settings.default_order === 'random'}
                onChange={(e) => handleSettingChange('default_order', e.target.value)}
              />
              ランダム
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>カードの色</h3>
        <div className="color-presets">
          {COLOR_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className={`color-preset ${settings.card_colors.front === preset.id ? 'active' : ''}`}
              onClick={() => handleSettingChange('card_colors.front', preset.id)}
            >
              <div className="color-preview">
                <div className="color-front" style={{ background: preset.front }}></div>
                <div className="color-back" style={{ background: preset.back }}></div>
              </div>
              <span>{preset.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>データ管理</h3>
        <div className="setting-item">
          <button
            className="btn-reset-progress"
            onClick={handleResetProgress}
            disabled={resetting}
          >
            {resetting ? 'リセット中...' : '正解・不正解数をリセット'}
          </button>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn-save-settings" onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '設定を保存'}
        </button>
      </div>
    </div>
  );
}

export default NotebookSettings;

