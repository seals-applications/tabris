// ボタンの色を定数として定義
const DEFAULT_BUTTON_COLOR = '#4a90e2';
const SELECTED_BUTTON_COLOR = '#EB5505';

// ボタンを選択状態にするヘルパー関数
function setSelectedStyle(button) {
  button.style.background = SELECTED_BUTTON_COLOR;
}

// ボタンを通常状態に戻すヘルパー関数
function resetButtonStyle(button) {
  button.style.background = DEFAULT_BUTTON_COLOR;
}

// 現在のステップを取得する補助関数
function getCurrentStep() {
  for (let i = 1; i <= 11; i++) {
    if (document.getElementById(`step${i}`).style.display !== 'none') {
      return i;
    }
  }
  return 1;
}

// ローカルストレージのキー
const STORAGE_KEYS = {
  ANSWERS: 'diagnosis_answers',
  HISTORY: 'diagnosis_history',
  SETTINGS: 'diagnosis_settings'
};

// エラーメッセージの定義
const ERROR_MESSAGES = {
  INVALID_INPUT: '入力値が無効です',
  SAVE_FAILED: 'データの保存に失敗しました',
  LOAD_FAILED: 'データの読み込みに失敗しました',
  NETWORK_ERROR: 'ネットワークエラーが発生しました',
  UNKNOWN_ERROR: '予期せぬエラーが発生しました'
};

// エラーログを記録する関数
function logError(error, context = '') {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    context,
    message: error.message,
    stack: error.stack
  };
  
  console.error('エラーが発生しました:', errorLog);
  
  // エラーログを保存
  try {
    const logs = loadData('error_logs') || [];
    logs.unshift(errorLog);
    if (logs.length > 100) logs.pop(); // 最新100件のみ保持
    saveData('error_logs', logs);
  } catch (e) {
    console.error('エラーログの保存に失敗しました:', e);
  }
}

// エラーメッセージを表示する関数
function showErrorMessage(message, duration = 3000) {
  const errorMsg = document.getElementById('errorMsg');
  if (!errorMsg) return;
  
  errorMsg.textContent = message;
  errorMsg.style.display = 'block';
  
  // アニメーション効果
  errorMsg.style.opacity = '0';
  errorMsg.style.transform = 'translateY(-20px)';
  
  setTimeout(() => {
    errorMsg.style.opacity = '1';
    errorMsg.style.transform = 'translateY(0)';
  }, 100);
  
  // 指定時間後に非表示
  setTimeout(() => {
    errorMsg.style.opacity = '0';
    errorMsg.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      errorMsg.style.display = 'none';
    }, 300);
  }, duration);
}

// 入力値を検証する関数
function validateInput(value, type) {
  try {
    switch (type) {
      case 'price':
        return !isNaN(value) && value > 0 && value <= 100000;
      case 'members':
        return !isNaN(value) && value > 0 && value <= 10;
      case 'number':
        return !isNaN(value) && value >= 0;
      default:
        return true;
    }
  } catch (error) {
    logError(error, 'validateInput');
    return false;
  }
}

// データを保存する関数（エラーハンドリング強化）
function saveData(key, data) {
  try {
    if (!key || !data) {
      throw new Error('無効なパラメータ');
    }
    
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    logError(error, 'saveData');
    showErrorMessage(ERROR_MESSAGES.SAVE_FAILED);
    return false;
  }
}

// データを読み込む関数（エラーハンドリング強化）
function loadData(key) {
  try {
    if (!key) {
      throw new Error('無効なキー');
    }
    
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logError(error, 'loadData');
    showErrorMessage(ERROR_MESSAGES.LOAD_FAILED);
    return null;
  }
}

// 回答を保存する関数
function saveAnswers(answers) {
  return saveData(STORAGE_KEYS.ANSWERS, answers);
}

// 回答を読み込む関数
function loadAnswers() {
  return loadData(STORAGE_KEYS.ANSWERS);
}

// 履歴を保存する関数
function saveHistory(history) {
  return saveData(STORAGE_KEYS.HISTORY, history);
}

// 履歴を読み込む関数
function loadHistory() {
  return loadData(STORAGE_KEYS.HISTORY) || [];
}

// 設定を保存する関数
function saveSettings(settings) {
  return saveData(STORAGE_KEYS.SETTINGS, settings);
}

// 設定を読み込む関数
function loadSettings() {
  return loadData(STORAGE_KEYS.SETTINGS) || {};
}

// データをクリアする関数
function clearData(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('データの削除に失敗しました:', error);
    return false;
  }
}

// すべてのデータをクリアする関数
function clearAllData() {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('データの削除に失敗しました:', error);
    return false;
  }
}

function saveToHistory() {
  const { carrier, price, dataUsage, members, needs } = answers;
  if (!carrier || !price || !dataUsage || !members) return;
  
  const now = new Date();
  const dateStr = now.toLocaleString('ja-JP');
  
  const historyItem = {
    date: dateStr,
    carrier: carrier,
    price: price,
    dataUsage: dataUsage,
    members: members,
    needs: needs,
    recommendedPlan: document.getElementById('planRecommendation').innerText
  };
  
  let history = JSON.parse(localStorage.getItem('diagnosisHistory') || '[]');
  history.unshift(historyItem);
  
  if (history.length > 10) {
    history = history.slice(0, 10);
  }
  
  localStorage.setItem('diagnosisHistory', JSON.stringify(history));
}

