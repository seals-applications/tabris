// 履歴機能の初期化
document.addEventListener('DOMContentLoaded', function() {
  initializeHistory();
  checkDraft();
  showHistory(); // 初期表示時に履歴を表示
});

// 履歴機能の初期化
function initializeHistory() {
  const clearHistoryButton = document.getElementById('clearHistoryButton');
  const tabButtons = document.querySelectorAll('.tab-button');
  
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
    // 回答をローカルストレージに保存
    saveAnswers(item);
    
    // 診断を再開
    window.location.href = 'index.html';
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
    // 回答をローカルストレージに保存
    saveAnswers(draft.answers);
    
    // 現在のステップを保存
    if (draft.currentStep) {
      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, draft.currentStep.toString());
      } catch (error) {
        console.error('ステップの保存に失敗しました:', error);
      }
    }
    
    // 診断を再開
    window.location.href = 'index.html';
  }
}

// 履歴の保存
async function saveToHistory(diagnosisData) {
  const history = JSON.parse(localStorage.getItem('diagnosisHistory') || '[]');
  const newDiagnosis = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...diagnosisData
  };
  
  history.unshift(newDiagnosis);
  localStorage.setItem('diagnosisHistory', JSON.stringify(history));
  
  // Supabaseに保存
  try {
    await saveMeetingData(newDiagnosis);
    console.log('Supabaseに保存成功');
  } catch (error) {
    console.error('Supabase保存エラー:', error);
  }
  
  return newDiagnosis;
}

// 履歴の表示
async function showHistory() {
  const historyList = document.getElementById('historyList');
  
  try {
    // Supabaseから履歴を取得
    const history = await getMeetingHistory();
    
    if (history.length === 0) {
      historyList.innerHTML = '<div class="no-history">履歴がありません</div>';
      return;
    }
    
    history.forEach(item => {
      const historyItem = createHistoryItem(item);
      historyList.appendChild(historyItem);
    });
  } catch (error) {
    console.error('履歴の取得に失敗:', error);
    historyList.innerHTML = '<div class="error">履歴の取得に失敗しました</div>';
  }
}

// 履歴の削除
async function deleteHistoryItem(id) {
  const history = JSON.parse(localStorage.getItem('diagnosisHistory') || '[]');
  const updatedHistory = history.filter(item => item.id !== id);
  localStorage.setItem('diagnosisHistory', JSON.stringify(updatedHistory));
  
  // Supabaseから削除
  try {
    const { error } = await supabase
      .from('sales_meetings')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    console.log('Supabaseから削除成功');
  } catch (error) {
    console.error('Supabase削除エラー:', error);
  }
  
  showHistory();
}

// 履歴のクリア
async function clearHistory() {
  localStorage.removeItem('diagnosisHistory');
  
  // Supabaseから全データ削除
  try {
    const { error } = await supabase
      .from('sales_meetings')
      .delete()
      .neq('id', 'dummy'); // 全レコードを削除
      
    if (error) throw error;
    console.log('Supabaseから全データ削除成功');
  } catch (error) {
    console.error('Supabase全データ削除エラー:', error);
  }
} 