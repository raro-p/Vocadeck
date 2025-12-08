import React from 'react';

function ProgressButtons({ onCorrect, onWrong, onMastered, onUnmastered, isMastered }) {
  return (
    <div className="progress-buttons">
      <button className="btn-correct" onClick={onCorrect}>
        ✓ 正解
      </button>
      <button className="btn-wrong" onClick={onWrong}>
        ✗ 不正解
      </button>
      {isMastered ? (
        <button className="btn-unmaster" onClick={onUnmastered}>
          マスター解除
        </button>
      ) : (
        <button className="btn-master" onClick={onMastered}>
          マスターにする
        </button>
      )}
    </div>
  );
}

export default ProgressButtons;

