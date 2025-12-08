import React from 'react';

function NotebookSidebar({ notebooks, selectedNotebookId, onSelectNotebook, onEditNotebook, onDeleteNotebook, onCreateNotebook }) {
  return (
    <div className="notebook-sidebar">
      <div className="sidebar-header">
        <h2>単語帳</h2>
      </div>
      <div className="notebook-list">
        <button
          className="btn-create-notebook"
          onClick={onCreateNotebook}
          title="新しい単語帳を作成"
        >
          + 新規作成
        </button>
        {notebooks.length === 0 ? (
          <p className="empty-message">単語帳がありません</p>
        ) : (
          notebooks.map((notebook) => (
            <div
              key={notebook.id}
              className={`notebook-item ${selectedNotebookId === notebook.id ? 'active' : ''}`}
              onClick={() => onSelectNotebook(notebook.id)}
            >
              <div className="notebook-name">{notebook.name}</div>
              <div className="notebook-actions">
                <button
                  className="btn-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditNotebook(notebook);
                  }}
                  title="編集"
                >
                  ✏️
                </button>
                <button
                  className="btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`「${notebook.name}」を削除しますか？`)) {
                      onDeleteNotebook(notebook.id);
                    }
                  }}
                  title="削除"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotebookSidebar;

