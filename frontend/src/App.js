import React, { useState, useEffect } from 'react';
import WordForm from './components/WordForm';
import WordList from './components/WordList';
import FlashCard from './components/FlashCard';
import CardControls from './components/CardControls';
import ProgressStats from './components/ProgressStats';
import ProgressButtons from './components/ProgressButtons';
import ReviewMode from './components/ReviewMode';
import SessionTracker from './components/SessionTracker';
import StudyHistory from './components/StudyHistory';
import NotebookSidebar from './components/NotebookSidebar';
import NotebookForm from './components/NotebookForm';
import NotebookSettings from './components/NotebookSettings';
import ImportWords from './components/ImportWords';
import { API_URL } from './config';
import './App.css';

function App() {
  const [words, setWords] = useState([]);
  const [editingWord, setEditingWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('manage');
  
  // 単語帳の状態
  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebookId, setSelectedNotebookId] = useState(null);
  const [editingNotebook, setEditingNotebook] = useState(null);
  const [showNotebookForm, setShowNotebookForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  
  // カード機能の状態
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardDirection, setCardDirection] = useState('word-to-meaning');
  const [cardOrder, setCardOrder] = useState('sequential');
  const [shuffledWords, setShuffledWords] = useState([]);
  const [cardFlipped, setCardFlipped] = useState(false);
  
  // セッション管理の状態
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [sessionWrongCount, setSessionWrongCount] = useState(0);
  const [sessionWordsStudied, setSessionWordsStudied] = useState(0);
  
  // 設定の状態
  const [notebookSettings, setNotebookSettings] = useState(null);

  // 単語帳一覧を取得
  const fetchNotebooks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notebooks`);
      if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.status}`);
      }
      const data = await response.json();
      setNotebooks(data);
      // 最初の単語帳を選択
      if (data.length > 0 && !selectedNotebookId) {
        setSelectedNotebookId(data[0].id);
      }
    } catch (error) {
      console.error('単語帳の取得に失敗しました:', error);
      alert('バックエンドサーバーに接続できません。バックエンドが起動しているか確認してください。');
    }
  };

  // 単語一覧を取得（単語帳IDでフィルタリング）
  const fetchWords = async () => {
    if (!selectedNotebookId) {
      setWords([]);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/words?notebook_id=${selectedNotebookId}`);
      if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.status}`);
      }
      const data = await response.json();
      setWords(data);
    } catch (error) {
      console.error('単語の取得に失敗しました:', error);
      alert('バックエンドサーバーに接続できません。バックエンドが起動しているか確認してください。\n\n起動方法:\n1. ターミナルで backend フォルダに移動\n2. uvicorn main:app --reload を実行');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotebooks();
  }, []);

  useEffect(() => {
    if (selectedNotebookId) {
      setLoading(true);
      fetchWords();
      // 設定を取得
      fetch(`${API_URL}/api/notebook-settings?notebook_id=${selectedNotebookId}`)
        .then(res => res.json())
        .then(data => setNotebookSettings(data))
        .catch(err => console.error('設定の取得に失敗しました:', err));
    }
  }, [selectedNotebookId]);

  // 設定に基づいてカードの方向と順番を設定
  useEffect(() => {
    if (notebookSettings) {
      if (notebookSettings.default_direction) {
        setCardDirection(notebookSettings.default_direction);
      }
      if (notebookSettings.default_order) {
        setCardOrder(notebookSettings.default_order);
      }
    }
  }, [notebookSettings]);

  // カード用の単語リストを更新（初回読み込み時と順序変更時のみ）
  useEffect(() => {
    if (words.length > 0) {
      // 設定に基づいてマスターした単語を除外
      let filteredWords = words;
      if (notebookSettings?.exclude_mastered) {
        filteredWords = words.filter(word => !word.mastered);
      }
      
      if (cardOrder === 'random') {
        const shuffled = [...filteredWords].sort(() => Math.random() - 0.5);
        setShuffledWords(shuffled);
      } else {
        setShuffledWords([...filteredWords]);
      }
      setCurrentCardIndex(0);
      setCardFlipped(false);
    }
  }, [cardOrder, words, notebookSettings?.exclude_mastered]); // wordsの変更ではリセットしない

  // 初回読み込み時のみ
  useEffect(() => {
    if (words.length > 0 && shuffledWords.length === 0) {
      if (cardOrder === 'random') {
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        setShuffledWords(shuffled);
      } else {
        setShuffledWords([...words]);
      }
    }
  }, [words.length]);

  // 単語を追加
  const handleAddWord = async (wordData) => {
    if (!selectedNotebookId) {
      alert('単語帳を選択してください');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...wordData, notebook_id: selectedNotebookId }),
      });
      if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.status}`);
      }
      const newWord = await response.json();
      setWords([...words, newWord]);
      setEditingWord(null);
    } catch (error) {
      console.error('単語の追加に失敗しました:', error);
      alert('バックエンドサーバーに接続できません。バックエンドが起動しているか確認してください。');
    }
  };

  // 単語を更新
  const handleUpdateWord = async (wordData) => {
    try {
      const response = await fetch(`${API_URL}/api/words/${editingWord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wordData),
      });
      if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.status}`);
      }
      const updatedWord = await response.json();
      setWords(words.map((w) => (w.id === updatedWord.id ? updatedWord : w)));
      setEditingWord(null);
    } catch (error) {
      console.error('単語の更新に失敗しました:', error);
      alert('バックエンドサーバーに接続できません。バックエンドが起動しているか確認してください。');
    }
  };

  // 単語を削除
  const handleDeleteWord = async (wordId) => {
    if (!window.confirm('この単語を削除しますか？')) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/words/${wordId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.status}`);
      }
      setWords(words.filter((w) => w.id !== wordId));
    } catch (error) {
      console.error('単語の削除に失敗しました:', error);
      alert('バックエンドサーバーに接続できません。バックエンドが起動しているか確認してください。');
    }
  };

  // 編集開始
  const handleEdit = (word) => {
    setEditingWord(word);
  };

  // 編集キャンセル
  const handleCancelEdit = () => {
    setEditingWord(null);
  };

  // フォーム送信処理
  const handleSubmit = (wordData) => {
    if (editingWord) {
      handleUpdateWord(wordData);
    } else {
      handleAddWord(wordData);
    }
  };

  // カード機能のハンドラー
  const handleCardFlip = () => {
    setCardFlipped(true);
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setCardFlipped(false);
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < shuffledWords.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setCardFlipped(false);
    }
  };

  const handleDirectionChange = (direction) => {
    setCardDirection(direction);
    setCardFlipped(false);
  };

  const handleOrderChange = (order) => {
    setCardOrder(order);
    setCardFlipped(false);
  };

  const handleResetCard = () => {
    setCardFlipped(false);
  };

  const handleProgressUpdate = async (wordId, correct, mastered = null) => {
    try {
      const response = await fetch(`${API_URL}/api/words/${wordId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correct, mastered }),
      });
      if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.status}`);
      }
      const updatedWord = await response.json();
      const updatedWords = words.map((w) => (w.id === updatedWord.id ? updatedWord : w));
      setWords(updatedWords);
      // shuffledWordsも更新（インデックスを維持）
      setShuffledWords(prevShuffled => 
        prevShuffled.map((w) => (w.id === updatedWord.id ? updatedWord : w))
      );
    } catch (error) {
      console.error('進捗の更新に失敗しました:', error);
      alert('進捗の更新に失敗しました');
    }
  };

  const handleCorrect = () => {
    if (shuffledWords[currentCardIndex]) {
      const currentIndex = currentCardIndex;
      handleProgressUpdate(shuffledWords[currentIndex].id, true);
      setSessionCorrectCount(prev => prev + 1);
      setSessionWordsStudied(prev => prev + 1);
      
      // 次のカードに自動移行
      if (currentIndex < shuffledWords.length - 1) {
        setTimeout(() => {
          setCurrentCardIndex(prev => prev + 1);
          setCardFlipped(false);
        }, 300); // 少し遅延を入れてスムーズに移行
      }
    }
  };

  const handleWrong = () => {
    if (shuffledWords[currentCardIndex]) {
      const currentIndex = currentCardIndex;
      handleProgressUpdate(shuffledWords[currentIndex].id, false);
      setSessionWrongCount(prev => prev + 1);
      setSessionWordsStudied(prev => prev + 1);
      
      // 次のカードに自動移行
      if (currentIndex < shuffledWords.length - 1) {
        setTimeout(() => {
          setCurrentCardIndex(prev => prev + 1);
          setCardFlipped(false);
        }, 300); // 少し遅延を入れてスムーズに移行
      }
    }
  };

  const handleMastered = () => {
    if (shuffledWords[currentCardIndex]) {
      handleProgressUpdate(shuffledWords[currentCardIndex].id, true, true);
    }
  };

  const handleUnmastered = () => {
    if (shuffledWords[currentCardIndex]) {
      handleProgressUpdate(shuffledWords[currentCardIndex].id, false, false);
    }
  };

  // 単語帳のCRUD操作
  const handleCreateNotebook = async (notebookData) => {
    try {
      const response = await fetch(`${API_URL}/api/notebooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notebookData),
      });
      if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.status}`);
      }
      const newNotebook = await response.json();
      setNotebooks([...notebooks, newNotebook]);
      setSelectedNotebookId(newNotebook.id);
      setEditingNotebook(null);
      setShowNotebookForm(false);
    } catch (error) {
      console.error('単語帳の作成に失敗しました:', error);
      alert('単語帳の作成に失敗しました');
    }
  };

  const handleUpdateNotebook = async (notebookData) => {
    try {
      const response = await fetch(`${API_URL}/api/notebooks/${editingNotebook.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notebookData),
      });
      if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.status}`);
      }
      const updatedNotebook = await response.json();
      setNotebooks(notebooks.map((n) => (n.id === updatedNotebook.id ? updatedNotebook : n)));
      setEditingNotebook(null);
      setShowNotebookForm(false);
    } catch (error) {
      console.error('単語帳の更新に失敗しました:', error);
      alert('単語帳の更新に失敗しました');
    }
  };

  const handleDeleteNotebook = async (notebookId) => {
    try {
      const response = await fetch(`${API_URL}/api/notebooks/${notebookId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.status}`);
      }
      const remainingNotebooks = notebooks.filter((n) => n.id !== notebookId);
      setNotebooks(remainingNotebooks);
      if (selectedNotebookId === notebookId) {
        if (remainingNotebooks.length > 0) {
          setSelectedNotebookId(remainingNotebooks[0].id);
        } else {
          setSelectedNotebookId(null);
          setWords([]);
        }
      }
    } catch (error) {
      console.error('単語帳の削除に失敗しました:', error);
      alert('単語帳の削除に失敗しました');
    }
  };

  const handleNotebookSubmit = (notebookData) => {
    if (editingNotebook) {
      handleUpdateNotebook(notebookData);
    } else {
      handleCreateNotebook(notebookData);
    }
  };

  const handleCreateNotebookClick = () => {
    setEditingNotebook(null);
    setShowNotebookForm(true);
  };

  const handleEditNotebookClick = (notebook) => {
    setEditingNotebook(notebook);
    setShowNotebookForm(true);
  };

  const handleCancelNotebookForm = () => {
    setEditingNotebook(null);
    setShowNotebookForm(false);
  };

  const currentCard = shuffledWords[currentCardIndex];

  return (
    <div className="app">
      <header className="app-header">
        <h1>Vocadeck</h1>
      </header>
      <div className="app-container">
        <NotebookSidebar
          notebooks={notebooks}
          selectedNotebookId={selectedNotebookId}
          onSelectNotebook={setSelectedNotebookId}
          onEditNotebook={handleEditNotebookClick}
          onDeleteNotebook={handleDeleteNotebook}
          onCreateNotebook={handleCreateNotebookClick}
        />
        <main className="app-main">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            単語管理
          </button>
          <button
            className={`tab ${activeTab === 'cards' ? 'active' : ''}`}
            onClick={() => setActiveTab('cards')}
          >
            暗記カード
          </button>
          <button
            className={`tab ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            復習
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            学習履歴
          </button>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            設定
          </button>
        </div>

        {activeTab === 'manage' && (
          <>
            {showNotebookForm && (
              <section className="notebook-form-section">
                <h2>{editingNotebook ? '単語帳を編集' : '新しい単語帳を作成'}</h2>
                <NotebookForm
                  editingNotebook={editingNotebook}
                  onSubmit={handleNotebookSubmit}
                  onCancel={handleCancelNotebookForm}
                />
              </section>
            )}
            {selectedNotebookId && (
              <>
                <section className="form-section">
                  <h2>{editingWord ? '単語を編集' : '新しい単語を追加'}</h2>
                  <WordForm
                    onSubmit={handleSubmit}
                    editingWord={editingWord}
                    onCancel={handleCancelEdit}
                  />
                </section>
                
                <section className="import-section">
                  <button
                    className="btn-toggle-import"
                    onClick={() => setShowImport(!showImport)}
                  >
                    {showImport ? '▼ インポートを閉じる' : '▶ 一括インポート'}
                  </button>
                  {showImport && (
                    <ImportWords
                      notebookId={selectedNotebookId}
                      onImportComplete={() => {
                        fetchWords();
                        setShowImport(false);
                      }}
                    />
                  )}
                </section>
                
                <section className="list-section">
                  <h2>単語一覧</h2>
                  {loading ? (
                    <p className="loading">読み込み中...</p>
                  ) : (
                    <WordList
                      words={words}
                      onEdit={handleEdit}
                      onDelete={handleDeleteWord}
                    />
                  )}
                </section>
              </>
            )}
            {!selectedNotebookId && (
              <div className="empty-state">
                <p>単語帳を選択するか、新しい単語帳を作成してください。</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'cards' && (
          <section className="cards-section">
            {loading ? (
              <p className="loading">読み込み中...</p>
            ) : words.length === 0 ? (
              <div className="empty-state">
                <p>単語が登録されていません。まず単語を追加してください。</p>
              </div>
            ) : (
              <>
                <SessionTracker
                  correctCount={sessionCorrectCount}
                  wrongCount={sessionWrongCount}
                  wordsStudied={sessionWordsStudied}
                  onSessionEnd={() => {
                    setSessionCorrectCount(0);
                    setSessionWrongCount(0);
                    setSessionWordsStudied(0);
                  }}
                />
                <ProgressStats words={words} />
                {currentCard && (
                  <>
                    <FlashCard
                      key={`${currentCard.id}-${cardDirection}`}
                      word={currentCard}
                      direction={cardDirection}
                      onFlip={handleCardFlip}
                      colorPreset={notebookSettings?.card_colors?.front || 'blue'}
                    />
                    <CardControls
                      currentIndex={currentCardIndex}
                      totalCards={shuffledWords.length}
                      onPrevious={handlePreviousCard}
                      onNext={handleNextCard}
                      direction={cardDirection}
                      onDirectionChange={handleDirectionChange}
                      order={cardOrder}
                      onOrderChange={handleOrderChange}
                      onResetCard={handleResetCard}
                    />
                    {cardFlipped && (
                      <ProgressButtons
                        onCorrect={handleCorrect}
                        onWrong={handleWrong}
                        onMastered={handleMastered}
                        onUnmastered={handleUnmastered}
                        isMastered={currentCard.mastered}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </section>
        )}

        {activeTab === 'review' && (
          <section className="review-section">
            {selectedNotebookId ? (
              <ReviewMode
                notebookId={selectedNotebookId}
                onProgressUpdate={(updatedWord) => {
                  setWords(words.map((w) => (w.id === updatedWord.id ? updatedWord : w)));
                  setSessionCorrectCount(sessionCorrectCount + (updatedWord.correct_count > 0 ? 1 : 0));
                  setSessionWrongCount(sessionWrongCount + (updatedWord.wrong_count > 0 ? 1 : 0));
                  setSessionWordsStudied(sessionWordsStudied + 1);
                }}
              />
            ) : (
              <div className="empty-state">
                <p>単語帳を選択してください。</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'history' && (
          <section className="history-section">
            <StudyHistory />
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="settings-section">
            <NotebookSettings
              notebookId={selectedNotebookId}
              onSettingsChange={setNotebookSettings}
            />
          </section>
        )}
        </main>
      </div>
    </div>
  );
}

export default App;

