import React, { useState } from 'react';
import { Eye, EyeOff, Leaf, Mail, Lock, User, UserCheck, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiPost } from '../../utils/api';

// ---------------------------------------------------------------
// [MİMARİ] Component Reusability (Yeniden Kullanılabilirlik) & DRY Prensibi
// InputField: Hem Login hem de Register formlarında kod tekrarını engellemek (Don't Repeat Yourself) için oluşturulmuş ortak (shared) bir Child Component'tir. Parçalanabilir (Atomic Design) yapıdadır.
// ---------------------------------------------------------------
const InputField = ({ id, label, type = 'text', value, onChange, placeholder, icon: Icon, error, autoComplete }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={16} />
        </div>
        <input
          id={id}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full pl-9 pr-${isPassword ? '10' : '3'} py-2.5 rounded-xl border text-sm transition-all outline-none
            ${error
              ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300'
              : 'border-gray-200 bg-gray-50 focus:border-green-400 focus:ring-2 focus:ring-green-200 focus:bg-white'
            }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};

// ---------------------------------------------------------------
// [MİMARİ] Login Form Bileşeni (Controlled Component)
// React'in "Kontrollü Bileşen" yapısı kullanılarak input değerleri state'e (email, password) bağlanmıştır.
// ---------------------------------------------------------------
const LoginForm = ({ onSwitch }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // [MİMARİ] Frontend Validasyon (İstemci Tarafı Doğrulama)
  // Backend'e gereksiz HTTP istekleri gitmesini engelleyerek hem Network yükünü azaltır hem de kullanıcıya saniyesinde hata gösterir (Fast Feedback loop).
  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email alanı zorunludur.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Geçerli bir email girin.';
    if (!password) e.password = 'Şifre alanı zorunludur.';
    return e;
  };

  // [MİMARİ] Asenkron İstek Yönetimi ve Hata Yakalama
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setServerError('');
    if (Object.keys(e).length > 0) return;

    setIsLoading(true);
    try {
      const { data } = await apiPost('/auth/login', { email, password });
      if (data.success) {
        login(data.token, data.user, rememberMe);
      } else {
        setServerError(data.message || 'Giriş başarısız.');
      }
    } catch {
      setServerError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-gray-800">Tekrar Hoş Geldiniz</h2>
        <p className="text-sm text-gray-500 mt-1">Hesabınıza giriş yapın</p>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <InputField
        id="login-email"
        label="Email Adresi"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ornek@gmail.com"
        icon={Mail}
        error={errors.email}
        autoComplete="email"
      />

      <InputField
        id="login-password"
        label="Şifre"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        icon={Lock}
        error={errors.password}
        autoComplete="current-password"
      />

      <div className="flex items-center gap-2">
        <input
          id="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-4 h-4 accent-green-600 cursor-pointer"
        />
        <label htmlFor="remember-me" className="text-sm text-gray-600 cursor-pointer select-none">
          Beni hatırla (7 gün)
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-3 rounded-xl 
          hover:from-green-700 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg 
          disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Giriş yapılıyor...
          </>
        ) : (
          <>
            Giriş Yap <ArrowRight size={18} />
          </>
        )}
      </button>

      <p className="text-center text-sm text-gray-500">
        Hesabınız yok mu?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors"
        >
          Kayıt Ol
        </button>
      </p>
    </form>
  );
};

