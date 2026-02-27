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
    // Переход в папку forms к нужному файлу
    window.location.href = forms/${type}.html;
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
