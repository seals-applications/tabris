// ユーザー管理機能
let currentSalesUser = null;

// フィルター条件を管理
let currentFilters = {
  dateFilter: 'today',
  startDate: null,
  endDate: null,
  user: ''
};

// ローカルストレージのキー
const SALES_USER_STORAGE_KEY = 'current_sales_user';

// 絞り込み機能
let allDiagnoses = []; // 全データを保持
let currentFilter = 'today'; // 現在のフィルター

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
      window.currentSalesUser = currentSalesUser; // グローバルに設定
      console.log('ユーザー情報復元: currentSalesUser =', currentSalesUser);
    } catch (error) {
      console.error('ユーザー情報の読み込みに失敗:', error);
      currentSalesUser = null;
      window.currentSalesUser = null;
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
        <h2>キャリアアンケートツール</h2>
      </div>
      
      <div class="login-form">
        <div class="form-group">
          <label for="salesUsername">ユーザー名</label>
          <input type="text" id="salesUsername" placeholder="ユーザー名を入力" maxlength="20" required>
        </div>
        <div class="form-group">
          <label for="siteId">現場ID</label>
          <input type="text" id="siteId" placeholder="現場IDを入力" maxlength="20" required>
        </div>
        <p class="username-note">ユーザー名と現場IDはほかの人と重複しないように入力してください</p>
        
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
  
  // ユーザー情報の表示を無効化
  // ヘッダーにユーザー情報を追加
  let userHeader = document.getElementById('salesUserHeader');
  if (userHeader) {
    userHeader.remove();
  }
}

