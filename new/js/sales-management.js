// ユーザー管理機能
let currentSalesUser = null;

// ローカルストレージのキー
const SALES_USER_STORAGE_KEY = 'current_sales_user';

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
  // 保存されたユーザー情報を復元
  loadCurrentSalesUser();
  
  // ユーザーがログインしていない場合はログイン画面を表示
  if (!currentSalesUser) {
    showSalesLoginScreen();
  } else {
    showMainScreen();
    // 固定ログアウトボタンを表示
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
      logoutButton.style.display = 'block';
    }
    // 固定メニューボタンを表示
    const menuButton = document.getElementById('menuButton');
    if (menuButton) {
      menuButton.style.display = 'block';
    }
  }
});

// 現在のユーザーをローカルストレージから読み込み
function loadCurrentSalesUser() {
  const savedUser = localStorage.getItem(SALES_USER_STORAGE_KEY);
  if (savedUser) {
    try {
      currentSalesUser = JSON.parse(savedUser);
    } catch (error) {
      console.error('ユーザー情報の読み込みに失敗:', error);
      currentSalesUser = null;
    }
  }
}

// 現在のユーザーをローカルストレージに保存
function saveCurrentSalesUser(user) {
  localStorage.setItem(SALES_USER_STORAGE_KEY, JSON.stringify(user));
}

