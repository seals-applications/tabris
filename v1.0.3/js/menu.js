// メニュー機能とキャリア切り替え機能

// 現在選択されているキャリア
let currentCarrier = 'softbank'; // デフォルトはソフトバンク

// ローカルストレージのキー
const CARRIER_STORAGE_KEY = 'selected_carrier';

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
  // 保存されたキャリア設定を復元
  loadCarrierSetting();
  
  // メニューボタンの表示制御
  updateMenuButtonVisibility();
  
  // カラーテーマを適用
  updateColorTheme(currentCarrier);
  
  // メニューボタンを確実に表示
  const menuButton = document.getElementById('menuButton');
  if (menuButton) {
    menuButton.style.display = 'block';
  }
});

// キャリア設定をローカルストレージから読み込み
function loadCarrierSetting() {
  const savedCarrier = localStorage.getItem(CARRIER_STORAGE_KEY);
  if (savedCarrier) {
    currentCarrier = savedCarrier;
  }
  updateCarrierDisplay();
}

// キャリア設定をローカルストレージに保存
function saveCarrierSetting(carrier) {
  localStorage.setItem(CARRIER_STORAGE_KEY, carrier);
}

// メニューボタンの表示制御
function updateMenuButtonVisibility() {
  const menuButton = document.getElementById('menuButton');
  
  if (menuButton) {
    // メニューボタンを常に表示
    menuButton.style.display = 'block';
  }
}

// メニューの表示/非表示を切り替え
function toggleMenu() {
  const menuModal = document.getElementById('menuModal');
  if (menuModal.style.display === 'none' || menuModal.style.display === '') {
    menuModal.style.display = 'flex';
    updateMenuUsername();
  } else {
    menuModal.style.display = 'none';
  }
}

// メニューのユーザー名を更新
function updateMenuUsername() {
  const usernameElement = document.getElementById('menuUsername');
  if (usernameElement) {
    // ローカルストレージからユーザー情報を取得
    const savedUser = localStorage.getItem('current_sales_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        usernameElement.textContent = user.display_name || user.username;
      } catch (error) {
        console.error('ユーザー情報の読み込みに失敗:', error);
        usernameElement.textContent = 'ログイン中...';
      }
    } else {
      usernameElement.textContent = 'ログイン中...';
    }
  }
}

// メニューを閉じる
function closeMenu() {
  const menuModal = document.getElementById('menuModal');
  menuModal.style.display = 'none';
}

// キャリア選択画面を表示
function showCarrierSelector() {
  closeMenu();
  const carrierModal = document.getElementById('carrierModal');
  carrierModal.style.display = 'flex';
  updateCarrierSelectionUI();
}

// キャリア選択UIを更新
function updateCarrierSelectionUI() {
  // すべての選択状態をリセット
  document.querySelectorAll('.carrier-option').forEach(option => {
    option.classList.remove('selected');
  });
  
  // 現在選択されているキャリアをハイライト
  const selectedOption = document.querySelector(`[onclick="selectCarrier('${currentCarrier}')"]`);
  if (selectedOption) {
    selectedOption.classList.add('selected');
  }
}

// キャリアを選択
function selectCarrier(carrier) {
  currentCarrier = carrier;
  saveCarrierSetting(carrier);
  updateCarrierDisplay();
  updateCarrierSelectionUI();
  
  // キャリア選択モーダルを閉じる
  closeCarrierModal();
  
  // 質問内容を更新
  updateQuestionsForCarrier();
  
  // カラーテーマを更新
  updateColorTheme(carrier);
  
  // 選択中のボタンの色を更新
  if (typeof updateSelectedButtonsColor === 'function') {
    updateSelectedButtonsColor();
  }
  
  // 成功メッセージを表示
  showSuccessMessage(`キャリアを「${getCarrierDisplayName(carrier)}」に変更しました`);
}

// キャリア選択モーダルを閉じる
function closeCarrierModal() {
  const carrierModal = document.getElementById('carrierModal');
  carrierModal.style.display = 'none';
}

// キャリア表示名を取得
function getCarrierDisplayName(carrier) {
  switch (carrier) {
    case 'softbank':
      return 'ソフトバンク/Y!mobile';
    case 'au':
      return 'au/UQmobile';
    default:
      return 'ソフトバンク/Y!mobile';
  }
}

// 現在のキャリア表示を更新
function updateCarrierDisplay() {
  const displayElement = document.getElementById('currentCarrierDisplay');
  if (displayElement) {
    displayElement.textContent = `現在: ${getCarrierDisplayName(currentCarrier)}`;
  }
}

// キャリアに応じて質問内容を更新
function updateQuestionsForCarrier() {
  if (currentCarrier === 'softbank') {
    updateQuestionsForSoftbank();
  } else if (currentCarrier === 'au') {
    updateQuestionsForAu();
  }
}

