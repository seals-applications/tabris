// メニュー機能とキャリア切り替え機能

// 現在選択されているキャリア
let currentCarrier = 'softbank'; // デフォルトはソフトバンク

// ローカルストレージのキー
const CARRIER_STORAGE_KEY = 'selected_carrier';

// 文字サイズ制御機能
const FONT_SIZE_CONTROL = {
  // ローカルストレージのキー
  FONT_SIZE_STORAGE_KEY: 'selected_font_size',
  
  // デフォルトの文字サイズ
  DEFAULT_FONT_SIZE: 'medium',
  
  // 文字サイズ選択モーダル表示
  showFontSizeSelector() {
    document.getElementById('fontSizeModal').style.display = 'flex';
    this.updateFontSizeSelectionUI();
  },
  
  // 文字サイズ選択モーダル非表示
  closeFontSizeModal() {
    document.getElementById('fontSizeModal').style.display = 'none';
  },
  
  // 文字サイズを設定
  setFontSize(size) {
    // 既存のクラスを削除
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    
    // 新しいクラスを追加
    document.body.classList.add(`font-size-${size}`);
    
    // ローカルストレージに保存
    localStorage.setItem(this.FONT_SIZE_STORAGE_KEY, size);
    
    // 選択UIを更新
    this.updateFontSizeSelectionUI();
    
    // モーダルを閉じる
    this.closeFontSizeModal();
    
    // 設定画面の表示を更新
    updateSettingsDisplay();
    
    // 成功メッセージを表示
    const sizeNames = { small: '小', medium: '中', large: '大' };
    showSuccessMessage(`文字サイズを「${sizeNames[size]}」に変更しました`);
  },
  
  // 文字サイズ選択UIを更新
  updateFontSizeSelectionUI() {
    // すべての選択状態をリセット
    document.querySelectorAll('.font-size-option').forEach(option => {
      option.classList.remove('selected');
    });
    
    // 現在選択されている文字サイズを取得
    const currentSize = this.getCurrentFontSize();
    
    // 現在選択されているサイズをハイライト
    const selectedOption = document.querySelector(`[onclick="setFontSize('${currentSize}')"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
    }
  },
  
  // 現在の文字サイズを取得
  getCurrentFontSize() {
    return localStorage.getItem(this.FONT_SIZE_STORAGE_KEY) || this.DEFAULT_FONT_SIZE;
  },
  
  // 保存された文字サイズを復元
  loadFontSizeSetting() {
    const savedSize = this.getCurrentFontSize();
    this.setFontSize(savedSize);
  }
};

// 現在のページがメインページかどうかを判定
function isMainPage() {
  // メインページの判定条件
  // 1. startScreenが表示されている
  // 2. 他の画面（step1, step2, result等）が非表示
  const startScreen = document.getElementById('startScreen');
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const result = document.getElementById('result');
  
  return startScreen && 
         startScreen.style.display !== 'none' && 
         (!step1 || step1.style.display === 'none') &&
         (!step2 || step2.style.display === 'none') &&
         (!result || result.style.display === 'none');
}

// キャリア選択を制限する関数
function restrictCarrierSelection() {
  if (!isMainPage()) {
    // メインページ以外ではキャリア選択を無効化
    const carrierOption = document.querySelector('.menu-item[onclick="showCarrierSelector()"]');
    if (carrierOption) {
      carrierOption.style.opacity = '0.5';
      carrierOption.style.pointerEvents = 'none';
      carrierOption.title = 'キャリア変更はメインページでのみ可能です';
    }
  } else {
    // メインページではキャリア選択を有効化
    const carrierOption = document.querySelector('.menu-item[onclick="showCarrierSelector()"]');
    if (carrierOption) {
      carrierOption.style.opacity = '1';
      carrierOption.style.pointerEvents = 'auto';
      carrierOption.title = '';
    }
  }
}

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
  
  // キャリア選択制限を適用
  restrictCarrierSelection();
  
  // 文字サイズ設定を復元
  FONT_SIZE_CONTROL.loadFontSizeSetting();
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
    // キャリア選択制限を適用
    restrictCarrierSelection();
  } else {
    menuModal.style.display = 'none';
  }
}

// メニューのユーザー名を更新
function updateMenuUsername() {
  const usernameElement = document.getElementById('menuUsername');
  const siteIdElement = document.getElementById('menuSiteId');
  
  if (usernameElement) {
    // ローカルストレージからユーザー情報を取得
    const savedUser = localStorage.getItem('current_sales_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        usernameElement.textContent = user.display_name || user.username;
        
        // 現場IDも表示
        if (siteIdElement && user.site_id) {
          siteIdElement.textContent = `現場ID: ${user.site_id}`;
        }
      } catch (error) {
        console.error('ユーザー情報の読み込みに失敗:', error);
        usernameElement.textContent = 'ログイン中...';
        if (siteIdElement) {
          siteIdElement.textContent = '現場ID: 読み込み中...';
        }
      }
    } else {
      usernameElement.textContent = 'ログイン中...';
      if (siteIdElement) {
        siteIdElement.textContent = '現場ID: 読み込み中...';
      }
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
  // メインページ以外ではキャリア選択を制限
  if (!isMainPage()) {
    alert('キャリア変更はメインページでのみ可能です。メインページに戻ってからお試しください。');
    return;
  }
  
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
    case 'docomo':
      return 'docomo';
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
  } else if (currentCarrier === 'docomo') {
    updateQuestionsForDocomo();
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

  // 質問4: データ使用量（Softbank向け）
  const step4 = document.getElementById('step4');
  if (step4) {
    step4.innerHTML = `
      <h2>毎月の使用データ量（ギガ数）を選択してください</h2>
      <div class="input-box">
        <button class="input-box-button" onclick="setAnswer('dataUsage', '0～1GB')">0～1GB</button>
        <button class="input-box-button" onclick="setAnswer('dataUsage', '1～4GB')">1～4GB</button>
        <button class="input-box-button" onclick="setAnswer('dataUsage', '4～30GB')">4～30GB</button>
        <button class="input-box-button" onclick="setAnswer('dataUsage', '30～35GB')">30～35GB</button>
        <button class="input-box-button" onclick="setAnswer('dataUsage', '35GB以上')">35GB以上</button>
      </div>
      <button class="back-button" onclick="goBack(3)">戻る</button>
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

  // 質問4: データ使用量（au向け）
  const step4 = document.getElementById('step4');
  if (step4) {
    step4.innerHTML = `
      <h2>毎月の使用データ量（ギガ数）を選択してください</h2>
      <div class="input-box">
        <button class="input-box-button" onclick="setAnswer('dataUsage', '0～1GB')">0～1GB</button>
        <button class="input-box-button" onclick="setAnswer('dataUsage', '1～5GB')">1～5GB</button>
        <button class="input-box-button" onclick="setAnswer('dataUsage', '5～30GB')">5～30GB</button>
        <button class="input-box-button" onclick="setAnswer('dataUsage', '30～35GB')">30～35GB</button>
        <button class="input-box-button" onclick="setAnswer('dataUsage', '35GB以上')">35GB以上</button>
      </div>
      <button class="back-button" onclick="goBack(3)">戻る</button>
    `;
  }
}

// docomo向けの質問内容
function updateQuestionsForDocomo() {
  // 質問1: 現在のキャリア
  const step1 = document.getElementById('step1');
  if (step1) {
    step1.innerHTML = `
      <h2>現在ご利用のキャリアを選択してください</h2>
      <div class="input-box">
        <button class="input-box-button" onclick="setAnswer('carrier', 'docomo')">docomo</button>
        <button class="input-box-button" onclick="setAnswer('carrier', 'ahamo')">ahamo</button>
        <button class="input-box-button" onclick="setAnswer('carrier', 'ソフトバンク')">ソフトバンク</button>
        <button class="input-box-button" onclick="setAnswer('carrier', 'ワイモバイル')">ワイモバイル</button>
        <button class="input-box-button" onclick="setAnswer('carrier', 'au')">au</button>
        <button class="input-box-button" onclick="setAnswer('carrier', 'UQモバイル')">UQモバイル</button>
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
        <button class="input-box-button" onclick="setAnswer('wifi', 'ドコモ光')">ドコモ光</button>
        <button class="input-box-button" onclick="setAnswer('wifi', 'ビッグローブ光')">ビッグローブ光</button>
        <button class="input-box-button" onclick="setAnswer('wifi', 'ソフトバンク光')">ソフトバンク光</button>
        <button class="input-box-button" onclick="setAnswer('wifi', 'ケーブルTV')">ケーブルTV</button>
        <button class="input-box-button" onclick="setAnswer('wifi', 'その他')">その他</button>
        <button class="input-box-button" onclick="setAnswer('wifi', '使用していない')">使用していない</button>
      </div>
      <button class="back-button" onclick="goBack(1)">戻る</button>
    `;
  }

  // 質問4: データ使用量（docomo向け）
  const step4 = document.getElementById('step4');
  if (step4) {
    step4.innerHTML = `
      <h2>毎月の使用データ量（ギガ数）を選択してください</h2>
      <div class="input-box">
        <button class="input-box-button" onclick="setAnswer('dataUsage', '0～1GB')">0～1GB</button>
        <button class="input-box-button" onclick="setAnswer('dataUsage', '1～4GB')">1～4GB</button>
        <button class="input-box-button" onclick="setAnswer('dataUsage', '4～30GB')">4～30GB</button>
        <button class="input-box-button" onclick="setAnswer('dataUsage', '30GB以上')">30GB以上</button>
      </div>
      <button class="back-button" onclick="goBack(3)">戻る</button>
    `;
  }
}

// 設定画面を表示
function showSettings() {
  closeMenu();
  document.getElementById('settingsModal').style.display = 'flex';
  updateSettingsDisplay();
}

// 設定モーダルを閉じる
function closeSettingsModal() {
  document.getElementById('settingsModal').style.display = 'none';
}

// 設定画面の表示を更新
function updateSettingsDisplay() {
  // 現在の文字サイズを表示
  const currentFontSize = FONT_SIZE_CONTROL.getCurrentFontSize();
  const fontSizeNames = { small: '小', medium: '中', large: '大' };
  const fontSizeElement = document.getElementById('currentFontSize');
  if (fontSizeElement) {
    fontSizeElement.textContent = fontSizeNames[currentFontSize];
  }
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
  body.classList.remove('carrier-softbank', 'carrier-au', 'carrier-docomo');
  
  // 新しいキャリアクラスを追加
  if (carrier === 'au') {
    body.classList.add('carrier-au');
  } else if (carrier === 'docomo') {
    body.classList.add('carrier-docomo');
  } else {
    body.classList.add('carrier-softbank');
  }
}

// リンク集モーダル表示
function showLinks() {
  document.getElementById('linksModal').style.display = 'flex';
}

// リンク集モーダル非表示
function closeLinksModal() {
  document.getElementById('linksModal').style.display = 'none';
  // プルダウンメニューも閉じる
  closeDropdowns();
}

// 外部リンクを新しいタブで開く
function openLink(url) {
  window.open(url, '_blank');
}

// エリアマッププルダウンを表示
function showAreaMapDropdown() {
  const dropdown = document.getElementById('areaMapDropdown');
  const button = document.querySelector('.link-dropdown-button[onclick="showAreaMapDropdown()"]');
  const simDropdown = document.getElementById('simCheckDropdown');
  const simButton = document.querySelector('.link-dropdown-button[onclick="showSimCheckDropdown()"]');
  
  if (dropdown) {
    const isVisible = dropdown.style.display === 'block';
    
    // 他のプルダウンを閉じる
    if (simDropdown) simDropdown.style.display = 'none';
    if (simButton) simButton.classList.remove('active');
    
    // 現在のプルダウンを切り替え
    dropdown.style.display = isVisible ? 'none' : 'block';
    if (button) {
      button.classList.toggle('active', !isVisible);
    }
  }
}

// SIM動作確認プルダウンを表示
function showSimCheckDropdown() {
  const dropdown = document.getElementById('simCheckDropdown');
  const button = document.querySelector('.link-dropdown-button[onclick="showSimCheckDropdown()"]');
  const areaDropdown = document.getElementById('areaMapDropdown');
  const areaButton = document.querySelector('.link-dropdown-button[onclick="showAreaMapDropdown()"]');
  
  if (dropdown) {
    const isVisible = dropdown.style.display === 'block';
    
    // 他のプルダウンを閉じる
    if (areaDropdown) areaDropdown.style.display = 'none';
    if (areaButton) areaButton.classList.remove('active');
    
    // 現在のプルダウンを切り替え
    dropdown.style.display = isVisible ? 'none' : 'block';
    if (button) {
      button.classList.toggle('active', !isVisible);
    }
  }
}

// プルダウンメニューを閉じる
function closeDropdowns() {
  const dropdowns = document.querySelectorAll('.link-dropdown');
  const buttons = document.querySelectorAll('.link-dropdown-button');
  
  dropdowns.forEach(dropdown => {
    dropdown.style.display = 'none';
  });
  
  buttons.forEach(button => {
    button.classList.remove('active');
  });
}

// 文字サイズ選択モーダル表示
function showFontSizeSelector() {
  FONT_SIZE_CONTROL.showFontSizeSelector();
}

// 文字サイズ選択モーダル非表示
function closeFontSizeModal() {
  FONT_SIZE_CONTROL.closeFontSizeModal();
}

// 文字サイズ設定
function setFontSize(size) {
  FONT_SIZE_CONTROL.setFontSize(size);
} 