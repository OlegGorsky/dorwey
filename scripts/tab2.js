function initTab1() {
const style = document.createElement('style');
style.textContent = `
  body {
    font-family: Arial, sans-serif;
    padding: 20px;
    text-align: center;
    background-color: #ecf0f1; /* Цвет фона страницы */
  }

  .btn-invite {
    display: inline-block;
    background-color: #00D6CA;
    color: #000;
    padding: 15px;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    margin: 10px;
    width: 100%;
    max-width: 200px;
  }

  .btn-copy {
    display: inline-block;
    background-color: #00D6CA;
    padding: 10px;
    border-radius: 50%;
    cursor: pointer;
    margin: 10px;
    width: 50px;
    height: 50px;
    border: none;
  }

  .btn-copy img {
    width: 24px;
    height: 24px;
  }

  .popup {
    margin-top: 20px;
    color: #fff;
    background-color: #333;
    padding: 10px;
    border-radius: 5px;
    display: none;
  }

  .custom-user-stats {
    font-family: 'Unbounded', sans-serif;
    text-align: center;
    color: #fff;
    margin-top: 50px;
  }

  .custom-highlight {
    font-weight: 600;
    color: #DBFE01; /* Цвет выделенного текста */
  }

  /* Стили для бегущей строки */
  #ticker {
    position: fixed;
    top: 100px;
    left: -20px;
    width: calc(100% + 40px);
    overflow: hidden;
    white-space: nowrap;
    transform: rotate(-5deg);
    background-color: #DBFE01;
    margin: 0;
    padding: 0;
    height: 60px;
    display: flex;
    align-items: center;
  }

  #ticker-wrapper {
    display: flex;
    animation: ticker-animation 10s linear infinite;
  }

  #ticker-text {
    display: inline-block;
    font-family: 'Unbounded', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: #000;
    white-space: nowrap;
    padding-right: 20px;
  }

  @keyframes ticker-animation {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
`;

document.head.appendChild(style);

// Добавляем HTML элементы на страницу
const inviteBtn = document.createElement('div');
inviteBtn.classList.add('btn-invite');
inviteBtn.id = 'inviteBtn';
inviteBtn.textContent = 'Пригласить друга';

const copyBtn = document.createElement('button');
copyBtn.classList.add('btn-copy');
copyBtn.id = 'copyBtn';
const copyIcon = document.createElement('img');
copyIcon.src = 'https://files.salebot.pro/uploads/file_item/file/44501/copy-1024.webp';
copyIcon.alt = 'Copy Icon';
copyBtn.appendChild(copyIcon);

const popup = document.createElement('div');
popup.classList.add('popup');
popup.id = 'popup';
popup.textContent = 'Скопировано!';

const userStats = document.createElement('div');
userStats.classList.add('custom-user-stats');
userStats.innerHTML = `
  <p>Твоих приглашенных друзей: <span id="user-friends-count" class="custom-highlight">0</span></p>
  <p>Твой заработок за друзей: <span id="user-earnings" class="custom-highlight">0</span></p>
`;

// Добавляем элементы на страницу
document.body.appendChild(inviteBtn);
document.body.appendChild(copyBtn);
document.body.appendChild(popup);
document.body.appendChild(userStats);

// Бегущая строка
const ticker = document.createElement('div');
ticker.id = 'ticker';
const tickerWrapper = document.createElement('div');
tickerWrapper.id = 'ticker-wrapper';
const tickerText = document.createElement('div');
tickerText.id = 'ticker-text';
tickerText.textContent = 'Приглашай друзей и зарабатывай Ежкоины / Приглашай друзей и зарабатывай Ежкоины /';

tickerWrapper.appendChild(tickerText);
ticker.appendChild(tickerWrapper);
document.body.appendChild(ticker);

// Функция для получения данных о количестве друзей и заработке
async function fetchUserData(userId) {
  try {
    const response = await fetch(`http://localhost:3000/getUserData?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Ошибка сети');
    }

    const data = await response.json();

    // Обновляем количество друзей и заработок
    document.getElementById('user-friends-count').textContent = data.friendsCount || 0;
    document.getElementById('user-earnings').textContent = (data.friendsCount || 0) * 500;
  } catch (error) {
    console.error('Ошибка получения данных:', error);
  }
}

// Инициализация кнопок и работа с Telegram WebApp API
function onTelegramReady() {
  let userId = "defaultUserId"; // Значение по умолчанию
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe.user) {
    userId = window.Telegram.WebApp.initDataUnsafe.user.id;
  }

  // Создаем URL для приглашения с параметром userId
  const inviteUrl = `https://t.me/doorway_ezh_bot/doorway?startapp=${btoa(userId)}`;
  const message = "Привет! Зарабатывай на Еже: ";

  // Обработчик для кнопки приглашения
  inviteBtn.addEventListener('click', function() {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(message + inviteUrl)}`, '_blank');
  });

  // Обработчик для копирования ссылки
  copyBtn.addEventListener('click', function() {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(inviteUrl).then(function() {
        popup.style.display = 'block';
        setTimeout(() => { popup.style.display = 'none'; }, 2000);
      });
    }
  });

  // Запрос данных из базы данных при загрузке страницы
  fetchUserData(userId);
}

// Запуск после готовности Telegram WebApp API
window.Telegram.WebApp.ready();
onTelegramReady();
}