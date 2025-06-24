// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', function() {
  // 履歴メニューの初期化
  initializeHistoryMenu();
  
  // 履歴メニューのクリックイベント
  const historyButton = document.getElementById('historyButton');
  if (historyButton) {
    historyButton.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleHistoryMenu();
    });
  }
  
  // 履歴メニュー以外のクリックでメニューを閉じる
  document.addEventListener('click', function(e) {
    const historyMenu = document.getElementById('historyMenu');
    if (historyMenu && !e.target.closest('.history-button') && !e.target.closest('.history-menu')) {
      historyMenu.classList.remove('show');
    }
  });
  
  // 履歴モーダルのクリックイベント
  const historyModal = document.getElementById('historyModal');
  if (historyModal) {
    historyModal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeHistoryModal();
      }
    });
  }
  
  // 履歴クリアボタンのクリックイベント
  const clearHistoryButton = document.getElementById('clearHistoryButton');
  if (clearHistoryButton) {
    clearHistoryButton.addEventListener('click', clearHistory);
  }
  
  // 履歴表示ボタンのクリックイベント
  const showHistoryButton = document.getElementById('showHistoryButton');
  if (showHistoryButton) {
    showHistoryButton.addEventListener('click', showHistory);
  }
  
  // 履歴メニューボタンのクリックイベント
  const historyMenuButton = document.getElementById('historyMenuButton');
  if (historyMenuButton) {
    historyMenuButton.addEventListener('click', showHistory);
  }
  
  // 履歴モーダルを閉じるボタンのクリックイベント
  const closeHistoryButton = document.getElementById('closeHistoryButton');
  if (closeHistoryButton) {
    closeHistoryButton.addEventListener('click', closeHistoryModal);
  }
  
  // 履歴メニューを閉じるボタンのクリックイベント
  const closeHistoryMenuButton = document.getElementById('closeHistoryMenuButton');
  if (closeHistoryMenuButton) {
    closeHistoryMenuButton.addEventListener('click', function() {
      const historyMenu = document.getElementById('historyMenu');
      if (historyMenu) {
        historyMenu.classList.remove('show');
      }
    });
  }
  
  // 料金入力フィールドのイベントリスナー
  const priceInput = document.getElementById('priceInput');
  if (priceInput) {
    priceInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        setPrice();
      }
    });
  }
  
  // 家族人数入力フィールドのイベントリスナー
  const membersInput = document.getElementById('membersInput');
  if (membersInput) {
    membersInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        setMembers();
      }
    });
  }

  // 起動時の画面表示を設定
  // すべての画面を非表示にする
  document.querySelectorAll('.container > div').forEach(div => {
    div.style.display = 'none';
  });
  
  // スタート画面のみを表示
  const startScreen = document.getElementById('startScreen');
  if (startScreen) {
    startScreen.style.display = 'block';
  }
});

// 履歴メニューの初期化
function initializeHistoryMenu() {
  // 履歴メニューが存在しない場合は作成
  if (!document.getElementById('historyMenu')) {
    const historyMenu = document.createElement('div');
    historyMenu.id = 'historyMenu';
    historyMenu.className = 'history-menu';
    historyMenu.innerHTML = `
      <button id="historyMenuButton" class="history-menu-button">履歴を表示</button>
      <button id="closeHistoryMenuButton" class="history-menu-button">閉じる</button>
    `;
    document.body.appendChild(historyMenu);
  }
  
  // 履歴モーダルが存在しない場合は作成
  if (!document.getElementById('historyModal')) {
    const historyModal = document.createElement('div');
    historyModal.id = 'historyModal';
    historyModal.className = 'modal';
    historyModal.innerHTML = `
      <div class="modal-content">
        <h2>診断履歴</h2>
        <div id="historyList"></div>
        <button id="clearHistoryButton" class="clear-history">履歴を削除</button>
        <button id="closeHistoryButton" class="history-menu-button">閉じる</button>
      </div>
    `;
    document.body.appendChild(historyModal);
  }
  
  // 履歴ボタンが存在しない場合は作成
  if (!document.getElementById('historyButton')) {
    const historyButton = document.createElement('button');
    historyButton.id = 'historyButton';
    historyButton.className = 'history-button';
    historyButton.innerHTML = '履歴';
    document.querySelector('.container').insertBefore(historyButton, document.querySelector('.container').firstChild);
  }
}

// エラーメッセージを表示する関数
function showError(message) {
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.textContent = message;
  errorMsg.style.display = 'block';
  
  // 3秒後にエラーメッセージを非表示
  setTimeout(() => {
    errorMsg.style.display = 'none';
  }, 3000);
}

// 入力値を検証する関数
function validateInput(value, type) {
  switch (type) {
    case 'price':
      return !isNaN(value) && value > 0;
    case 'members':
      return !isNaN(value) && value > 0 && value <= 10;
    default:
      return true;
  }
}

// 入力値をフォーマットする関数
function formatInput(value, type) {
  switch (type) {
    case 'price':
      return parseInt(value).toLocaleString();
    default:
      return value;
  }
}

// 料金を設定する関数
function setPrice() {
  const priceInput = document.getElementById('priceInput');
  const price = parseInt(priceInput.value);
  
  // 入力値の検証
  if (!validateInput(price, 'price')) {
    showError('有効な料金を入力してください');
    return;
  }
  
  // 料金を保存
  answers.price = price;
  
  // 次のステップへ
  nextStep();
}

// 家族人数を設定する関数
function setMembers() {
  const membersInput = document.getElementById('membersInput');
  const members = parseInt(membersInput.value);
  
  // 入力値の検証
  if (!validateInput(members, 'members')) {
    showError('1～10人の範囲で入力してください');
    return;
  }
  
  // 家族人数を保存
  answers.members = members;
  
  // 次のステップへ
  nextStep();
}
