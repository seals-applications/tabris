-- 既存のテーブルを削除（注意：データが失われます）
DROP TABLE IF EXISTS family_members;
DROP TABLE IF EXISTS diagnosis_history;

-- 営業マンテーブル
CREATE TABLE sales_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 基本情報
  username TEXT UNIQUE NOT NULL, -- 営業マンのユーザー名
  display_name TEXT, -- 営業マンの表示名
  employee_id TEXT, -- 社員番号（将来的に使用）
  
  -- 将来的な認証用フィールド（現在は未使用）
  email TEXT,
  password_hash TEXT,
  auth_provider TEXT, -- 'local', 'google', 'github', etc.
  
  -- メタデータ
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  -- 統計情報
  total_diagnoses INTEGER DEFAULT 0,
  last_diagnosis_at TIMESTAMP WITH TIME ZONE
);

-- 診断履歴テーブル（営業マンとお客様の情報を分離）
CREATE TABLE diagnosis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 営業マン情報
  sales_user_id UUID REFERENCES sales_users(id) ON DELETE CASCADE,
  sales_username TEXT NOT NULL, -- 営業マンのユーザー名
  
  -- お客様情報
  customer_name TEXT, -- お客様の名前（任意）
  customer_phone TEXT, -- お客様の電話番号（任意）
  customer_email TEXT, -- お客様のメールアドレス（任意）
  
  -- 基本情報
  diagnosis_type TEXT NOT NULL, -- 'quick' or 'detailed'
  
  -- 回答データ
  carrier TEXT,
  wifi TEXT,
  price INTEGER,
  data_usage TEXT,
  members INTEGER,
  satisfaction INTEGER,
  
  -- 詳細診断用
  call_time TEXT,
  location TEXT,
  apps TEXT[], -- 配列として保存
  contract TEXT,
  payment TEXT,
  
  -- 結果
  recommended_plans JSONB,
  cashback_amount INTEGER,
  additional_info TEXT[], -- 追加情報を配列として保存
  
  -- 営業情報
  sales_status TEXT DEFAULT 'new', -- 'new', 'contacted', 'proposal', 'closed', 'lost'
  sales_notes TEXT, -- 営業メモ
  follow_up_date DATE, -- フォローアップ予定日
  
  -- 共有設定
  is_public BOOLEAN DEFAULT false, -- デフォルトで非公開
  share_code TEXT UNIQUE,
  
  -- メタデータ
  user_agent TEXT,
  ip_address INET
);

-- 家族情報テーブル（詳細診断用）
CREATE TABLE family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnosis_id UUID REFERENCES diagnosis_history(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  role TEXT NOT NULL, -- '父', '母', '長男', etc.
  carrier TEXT,
  price INTEGER,
  age INTEGER,
  account_holder TEXT
);

-- インデックス
CREATE INDEX idx_sales_users_username ON sales_users(username);
CREATE INDEX idx_sales_users_created_at ON sales_users(created_at);
CREATE INDEX idx_diagnosis_history_sales_user_id ON diagnosis_history(sales_user_id);
CREATE INDEX idx_diagnosis_history_sales_username ON diagnosis_history(sales_username);
CREATE INDEX idx_diagnosis_history_customer_name ON diagnosis_history(customer_name);
CREATE INDEX idx_diagnosis_history_created_at ON diagnosis_history(created_at);
CREATE INDEX idx_diagnosis_history_share_code ON diagnosis_history(share_code);
CREATE INDEX idx_diagnosis_history_sales_status ON diagnosis_history(sales_status);
CREATE INDEX idx_family_members_diagnosis_id ON family_members(diagnosis_id);

-- RLS（Row Level Security）の設定
ALTER TABLE sales_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- 匿名ユーザーでも読み書き可能なポリシー
CREATE POLICY "Allow anonymous access to sales_users" ON sales_users
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to diagnosis_history" ON diagnosis_history
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to family_members" ON family_members
  FOR ALL USING (true);

-- 営業マン作成用の関数
CREATE OR REPLACE FUNCTION create_sales_user_if_not_exists(p_username TEXT, p_display_name TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 営業マンが存在するかチェック
  SELECT id INTO v_user_id FROM sales_users WHERE username = p_username;
  
  -- 存在しない場合は作成
  IF v_user_id IS NULL THEN
    INSERT INTO sales_users (username, display_name)
    VALUES (p_username, COALESCE(p_display_name, p_username))
    RETURNING id INTO v_user_id;
  END IF;
  
  -- 最終ログイン時間を更新
  UPDATE sales_users SET last_login = NOW() WHERE id = v_user_id;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql; 