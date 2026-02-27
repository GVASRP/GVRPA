const SUPABASE_URL = 'https://exbhxsdwqznmroxrzxjp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4Ymh4c2R3cXpubXJveHJ6eGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDUzMzksImV4cCI6MjA4NzY4MTMzOX0.CUpzfJCrhghGNZKMK4xboXA7ZdSbYArWBSW4LpMevVk';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function showReg(show) {
    // Если на странице нет этих ID (например, в формах), код не сломается
    const loginBox = document.getElementById('login-box');
    const regBox = document.getElementById('reg-box');
    if (loginBox && regBox) {
        loginBox.style.display = show ? 'none' : 'block';
        regBox.style.display = show ? 'block' : 'none';
    }
}

async function register() {
    const nick = document.getElementById('reg-nick').value;
    const pass = document.getElementById('reg-pass').value;
    const tg = document.getElementById('reg-tg').value;

    if (!nick || !pass) return alert("Введите ник и пароль!");

    const { error } = await supabaseClient
        .from('profiles')
        .insert([{ username: nick, password: pass, telegram: tg, role: 'user' }]);

    if (error) {
        alert("Ошибка: Ник уже занят или база недоступна");
    } else {
        alert("Регистрация успешна!");
        showReg(false);
    }
}

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
        localStorage.setItem('gvr_user', JSON.stringify(data));
        renderMain(data);
    } else {
        alert("Неверный ник или пароль!");
    }
}

// ГЛАВНАЯ ФУНКЦИЯ ОТОБРАЖЕНИЯ ИНТЕРФЕЙСА
function renderMain(user) {
    const authScreen = document.getElementById('auth-screen');
    const mainScreen = document.getElementById('main-screen');
    
    if (authScreen) authScreen.style.display = 'none';
    if (mainScreen) mainScreen.style.display = 'flex';
    
    document.getElementById('user-display').innerText = user.username;

    // ПРОВЕРКА РОЛЕЙ ДЛЯ КНОПОК
    const policeTile = document.getElementById('police-tile');
    const adminLink = document.getElementById('admin-link');

    // Показываем плитку МВД (для админов и полиции)
    if (policeTile) {
        if (user.role === 'admin' || user.role === 'police') {
            policeTile.style.display = 'block';
        } else {
            policeTile.style.display = 'none';
        }
    }

    // Показываем ссылку на админ-панель (только для админов)
    if (adminLink) {
        if (user.role === 'admin') {
            adminLink.style.display = 'inline';
        } else {
            adminLink.style.display = 'none';
        }
    }
}

function logout() {
    localStorage.removeItem('gvr_user');
    location.reload();
}

function openForm(type) {
    window.location.href = 'forms/' + type + '.html';
}

async function sendApp(type, info) {
    const user = JSON.parse(localStorage.getItem('gvr_user'));
    const { error } = await supabaseClient
        .from('applications')
        .insert([{ username: user.username, type: type, data: info, status: 'pending' }]);

    if (error) alert("Ошибка отправки");
    else alert("Заявка отправлена админам!");
}

// При загрузке страницы проверяем, залогинен ли юзер
window.onload = () => {
    const saved = localStorage.getItem('gvr_user');
    if (saved) {
        renderMain(JSON.parse(saved));
    }
};

// --- ФУНКЦИИ ТЕЛЕГРАМА ---

function linkTelegram() {
    const modal = document.getElementById('tg-modal');
    if (modal) modal.style.display = 'flex';
    else alert("Функция Telegram временно недоступна");
}

async function saveTgId() {
    const tgId = document.getElementById('tg-id-input').value.trim();
    const savedData = localStorage.getItem('gvr_user');
    
    if (!savedData) return alert("Сначала войдите в аккаунт!");
    
    const user = JSON.parse(savedData);
    const robloxNick = user.username;

    if (!tgId) return alert("Введите ID!");

    const { error } = await supabaseClient
        .from('telegram_users')
        .upsert([{ 
            username: robloxNick, 
            chat_id: tgId 
        }], { onConflict: 'username' });

    if (error) {
        alert("Ошибка: " + error.message);
    } else {
        alert("Успешно привязано! Теперь ждите уведомлений.");
        const modal = document.getElementById('tg-modal');
        if (modal) modal.style.display = 'none';
    }
}
