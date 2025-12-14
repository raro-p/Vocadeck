import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

function NotebookSidebar({ notebooks, selectedNotebookId, onSelectNotebook, onEditNotebook, onDeleteNotebook, onCreateNotebook }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // デバウンス付き検索
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query) => {
    try {
      const response = await fetch(`${API_URL}/api/words/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setShowResults(true);
      }
    } catch (error) {
      console.error('検索エラー:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (notebookId) => {
    onSelectNotebook(notebookId);
    setSearchQuery('');
    setShowResults(false);
  };

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  return (
    <div className="notebook-sidebar">
      <div className="sidebar-search">
        <input
          type="text"
          className="sidebar-search-input"
          placeholder="🔍 単語を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setShowResults(true)}
        />
        {isSearching && <div className="search-loader">検索中...</div>}
        
        {showResults && (
          <div className="sidebar-search-results">
            {searchResults.length === 0 ? (
              <div className="search-no-results">
                結果なし
              </div>
            ) : (
              <>
                <div className="search-results-count">
                  {searchResults.length}件
                </div>
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="sidebar-search-result"
                    onClick={() => handleResultClick(result.notebook_id)}
                  >
                    <div className="result-word">
                      {highlightMatch(result.word, searchQuery)}
                    </div>
                    <div className="result-meaning">
                      {highlightMatch(result.meaning, searchQuery)}
                    </div>
                    <div className="result-notebook">
                      📚 {result.notebook_name}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
      
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

