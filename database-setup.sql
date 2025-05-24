-- Enable RLS (Row Level Security)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  active_exercises TEXT[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workouts table
CREATE TABLE workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_type TEXT,
  workout_subtype TEXT,
  completed BOOLEAN DEFAULT FALSE,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workout_exercises table (stores individual exercises for each workout)
CREATE TABLE workout_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_data JSONB NOT NULL, -- Store full exercise object for history
  sets JSONB NOT NULL, -- Array of {weight, reps, completed}
  order_index INTEGER NOT NULL DEFAULT 0
);

-- Create exercises table (global exercise library)
CREATE TABLE exercises (
  exercise_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  categories TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  equipment TEXT[] DEFAULT '{}',
  muscle_groups TEXT[] DEFAULT '{}',
  movement_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Workouts: Users can only see/edit their own workouts
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Workout exercises: Users can only see/edit exercises for their own workouts
CREATE POLICY "Users can view own workout exercises" ON workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own workout exercises" ON workout_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own workout exercises" ON workout_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own workout exercises" ON workout_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- Exercises: Public read access (everyone can see the exercise library)
CREATE POLICY "Anyone can view exercises" ON exercises
  FOR SELECT USING (true);

-- Only authenticated users can suggest new exercises (optional)
CREATE POLICY "Authenticated users can insert exercises" ON exercises
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_date ON workouts(date);
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX idx_profiles_updated_at ON profiles(updated_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at for profiles
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 