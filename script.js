const SUPABASE_URL = 'https://exbhxsdwqznmroxrzxjp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4Ymh4c2R3cXpubXJveHJ6eGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDUzMzksImV4cCI6MjA4NzY4MTMzOX0.CUpzfJCrhghGNZKMK4xboXA7ZdSbYArWBSW4LpMevVk';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function showReg(show) {
    document.getElementById('login-box').style.display = show ? 'none' : 'block';
    document.getElementById('reg-box').style.display = show ? 'block' : 'none';
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

function renderMain(user) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('main-screen').style.display = 'flex';
    document.getElementById('user-display').innerText = user.username;
    if (user.role === 'admin' || user.role === 'police') {
        document.getElementById('police-tile').style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('gvr_user');
    location.reload();
}

function openForm(type) {
    if (type === 'police') {
        window.location.href = 'police.html';
    } else {
        window.location.href = forms/${type}.html;
    }
}


async function sendApp(type, info) {
    const user = JSON.parse(localStorage.getItem('gvr_user'));
    const { error } = await supabaseClient
        .from('applications')
        .insert([{ username: user.username, type: type, data: { details: info }, status: 'pending' }]);

    if (error) alert("Ошибка отправки");
    else alert("Заявка отправлена админам!");
}

window.onload = () => {
    const saved = localStorage.getItem('gvr_user');
    if (saved) renderMain(JSON.parse(saved));
};;
// Функция для привязки Телеграм-бота
function linkTelegram() {
    const userData = JSON.parse(localStorage.getItem('gvr_user'));
    
    if (!userData || !userData.username) {
        alert("Пожалуйста, сначала войдите в свой аккаунт!");
        return;
    }

    // Впиши сюда ник своего бота БЕЗ символа @
    // Например: const botUsername = 'GvrpaPortalBot';
    const botUsername = 'ТВОЙ_БОТ_USERNAME'; 
    const robloxNick = userData.username;

    // Формируем ссылку для передачи ника боту
    const link = https://t.me/${botUsername}?start=${robloxNick};
    
    window.open(link, '_blank');
}
// Функция открытия окна
function linkTelegram() {
    document.getElementById('tg-modal').style.display = 'flex';
}

// Функция сохранения ID в базу
async function saveTgId() {
    const tgId = document.getElementById('tg-id-input').value.trim();
    // Берем ник текущего пользователя из того же места, где ты его хранишь при логине
    // Если у тебя ник хранится в переменной или localStorage:
    const robloxNick = localStorage.getItem('userNick'); // Или как у тебя в коде реализовано получение ника

    if (!tgId) return alert("Введите ID!");

    const { data, error } = await supabase
        .from('telegram_users')
        .upsert([{ 
            username: robloxNick, 
            chat_id: tgId 
        }], { onConflict: 'username' });

    if (error) {
        alert("Ошибка: " + error.message);
    } else {
        alert("Успешно привязано! Теперь ждите уведомлений.");
        document.getElementById('tg-modal').style.display = 'none';
    }
}
