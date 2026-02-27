// НАСТРОЙКИ SUPABASE (Возьми в Settings -> API)
const SUPABASE_URL = 'https://exbhxsdwqznmroxrzxjp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4Ymh4c2R3cXpubXJveHJ6eGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDUzMzksImV4cCI6MjA4NzY4MTMzOX0.CUpzfJCrhghGNZKMK4xboXA7ZdSbYArWBSW4LpMevVk';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. ПЕРЕКЛЮЧЕНИЕ ФОРМ (Вход/Регистрация)
function showReg(show) {
    document.getElementById('login-box').style.display = show ? 'none' : 'block';
    document.getElementById('reg-box').style.display = show ? 'block' : 'none';
}

// 2. РЕГИСТРАЦИЯ (Без Email)
async function register() {
    const nick = document.getElementById('reg-nick').value;
    const pass = document.getElementById('reg-pass').value;
    const tg = document.getElementById('reg-tg').value;

    if (!nick || !pass) return alert("Заполните ник и пароль!");

    const { data, error } = await supabaseClient
        .from('profiles')
        .insert([{ username: nick, password: pass, telegram: tg }]);

    if (error) {
        alert("Ошибка: " + error.message);
    } else {
        alert("Регистрация успешна! Теперь войдите.");
        showReg(false);
    }
}

// 3. ВХОД
async function login() {
    const nick = document.getElementById('login-nick').value;
    const pass = document.getElementById('login-pass').value;

    const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('username', nick)
        .eq('password', pass)
        .single();

    if (data) {
        // Сохраняем данные игрока в браузере, чтобы не вылетало при перезагрузке
        localStorage.setItem('gvr_user', JSON.stringify(data));
        showMainScreen(data);
    } else {
        alert("Неверный ник или пароль!");
    }
}

// 4. ОТОБРАЖЕНИЕ ГЛАВНОГО ЭКРАНА
function showMainScreen(user) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('main-screen').style.display = 'block';
    document.getElementById('user-display').innerText = "Привет, " + user.username;

    // Если зашел админ или коп — показываем секретную плитку
    if (user.role === 'admin' || user.role === 'police') {
        document.getElementById('police-tile').style.display = 'block';
    }
}

// 5. ЛОГИКА ОТКРЫТИЯ ФОРМ (Плиточки)
function openForm(type) {
    // Пока что сделаем простой ввод через prompt, потом заменим на красивые окна
    let details = "";
    
    if (type === 'car') details = prompt("Введите марку и номер авто:");
    if (type === 'court') details = prompt("Опишите суть иска и ник ответчика:");
    if (type === 'accident') details = prompt("Место ДТП и участники:");
    if (type === 'id') details = prompt("Ваше полное имя и дата рождения для ID:");
    
    if (details) {
        sendApplication(type, details);
    }
}

// 6. ОТПРАВКА ЗАЯВКИ В БАЗУ
async function sendApplication(type, details) {
    const user = JSON.parse(localStorage.getItem('gvr_user'));
    
    const { error } = await supabaseClient
        .from('applications')
        .insert([{ 
            username: user.username, 
            type: type, 
            data: { info: details },
            status: 'pending' 
        }]);

    if (error) {
        alert("Ошибка при отправке: " + error.message);
    } else {
        alert("Заявка отправлена! Ожидайте уведомления в Telegram или решения админа.");
    }
}

// 7. ВЫХОД
function logout() {
    localStorage.removeItem('gvr_user');
    location.reload();
}

// Проверка при загрузке: если уже входил — сразу в меню
window.onload = () => {
    const savedUser = localStorage.getItem('gvr_user');
    if (savedUser) showMainScreen(JSON.parse(savedUser));
};
