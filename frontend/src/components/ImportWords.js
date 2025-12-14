import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

function ImportWords({ notebookId, onImportComplete }) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // リアルタイムでMarkdownをパース
  useEffect(() => {
    if (!text.trim()) {
      setPreview([]);
      return;
    }

    const lines = text.split('\n');
    const pattern = /^[-*]\s*(.+?)\s*:\s*(.+)$/;
    const parsed = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      const match = trimmedLine.match(pattern);
      if (match) {
        const word = match[1].trim();
        const meaning = match[2].trim();
        if (word && meaning) {
          parsed.push({
            lineNumber: index + 1,
            word,
            meaning,
            valid: true
          });
        } else {
          parsed.push({
            lineNumber: index + 1,
            text: trimmedLine,
            valid: false,
            reason: '空の単語または意味'
          });
        }
      } else {
        parsed.push({
          lineNumber: index + 1,
          text: trimmedLine,
          valid: false,
          reason: 'フォーマットが不正'
        });
      }
    });

    setPreview(parsed);
  }, [text]);

  const handleImport = async () => {
    if (!notebookId) {
      showMessage('単語帳を選択してください', 'error');
      return;
    }

    if (!text.trim()) {
      showMessage('テキストを入力してください', 'error');
      return;
    }

    const validWords = preview.filter(item => item.valid);
    if (validWords.length === 0) {
      showMessage('有効な単語が見つかりません', 'error');
      return;
    }

    setImporting(true);
    try {
      const response = await fetch(`${API_URL}/api/words/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notebook_id: notebookId,
          text: text
        }),
      });

      if (response.ok) {
        const result = await response.json();
        showMessage(
          `${result.added_count}件の単語を追加しました` +
          (result.skipped_count > 0 ? `（${result.skipped_count}件スキップ）` : ''),
          'success'
        );
        setText('');
        setPreview([]);
        
        // 単語一覧を更新
        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        const error = await response.json();
        showMessage(`インポートに失敗しました: ${error.detail || 'エラー'}`, 'error');
      }
    } catch (error) {
      console.error('インポートエラー:', error);
      showMessage('インポートに失敗しました', 'error');
    } finally {
      setImporting(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const validCount = preview.filter(item => item.valid).length;
  const invalidCount = preview.filter(item => !item.valid).length;

  return (
    <div className="import-words">
      <div className="import-header">
        <h3>一括インポート</h3>
        <p className="import-description">
          Markdown形式で単語を入力してください（例: <code>- apple: りんご</code>）
        </p>
      </div>

      {message.text && (
        <div className={`import-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="import-input-section">
        <textarea
          className="import-textarea"
          placeholder="- apple: りんご&#10;- banana: バナナ&#10;- cherry: さくらんぼ"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
        />
      </div>

      {preview.length > 0 && (
        <div className="import-preview">
          <div className="preview-header">
            <span className="preview-title">プレビュー</span>
            <span className="preview-count">
              ✓ {validCount}件
              {invalidCount > 0 && <span className="preview-invalid"> / ✗ {invalidCount}件</span>}
            </span>
          </div>
          <div className="preview-list">
            {preview.map((item, index) => (
              <div key={index} className={`preview-item ${item.valid ? 'valid' : 'invalid'}`}>
                {item.valid ? (
                  <>
                    <span className="preview-icon">✓</span>
                    <span className="preview-word">{item.word}</span>
                    <span className="preview-arrow">→</span>
                    <span className="preview-meaning">{item.meaning}</span>
                  </>
                ) : (
                  <>
                    <span className="preview-icon">✗</span>
                    <span className="preview-text">{item.text}</span>
                    <span className="preview-reason">({item.reason})</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="import-actions">
        <button
          className="btn-import"
          onClick={handleImport}
          disabled={importing || validCount === 0}
        >
          {importing ? 'インポート中...' : `${validCount}件をインポート`}
        </button>
      </div>
    </div>
  );
}

export default ImportWords;

