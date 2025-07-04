-- 診断履歴テーブル
CREATE TABLE diagnosis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
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
  
  -- 共有設定
  is_public BOOLEAN DEFAULT false,
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
CREATE INDEX idx_diagnosis_history_created_at ON diagnosis_history(created_at);
CREATE INDEX idx_diagnosis_history_share_code ON diagnosis_history(share_code);
CREATE INDEX idx_family_members_diagnosis_id ON family_members(diagnosis_id);

-- RLS（Row Level Security）の設定
ALTER TABLE diagnosis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- 匿名ユーザーでも読み書き可能なポリシー
CREATE POLICY "Allow anonymous access" ON diagnosis_history
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access" ON family_members
  FOR ALL USING (true); 