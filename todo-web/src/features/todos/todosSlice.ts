import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api';
import type { Todo } from '../../types';

type TodosState = {
  items: Todo[];
  status: 'idle' | 'loading' | 'error';
  error?: string;
};

const initialState: TodosState = { items: [], status: 'idle' };

export const fetchTodos = createAsyncThunk('todos/fetch', async () => {
  const res = await api.listTodos();
  // backend might return array or {items:[]}; normalize
  const items = Array.isArray(res) ? res : res.items;
  return items as Todo[];
});

export const addTodo = createAsyncThunk('todos/add', async (body: string) => {
  const t = await api.createTodo(body);
  return t as Todo;
});

export const updateTodo = createAsyncThunk(
  'todos/update',
  async ({ id, patch }: { id: string; patch: Partial<Todo> }) => {
    const t = await api.updateTodo(id, patch);
    return t as Todo;
  }
);

export const deleteTodo = createAsyncThunk('todos/delete', async (id: string) => {
  await api.deleteTodo(id);
  return id;
});

const slice = createSlice({
  name: 'todos',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchTodos.pending, (s) => { s.status = 'loading'; s.error = undefined; });
    b.addCase(fetchTodos.fulfilled, (s, a) => { s.status = 'idle'; s.items = a.payload; });
    b.addCase(fetchTodos.rejected, (s, a) => { s.status = 'error'; s.error = a.error.message; });

    b.addCase(addTodo.fulfilled, (s, a) => { s.items.unshift(a.payload); });
    b.addCase(updateTodo.fulfilled, (s, a) => {
      const i = s.items.findIndex(x => x.id === a.payload.id);
      if (i >= 0) s.items[i] = { ...s.items[i], ...a.payload };
    });
    b.addCase(deleteTodo.fulfilled, (s, a) => {
      s.items = s.items.filter(x => x.id !== a.payload);
    });
  }
});

export default slice.reducer;