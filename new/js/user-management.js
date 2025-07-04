// ユーザー管理機能
let currentUser = null;

// ローカルストレージのキー
const USER_STORAGE_KEY = 'current_user';

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
  // 保存されたユーザー情報を復元
  loadCurrentUser();
  
  // ユーザーがログインしていない場合はログイン画面を表示
  if (!currentUser) {
    showLoginScreen();
  } else {
    showMainScreen();
  }
});

// 現在のユーザーをローカルストレージから読み込み
function loadCurrentUser() {
  const savedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
    } catch (error) {
      console.error('ユーザー情報の読み込みに失敗:', error);
      currentUser = null;
    }
  }
}

// 現在のユーザーをローカルストレージに保存
function saveCurrentUser(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

// ログイン画面を表示
function showLoginScreen() {
  // メインコンテンツを非表示
  document.querySelector('.container').style.display = 'none';
  
  // ログイン画面を作成・表示
  const loginScreen = document.createElement('div');
  loginScreen.id = 'loginScreen';
  loginScreen.className = 'login-screen';
  loginScreen.innerHTML = `
    <div class="login-container">
      <div class="login-header">
        <h2>スマートフォン料金診断</h2>
        <p>ユーザー名を入力して診断を開始してください</p>
      </div>
      
      <div class="login-form">
        <div class="form-group">
          <label for="username">ユーザー名</label>
          <input type="text" id="username" placeholder="ユーザー名を入力" maxlength="20" required>
          <small>英数字、ひらがな、カタカナ、漢字が使用できます</small>
        </div>
        
        <div class="form-group">
          <label for="displayName">表示名（任意）</label>
          <input type="text" id="displayName" placeholder="表示名を入力" maxlength="30">
          <small>診断結果に表示される名前です</small>
        </div>
        
        <button onclick="login()" class="login-button">診断を開始</button>
      </div>
      
      <div class="login-footer">
        <p>ユーザー名は診断結果の共有に使用されます</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(loginScreen);
}

// メイン画面を表示
function showMainScreen() {
  // ログイン画面を削除
  const loginScreen = document.getElementById('loginScreen');
  if (loginScreen) {
    loginScreen.remove();
  }
  
  // メインコンテンツを表示
  document.querySelector('.container').style.display = 'block';
  
  // ユーザー情報をヘッダーに表示
  updateUserHeader();
}

// ユーザー情報をヘッダーに表示
function updateUserHeader() {
  if (!currentUser) return;
  
  // ヘッダーにユーザー情報を追加
  let userHeader = document.getElementById('userHeader');
  if (!userHeader) {
    userHeader = document.createElement('div');
    userHeader.id = 'userHeader';
    userHeader.className = 'user-header';
    document.querySelector('.container').insertBefore(userHeader, document.querySelector('.container').firstChild);
  }
  
  userHeader.innerHTML = `
    <div class="user-info">
      <span class="username">${currentUser.display_name || currentUser.username}</span>
      <button onclick="logout()" class="logout-button">
        <i class="fas fa-sign-out-alt"></i> ログアウト
      </button>
    </div>
  `;
}

// ログイン処理
async function login() {
  const username = document.getElementById('username').value.trim();
  const displayName = document.getElementById('displayName').value.trim();
  
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
    const user = await createOrGetUser(username, displayName);
    
    if (user) {
      currentUser = user;
      saveCurrentUser(user);
      showMainScreen();
      
      // 診断履歴を読み込み
      await loadUserDiagnosisHistory();
    } else {
      alert('ログインに失敗しました。もう一度お試しください。');
    }
  } catch (error) {
    console.error('ログインエラー:', error);
    alert('ログインに失敗しました。もう一度お試しください。');
  }
}

// ログアウト処理
function logout() {
  if (confirm('ログアウトしますか？')) {
    currentUser = null;
    localStorage.removeItem(USER_STORAGE_KEY);
    showLoginScreen();
  }
}

// Supabaseでユーザーを作成または取得
async function createOrGetUser(username, displayName) {
  if (!supabase) {
    console.warn('Supabaseクライアントが初期化されていません');
    return null;
  }
  
  try {
    // データベース関数を使用してユーザーを作成または取得
    const { data, error } = await supabase
      .rpc('create_user_if_not_exists', {
        p_username: username,
        p_display_name: displayName || null
      });
    
    if (error) {
      console.error('ユーザー作成エラー:', error);
      return null;
    }
    
    // ユーザー情報を取得
    const { data: userData, error: userError } = await supabase
      .from('users')
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
async function loadUserDiagnosisHistory() {
  if (!currentUser || !supabase) return;
  
  try {
    const { data, error } = await supabase
      .from('diagnosis_history')
      .select('*')
      .eq('username', currentUser.username)
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

// 他のユーザーの公開診断結果を表示
async function showPublicDiagnoses() {
  if (!supabase) return;
  
  try {
    const { data, error } = await supabase
      .from('diagnosis_history')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('公開診断結果の取得に失敗:', error);
      return;
    }
    
    showPublicDiagnosesModal(data || []);
  } catch (error) {
    console.error('公開診断結果の取得中にエラーが発生:', error);
  }
}

// 公開診断結果モーダルを表示
function showPublicDiagnosesModal(diagnoses) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'publicDiagnosesModal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>他のユーザーの診断結果</h2>
      <div class="public-diagnoses-list">
        ${diagnoses.map(diagnosis => `
          <div class="public-diagnosis-item">
            <div class="diagnosis-header">
              <span class="username">${diagnosis.username}</span>
              <span class="date">${new Date(diagnosis.created_at).toLocaleDateString('ja-JP')}</span>
            </div>
            <div class="diagnosis-summary">
              <p><strong>キャリア:</strong> ${diagnosis.carrier || '未回答'}</p>
              <p><strong>料金:</strong> ${diagnosis.price ? diagnosis.price + '円' : '未回答'}</p>
              <p><strong>データ使用量:</strong> ${diagnosis.data_usage || '未回答'}</p>
            </div>
            <button onclick="viewPublicDiagnosis('${diagnosis.share_code}')" class="view-button">詳細を見る</button>
          </div>
        `).join('')}
      </div>
      <button onclick="closePublicDiagnosesModal()" class="close-button">閉じる</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.style.display = 'block';
}

// 公開診断結果モーダルを閉じる
function closePublicDiagnosesModal() {
  const modal = document.getElementById('publicDiagnosesModal');
  if (modal) {
    modal.remove();
  }
}

// 公開診断結果の詳細を表示
function viewPublicDiagnosis(shareCode) {
  closePublicDiagnosesModal();
  window.location.href = `${window.location.pathname}?share=${shareCode}`;
} 