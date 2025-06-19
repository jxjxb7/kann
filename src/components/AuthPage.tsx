import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User, CheckCircle2, Link } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [boardLink, setBoardLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useApp();

  // Валидация пароля
  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8 || password.length > 20) {
      return { isValid: false, message: 'ПАРОЛЬ ДОЛЖЕН СОДЕРЖАТЬ ОТ 8 ДО 20 СИМВОЛОВ' };
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
      return { isValid: false, message: 'ПАРОЛЬ ДОЛЖЕН СОДЕРЖАТЬ ТОЛЬКО АНГЛИЙСКИЕ БУКВЫ И ЦИФРЫ' };
    }
    
    if (!/[a-zA-Z]/.test(password)) {
      return { isValid: false, message: 'ПАРОЛЬ ДОЛЖЕН СОДЕРЖАТЬ ХОТЯ БЫ ОДНУ БУКВУ' };
    }
    
    return { isValid: true, message: '' };
  };

  // Валидация логина
  const validateLogin = (login: string): { isValid: boolean; message: string } => {
    if (login.length < 8 || login.length > 20) {
      return { isValid: false, message: 'ЛОГИН ДОЛЖЕН СОДЕРЖАТЬ ОТ 8 ДО 20 СИМВОЛОВ' };
    }
    
    if (!/^[a-zA-Z0-9@.]+$/.test(login)) {
      return { isValid: false, message: 'ЛОГИН ДОЛЖЕН СОДЕРЖАТЬ ТОЛЬКО АНГЛИЙСКИЕ БУКВЫ, ЦИФРЫ И СИМВОЛЫ @ .' };
    }
    
    return { isValid: true, message: '' };
  };

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Валидация логина
      const loginValidation = validateLogin(email);
      if (!loginValidation.isValid) {
        setError(loginValidation.message);
        setLoading(false);
        return;
      }

      // Валидация пароля
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.message);
        setLoading(false);
        return;
      }

      let success = false;
      if (isLogin) {
        success = await login(email, password, boardLink);
        if (!success) {
          setError('НЕВЕРНЫЙ EMAIL ИЛИ ПАРОЛЬ');
        }
      } else {
        // Проверка имени и фамилии при регистрации
        if (!firstName.trim() || !lastName.trim()) {
          setError('НЕОБХОДИМО УКАЗАТЬ ИМЯ И ФАМИЛИЮ');
          setLoading(false);
          return;
        }

        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        success = await register(email, password, fullName, boardLink);
        if (!success) {
          setError('ПОЛЬЗОВАТЕЛЬ УЖЕ СУЩЕСТВУЕТ');
        } else {
          // Отправка email о успешной регистрации (имитация)
          console.log(`Отправка email на ${email}: Добро пожаловать в KanbanPro! Ваша регистрация прошла успешно.`);
          alert('РЕГИСТРАЦИЯ ПРОШЛА УСПЕШНО! НА ВАШ EMAIL ОТПРАВЛЕНО ПОДТВЕРЖДЕНИЕ.');
        }
      }
    } catch (err) {
      setError('ПРОИЗОШЛА ОШИБКА. ПОПРОБУЙТЕ СНОВА.');
    } finally {
      setLoading(false);
    }
  };

  // Демо вход
  const demoLogin = async (role: 'admin' | 'user') => {
    setLoading(true);
    const demoEmail = role === 'admin' ? 'admin@kanban.com' : 'user@kanban.com';
    await login(demoEmail, 'password123');
    setLoading(false);
  };

  // Восстановление пароля
  const handleForgotPassword = () => {
    if (!email.trim()) {
      alert('ВВЕДИТЕ EMAIL ДЛЯ ВОССТАНОВЛЕНИЯ ПАРОЛЯ');
      return;
    }
    
    // Имитация отправки email для восстановления пароля
    console.log(`Отправка email на ${email}: Ссылка для восстановления пароля в KanbanPro`);
    alert('ССЫЛКА ДЛЯ ВОССТАНОВЛЕНИЯ ПАРОЛЯ ОТПРАВЛЕНА НА ВАШ EMAIL');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl mb-4">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KanbanPro</h1>
          <p className="text-gray-600">Управляйте проектами со стилем</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                isLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                !isLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имя
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Введите имя"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Фамилия
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Введите фамилию"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email адрес
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Введите email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Введите пароль"
                  required
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                8-20 символов, только английские буквы и цифры, минимум одна буква
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ссылка на доску (необязательно)
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={boardLink}
                  onChange={(e) => setBoardLink(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Вставьте ссылку на доску"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-teal-700 focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? (
                    <LogIn className="w-5 h-5" />
                  ) : (
                    <UserPlus className="w-5 h-5" />
                  )}
                  <span>{isLogin ? 'Войти' : 'Создать аккаунт'}</span>
                </>
              )}
            </button>

            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Забыли пароль?
                </button>
              </div>
            )}
          </form>

          <div className="px-8 pb-8">
            <div className="text-center text-sm text-gray-500 mb-4">
              Или попробуйте демо аккаунты
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => demoLogin('admin')}
                disabled={loading}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Демо Админ
              </button>
              <button
                onClick={() => demoLogin('user')}
                disabled={loading}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Демо Пользователь
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}