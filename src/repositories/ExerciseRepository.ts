import { Exercise, ExerciseSchema, MuscleGroup, EquipmentType, ExerciseLibraryItem } from '../types';
import exercisesData from '../data/exercises_dataset.json';

export interface ExerciseRepository {
  getAll(): Promise<Exercise[]>;
  getById(id: string): Promise<Exercise | null>;
  getByMuscleGroup(groups: MuscleGroup[]): Promise<Exercise[]>;
  search(term: string): Promise<Exercise[]>;
  validateExercise(data: unknown): data is Exercise;
}

export class MockExerciseRepository implements ExerciseRepository {
  private data: Exercise[];

  constructor(exercises: ExerciseLibraryItem[] = exercisesData) {
    this.data = exercises.map(e => ({
      ...e,
      equipment: e.equipment?.map(eq => eq as EquipmentType) || [],
      muscle_groups: e.muscle_groups || []
    }));
  }

  async getAll(): Promise<Exercise[]> {
    return this.data;
  }

  async getById(id: string): Promise<Exercise | null> {
    const exercise = this.data.find(e => e.exercise_id === id);
    return exercise || null;
  }

  async getByMuscleGroup(groups: MuscleGroup[]): Promise<Exercise[]> {
    return this.data.filter(e => 
      e.muscle_groups?.some(g => groups.includes(g))
    );
  }

  async search(term: string): Promise<Exercise[]> {
    const searchTerm = term.toLowerCase();
    return this.data.filter(e => 
      e.name.toLowerCase().includes(searchTerm) ||
      e.description?.toLowerCase().includes(searchTerm) ||
      e.categories?.some(c => c.toLowerCase().includes(searchTerm))
    );
  }

  validateExercise(data: unknown): data is Exercise {
    return ExerciseSchema.safeParse(data).success;
  }
}

export class ApiExerciseRepository implements ExerciseRepository {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async getAll(): Promise<Exercise[]> {
    try {
      const response = await fetch(`${this.baseUrl}/exercises`);
      if (!response.ok) throw new Error('Failed to fetch exercises');
      const data = await response.json();
      return ExerciseSchema.array().parse(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Exercise | null> {
    try {
      const response = await fetch(`${this.baseUrl}/exercises/${id}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to fetch exercise');
      const data = await response.json();
      return ExerciseSchema.parse(data);
    } catch (error) {
      console.error(`Error fetching exercise ${id}:`, error);
      throw error;
    }
  }

  async getByMuscleGroup(groups: MuscleGroup[]): Promise<Exercise[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/exercises?muscleGroups=${groups.join(',')}`
      );
      if (!response.ok) throw new Error('Failed to fetch exercises by muscle group');
      const data = await response.json();
      return ExerciseSchema.array().parse(data);
    } catch (error) {
      console.error('Error fetching exercises by muscle group:', error);
      throw error;
    }
  }

  async search(term: string): Promise<Exercise[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/exercises/search?q=${encodeURIComponent(term)}`
      );
      if (!response.ok) throw new Error('Failed to search exercises');
      const data = await response.json();
      return ExerciseSchema.array().parse(data);
    } catch (error) {
      console.error('Error searching exercises:', error);
      throw error;
    }
  }

  validateExercise(data: unknown): data is Exercise {
    return ExerciseSchema.safeParse(data).success;
  }
}

export class CachedRepository implements ExerciseRepository {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(
    private inner: ExerciseRepository,
    private ttlMs: number = 300_000 // 5 minutes default
  ) {}

  private getCacheKey(method: string, params: any): string {
    return `${method}:${JSON.stringify(params)}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.ttlMs;
  }

  async getAll(): Promise<Exercise[]> {
    const cacheKey = this.getCacheKey('getAll', {});
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    const data = await this.inner.getAll();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getById(id: string): Promise<Exercise | null> {
    const cacheKey = this.getCacheKey('getById', { id });
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    const data = await this.inner.getById(id);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getByMuscleGroup(groups: MuscleGroup[]): Promise<Exercise[]> {
    const cacheKey = this.getCacheKey('getByMuscleGroup', { groups });
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    const data = await this.inner.getByMuscleGroup(groups);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async search(term: string): Promise<Exercise[]> {
    const cacheKey = this.getCacheKey('search', { term });
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    const data = await this.inner.search(term);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  validateExercise(data: unknown): data is Exercise {
    return this.inner.validateExercise(data);
  }

  clearCache(): void {
    this.cache.clear();
  }
} 