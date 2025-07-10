-- usersテーブルの作成（存在しない場合）
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  site_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 既存のテーブルに現場IDフィールドを追加
ALTER TABLE diagnosis_history 
ADD COLUMN IF NOT EXISTS site_id TEXT;

-- 現場IDベースのインデックスを追加
CREATE INDEX IF NOT EXISTS idx_diagnosis_history_site_id ON diagnosis_history(site_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_history_sales_username ON diagnosis_history(sales_username);

-- usersテーブルにsite_idフィールドを追加（存在しない場合）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS site_id TEXT;

-- 現場ID対応のユーザー作成関数
CREATE OR REPLACE FUNCTION create_user_if_not_exists(
  p_username TEXT,
  p_display_name TEXT DEFAULT NULL,
  p_site_id TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- ユーザーが存在するかチェック
  SELECT * INTO user_record FROM users WHERE username = p_username;
  
  IF user_record IS NULL THEN
    -- 新しいユーザーを作成
    INSERT INTO users (username, display_name, site_id, created_at)
    VALUES (p_username, p_display_name, p_site_id, NOW())
    RETURNING * INTO user_record;
  ELSE
    -- 既存ユーザーの現場IDを更新
    UPDATE users 
    SET site_id = COALESCE(p_site_id, site_id),
        display_name = COALESCE(p_display_name, display_name),
        updated_at = NOW()
    WHERE username = p_username
    RETURNING * INTO user_record;
  END IF;
  
  RETURN json_build_object(
    'id', user_record.id,
    'username', user_record.username,
    'display_name', user_record.display_name,
    'site_id', user_record.site_id,
    'created_at', user_record.created_at,
    'updated_at', user_record.updated_at
  );
END;
$$ LANGUAGE plpgsql;

-- 既存のデータに対して現場IDを設定（必要に応じて）
-- UPDATE diagnosis_history SET site_id = 'default' WHERE site_id IS NULL; 