// ユーザーログイン処理
async function salesLogin() {
  const username = document.getElementById('salesUsername').value.trim();
  const siteId = document.getElementById('siteId').value.trim();
  
  // バリデーション
  if (!username) {
    alert('ユーザー名を入力してください');
    return;
  }
  
  if (!siteId) {
    alert('現場IDを入力してください');
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
  
  if (siteId.length < 2) {
    alert('現場IDは2文字以上で入力してください');
    return;
  }
  
  if (siteId.length > 20) {
    alert('現場IDは20文字以内で入力してください');
    return;
  }
  
  // ユーザー名と現場IDの形式チェック
  const usernameRegex = /^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/;
  if (!usernameRegex.test(username)) {
    alert('ユーザー名には英数字、ひらがな、カタカナ、漢字のみ使用できます');
    return;
  }
  
  if (!usernameRegex.test(siteId)) {
    alert('現場IDには英数字、ひらがな、カタカナ、漢字のみ使用できます');
    return;
  }
  
  try {
    // Supabaseでユーザーを作成または取得
    const user = await createOrGetSalesUser(username, username, siteId);
    
    if (user) {
      currentSalesUser = user;
      window.currentSalesUser = user; // グローバルに設定
      saveCurrentSalesUser(user);
      console.log('ログイン成功: currentSalesUser =', user);
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
    window.currentSalesUser = null; // グローバル変数もクリア
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
async function createOrGetSalesUser(username, displayName, siteId) {
  if (!supabase) {
    console.warn('Supabaseクライアントが初期化されていません');
    return null;
  }
  
  try {
    // データベース関数を使用してユーザーを作成または取得
    const { data, error } = await supabase
      .rpc('create_user_if_not_exists', {
        p_username: username,
        p_display_name: displayName || null,
        p_site_id: siteId
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
async function loadSalesUserDiagnosisHistory() {
  if (!currentSalesUser || !supabase) return;
  
  try {
    const { data, error } = await supabase
      .from('diagnosis_history')
      .select('*')
      .eq('sales_username', currentSalesUser.username)
      .eq('site_id', currentSalesUser.site_id)
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
  console.log('showOtherSalesDiagnoses が呼ばれました');
  if (!supabase) return;
  
  try {
    // 初期表示は個人の診断結果
    console.log('showPersonalDiagnoses を呼び出します（初期表示）');
    await showPersonalDiagnoses();
  } catch (error) {
    console.error('診断結果の取得中にエラーが発生:', error);
  }
}

// 個人の診断結果を表示
async function showPersonalDiagnoses() {
  console.log('showPersonalDiagnoses が呼ばれました');
  if (!currentSalesUser || !supabase) {
    console.log('currentSalesUser または supabase が利用できません');
    return;
  }
  
  console.log('currentSalesUser:', currentSalesUser.username);
  
  try {
    const { data, error } = await supabase
      .from('diagnosis_history')
      .select('*')
      .eq('sales_username', currentSalesUser.username)
      .eq('site_id', currentSalesUser.site_id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('個人の診断結果の取得に失敗:', error);
      return;
    }
    
    showDiagnosesModal(data || [], 'personal');
  } catch (error) {
    console.error('個人の診断結果の取得中にエラーが発生:', error);
  }
}

// 全ユーザーの診断結果を表示
async function showAllUsersDiagnoses() {
  console.log('showAllUsersDiagnoses が呼ばれました');
  if (!currentSalesUser || !supabase) {
    console.log('currentSalesUser または supabase が利用できません');
    return;
  }
  
  console.log('Supabaseクライアントは利用可能です');
  
  try {
    console.log('全ユーザーの診断結果を取得中...');
    const { data, error } = await supabase
      .from('diagnosis_history')
      .select('*')
      .eq('site_id', currentSalesUser.site_id)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('全ユーザーの診断結果の取得に失敗:', error);
      return;
    }
    
    console.log('取得したデータ:', data);
    console.log('データ件数:', data ? data.length : 0);
    showDiagnosesModal(data || [], 'all');
  } catch (error) {
    console.error('全ユーザーの診断結果の取得中にエラーが発生:', error);
  }
}

// 診断結果モーダルを表示（切り替え機能付き）
function showDiagnosesModal(diagnoses, viewType) {
  console.log('showDiagnosesModal が呼ばれました - viewType:', viewType, 'データ件数:', diagnoses.length);
  
  // 全データを保持
  allDiagnoses = [...diagnoses];
  
  // 既存のモーダルがあれば削除
  const existingModal = document.getElementById('diagnosesModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // 件数表示用のテキストを生成
  const countText = viewType === 'personal' ? 
    `${currentSalesUser ? currentSalesUser.username : '個人'}の結果 (${diagnoses.length}件)` : 
    `全ユーザーの結果 (${diagnoses.length}件)`;
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'diagnosesModal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <button onclick="closeDiagnosesModal()" class="close-button">閉じる</button>
        <h2>診断結果一覧</h2>
      </div>
      <div class="view-toggle">
        <button id="personalToggleBtn" class="toggle-button ${viewType === 'personal' ? 'active' : ''}">個人の結果</button>
        <button id="allUsersToggleBtn" class="toggle-button ${viewType === 'all' ? 'active' : ''}">全ユーザーの結果</button>
      </div>
      <div class="filter-section">
        <div class="filter-header">
          <button id="filterToggleBtn" class="filter-toggle-button" onclick="toggleFilterPanel()">
            <i class="fas fa-filter"></i> 絞り込み
          </button>
        </div>
        <div id="filterPanel" class="filter-panel" style="display: none;">
          <div class="filter-group">
            <h4>期間絞り込み</h4>
            <div class="filter-buttons">
              <button id="filterToday" class="filter-button active" onclick="filterByDate('today')">今日</button>
              <button id="filterThisMonth" class="filter-button" onclick="filterByDate('thisMonth')">今月</button>
              <button id="filterCustom" class="filter-button" onclick="showCustomDateFilter()">期間指定</button>
              <button id="filterAll" class="filter-button" onclick="filterByDate('all')">すべて</button>
            </div>
            <div id="customDateFilter" class="custom-date-filter" style="display: none;">
              <div class="date-inputs">
                <div class="date-input">
                  <label for="startDate">開始日:</label>
                  <input type="date" id="startDate">
                </div>
                <div class="date-input">
                  <label for="endDate">終了日:</label>
                  <input type="date" id="endDate">
                </div>
              </div>
              <button onclick="applyCustomDateFilter()" class="apply-filter-button">適用</button>
            </div>
          </div>
          ${viewType === 'all' ? `
          <div class="filter-group">
            <h4>ユーザー絞り込み</h4>
            <div class="user-filter">
              <select id="userFilter" onchange="filterByUser()">
                <option value="">すべてのユーザー</option>
              </select>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
      <div class="diagnoses-count">
        <p class="count-text">${countText}</p>
      </div>
      <div class="sales-diagnoses-list">
        ${diagnoses.length > 0 ? diagnoses.map(diagnosis => `
          <div class="sales-diagnosis-item">
            <div class="diagnosis-header">
              <span class="sales-username">ユーザー: ${diagnosis.sales_username}</span>
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
        `).join('') : '<p class="no-results">診断結果がありません</p>'}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.style.display = 'block';
  
  // イベントリスナーを追加
  const personalBtn = modal.querySelector('#personalToggleBtn');
  const allUsersBtn = modal.querySelector('#allUsersToggleBtn');
  
  personalBtn.addEventListener('click', async () => {
    console.log('個人の結果ボタンがクリックされました');
    await switchToPersonalView();
  });
  
  allUsersBtn.addEventListener('click', async () => {
    console.log('全ユーザーの結果ボタンがクリックされました');
    await switchToAllUsersView();
  });
  
  // 初期フィルターを適用
  filterByDate('today');
  
  console.log('モーダルが表示されました - viewType:', viewType);
  
  // 全ユーザー表示の場合はユーザーリストを取得
  if (viewType === 'all') {
    loadUserList();
  }
}

// 個人の結果表示に切り替え
async function switchToPersonalView() {
  console.log('switchToPersonalView が呼ばれました');
  try {
    console.log('showPersonalDiagnoses を呼び出します');
    await showPersonalDiagnoses();
    console.log('showPersonalDiagnoses の実行が完了しました');
  } catch (error) {
    console.error('switchToPersonalView でエラーが発生:', error);
  }
}

// 全ユーザーの結果表示に切り替え
async function switchToAllUsersView() {
  console.log('switchToAllUsersView が呼ばれました');
  try {
    console.log('showAllUsersDiagnoses を呼び出します');
    await showAllUsersDiagnoses();
    console.log('showAllUsersDiagnoses の実行が完了しました');
  } catch (error) {
    console.error('switchToAllUsersView でエラーが発生:', error);
  }
}

// 絞り込みパネルの表示・非表示を切り替え
function toggleFilterPanel() {
  const filterPanel = document.getElementById('filterPanel');
  const filterToggleBtn = document.getElementById('filterToggleBtn');
  
  if (filterPanel.style.display === 'none') {
    filterPanel.style.display = 'block';
    filterToggleBtn.classList.add('active');
  } else {
    filterPanel.style.display = 'none';
    filterToggleBtn.classList.remove('active');
  }
}

// ユーザーリストを読み込み
async function loadUserList() {
  if (!supabase) return;
  
  try {
    const { data, error } = await supabase
      .from('diagnosis_history')
      .select('sales_username')
      .eq('site_id', currentSalesUser.site_id)
      .not('sales_username', 'is', null);
    
    if (error) {
      console.error('ユーザーリストの取得に失敗:', error);
      return;
    }
    
    // 重複を除去してユーザーリストを作成
    const uniqueUsers = [...new Set(data.map(item => item.sales_username))];
    const userFilter = document.getElementById('userFilter');
    
    if (userFilter) {
      // 既存のオプションをクリア（最初の「すべてのユーザー」は残す）
      userFilter.innerHTML = '<option value="">すべてのユーザー</option>';
      
      // ユーザーオプションを追加
      uniqueUsers.forEach(username => {
        const option = document.createElement('option');
        option.value = username;
        option.textContent = username;
        userFilter.appendChild(option);
      });
    }
  } catch (error) {
    console.error('ユーザーリストの取得中にエラーが発生:', error);
  }
}

// ユーザーで絞り込み
function filterByUser() {
  const userFilter = document.getElementById('userFilter');
  const selectedUser = userFilter ? userFilter.value : '';
  
  console.log('ユーザー絞り込み:', selectedUser);
  
  // 現在のフィルター条件を更新
  currentFilters.user = selectedUser;
  
  // フィルターを適用
  applyCurrentFilters();
}

// 現在のフィルター条件を適用
function applyCurrentFilters() {
  let filteredData = [...allDiagnoses];
  
  // 期間フィルター
  if (currentFilters.dateFilter && currentFilters.dateFilter !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    filteredData = filteredData.filter(diagnosis => {
      const diagnosisDate = new Date(diagnosis.created_at);
      
      switch (currentFilters.dateFilter) {
        case 'today':
          return diagnosisDate >= today;
        case 'thisMonth':
          return diagnosisDate >= thisMonth;
        case 'custom':
          if (currentFilters.startDate && currentFilters.endDate) {
            const start = new Date(currentFilters.startDate);
            const end = new Date(currentFilters.endDate);
            end.setHours(23, 59, 59, 999);
            return diagnosisDate >= start && diagnosisDate <= end;
          }
          return true;
        default:
          return true;
      }
    });
  }
  
  // ユーザーフィルター
  if (currentFilters.user) {
    filteredData = filteredData.filter(diagnosis => 
      diagnosis.sales_username === currentFilters.user
    );
  }
  
  // 結果を表示
  updateDiagnosesList(filteredData);
}

// 診断結果モーダルを閉じる
function closeDiagnosesModal() {
  const modal = document.getElementById('diagnosesModal');
  if (modal) {
    modal.remove();
  }
}

// 他のユーザーの診断結果モーダルを表示（後方互換性のため残す）
function showOtherSalesDiagnosesModal(diagnoses) {
  showDiagnosesModal(diagnoses, 'all');
}

// 他のユーザーの診断結果モーダルを閉じる（後方互換性のため残す）
function closeOtherSalesDiagnosesModal() {
  closeDiagnosesModal();
}

// 営業ステータスのテキストを取得
function getSalesStatusText(status) {
  const statusMap = {
    'closed': '成約',
    'lost': '失注',
    'prospect_with_info': '見込み（お客様情報あり）',
    'prospect_without_info': '見込み（お客様情報なし）',
    'not_updated': '未更新'
  };
  return statusMap[status] || status;
}

// ユーザーの診断結果の詳細を表示
async function viewSalesDiagnosis(shareCode) {
  try {
    console.log('診断結果の詳細を取得中... shareCode:', shareCode);
    
    // Supabaseから診断結果の詳細を取得
    const { data, error } = await supabase
      .from('diagnosis_history')
      .select('*')
      .eq('share_code', shareCode)
      .single();
    
    if (error) {
      console.error('診断結果の詳細取得に失敗:', error);
      alert('診断結果の詳細を取得できませんでした');
      return;
    }
    
    if (!data) {
      alert('診断結果が見つかりませんでした');
      return;
    }
    
    console.log('取得した診断結果:', data);
    showDiagnosisDetailModal(data);
    
  } catch (error) {
    console.error('診断結果の詳細取得中にエラーが発生:', error);
    alert('診断結果の詳細を取得できませんでした');
  }
}

// 推奨プランを整形
function formatRecommendedPlans(recommendedPlans) {
  console.log('推奨プランデータ:', recommendedPlans);
  console.log('推奨プランデータの型:', typeof recommendedPlans);
  
  if (!recommendedPlans) {
    return '未算出';
  }
  
  try {
    // JSON文字列の場合はパース
    const plans = typeof recommendedPlans === 'string' ? JSON.parse(recommendedPlans) : recommendedPlans;
    console.log('パース後のプランデータ:', plans);
    
    if (Array.isArray(plans)) {
      const planDetails = plans.map((plan, index) => {
        if (typeof plan === 'object') {
          // プランの詳細情報を構築
          const planInfo = [];
          if (plan.data) planInfo.push(`データ容量: ${plan.data}`);
          if (plan.price) planInfo.push(`月額料金: ${plan.price}`);
          
          if (planInfo.length > 0) {
            return planInfo.join('<br>');
          } else {
            return `プラン${index + 1}`;
          }
        } else {
          return String(plan);
        }
      });
      return planDetails.join(' | ');
    } else if (typeof plans === 'object') {
      // 単一オブジェクトの場合
      const planInfo = [];
      if (plans.data) planInfo.push(`データ容量: ${plans.data}`);
      if (plans.price) planInfo.push(`月額料金: ${plans.price}`);
      
      return planInfo.length > 0 ? planInfo.join('<br>') : '推奨プランあり';
    } else {
      return String(plans);
    }
  } catch (error) {
    console.error('推奨プランのパースに失敗:', error);
    console.error('元のデータ:', recommendedPlans);
    return '推奨プランあり';
  }
}

// 診断結果詳細モーダルを表示
async function showDiagnosisDetailModal(diagnosis) {
  // 既存の詳細モーダルがあれば削除
  const existingModal = document.getElementById('diagnosisDetailModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // 家族メンバー情報を取得
  let familyMembers = [];
  try {
    const { data: familyData, error: familyError } = await supabase
      .from('family_members')
      .select('*')
      .eq('diagnosis_id', diagnosis.id)
      .order('created_at', { ascending: true });
    
    if (!familyError && familyData) {
      familyMembers = familyData;
    }
  } catch (error) {
    console.error('家族メンバー情報の取得に失敗:', error);
  }
  
  // 回答内容を整形
  const formattedAnswers = formatAnswers(diagnosis, diagnosis.carrier);
  
  // 家族メンバー情報を整形
  const formattedFamilyMembers = formatFamilyMembers(familyMembers);
  
  // 推奨プランを整形
  const formattedRecommendedPlans = formatRecommendedPlans(diagnosis.recommended_plans);
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'diagnosisDetailModal';
  modal.innerHTML = `
    <div class="modal-content diagnosis-detail-content">
      <div class="modal-header">
        <h2>診断結果詳細</h2>
        <button onclick="closeDiagnosisDetailModal()" class="close-button">&times;</button>
      </div>
      <div class="diagnosis-detail-body">
        <div class="diagnosis-info">
          <h3>基本情報</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>ユーザー名:</label>
              <span>${diagnosis.sales_username || '未設定'}</span>
            </div>
            <div class="info-item">
              <label>診断日時:</label>
              <span>${new Date(diagnosis.created_at).toLocaleString('ja-JP')}</span>
            </div>
            <div class="info-item">
              <label>キャリア:</label>
              <span>${diagnosis.carrier || '未回答'}</span>
            </div>
            <div class="info-item">
              <label>営業ステータス:</label>
              <span>${getSalesStatusText(diagnosis.sales_status)}</span>
            </div>
          </div>
        </div>
        
        <div class="diagnosis-answers">
          <h3>アンケート回答</h3>
          <div class="info-grid">
            ${formattedAnswers}
          </div>
        </div>
        
        ${familyMembers.length > 0 ? `
        <div class="diagnosis-family">
          <h3>家族構成</h3>
          <div class="family-list">
            ${formattedFamilyMembers}
          </div>
        </div>
        ` : ''}
        
        <div class="diagnosis-results">
          <h3>診断結果</h3>
          <div class="results-grid">
            <div class="result-item">
              <label>推奨料金:</label>
              <span>${diagnosis.price ? diagnosis.price + '円' : '未算出'}</span>
            </div>
            <div class="result-item">
              <label>データ使用量:</label>
              <span>${diagnosis.data_usage || '未回答'}</span>
            </div>
            <div class="result-item">
              <label>推奨プラン:</label>
              <span>${formattedRecommendedPlans}</span>
            </div>
            <div class="result-item">
              <label>キャッシュバック:</label>
              <span>${diagnosis.cashback_amount ? diagnosis.cashback_amount + '円' : 'なし'}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button onclick="closeDiagnosisDetailModal()" class="close-button">閉じる</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.style.display = 'block';
}

// 家族メンバー情報を整形
function formatFamilyMembers(familyMembers) {
  if (!familyMembers || familyMembers.length === 0) {
    return '<p class="no-family">家族情報がありません</p>';
  }
  
  return familyMembers.map(member => `
    <div class="family-member-item">
      <div class="member-info">
        <div class="member-role">${member.role}</div>
        <div class="member-details">
          <div class="member-detail">
            <label>キャリア:</label>
            <span>${member.carrier || '未設定'}</span>
          </div>
          <div class="member-detail">
            <label>料金:</label>
            <span>${member.price ? member.price + '円' : '未設定'}</span>
          </div>
          <div class="member-detail">
            <label>年齢:</label>
            <span>${member.age ? member.age + '歳' : '未設定'}</span>
          </div>
          <div class="member-detail">
            <label>契約者:</label>
            <span>${member.account_holder || '未設定'}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// 診断結果詳細モーダルを閉じる
function closeDiagnosisDetailModal() {
  const modal = document.getElementById('diagnosisDetailModal');
  if (modal) {
    modal.remove();
  }
}

// 回答内容を整形
function formatAnswers(diagnosis, carrier) {
  // データベースの実際のカラムから回答データを構築
  const answers = {
    carrier: diagnosis.carrier,
    wifi: diagnosis.wifi,
    price: diagnosis.price,
    data_usage: diagnosis.data_usage,
    members: diagnosis.members,
    satisfaction: diagnosis.satisfaction,
    call_time: diagnosis.call_time,
    location: diagnosis.location,
    apps: diagnosis.apps,
    contract: diagnosis.contract,
    payment: diagnosis.payment
  };
  
  // 空の値を除外
  const filteredAnswers = {};
  for (const [key, value] of Object.entries(answers)) {
    if (value !== null && value !== undefined && value !== '') {
      filteredAnswers[key] = value;
    }
  }
  
  if (Object.keys(filteredAnswers).length === 0) {
    return '<p class="no-answers">回答データがありません</p>';
  }
  
  // 診断結果画面と同じラベルとフォーマット
  const questionLabels = {
    'carrier': 'キャリア',
    'wifi': 'ネット回線',
    'price': '料金プラン',
    'data_usage': 'データ使用量',
    'members': '家族人数',
    'satisfaction': '満足度',
    'call_time': '平均通話時間',
    'location': '利用場所',
    'apps': '使用アプリ',
    'contract': '契約期間',
    'payment': '端末支払方法'
  };
  
  const carrierLabels = {
    'docomo': 'ドコモ',
    'au': 'au',
    'softbank': 'SoftBank'
  };
  
  let formattedHtml = '';
  
  for (const [key, value] of Object.entries(filteredAnswers)) {
    let label = questionLabels[key] || key;
    let displayValue = value;
    
    // 値の表示を整形（診断結果画面と同じフォーマット）
    switch (key) {
      case 'carrier':
        displayValue = carrierLabels[value] || value;
        break;
      case 'price':
        displayValue = value + '円/月';
        break;
      case 'data_usage':
        displayValue = value;
        break;
      case 'call_time':
        displayValue = value;
        break;
      case 'members':
        displayValue = value + '人';
        break;
      case 'satisfaction':
        displayValue = value + '%';
        break;
      case 'apps':
        if (Array.isArray(value)) {
          displayValue = value.join(', ');
        } else if (typeof value === 'string') {
          displayValue = value;
        }
        break;
      case 'wifi':
        displayValue = value;
        break;
      case 'location':
        displayValue = value;
        break;
      case 'contract':
        displayValue = value;
        break;
      case 'payment':
        displayValue = value;
        break;
    }
    
    formattedHtml += `
      <div class="info-item">
        <label>${label}</label>
        <span>${displayValue}</span>
      </div>
    `;
  }
  
  return formattedHtml || '<p class="no-answers">回答データがありません</p>';
}

// 営業ステータスを編集
async function editSalesStatus(diagnosisId) {
  // ステータス編集モーダルを表示
  showStatusEditModal(diagnosisId);
}

// ステータス編集モーダルを表示
function showStatusEditModal(diagnosisId) {
  // 既存のモーダルがあれば削除
  const existingModal = document.getElementById('statusEditModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.className = 'menu-modal';
  modal.id = 'statusEditModal';
  modal.innerHTML = `
    <div class="menu-content">
      <div class="menu-header">
        <h3>営業ステータス編集</h3>
        <button onclick="closeStatusEditModal()" class="menu-close-button">×</button>
      </div>
      <div class="status-edit-form">
        <div class="status-options">
          <button class="status-option" data-status="closed" onclick="selectStatus('closed', '${diagnosisId}')">
            <span class="status-text">成約</span>
          </button>
          <button class="status-option" data-status="lost" onclick="selectStatus('lost', '${diagnosisId}')">
            <span class="status-text">失注</span>
          </button>
          <button class="status-option" data-status="prospect_with_info" onclick="selectStatus('prospect_with_info', '${diagnosisId}')">
            <span class="status-text">見込み（お客様情報あり）</span>
          </button>
          <button class="status-option" data-status="prospect_without_info" onclick="selectStatus('prospect_without_info', '${diagnosisId}')">
            <span class="status-text">見込み（お客様情報なし）</span>
          </button>
          <button class="status-option" data-status="not_updated" onclick="selectStatus('not_updated', '${diagnosisId}')">
            <span class="status-text">未更新</span>
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.style.display = 'block';
}

// ステータスを選択
async function selectStatus(status, diagnosisId) {
  try {
    const { error } = await supabase
      .from('diagnosis_history')
      .update({ sales_status: status })
      .eq('id', diagnosisId);
    
    if (error) {
      console.error('ステータス更新エラー:', error);
      alert('ステータスの更新に失敗しました');
    } else {
      // モーダルを閉じる
      closeStatusEditModal();
      // 診断結果一覧を再読み込み
      closeDiagnosesModal();
      showOtherSalesDiagnoses();
    }
  } catch (error) {
    console.error('ステータス更新中にエラーが発生:', error);
    alert('ステータスの更新に失敗しました');
  }
}

// ステータス編集モーダルを閉じる
function closeStatusEditModal() {
  const modal = document.getElementById('statusEditModal');
  if (modal) {
    modal.remove();
  }
}



// 日付で絞り込み
function filterByDate(filterType) {
  console.log('filterByDate が呼ばれました - filterType:', filterType);
  
  // フィルターボタンのアクティブ状態を更新
  document.querySelectorAll('.filter-button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`filter${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`).classList.add('active');
  
  // カスタム日付フィルターを非表示
  document.getElementById('customDateFilter').style.display = 'none';
  
  // フィルター条件を更新
  currentFilters.dateFilter = filterType;
  currentFilters.startDate = null;
  currentFilters.endDate = null;
  
  // 絞り込みを実行
  applyCurrentFilters();
}

// カスタム日付フィルターを表示
function showCustomDateFilter() {
  // フィルターボタンのアクティブ状態を更新
  document.querySelectorAll('.filter-button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById('filterCustom').classList.add('active');
  
  // カスタム日付フィルターを表示
  document.getElementById('customDateFilter').style.display = 'block';
  
  // 今日の日付をデフォルトに設定
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('startDate').value = today;
  document.getElementById('endDate').value = today;
  
  // フィルター条件を更新
  currentFilters.dateFilter = 'custom';
}

// カスタム日付フィルターを適用
function applyCustomDateFilter() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  
  if (!startDate || !endDate) {
    alert('開始日と終了日を入力してください');
    return;
  }
  
  if (startDate > endDate) {
    alert('開始日は終了日より前の日付を選択してください');
    return;
  }
  
  // フィルター条件を更新
  currentFilters.startDate = startDate;
  currentFilters.endDate = endDate;
  
  // フィルターを適用
  applyCurrentFilters();
}

// フィルターを適用
function applyFilter(startDate = null, endDate = null) {
  let filteredDiagnoses = [...allDiagnoses];
  
  switch (currentFilter) {
    case 'today':
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      filteredDiagnoses = allDiagnoses.filter(diagnosis => {
        const diagnosisDate = new Date(diagnosis.created_at).toISOString().split('T')[0];
        return diagnosisDate === todayStr;
      });
      break;
      
    case 'thisMonth':
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      filteredDiagnoses = allDiagnoses.filter(diagnosis => {
        const diagnosisDate = new Date(diagnosis.created_at);
        return diagnosisDate >= startOfMonth && diagnosisDate <= endOfMonth;
      });
      break;
      
    case 'custom':
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59); // 終了日は23:59:59まで
        filteredDiagnoses = allDiagnoses.filter(diagnosis => {
          const diagnosisDate = new Date(diagnosis.created_at);
          return diagnosisDate >= start && diagnosisDate <= end;
        });
      }
      break;
      
    case 'all':
    default:
      // すべて表示（フィルターなし）
      break;
  }
  
  // 絞り込み結果を表示
  updateDiagnosesList(filteredDiagnoses);
}

// 診断結果リストを更新
function updateDiagnosesList(diagnoses) {
  const listContainer = document.querySelector('.sales-diagnoses-list');
  if (!listContainer) return;
  
  const countText = document.querySelector('.count-text');
  if (countText) {
    countText.textContent = `表示中: ${diagnoses.length}件`;
  }
  
  if (diagnoses.length > 0) {
    listContainer.innerHTML = diagnoses.map(diagnosis => `
      <div class="sales-diagnosis-item">
        <div class="diagnosis-header">
          <span class="sales-username">ユーザー: ${diagnosis.sales_username}</span>
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
    `).join('');
  } else {
    listContainer.innerHTML = '<p class="no-results">該当する診断結果がありません</p>';
  }
}