import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:G,TN_2-+j!LW&.k@jsnjwzvzjfkmzcjdvdsc.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const sql = `
-- TABEL SOAL (per question set)
CREATE TABLE IF NOT EXISTS question_sets (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  set_name TEXT NOT NULL REFERENCES question_sets(name) ON DELETE CASCADE,
  question_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_set_name ON questions(set_name);

-- TABEL ROOMS
CREATE TABLE IF NOT EXISTS rooms (
  id BIGSERIAL PRIMARY KEY,
  room_id TEXT NOT NULL UNIQUE,
  question_set TEXT NOT NULL REFERENCES question_sets(name) ON DELETE CASCADE,
  current_problem INT DEFAULT 0,
  status TEXT DEFAULT 'not_started',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rooms_room_id ON rooms(room_id);

-- TABEL SCORES
CREATE TABLE IF NOT EXISTS scores (
  id BIGSERIAL PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  npm TEXT NOT NULL,
  name TEXT DEFAULT '',
  points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_scores_room_id ON scores(room_id);
CREATE INDEX IF NOT EXISTS idx_scores_npm ON scores(npm);

-- RLS
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'question_sets') THEN
    CREATE POLICY "Allow all" ON question_sets FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'questions') THEN
    CREATE POLICY "Allow all" ON questions FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'rooms') THEN
    CREATE POLICY "Allow all" ON rooms FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'scores') THEN
    CREATE POLICY "Allow all" ON scores FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
`;

async function main() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL');
    await client.query(sql);
    console.log('✅ Tables created: question_sets, questions, rooms, scores');
    await client.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
