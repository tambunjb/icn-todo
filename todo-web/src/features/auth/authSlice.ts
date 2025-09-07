import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api';

type AuthState = {
  token: string | null;
  email: string | null;
  displayName: string | null;
  status: 'idle' | 'loading' | 'error';
  error?: string;
};

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  email: localStorage.getItem('email'),
  displayName: localStorage.getItem('displayName'),
  status: 'idle',
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const res = await api.login(email, password);
    return { token: res.accessToken, email, displayName: res.displayName };
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, displayName }: { email: string; password: string; displayName?: string }) => {
    const reg = await api.register(email, password, displayName); // ignore return
    const res = await api.login(email, password); // auto login after register
    return { token: res.accessToken, email, displayName: reg.displayName };
  }
);

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.email = null;
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('displayName');
    },
  },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => { s.status = 'loading'; s.error = undefined; });
    b.addCase(login.fulfilled, (s, a) => {
      s.status = 'idle'; s.token = a.payload.token; s.email = a.payload.email;
      s.displayName = a.payload.displayName || null;
      localStorage.setItem('token', a.payload.token);
      localStorage.setItem('email', a.payload.email ?? '');
      if (a.payload.displayName) localStorage.setItem('displayName', a.payload.displayName);
    });
    b.addCase(login.rejected, (s, a) => { s.status = 'error'; s.error = a.error.message; });

    b.addCase(register.pending, (s) => { s.status = 'loading'; s.error = undefined; });
    b.addCase(register.fulfilled, (s, a) => {
      s.status = 'idle'; s.token = a.payload.token; s.email = a.payload.email;
      s.displayName = a.payload.displayName || null;
      localStorage.setItem('token', a.payload.token);
      localStorage.setItem('email', a.payload.email ?? '');
      if (a.payload.displayName) localStorage.setItem('displayName', a.payload.displayName);
    });
    b.addCase(register.rejected, (s, a) => { s.status = 'error'; s.error = a.error.message; });
  }
});

export const { logout } = slice.actions;
export default slice.reducer;