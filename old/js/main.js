// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', function() {
  // 履歴メニューの初期化
  initializeHistoryMenu();
  
  // 履歴メニューのクリックイベント
  const historyButton = document.getElementById('historyButton');
  if (historyButton) {
    historyButton.style.display = 'none'; // 古い履歴ボタンを非表示
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

// 履歴機能の初期化
function initializeHistory() {
  const historyButton = document.getElementById('historyButton');
  const historyModal = document.getElementById('historyModal');
  const closeHistoryButton = document.getElementById('closeHistoryButton');
  const clearHistoryButton = document.getElementById('clearHistoryButton');
  const tabButtons = document.querySelectorAll('.tab-button');
  
  // 履歴ボタンのクリックイベント
  historyButton.addEventListener('click', () => {
    showHistory();
  });
  
  // 履歴モーダルを閉じる
  closeHistoryButton.addEventListener('click', () => {
    historyModal.style.display = 'none';
  });
  
  // 履歴をクリア
  clearHistoryButton.addEventListener('click', () => {
    if (confirm('履歴を削除してもよろしいですか？')) {
      clearHistory();
      showHistory();
    }
  });
  
  // タブ切り替え
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      showHistoryByTab(tab);
    });
  });
  
  // 途中保存の確認
  checkDraft();
}

// 履歴を表示
function showHistory() {
  const historyList = document.getElementById('historyList');
  const history = loadHistory();
  
  if (history.length === 0) {
    historyList.innerHTML = '<p>履歴がありません</p>';
  } else {
    let html = '';
    history.forEach((item, index) => {
      html += createHistoryItemHtml(item, index);
    });
    historyList.innerHTML = html;
    
    // 履歴アイテムのイベントリスナーを設定
    setupHistoryItemListeners();
  }
  
  // タブの初期状態を設定
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  const allTab = document.querySelector('.tab-button[data-tab="all"]');
  if (allTab) {
    allTab.classList.add('active');
  }
  
  document.getElementById('historyModal').style.display = 'block';
}

// タブに応じて履歴を表示
function showHistoryByTab(tab) {
  const historyList = document.getElementById('historyList');
  const history = loadHistory();
  let html = '';
  
  switch (tab) {
    case 'daily':
      const dailyGroups = groupHistoryByDate();
      for (const [date, items] of Object.entries(dailyGroups)) {
        html += `<h3>${date}</h3>`;
        items.forEach((item, index) => {
          const originalIndex = history.findIndex(h => h.date === item.date);
          html += createHistoryItemHtml(item, originalIndex);
        });
      }
      break;
      
    case 'monthly':
      const monthlyGroups = groupHistoryByMonth();
      for (const [month, items] of Object.entries(monthlyGroups)) {
        html += `<h3>${month}</h3>`;
        items.forEach((item, index) => {
          const originalIndex = history.findIndex(h => h.date === item.date);
          html += createHistoryItemHtml(item, originalIndex);
        });
      }
      break;
      
    default:
      history.forEach((item, index) => {
        html += createHistoryItemHtml(item, index);
      });
  }
  
  historyList.innerHTML = html;
  setupHistoryItemListeners();
}

// 履歴アイテムのHTMLを生成
function createHistoryItemHtml(item, index) {
  let details = `
    <div class="history-item" data-index="${index}">
      <div class="history-date">${item.date}</div>
      <div class="history-details">
        <p>キャリア: ${item.carrier}</p>
        <p>ネット回線: ${item.wifi}</p>
        <p>料金プラン: ${item.price}円/月</p>
        <p>使用データ量: ${item.dataUsage}</p>
        <p>家族人数: ${item.members}人</p>
        <p>満足度: ${item.satisfaction}%</p>
  `;

  // 3分診断の場合のみ追加情報を表示
  if (item.callTime) {
    details += `
        <p>通話時間: ${item.callTime}</p>
        <p>利用場所: ${item.location}</p>
        <p>よく使うアプリ: ${item.apps ? item.apps.join('、') : '特になし'}</p>
        <p>契約期間: ${item.contract}</p>
        <p>支払い方法: ${item.payment}</p>
    `;
  }

  details += `
        <p>おすすめプラン: ${item.recommendedPlan}</p>
      </div>
      <div class="button-container">
        <button class="edit-button" onclick="editHistoryItem(${index})">編集</button>
        <button class="delete-button" onclick="deleteHistoryItem(${index})">削除</button>
      </div>
    </div>
  `;

  return details;
}