// ユーザーログイン画面を表示
function showSalesLoginScreen() {
  // メインコンテンツを非表示
  document.querySelector('.container').style.display = 'none';
  
  // ログイン画面を作成・表示
  const loginScreen = document.createElement('div');
  loginScreen.id = 'salesLoginScreen';
  loginScreen.className = 'login-screen';
  loginScreen.innerHTML = `
    <div class="login-container">
      <div class="login-header">
        <h2>営業支援ツール</h2>
        <p>ユーザー名を入力してください</p>
      </div>
      
      <div class="login-form">
        <div class="form-group">
          <label for="salesUsername">ユーザー名</label>
          <input type="text" id="salesUsername" placeholder="ユーザー名を入力" maxlength="20" required>
        </div>
        
        <button onclick="salesLogin()" class="login-button">ログイン</button>
      </div>
      
      <div class="login-footer">
        <p>ユーザー名は診断結果の管理に使用されます</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(loginScreen);
}

// メイン画面を表示
function showMainScreen() {
  // ログイン画面を削除
  const loginScreen = document.getElementById('salesLoginScreen');
  if (loginScreen) {
    loginScreen.remove();
  }
  
  // メインコンテンツを表示
  document.querySelector('.container').style.display = 'block';
  
  // 固定ログアウトボタンを表示
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.style.display = 'block';
  }
  
  // 固定メニューボタンを表示
  const menuButton = document.getElementById('menuButton');
  if (menuButton) {
    menuButton.style.display = 'block';
  }
  
  // ユーザー情報をヘッダーに表示
  updateSalesUserHeader();
}

// ユーザー情報をヘッダーに表示
function updateSalesUserHeader() {
  if (!currentSalesUser) return;
  
  // ヘッダーにユーザー情報を追加
  let userHeader = document.getElementById('salesUserHeader');
  if (!userHeader) {
    userHeader = document.createElement('div');
    userHeader.id = 'salesUserHeader';
    userHeader.className = 'user-header';
    document.querySelector('.container').insertBefore(userHeader, document.querySelector('.container').firstChild);
  }
  
  userHeader.innerHTML = `
    <div class="user-info">
      <span class="username">ユーザー: ${currentSalesUser.display_name || currentSalesUser.username}</span>
      <button onclick="salesLogout()" class="logout-button">
        <i class="fas fa-sign-out-alt"></i> ログアウト
      </button>
    </div>
  `;
}

// ユーザーログイン処理
async function salesLogin() {
  const username = document.getElementById('salesUsername').value.trim();
  
  // バリデーション
  if (!username) {
    alert('ユーザー名を入力してください');
    return;
  }
  
  if (username.length < 2) {
    alert('ユーザー名は2文字以上で入力してください');
    return;
  }
  
  if (username.length > 20) {
    alert('ユーザー名は20文字以内で入力してください');
    return;
  }
  
  // ユーザー名の形式チェック
  const usernameRegex = /^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/;
  if (!usernameRegex.test(username)) {
    alert('ユーザー名には英数字、ひらがな、カタカナ、漢字のみ使用できます');
    return;
  }
  
  try {
    // Supabaseでユーザーを作成または取得
    const user = await createOrGetSalesUser(username, username);
    
    if (user) {
      currentSalesUser = user;
      saveCurrentSalesUser(user);
      showMainScreen();
      
      // ユーザーの診断履歴を読み込み
      await loadSalesUserDiagnosisHistory();
    } else {
      alert('ログインに失敗しました。もう一度お試しください。');
    }
  } catch (error) {
    console.error('ログインエラー:', error);
    alert('ログインに失敗しました。もう一度お試しください。');
  }
}

// ユーザーログアウト処理
function salesLogout() {
  if (confirm('ログアウトしますか？')) {
    currentSalesUser = null;
    localStorage.removeItem(SALES_USER_STORAGE_KEY);
    
    // 固定ログアウトボタンを非表示
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
      logoutButton.style.display = 'none';
    }
    
    // 固定メニューボタンを非表示
    const menuButton = document.getElementById('menuButton');
    if (menuButton) {
      menuButton.style.display = 'none';
    }
    
    showSalesLoginScreen();
  }
}

// Supabaseでユーザーを作成または取得
async function createOrGetSalesUser(username, displayName) {
  if (!supabase) {
    console.warn('Supabaseクライアントが初期化されていません');
    return null;
  }
  
  try {
    // データベース関数を使用してユーザーを作成または取得
    const { data, error } = await supabase
      .rpc('create_sales_user_if_not_exists', {
        p_username: username,
        p_display_name: displayName || null
      });
    
    if (error) {
      console.error('ユーザー作成エラー:', error);
      return null;
    }
    
    // ユーザー情報を取得
    const { data: userData, error: userError } = await supabase
      .from('sales_users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (userError) {
      console.error('ユーザー情報取得エラー:', userError);
      return null;
    }
    
    return userData;
  } catch (error) {
    console.error('ユーザー作成中にエラーが発生:', error);
    return null;
  }
}

// ユーザーの診断履歴を読み込み
async function loadSalesUserDiagnosisHistory() {
  if (!currentSalesUser || !supabase) return;
  
  try {
    const { data, error } = await supabase
      .from('diagnosis_history')
      .select('*')
      .eq('sales_username', currentSalesUser.username)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('ユーザー履歴の取得に失敗:', error);
      return;
    }
    
    // 履歴表示を更新
    updateHistoryDisplay(data || []);
  } catch (error) {
    console.error('ユーザー履歴の取得中にエラーが発生:', error);
  }
}

// 他のユーザーの診断結果を表示（管理者向け）
async function showOtherSalesDiagnoses() {
  if (!supabase) return;
  
  try {
    const { data, error } = await supabase
      .from('diagnosis_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('他のユーザーの診断結果の取得に失敗:', error);
      return;
    }
    
    showOtherSalesDiagnosesModal(data || []);
  } catch (error) {
    console.error('他のユーザーの診断結果の取得中にエラーが発生:', error);
  }
}

// 他のユーザーの診断結果モーダルを表示
function showOtherSalesDiagnosesModal(diagnoses) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'otherSalesDiagnosesModal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>全ユーザーの診断結果</h2>
      <div class="sales-diagnoses-list">
        ${diagnoses.map(diagnosis => `
          <div class="sales-diagnosis-item">
            <div class="diagnosis-header">
              <span class="sales-username">ユーザー: ${diagnosis.sales_username}</span>
              <span class="customer-name">${diagnosis.customer_name ? 'お客様: ' + diagnosis.customer_name : 'お客様名未入力'}</span>
              <span class="date">${new Date(diagnosis.created_at).toLocaleDateString('ja-JP')}</span>
            </div>
            <div class="diagnosis-summary">
              <p><strong>キャリア:</strong> ${diagnosis.carrier || '未回答'}</p>
              <p><strong>料金:</strong> ${diagnosis.price ? diagnosis.price + '円' : '未回答'}</p>
              <p><strong>データ使用量:</strong> ${diagnosis.data_usage || '未回答'}</p>
              <p><strong>営業ステータス:</strong> ${getSalesStatusText(diagnosis.sales_status)}</p>
            </div>
            <div class="diagnosis-actions">
              <button onclick="viewSalesDiagnosis('${diagnosis.share_code}')" class="view-button">詳細を見る</button>
              <button onclick="editSalesStatus('${diagnosis.id}')" class="edit-button">ステータス編集</button>
            </div>
          </div>
        `).join('')}
      </div>
      <button onclick="closeOtherSalesDiagnosesModal()" class="close-button">閉じる</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.style.display = 'block';
}

// 営業ステータスのテキストを取得
function getSalesStatusText(status) {
  const statusMap = {
    'new': '新規',
    'contacted': '連絡済み',
    'proposal': '提案中',
    'closed': '成約',
    'lost': '失注'
  };
  return statusMap[status] || status;
}

// 他のユーザーの診断結果モーダルを閉じる
function closeOtherSalesDiagnosesModal() {
  const modal = document.getElementById('otherSalesDiagnosesModal');
  if (modal) {
    modal.remove();
  }
}

// ユーザーの診断結果の詳細を表示
function viewSalesDiagnosis(shareCode) {
  closeOtherSalesDiagnosesModal();
  window.location.href = `${window.location.pathname}?share=${shareCode}`;
}

// 営業ステータスを編集
async function editSalesStatus(diagnosisId) {
  const newStatus = prompt('営業ステータスを選択してください:\n1. 新規\n2. 連絡済み\n3. 提案中\n4. 成約\n5. 失注');
  
  if (!newStatus) return;
  
  const statusMap = {
    '1': 'new',
    '2': 'contacted',
    '3': 'proposal',
    '4': 'closed',
    '5': 'lost'
  };
  
  const status = statusMap[newStatus];
  if (!status) {
    alert('無効な選択です');
    return;
  }
  
  try {
    const { error } = await supabase
      .from('diagnosis_history')
      .update({ sales_status: status })
      .eq('id', diagnosisId);
    
    if (error) {
      console.error('ステータス更新エラー:', error);
      alert('ステータスの更新に失敗しました');
    } else {
      alert('ステータスを更新しました');
      // モーダルを再読み込み
      closeOtherSalesDiagnosesModal();
      showOtherSalesDiagnoses();
    }
  } catch (error) {
    console.error('ステータス更新中にエラーが発生:', error);
    alert('ステータスの更新に失敗しました');
  }
} 