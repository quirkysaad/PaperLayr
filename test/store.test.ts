import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../src/store';

describe('PaperLayr Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useStore.setState({
      spaces: {},
      notes: {},
      todos: {},
      selectedSpaceId: null,
      selectedNoteId: null,
      isSidebarOpen: true,
      searchQuery: '',
      isSearchOpen: false,
    });
  });

  it('creates, renames, and deletes spaces', () => {
    const store = useStore.getState();
    store.createSpace('Personal');
    
    const newState = useStore.getState();
    const spaceId = Object.keys(newState.spaces)[0];
    
    expect(spaceId).toBeDefined();
    expect(newState.spaces[spaceId].name).toBe('Personal');
    
    // Rename
    newState.renameSpace(spaceId, 'Work');
    expect(useStore.getState().spaces[spaceId].name).toBe('Work');
    
    // Delete
    useStore.getState().deleteSpace(spaceId);
    expect(Object.keys(useStore.getState().spaces).length).toBe(0);
  });

  it('creates, updates, and deletes notes', () => {
    const store = useStore.getState();
    store.createSpace('Test Space');
    const spaceId = Object.keys(useStore.getState().spaces)[0];
    
    const noteId = useStore.getState().createNote(spaceId, 'My Note');
    expect(useStore.getState().notes[noteId].title).toBe('My Note');
    
    useStore.getState().updateNote(noteId, { content: 'Hello World' });
    expect(useStore.getState().notes[noteId].content).toBe('Hello World');
    
    useStore.getState().deleteNote(noteId);
    expect(useStore.getState().notes[noteId]).toBeUndefined();
  });

  it('creates, updates, completes, and deletes todos', () => {
    const store = useStore.getState();
    store.createSpace('Test Space');
    const spaceId = Object.keys(useStore.getState().spaces)[0];
    
    useStore.getState().createTodo(spaceId, 'Buy milk');
    const todoId = Object.keys(useStore.getState().todos)[0];
    
    expect(useStore.getState().todos[todoId].title).toBe('Buy milk');
    expect(useStore.getState().todos[todoId].completed).toBe(false);
    
    useStore.getState().updateTodo(todoId, { completed: true });
    expect(useStore.getState().todos[todoId].completed).toBe(true);
    
    useStore.getState().deleteTodo(todoId);
    expect(useStore.getState().todos[todoId]).toBeUndefined();
  });
});