// 履歴を表示する関数
function showHistory() {
  const history = loadHistory();
  const historyList = document.getElementById('historyList');
  const historyModal = document.getElementById('historyModal');
  
  if (!historyList || !historyModal) return;
  
  if (history.length === 0) {
    historyList.innerHTML = '<p>履歴がありません</p>';
  } else {
    let html = '';
    history.forEach((item, index) => {
      html += `
        <div class="history-item">
          <div class="history-date">${item.date}</div>
          <div class="history-details">
            <p>キャリア: ${item.carrier}</p>
            <p>料金プラン: ${item.price}円/月</p>
            <p>使用データ量: ${item.dataUsage}</p>
            <p>家族人数: ${item.members}人</p>
            ${item.needs ? `<p>その他の要望: ${item.needs.join('、')}</p>` : ''}
            <p>${item.recommendedPlan}</p>
          </div>
        </div>
      `;
    });
    historyList.innerHTML = html;
  }
  
  // モーダルを表示
  historyModal.style.display = 'block';
  
  // 履歴メニューを閉じる
  const historyMenu = document.getElementById('historyMenu');
  if (historyMenu) {
    historyMenu.classList.remove('show');
  }
}

// 履歴モーダルを閉じる関数
function closeHistoryModal() {
  const historyModal = document.getElementById('historyModal');
  if (historyModal) {
    historyModal.style.display = 'none';
  }
}

// 履歴を削除する関数
function clearHistory() {
  if (confirm('履歴を削除してもよろしいですか？')) {
    clearData(STORAGE_KEYS.HISTORY);
    const historyList = document.getElementById('historyList');
    if (historyList) {
      historyList.innerHTML = '<p>履歴がありません</p>';
    }
  }
}

// 履歴メニューの表示/非表示を切り替える関数
function toggleHistoryMenu() {
  const menu = document.getElementById('historyMenu');
  if (!menu) return;
  
  menu.classList.toggle('show');
  
  // メニュー以外のクリックで閉じる
  setTimeout(() => {
    const closeMenuHandler = function(e) {
      if (!e.target.closest('.history-button') && !e.target.closest('.history-menu')) {
        menu.classList.remove('show');
        document.removeEventListener('click', closeMenuHandler);
      }
    };
    document.addEventListener('click', closeMenuHandler);
  }, 100);
}

// テンプレートから要素を作成する関数
function createFromTemplate(templateId, data) {
  const template = document.getElementById(templateId);
  if (!template) {
    console.error(`テンプレート "${templateId}" が見つかりません。`);
    return null;
  }
  
  const clone = template.content.cloneNode(true);
  
  // データに基づいて要素を更新
  if (data.title) {
    const titleElement = clone.querySelector('.question-title');
    if (titleElement) {
      titleElement.textContent = data.title;
    }
  }
  
  if (data.placeholder) {
    const inputElement = clone.querySelector('.number-field');
    if (inputElement) {
      inputElement.placeholder = data.placeholder;
    }
  }
  
  if (data.value) {
    const valueElement = clone.querySelector('[data-value]');
    if (valueElement) {
      valueElement.dataset.value = data.value;
      valueElement.textContent = data.value;
    }
  }
  
  return clone;
}

// 選択式質問を作成する関数
function createChoiceQuestion(title, choices, onSelect) {
  const question = createFromTemplate('question-template', { title });
  const inputBox = question.querySelector('.input-box');
  
  choices.forEach(choice => {
    const choiceElement = createFromTemplate('choice-question-template', { value: choice });
    const button = choiceElement.querySelector('.choice-button');
    button.addEventListener('click', () => onSelect(choice));
    inputBox.appendChild(choiceElement);
  });
  
  return question;
}

// 数値入力質問を作成する関数
function createNumberInputQuestion(title, placeholder, onSubmit) {
  const question = createFromTemplate('question-template', { title });
  const inputBox = question.querySelector('.input-box');
  
  const numberInput = createFromTemplate('number-input-template', { placeholder });
  const input = numberInput.querySelector('.number-field');
  const submitButton = numberInput.querySelector('.submit-button');
  
  submitButton.addEventListener('click', () => {
    const value = parseInt(input.value);
    if (validateInput(value, 'number')) {
      onSubmit(value);
    } else {
      showError('有効な数値を入力してください');
    }
  });
  
  inputBox.appendChild(numberInput);
  return question;
}

// 複数選択質問を作成する関数
function createMultiChoiceQuestion(title, choices, onSelect) {
  const question = createFromTemplate('question-template', { title });
  const inputBox = question.querySelector('.input-box');
  const selectedValues = new Set();
  
  choices.forEach(choice => {
    const choiceElement = createFromTemplate('multi-choice-template', { value: choice });
    const button = choiceElement.querySelector('.multi-choice-button');
    
    button.addEventListener('click', () => {
      if (selectedValues.has(choice)) {
        selectedValues.delete(choice);
        button.classList.remove('selected');
      } else {
        selectedValues.add(choice);
        button.classList.add('selected');
      }
      onSelect(Array.from(selectedValues));
    });
    
    inputBox.appendChild(choiceElement);
  });
  
  return question;
}

// CSSを動的に読み込む関数
function loadCSS(path) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = path;
  document.head.appendChild(link);
}

// ページ読み込み時にCSSを読み込む
document.addEventListener('DOMContentLoaded', function() {
  loadCSS('css/main.css');
  loadCSS('css/buttons.css');
  loadCSS('css/components.css');
});
