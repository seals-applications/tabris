// Supabase設定
// 実際のSupabaseプロジェクトのURLとアノニマスキーを設定してください
const supabaseUrl = 'https://mptcoaicflbluztjmrlt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdGNvYWljZmxibHV6dGptcmx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzM1NzgsImV4cCI6MjA2NzEwOTU3OH0.nAn-39ZX5qgVK96gas_iNuHnjci9A0UWMtmofFKPFgA';

// 開発環境用の設定（実際の値に置き換えてください）
// const supabaseUrl = 'https://your-project.supabase.co';
// const supabaseAnonKey = 'your-anon-key';

// Supabaseクライアントの初期化
let supabase = null;

// Supabaseクライアントを初期化する関数
function initializeSupabase() {
  try {
    // Supabaseライブラリが読み込まれているか確認
    if (typeof window.supabase !== 'undefined') {
      supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
      console.log('Supabaseクライアントが初期化されました');
      return true;
    } else {
      console.warn('Supabaseライブラリが読み込まれていません');
      return false;
    }
  } catch (error) {
    console.error('Supabaseクライアントの初期化に失敗:', error);
    return false;
  }
}

// 診断履歴の保存
async function saveDiagnosisHistory(diagnosisData) {
  if (!supabase) {
    console.warn('Supabaseクライアントが初期化されていません');
    return null;
  }

  try {
    // 共有コードを生成
    const shareCode = generateShareCode();
    
    // 現在のユーザー情報を取得
    const currentSalesUser = JSON.parse(localStorage.getItem('current_sales_user') || '{}');
    
    // お客様情報を取得
    const customerName = document.getElementById('customerName')?.value?.trim() || null;
    const customerPhone = document.getElementById('customerPhone')?.value?.trim() || null;
    const customerEmail = document.getElementById('customerEmail')?.value?.trim() || null;
    
    const { data, error } = await supabase
      .from('diagnosis_history')
      .insert([{
        ...diagnosisData,
        sales_user_id: currentSalesUser.id,
        sales_username: currentSalesUser.username,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        share_code: shareCode,
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('診断履歴の保存に失敗:', error);
      return null;
    }

    console.log('診断履歴が保存されました:', data[0]);
    return data[0];
  } catch (error) {
    console.error('診断履歴の保存中にエラーが発生:', error);
    return null;
  }
}

// 診断履歴の取得
async function getDiagnosisHistory(limit = 50) {
  if (!supabase) {
    console.warn('Supabaseクライアントが初期化されていません');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('diagnosis_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('診断履歴の取得に失敗:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('診断履歴の取得中にエラーが発生:', error);
    return [];
  }
}

// 共有コードで診断履歴を取得
async function getDiagnosisByShareCode(shareCode) {
  if (!supabase) {
    console.warn('Supabaseクライアントが初期化されていません');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('diagnosis_history')
      .select('*')
      .eq('share_code', shareCode)
      .single();

    if (error) {
      console.error('共有コードでの診断履歴取得に失敗:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('共有コードでの診断履歴取得中にエラーが発生:', error);
    return null;
  }
}

// 家族メンバー情報の保存
async function saveFamilyMembers(diagnosisId, familyMembers) {
  if (!supabase) {
    console.warn('Supabaseクライアントが初期化されていません');
    return null;
  }

  try {
    const membersData = familyMembers.map(member => ({
      diagnosis_id: diagnosisId,
      role: member.role,
      carrier: member.carrier,
      price: member.price,
      age: member.age,
      account_holder: member.accountHolder
    }));

    const { data, error } = await supabase
      .from('family_members')
      .insert(membersData);

    if (error) {
      console.error('家族メンバー情報の保存に失敗:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('家族メンバー情報の保存中にエラーが発生:', error);
    return null;
  }
}

// 家族メンバー情報の取得
async function getFamilyMembers(diagnosisId) {
  if (!supabase) {
    console.warn('Supabaseクライアントが初期化されていません');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('diagnosis_id', diagnosisId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('家族メンバー情報の取得に失敗:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('家族メンバー情報の取得中にエラーが発生:', error);
    return [];
  }
}

// 共有コードの生成
function generateShareCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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

// 履歴表示の更新
function updateHistoryDisplay(history) {
  const historyList = document.getElementById('historyList');
  if (!historyList) return;

  if (history.length === 0) {
    historyList.innerHTML = '<p class="no-history">まだ診断履歴がありません</p>';
    return;
  }

  const historyHTML = history.map(item => `
    <div class="history-item" data-id="${item.id}">
      <div class="history-header">
        <span class="history-date">${new Date(item.created_at).toLocaleString('ja-JP')}</span>
        <span class="history-type">${item.diagnosis_type === 'quick' ? '1分診断' : '3分診断'}</span>
      </div>
      <div class="history-content">
        <p><strong>ユーザー:</strong> ${item.sales_username || '不明'}</p>
        <p><strong>お客様:</strong> ${item.customer_name || '未入力'}</p>
        <p><strong>キャリア:</strong> ${item.carrier || '未回答'}</p>
        <p><strong>料金:</strong> ${item.price ? item.price + '円' : '未回答'}</p>
        <p><strong>データ使用量:</strong> ${item.data_usage || '未回答'}</p>
        <p><strong>営業ステータス:</strong> ${getSalesStatusText(item.sales_status)}</p>
      </div>
      <div class="history-actions">
        <button onclick="viewHistoryDetail('${item.id}')" class="view-button">詳細を見る</button>
        <button onclick="deleteHistory('${item.id}')" class="delete-button">削除</button>
      </div>
    </div>
  `).join('');

  historyList.innerHTML = historyHTML;
}

// ページ読み込み時にSupabaseを初期化
document.addEventListener('DOMContentLoaded', function() {
  initializeSupabase();
});

// 定期的な同期（5分ごと）- Supabaseが利用可能な場合のみ
setInterval(async () => {
  if (supabase) {
    const history = await getDiagnosisHistory();
    updateHistoryDisplay(history);
  }
}, 5 * 60 * 1000); 