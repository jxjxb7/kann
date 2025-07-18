import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, User, Task, Board } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextType extends AppState {
  login: (email: string, password: string, boardLink?: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, boardLink?: string) => Promise<boolean>;
  logout: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskPin: (taskId: string) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<{ success: boolean; message: string }>;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  addBoard: (board: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBoard: (boardId: string, updates: Partial<Board>) => void;
  deleteBoard: (boardId: string) => void;
  setCurrentBoard: (boardId: string) => void;
  getCurrentBoardTasks: () => Task[];
  getBoardByLink: (link: string) => Board | null;
  getUserAccessibleBoards: (userId: string) => Board[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  currentUser: null,
  users: [],
  tasks: [],
  boards: [],
  currentBoardId: null,
  isAuthenticated: false,
};

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_BOARDS'; payload: Board[] }
  | { type: 'SET_CURRENT_BOARD'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: { id: string; updates: Partial<User> } }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_BOARD'; payload: Board }
  | { type: 'UPDATE_BOARD'; payload: { id: string; updates: Partial<Board> } }
  | { type: 'DELETE_BOARD'; payload: string };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        isAuthenticated: false,
      };
    case 'SET_USERS':
      return {
        ...state,
        users: action.payload,
      };
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
      };
    case 'SET_BOARDS':
      return {
        ...state,
        boards: action.payload,
      };
    case 'SET_CURRENT_BOARD':
      return {
        ...state,
        currentBoardId: action.payload,
      };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload],
      };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id
            ? { ...user, ...action.payload.updates }
            : user
        ),
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
      };
    case 'ADD_BOARD':
      return {
        ...state,
        boards: [...state.boards, action.payload],
      };
    case 'UPDATE_BOARD':
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.payload.id
            ? { ...board, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : board
        ),
      };
    case 'DELETE_BOARD':
      return {
        ...state,
        boards: state.boards.filter(board => board.id !== action.payload),
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [storedUsers, setStoredUsers] = useLocalStorage<User[]>('kanban-users', []);
  const [storedTasks, setStoredTasks] = useLocalStorage<Task[]>('kanban-tasks', []);
  const [storedBoards, setStoredBoards] = useLocalStorage<Board[]>('kanban-boards', []);
  const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>('kanban-current-user', null);
  const [currentBoardId, setCurrentBoardId] = useLocalStorage<string | null>('kanban-current-board', null);

  // Инициализация с демо данными, если пусто
  useEffect(() => {
    if (storedUsers.length === 0) {
      const demoUsers: User[] = [
        {
          id: '1',
          email: 'admin@kanban.com',
          name: 'АДМИНИСТРАТОР',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'user@kanban.com',
          name: 'ОБЫЧНЫЙ ПОЛЬЗОВАТЕЛЬ',
          role: 'user',
          createdAt: new Date().toISOString(),
        },
      ];
      setStoredUsers(demoUsers);
      dispatch({ type: 'SET_USERS', payload: demoUsers });
    } else {
      dispatch({ type: 'SET_USERS', payload: storedUsers });
    }

    if (storedBoards.length === 0) {
      const demoBoards: Board[] = [
        {
          id: '1',
          name: 'ОСНОВНАЯ ДОСКА',
          description: 'ГЛАВНАЯ ДОСКА ДЛЯ УПРАВЛЕНИЯ ЗАДАЧАМИ',
          createdBy: '1',
          link: 'main-board-' + Date.now(),
          allowedUsers: ['1', '2'],
          isPublic: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setStoredBoards(demoBoards);
      dispatch({ type: 'SET_BOARDS', payload: demoBoards });
      if (!currentBoardId) {
        setCurrentBoardId('1');
        dispatch({ type: 'SET_CURRENT_BOARD', payload: '1' });
      }
    } else {
      dispatch({ type: 'SET_BOARDS', payload: storedBoards });
      if (currentBoardId) {
        dispatch({ type: 'SET_CURRENT_BOARD', payload: currentBoardId });
      }
    }

    if (storedTasks.length === 0) {
      const demoTasks: Task[] = [
        {
          id: '1',
          title: 'ДИЗАЙН ПОЛЬЗОВАТЕЛЬСКОГО ИНТЕРФЕЙСА',
          description: 'СОЗДАТЬ МАКЕТЫ И ПРОТОТИПЫ ДЛЯ НОВОЙ ФУНКЦИИ',
          status: 'in-progress',
          priority: 'high',
          assigneeId: '2',
          creatorId: '1',
          boardId: '1',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          isPinned: true,
          attachments: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'РЕАЛИЗАЦИЯ АУТЕНТИФИКАЦИИ',
          description: 'НАСТРОИТЬ СИСТЕМУ ВХОДА И РЕГИСТРАЦИИ ПОЛЬЗОВАТЕЛЕЙ',
          status: 'created',
          priority: 'high',
          assigneeId: '1',
          creatorId: '1',
          boardId: '1',
          isPinned: false,
          attachments: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setStoredTasks(demoTasks);
      dispatch({ type: 'SET_TASKS', payload: demoTasks });
    } else {
      dispatch({ type: 'SET_TASKS', payload: storedTasks });
    }

    // Проверка существующего входа
    if (currentUserId) {
      const user = storedUsers.find(u => u.id === currentUserId);
      if (user) {
        dispatch({ type: 'LOGIN', payload: user });
      }
    }
  }, []);

  // Синхронизация с localStorage
  useEffect(() => {
    setStoredUsers(state.users);
  }, [state.users, setStoredUsers]);

  useEffect(() => {
    setStoredTasks(state.tasks);
  }, [state.tasks, setStoredTasks]);

  useEffect(() => {
    setStoredBoards(state.boards);
  }, [state.boards, setStoredBoards]);

  useEffect(() => {
    if (state.currentBoardId) {
      setCurrentBoardId(state.currentBoardId);
    }
  }, [state.currentBoardId, setCurrentBoardId]);

  // Получение досок, доступных пользователю
  const getUserAccessibleBoards = (userId: string): Board[] => {
    const user = state.users.find(u => u.id === userId);
    if (!user) return [];

    return state.boards.filter(board => {
      // Администратор видит все доски
      if (user.role === 'admin') return true;
      
      // Пользователь видит доски, которые он создал или к которым добавлен
      return board.createdBy === userId || board.allowedUsers?.includes(userId);
    });
  };

  // Получение доски по ссылке
  const getBoardByLink = (link: string): Board | null => {
    return state.boards.find(board => board.link === link) || null;
  };

  // Вход в систему
  const login = async (email: string, password: string, boardLink?: string): Promise<boolean> => {
    const user = state.users.find(u => u.email === email);
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
      setCurrentUserId(user.id);
      
      // Если предоставлена ссылка на доску, попытаться найти и установить её
      if (boardLink) {
        const board = getBoardByLink(boardLink);
        if (board) {
          // Проверить доступ к доске
          const hasAccess = board.isPublic || 
            board.createdBy === user.id || 
            board.allowedUsers?.includes(user.id) ||
            user.role === 'admin';
          
          if (hasAccess) {
            dispatch({ type: 'SET_CURRENT_BOARD', payload: board.id });
          }
        }
      }
      
      // Проверить, есть ли у пользователя доступ к доскам
      const userBoards = getUserAccessibleBoards(user.id);
      
      if (userBoards.length === 0 && user.role !== 'admin') {
        // Создать персональную доску для пользователя
        const newBoard: Board = {
          id: Date.now().toString(),
          name: `ДОСКА ${user.name.toUpperCase()}`,
          description: `ПЕРСОНАЛЬНАЯ ДОСКА ДЛЯ ${user.name.toUpperCase()}`,
          createdBy: user.id,
          link: `board-${user.id}-${Date.now()}`,
          allowedUsers: [user.id],
          isPublic: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_BOARD', payload: newBoard });
        dispatch({ type: 'SET_CURRENT_BOARD', payload: newBoard.id });
      } else if (userBoards.length > 0 && !state.currentBoardId) {
        dispatch({ type: 'SET_CURRENT_BOARD', payload: userBoards[0].id });
      }
      
      return true;
    }
    return false;
  };

  // Регистрация
  const register = async (email: string, password: string, name: string, boardLink?: string): Promise<boolean> => {
    const existingUser = state.users.find(u => u.email === email);
    if (existingUser) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name: name.toUpperCase(),
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_USER', payload: newUser });
    dispatch({ type: 'LOGIN', payload: newUser });
    setCurrentUserId(newUser.id);
    
    // Если предоставлена ссылка на доску, попытаться найти и добавить пользователя
    if (boardLink) {
      const board = getBoardByLink(boardLink);
      if (board) {
        // Добавить пользователя к доске
        const updatedBoard = {
          ...board,
          allowedUsers: [...(board.allowedUsers || []), newUser.id]
        };
        dispatch({ type: 'UPDATE_BOARD', payload: { id: board.id, updates: updatedBoard } });
        dispatch({ type: 'SET_CURRENT_BOARD', payload: board.id });
        return true;
      }
    }
    
    // Создать персональную доску для нового пользователя
    const newBoard: Board = {
      id: (Date.now() + 1).toString(),
      name: `ДОСКА ${newUser.name}`,
      description: `ПЕРСОНАЛЬНАЯ ДОСКА ДЛЯ ${newUser.name}`,
      createdBy: newUser.id,
      link: `board-${newUser.id}-${Date.now()}`,
      allowedUsers: [newUser.id],
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_BOARD', payload: newBoard });
    dispatch({ type: 'SET_CURRENT_BOARD', payload: newBoard.id });
    
    return true;
  };

  // Выход из системы
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    setCurrentUserId(null);
  };

  // Добавление задачи
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      boardId: taskData.boardId || state.currentBoardId || '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
  };

  // Обновление задачи
  const updateTask = (taskId: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, updates } });
  };

  // Удаление задачи
  const deleteTask = (taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  // Переключение закрепления задачи
  const toggleTaskPin = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { isPinned: !task.isPinned });
    }
  };

  // Добавление пользователя
  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> => {
    const existingUserByEmail = state.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    const existingUserByName = state.users.find(u => u.name.toLowerCase() === userData.name.toLowerCase());
    
    if (existingUserByEmail) {
      return { success: false, message: 'ПОЛЬЗОВАТЕЛЬ С ТАКИМ EMAIL УЖЕ СУЩЕСТВУЕТ' };
    }
    
    if (existingUserByName) {
      return { success: false, message: 'ПОЛЬЗОВАТЕЛЬ С ТАКИМ ИМЕНЕМ УЖЕ СУЩЕСТВУЕТ' };
    }

    const newUser: User = {
      ...userData,
      name: userData.name.toUpperCase(),
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_USER', payload: newUser });
    return { success: true, message: 'ПОЛЬЗОВАТЕЛЬ УСПЕШНО СОЗДАН' };
  };

  // Обновление пользователя
  const updateUser = (userId: string, updates: Partial<User>) => {
    const updatedUser = { ...updates };
    if (updatedUser.name) {
      updatedUser.name = updatedUser.name.toUpperCase();
    }
    dispatch({ type: 'UPDATE_USER', payload: { id: userId, updates: updatedUser } });
  };

  // Удаление пользователя
  const deleteUser = (userId: string) => {
    dispatch({ type: 'DELETE_USER', payload: userId });
  };

  // Добавление доски
  const addBoard = (boardData: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBoard: Board = {
      ...boardData,
      name: boardData.name.toUpperCase(),
      description: boardData.description?.toUpperCase(),
      id: Date.now().toString(),
      link: `board-${Date.now()}`,
      allowedUsers: [boardData.createdBy],
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_BOARD', payload: newBoard });
  };

  // Обновление доски
  const updateBoard = (boardId: string, updates: Partial<Board>) => {
    const updatedBoard = { ...updates };
    if (updatedBoard.name) {
      updatedBoard.name = updatedBoard.name.toUpperCase();
    }
    if (updatedBoard.description) {
      updatedBoard.description = updatedBoard.description.toUpperCase();
    }
    dispatch({ type: 'UPDATE_BOARD', payload: { id: boardId, updates: updatedBoard } });
  };

  // Удаление доски
  const deleteBoard = (boardId: string) => {
    // Проверить, может ли пользователь удалить эту доску
    const board = state.boards.find(b => b.id === boardId);
    if (!board) return;
    
    const canDelete = state.currentUser?.role === 'admin' || 
      (board.createdBy === state.currentUser?.id && state.boards.length > 1);
    
    if (!canDelete) {
      alert('ВЫ НЕ МОЖЕТЕ УДАЛИТЬ ЭТУ ДОСКУ');
      return;
    }
    
    dispatch({ type: 'DELETE_BOARD', payload: boardId });
    
    // Переключиться на другую доску, если текущая была удалена
    if (state.currentBoardId === boardId) {
      const remainingBoards = state.boards.filter(b => b.id !== boardId);
      if (remainingBoards.length > 0) {
        dispatch({ type: 'SET_CURRENT_BOARD', payload: remainingBoards[0].id });
      }
    }
  };

  // Установка текущей доски
  const setCurrentBoard = (boardId: string) => {
    dispatch({ type: 'SET_CURRENT_BOARD', payload: boardId });
  };

  // Получение задач текущей доски
  const getCurrentBoardTasks = () => {
    return state.tasks.filter(task => task.boardId === state.currentBoardId);
  };

  const value: AppContextType = {
    ...state,
    login,
    register,
    logout,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskPin,
    addUser,
    updateUser,
    deleteUser,
    addBoard,
    updateBoard,
    deleteBoard,
    setCurrentBoard,
    getCurrentBoardTasks,
    getBoardByLink,
    getUserAccessibleBoards,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}