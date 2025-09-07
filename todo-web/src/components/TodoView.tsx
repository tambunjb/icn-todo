import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchTodos, addTodo, updateTodo, deleteTodo } from '../features/todos/todosSlice';
import { logout } from '../features/auth/authSlice';
import type { Todo } from '../types';
import SuggestButton from './SuggestButton';

export default function TodoView() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, status } = useSelector((s: RootState) => s.todos);
  const email = useSelector((s: RootState) => s.auth.email);
  const [newText, setNewText] = useState('');
  const displayName = useSelector((s: RootState) => s.auth.displayName);


  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    await dispatch(addTodo(newText.trim()));
    setNewText('');
  };

  const onPickAdd = (s: string) => setNewText(s);

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: 12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 }}>
        <h2>Your Todos</h2>
        <div>
          <span style={{ marginRight: 10, opacity:.7 }}>{displayName || email}</span>
          <button onClick={()=>dispatch(logout())}>Logout</button>
        </div>
      </div>

      <form onSubmit={onAdd} style={{ display:'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={newText}
          onChange={e=>setNewText(e.target.value)}
          placeholder="What needs to be done?"
          style={{ flex:1 }}
        />
        <SuggestButton currentText={newText} onPick={onPickAdd} />
        <button type="submit">Add</button>
      </form>

      {status==='loading' && <div>Loading…</div>}

      <ul style={{ listStyle:'none', padding:0, display:'grid', gap:8 }}>
        {items.map(t => <TodoItem key={t.id} todo={t} />)}
      </ul>
    </div>
  );
}

function TodoItem({ todo }: { todo: Todo }) {
  const dispatch = useDispatch<AppDispatch>();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.body);

  const save = async () => {
    if (!text.trim()) return;
    await dispatch(updateTodo({ id: todo.id, patch: { body: text.trim() } }));
    setEditing(false);
  };
  const toggle = () => dispatch(updateTodo({ id: todo.id, patch: { isDone: !todo.isDone } }));
  const remove = () => dispatch(deleteTodo(todo.id));
  const onPickEdit = (s: string) => setText(s);

  return (
    <li style={{ border:'1px solid #eee', borderRadius:8, padding:10, display:'flex', alignItems:'center', gap:8 }}>
      <input type="checkbox" checked={todo.isDone} onChange={toggle} />
      {!editing ? (
        <>
          <span style={{ flex:1, textDecoration: todo.isDone ? 'line-through' : 'none' }}>{todo.body}</span>
          <button onClick={()=>{ setText(todo.body); setEditing(true); }}>Edit</button>
          <button onClick={remove}>Delete</button>
        </>
      ) : (
        <>
          <input style={{ flex:1 }} value={text} onChange={e=>setText(e.target.value)} />
          <SuggestButton currentText={text} onPick={onPickEdit} />
          <button onClick={save}>Save</button>
          <button onClick={()=>setEditing(false)}>Cancel</button>
        </>
      )}
    </li>
  );
}