import { useSelector } from 'react-redux';
import type { RootState } from './store';
import AuthView from './components/AuthView';
import TodoView from './components/TodoView';

export default function App() {
  const token = useSelector((s: RootState) => s.auth.token);
  return token ? <TodoView /> : <AuthView />;
}