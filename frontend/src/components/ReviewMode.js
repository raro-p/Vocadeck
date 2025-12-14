import React, { useState, useEffect } from 'react';
import FlashCard from './FlashCard';
import CardControls from './CardControls';
import ProgressButtons from './ProgressButtons';

const API_URL = '/api/words';

function ReviewMode({ notebookId, notebookSettings, onProgressUpdate }) {
  const [wrongWords, setWrongWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardDirection, setCardDirection] = useState('word-to-meaning');
  const [cardOrder, setCardOrder] = useState('sequential');
  const [shuffledWords, setShuffledWords] = useState([]);
  const [cardFlipped, setCardFlipped] = useState(false);

  // 間違えた単語を取得
  const fetchWrongWords = async () => {
    if (!notebookId) {
      setWrongWords([]);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/wrong-only?notebook_id=${notebookId}`);
      if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.status}`);
      }
      const data = await response.json();
      setWrongWords(data);
      if (data.length > 0) {
        setShuffledWords([...data]);
      }
    } catch (error) {
      console.error('間違えた単語の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWrongWords();
  }, [notebookId]);

  // カード用の単語リストを更新（初回読み込み時と順序変更時のみ）
  useEffect(() => {
    if (wrongWords.length > 0) {
      if (cardOrder === 'random') {
        const shuffled = [...wrongWords].sort(() => Math.random() - 0.5);
        setShuffledWords(shuffled);
      } else {
        setShuffledWords([...wrongWords]);
      }
      setCurrentCardIndex(0);
      setCardFlipped(false);
    }
  }, [cardOrder]); // wrongWordsの変更ではリセットしない

  // 初回読み込み時のみ
  useEffect(() => {
    if (wrongWords.length > 0 && shuffledWords.length === 0) {
      if (cardOrder === 'random') {
        const shuffled = [...wrongWords].sort(() => Math.random() - 0.5);
        setShuffledWords(shuffled);
      } else {
        setShuffledWords([...wrongWords]);
      }
    }
  }, [wrongWords.length]);

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
      const response = await fetch(`${API_URL}/${wordId}/progress`, {
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
      const updatedWrongWords = wrongWords.map((w) => (w.id === updatedWord.id ? updatedWord : w));
      setWrongWords(updatedWrongWords);
      
      // shuffledWordsも更新（インデックスを維持）
      setShuffledWords(prevShuffled => 
        prevShuffled.map((w) => (w.id === updatedWord.id ? updatedWord : w))
      );
      
      // 親コンポーネントに通知
      if (onProgressUpdate) {
        onProgressUpdate(updatedWord);
      }
    } catch (error) {
      console.error('進捗の更新に失敗しました:', error);
      alert('進捗の更新に失敗しました');
    }
  };

  const handleCorrect = () => {
    if (shuffledWords[currentCardIndex]) {
      const currentIndex = currentCardIndex;
      handleProgressUpdate(shuffledWords[currentIndex].id, true);
      
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

  const currentCard = shuffledWords[currentCardIndex];

  if (loading) {
    return <p className="loading">読み込み中...</p>;
  }

  if (wrongWords.length === 0) {
    return (
      <div className="empty-state">
        <p>間違えた単語がありません。素晴らしいです！</p>
      </div>
    );
  }

  return (
    <div className="review-mode">
      <div className="review-header">
        <h2>復習モード</h2>
        <p className="review-info">
          間違えた単語 {wrongWords.length} 個を復習します
        </p>
      </div>
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
    </div>
  );
}

export default ReviewMode;