// 履歴アイテムのイベントリスナーを設定
function setupHistoryItemListeners() {
  const historyItems = document.querySelectorAll('.history-item');
  historyItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.classList.contains('edit-button') && !e.target.classList.contains('delete-button')) {
        const index = item.dataset.index;
        resumeFromHistory(index);
      }
    });
  });
}

// 履歴から再開
function resumeFromHistory(index) {
  const history = loadHistory();
  const item = history[index];
  
  if (item) {
    // 回答を復元
    Object.assign(answers, item);
    
    // 診断を再開
    startDetailedDiagnosis();
    
    // 履歴モーダルを閉じる
    document.getElementById('historyModal').style.display = 'none';
  }
}

// 履歴アイテムを編集
function editHistoryItem(index) {
  const history = loadHistory();
  const item = history[index];
  
  if (item) {
    const editModal = document.getElementById('editHistoryModal');
    const editCarrier = document.getElementById('editCarrier');
    const editPrice = document.getElementById('editPrice');
    const editDataUsage = document.getElementById('editDataUsage');
    const editMembers = document.getElementById('editMembers');
    
    // フォームに値を設定
    editCarrier.value = item.carrier;
    editPrice.value = item.price;
    editDataUsage.value = item.dataUsage;
    editMembers.value = item.members;
    
    // 編集モーダルを表示
    editModal.style.display = 'block';
    
    // 保存ボタンのイベントリスナー
    document.getElementById('saveEditButton').onclick = () => {
      const updatedItem = {
        carrier: editCarrier.value,
        price: editPrice.value,
        dataUsage: editDataUsage.value,
        members: editMembers.value
      };
      
      if (updateHistoryItem(index, updatedItem)) {
        showHistory();
        editModal.style.display = 'none';
      }
    };
    
    // 削除ボタンのイベントリスナー
    document.getElementById('deleteEditButton').onclick = () => {
      if (confirm('この履歴を削除してもよろしいですか？')) {
        if (deleteHistoryItem(index)) {
          showHistory();
          editModal.style.display = 'none';
        }
      }
    };
    
    // キャンセルボタンのイベントリスナー
    document.getElementById('closeEditButton').onclick = () => {
      editModal.style.display = 'none';
    };
  }
}

// 途中保存を確認
function checkDraft() {
  const draft = loadDraft();
  if (draft) {
    const draftSection = document.querySelector('.draft-section');
    const draftContent = document.getElementById('draftContent');
    
    draftContent.innerHTML = `
      <div class="history-item">
        <div class="history-date">途中保存: ${new Date(draft.timestamp).toLocaleString('ja-JP')}</div>
        <div class="history-details">
          <p>現在のステップ: ${draft.currentStep}</p>
        </div>
        <div class="button-container">
          <button onclick="resumeFromDraft()">続きから再開</button>
          <button onclick="clearDraft()">削除</button>
        </div>
      </div>
    `;
    
    draftSection.style.display = 'block';
  }
}

// 途中保存から再開
function resumeFromDraft() {
  const draft = loadDraft();
  if (draft) {
    // 回答を復元
    Object.assign(answers, draft.answers);
    
    // 診断を再開
    startDetailedDiagnosis();
    
    // 指定されたステップに移動
    goToStep(draft.currentStep);
    
    // 履歴モーダルを閉じる
    document.getElementById('historyModal').style.display = 'none';
  }
}

// ページ読み込み時に履歴機能を初期化
document.addEventListener('DOMContentLoaded', () => {
  initializeHistory();
});