// ソフトバンク/Y!mobile向けの質問内容
function updateQuestionsForSoftbank() {
  // 質問1: 現在のキャリア
  const step1 = document.getElementById('step1');
  if (step1) {
    step1.innerHTML = `
      <h2>現在ご利用のキャリアを選択してください</h2>
      <div class="input-box">
        <button class="input-box-button" onclick="setAnswer('carrier', 'ソフトバンク')">ソフトバンク</button>
        <button class="input-box-button" onclick="setAnswer('carrier', 'ワイモバイル')">ワイモバイル</button>
        <button class="input-box-button" onclick="setAnswer('carrier', 'au')">au</button>
        <button class="input-box-button" onclick="setAnswer('carrier', 'UQモバイル')">UQモバイル</button>
        <button class="input-box-button" onclick="setAnswer('carrier', 'docomo')">docomo</button>
        <button class="input-box-button" onclick="setAnswer('carrier', 'ahamo')">ahamo</button>
        <button class="input-box-button" onclick="setAnswer('carrier', '楽天モバイル')">楽天モバイル</button>
        <button class="input-box-button" onclick="setAnswer('carrier', 'その他')">その他</button>
      </div>
      <button class="back-button" onclick="goToTop()">戻る</button>
    `;
  }

  // 質問2: ネット回線
  const step2 = document.getElementById('step2');
  if (step2) {
    step2.innerHTML = `
      <h2>ご自宅のインターネット回線を選択してください</h2>
      <div class="input-box">
        <button class="input-box-button" onclick="setAnswer('wifi', 'ソフトバンク光')">ソフトバンク光</button>
        <button class="input-box-button" onclick="setAnswer('wifi', 'ドコモ光')">ドコモ光</button>
        <button class="input-box-button" onclick="setAnswer('wifi', 'ビッグローブ光')">ビッグローブ光</button>
        <button class="input-box-button" onclick="setAnswer('wifi', 'ケーブルTV')">ケーブルTV</button>
        <button class="input-box-button" onclick="setAnswer('wifi', 'その他')">その他</button>
        <button class="input-box-button" onclick="setAnswer('wifi', '使用していない')">使用していない</button>
      </div>
      <button class="back-button" onclick="goBack(1)">戻る</button>
    `;
  }
}

// au/UQmobile向けの質問内容
function updateQuestionsForAu() {
  // 質問1: 現在のキャリア
  const step1 = document.getElementById('step1');
  if (step1) {
    step1.innerHTML = `
      <h2>現在ご利用のキャリアを選択してください</h2>
      <div class="input-box">
        <button class="input-box-button" onclick="setAnswer('carrier', 'au')">au</button>
        <button class="input-box-button" onclick="setAnswer('carrier', 'UQモバイル')">UQモバイル</button>
        <button class="input-box-button" onclick="setAnswer('carrier', 'ソフトバンク')">ソフトバンク</button>
        <button class="input-box-button" onclick="setAnswer('carrier', 'ワイモバイル')">ワイモバイル</button>
        <button class="input-box-button" onclick="setAnswer('carrier', 'docomo')">docomo</button>
        <button class="input-box-button" onclick="setAnswer('carrier', 'ahamo')">ahamo</button>
        <button class="input-box-button" onclick="setAnswer('carrier', '楽天モバイル')">楽天モバイル</button>
        <button class="input-box-button" onclick="setAnswer('carrier', 'その他')">その他</button>
      </div>
      <button class="back-button" onclick="goToTop()">戻る</button>
    `;
  }

  // 質問2: ネット回線
  const step2 = document.getElementById('step2');
  if (step2) {
    step2.innerHTML = `
      <h2>ご自宅のインターネット回線を選択してください</h2>
      <div class="input-box">
        <button class="input-box-button" onclick="setAnswer('wifi', 'auひかり')">auひかり</button>
        <button class="input-box-button" onclick="setAnswer('wifi', 'ドコモ光')">ドコモ光</button>
        <button class="input-box-button" onclick="setAnswer('wifi', 'ビッグローブ光')">ビッグローブ光</button>
        <button class="input-box-button" onclick="setAnswer('wifi', 'ケーブルTV')">ケーブルTV</button>
        <button class="input-box-button" onclick="setAnswer('wifi', 'その他')">その他</button>
        <button class="input-box-button" onclick="setAnswer('wifi', '使用していない')">使用していない</button>
      </div>
      <button class="back-button" onclick="goBack(1)">戻る</button>
    `;
  }
}

// 設定画面を表示（将来の拡張用）
function showSettings() {
  closeMenu();
  alert('設定機能は現在開発中です。');
}

// 全ユーザーの診断結果を表示
function showAllUsersDiagnosesFromMenu() {
  closeMenu();
  // 全ユーザーの診断結果を表示
  if (typeof showOtherSalesDiagnoses === 'function') {
    // 初期表示は個人の診断結果（showOtherSalesDiagnosesの仕様に合わせる）
    showOtherSalesDiagnoses();
  } else {
    // 関数が存在しない場合はsales-management.htmlに遷移
    window.location.href = 'sales-management.html';
  }
}

// ヘルプ画面を表示（将来の拡張用）
function showHelp() {
  closeMenu();
  alert('ヘルプ機能は現在開発中です。');
}

// 成功メッセージを表示
function showSuccessMessage(message) {
  // 既存のエラーメッセージ要素を利用して成功メッセージを表示
  const errorMsg = document.getElementById('errorMsg');
  if (errorMsg) {
    errorMsg.textContent = message;
    errorMsg.style.background = 'linear-gradient(145deg, #28a745 0%, #20c997 100%)';
    errorMsg.style.display = 'block';
    errorMsg.classList.add('show');
    
    // 3秒後に自動で非表示
    setTimeout(() => {
      errorMsg.classList.add('hide');
      setTimeout(() => {
        errorMsg.style.display = 'none';
        errorMsg.classList.remove('show', 'hide');
      }, 300);
    }, 3000);
  }
}

// 現在のキャリアを取得
function getCurrentCarrier() {
  return currentCarrier;
}

// カラーテーマを更新
function updateColorTheme(carrier) {
  const body = document.body;
  
  // 既存のキャリアクラスを削除
  body.classList.remove('carrier-softbank', 'carrier-au');
  
  // 新しいキャリアクラスを追加
  if (carrier === 'au') {
    body.classList.add('carrier-au');
  } else {
    body.classList.add('carrier-softbank');
  }
} 