// ---------------------------------------------------------------
// [MİMARİ] Register Form Bileşeni (Kayıt Olma)
// ---------------------------------------------------------------
const RegisterForm = ({ onSwitch }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Ad alanı zorunludur.';
    if (!form.lastName.trim()) e.lastName = 'Soyad alanı zorunludur.';
    if (!form.email.trim()) e.email = 'Email alanı zorunludur.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Geçerli bir email girin.';
    if (!form.password) e.password = 'Şifre alanı zorunludur.';
    else if (form.password.length < 6) e.password = 'Şifre en az 6 karakter olmalıdır.';
    if (!form.confirmPassword) e.confirmPassword = 'Şifre tekrarı zorunludur.';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Şifreler eşleşmiyor.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setServerError('');
    if (Object.keys(e).length > 0) return;

    setIsLoading(true);
    try {
      const { data } = await apiPost('/auth/register', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          login(data.token, data.user, true); // Kayıtta otomatik giriş + hatırla
        }, 1200);
      } else {
        setServerError(data.message || 'Kayıt başarısız.');
      }
    } catch {
      setServerError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 animate-bounce">
          <CheckCircle size={36} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Hesabınız Oluşturuldu!</h2>
        <p className="text-sm text-gray-500">BitkiAI'ya hoş geldiniz, yönlendiriliyorsunuz...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
      <div className="text-center mb-1">
        <h2 className="text-2xl font-bold text-gray-800">Hesap Oluştur</h2>
        <p className="text-sm text-gray-500 mt-1">BitkiAI'ya katılın, bitkilerinize bakın</p>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <InputField
          id="reg-firstname"
          label="Ad"
          value={form.firstName}
          onChange={set('firstName')}
          placeholder="Ahmet"
          icon={User}
          error={errors.firstName}
          autoComplete="given-name"
        />
        <InputField
          id="reg-lastname"
          label="Soyad"
          value={form.lastName}
          onChange={set('lastName')}
          placeholder="Yılmaz"
          icon={UserCheck}
          error={errors.lastName}
          autoComplete="family-name"
        />
      </div>

      <InputField
        id="reg-email"
        label="Email Adresi"
        type="email"
        value={form.email}
        onChange={set('email')}
        placeholder="ornek@gmail.com"
        icon={Mail}
        error={errors.email}
        autoComplete="email"
      />

      <InputField
        id="reg-password"
        label="Şifre"
        type="password"
        value={form.password}
        onChange={set('password')}
        placeholder="En az 6 karakter"
        icon={Lock}
        error={errors.password}
        autoComplete="new-password"
      />

      <InputField
        id="reg-confirm-password"
        label="Şifre Tekrar"
        type="password"
        value={form.confirmPassword}
        onChange={set('confirmPassword')}
        placeholder="Şifrenizi tekrar girin"
        icon={Lock}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-3 rounded-xl 
          hover:from-green-700 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg 
          disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Hesap oluşturuluyor...
          </>
        ) : (
          <>
            Kayıt Ol <ArrowRight size={18} />
          </>
        )}
      </button>

      <p className="text-center text-sm text-gray-500">
        Zaten hesabınız var mı?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors"
        >
          Giriş Yap
        </button>
      </p>
    </form>
  );
};

// ---------------------------------------------------------------
// [MİMARİ] Ana Auth Modal Parent Bileşeni
// Login ve Register component'lerini bir araya getirip aralarında sekme (tab) geçişini yönetir. 
// Koşullu render yerine animasyonlu geçiş (isAnimating state) tercih edilerek akıcı bir UI sağlanmıştır.
// ---------------------------------------------------------------
const AuthModal = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [isAnimating, setIsAnimating] = useState(false);

  const switchMode = (newMode) => {
    if (isAnimating || mode === newMode) return;
    setIsAnimating(true);
    setTimeout(() => {
      setMode(newMode);
      setIsAnimating(false);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Arka plan — blur + gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-800/70 to-teal-900/80 backdrop-blur-sm" />

      {/* Dekoratif arka plan daireleri */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-green-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />

      {/* Modal Kartı */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Üst başlık / Logo alanı */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-8 py-6 flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white shadow-lg">
              <Leaf size={28} />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">BitkiAI</span>
            <span className="text-white/75 text-sm">Akıllı Bitki Asistanınız</span>
          </div>

          {/* Form sekmesi (Login / Register) */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === 'login'
                ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === 'register'
                ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              Kayıt Ol
            </button>
          </div>

          {/* Form İçeriği */}
          <div
            className={`px-8 py-6 transition-all duration-200 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
              }`}
            style={{ transform: isAnimating ? 'translateY(8px)' : 'translateY(0)' }}
          >
            {mode === 'login' ? (
              <LoginForm onSwitch={() => switchMode('register')} />
            ) : (
              <RegisterForm onSwitch={() => switchMode('login')} />
            )}
          </div>

          {/* Alt bilgi */}
          <div className="px-8 pb-5 text-center text-xs text-gray-400">
            Devam ederek{' '}
            <span className="text-green-600 cursor-default">Kullanım Koşullarını</span> kabul etmiş olursunuz.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
