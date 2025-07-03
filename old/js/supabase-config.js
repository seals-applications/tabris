// Supabase設定
// 実際のSupabaseプロジェクトのURLとアノニマスキーを設定してください
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

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

// 商談データの保存
async function saveMeetingData(meetingData) {
  if (!supabase) {
    console.warn('Supabaseクライアントが初期化されていません');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('sales_meetings')
      .insert([meetingData]);

    if (error) {
      console.error('データの保存に失敗:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('データの保存中にエラーが発生:', error);
    return null;
  }
}

// 商談履歴の取得
async function getMeetingHistory() {
  if (!supabase) {
    console.warn('Supabaseクライアントが初期化されていません');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('sales_meetings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('履歴の取得に失敗:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('履歴の取得中にエラーが発生:', error);
    return [];
  }
}

// 履歴表示の更新
function updateHistoryDisplay(history) {
  // 履歴表示の更新処理
  console.log('履歴が更新されました:', history);
}

// ページ読み込み時にSupabaseを初期化
document.addEventListener('DOMContentLoaded', function() {
  initializeSupabase();
});

// 定期的な同期（1分ごと）- Supabaseが利用可能な場合のみ
setInterval(async () => {
  if (supabase) {
    const history = await getMeetingHistory();
    updateHistoryDisplay(history);
  }
}, 60 * 1000); 