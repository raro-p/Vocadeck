import React, { useState, useEffect } from 'react';

function NotebookForm({ editingNotebook, onSubmit, onCancel }) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (editingNotebook) {
      setName(editingNotebook.name);
    } else {
      setName('');
    }
  }, [editingNotebook]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim() });
      setName('');
    }
  };

  return (
    <form className="notebook-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="単語帳の名前"
        className="form-input"
        autoFocus
      />
      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {editingNotebook ? '更新' : '作成'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          キャンセル
        </button>
      </div>
    </form>
  );
}

export default NotebookForm;

