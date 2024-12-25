
function initTab1() {
  // CSS стили для "тапалки"
  const tapalkaStyles = `
    #tapalka-container {
      width: 100%;
      overflow: hidden;
      position: relative;
    }

    #tapalka-balance-container {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      width: 100%;
      overflow: hidden;
      position: relative;
    }

    #tapalka-points-display {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }

    #tapalka-points-display img {
      width: 64px;
      height: 64px;
      margin-right: 5px;
    }

    #tapalka-current-points {
      font-size: 42px;
      color: white;
      font-weight: bold;
    }

    #tapalka-coin-image {
      max-width: 500px;
      cursor: pointer;
      transition: transform 0.1s;
    }

    #tapalka-coin-image:active {
      transform: scale(0.9);
    }

    #tapalka-points-animation {
      display: none;
      position: absolute;
      font-size: 24px;
      color: #00D6CA;
      z-index: 1000;
    }

    /* Адаптация для ПК */
    @media (min-width: 1024px) {
      #tapalka-coin-image {
        max-width: 600px; /* Увеличиваем изображение на больших экранах */
      }
    }

    /* Адаптация для мобильных устройств */
    @media (max-width: 1023px) {
      #tapalka-coin-image {
        max-width: 300px; /* Уменьшаем изображение на мобильных */
      }
    }

    /* Адаптация для очень маленьких экранов */
    @media (max-width: 480px) {
      #tapalka-coin-image {
        max-width: 250px;
      }
    }
  `;

  // Добавляем стили в документ
  const tapalkaStyleSheet = document.createElement("style");
  tapalkaStyleSheet.type = "text/css";
  tapalkaStyleSheet.innerText = tapalkaStyles;
  document.head.appendChild(tapalkaStyleSheet);

  // Добавляем HTML для "тапалки"
  const tapalkaHTML = `
    <div id="tapalka-container">
      <div id="tapalka-balance-container">
        <div id="tapalka-points-display">
          <img src="https://files.salebot.pro/uploads/file_item/file/44501/1ежкоин.png" alt="Coin">
          <span id="tapalka-current-points">0</span>
        </div>
        <img id="tapalka-coin-image" src="https://files.salebot.pro/uploads/file_item/file/44501/tild6164-3131-4538-b864-343962326538___.png" alt="Earn Coins">
        <div id="tapalka-points-animation">+3</div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', tapalkaHTML);

  // Заменяем localhost на IP-адрес сервера
  const tapalkaGetBalanceUrl = 'http://185.219.7.235:3000/api/balance';  // API для получения баланса
  const tapalkaUpdatePointsUrl = 'http://185.219.7.235:3000/api/update-points';  // API для обновления баллов
  const tapalkaPointsIncrement = 3;  // Количество баллов, добавляемое при каждом клике
  let tapalkaUserId = null;

  // Функция для получения информации о пользователе через Telegram WebApp API
  function tapalkaGetUserId() {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
      return window.Telegram.WebApp.initDataUnsafe.user.id;  // Получаем userId
    } else {
      console.error('Unable to get userId from Telegram WebApp');
      return null;
    }
  }

  // Функция загрузки баланса с сервера
  function tapalkaLoadBalance() {
    if (!tapalkaUserId) return;

    console.log("Loading balance for User ID: ", tapalkaUserId);  // Отладка

    fetch(`${tapalkaGetBalanceUrl}?userId=${tapalkaUserId}`, {
      method: 'GET',
      cache: 'no-cache',  // Отключаем кэширование, чтобы избежать старых данных
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "User not found") {
        console.log("User not found, creating user...");
        tapalkaCreateUser();
      } else {
        const points = data.points || 0;
        document.getElementById('tapalka-current-points').textContent = points;
        console.log('Баланс загружен:', points);  // Отладка
      }
    })
    .catch(err => {
      console.error('Error loading balance:', err);
    });
  }

  // Функция создания пользователя в базе данных
  function tapalkaCreateUser() {
    console.log("Creating new user for ID: ", tapalkaUserId);  // Отладка
    fetch(tapalkaUpdatePointsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: tapalkaUserId, points: 0 }),
      cache: 'no-cache',
    })
    .then(response => {
      if (response.ok) {
        console.log("User created successfully");
        tapalkaLoadBalance();  // После создания пользователя загружаем баланс
      } else {
        console.error('Failed to create user');
      }
    })
    .catch(err => {
      console.error('Error creating user:', err);
    });
  }

  // Функция обновления баланса на сервере
  function tapalkaUpdatePoints() {
    if (!tapalkaUserId) return;

    console.log("Updating points for User ID: ", tapalkaUserId);

    fetch(tapalkaUpdatePointsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: tapalkaUserId, points: tapalkaPointsIncrement }),
      cache: 'no-cache',
    })
    .then(response => {
      if (response.ok) {
        console.log("Points updated successfully");
        tapalkaLoadBalance();  // После обновления баланса заново загружаем баланс
      } else {
        console.error('Failed to update points');
      }
    })
    .catch(err => {
      console.error('Error updating points:', err);
    });
  }

  // Функция для показа анимации при клике
  function showTapAnimation(event) {
    const coinImage = document.getElementById('tapalka-coin-image');
    const animationElement = document.getElementById('tapalka-points-animation');
    const rect = coinImage.getBoundingClientRect();
    const x = event.clientX - rect.left || event.touches[0].clientX - rect.left;
    const y = event.clientY - rect.top || event.touches[0].clientY - rect.top;

    // Анимация появляется в месте клика
    animationElement.style.left = `${x}px`;
    animationElement.style.top = `${y}px`;
    animationElement.style.display = 'block';

    setTimeout(() => animationElement.style.display = 'none', 500);
  }

  // Привязка события клика к изображению монеты
  function tapalkaAttachClickEvent() {
    const coinImage = document.getElementById('tapalka-coin-image');

    const handleTap = (event) => {
      event.preventDefault();
      showTapAnimation(event);

      // Виброотклик
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }

      coinImage.style.transform = 'scale(0.9)';  // Эффект нажатия
      setTimeout(() => {
        coinImage.style.transform = 'scale(1)';
      }, 100);
      tapalkaUpdatePoints();  // Обновляем баланс
    };

    coinImage.addEventListener('click', handleTap);
    coinImage.addEventListener('touchstart', handleTap);
  }

  // Инициализация "тапалки" при загрузке страницы
  function tapalkaInit() {
    tapalkaUserId = tapalkaGetUserId();  // Получаем userId из Telegram WebApp API
    if (!tapalkaUserId) {
      console.error('No user ID found');
      return;
    }
    tapalkaLoadBalance();  // Загружаем баланс при загрузке страницы
    tapalkaAttachClickEvent();  // Привязываем событие клика
  }

  // Слушаем события переключения вкладки
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      tapalkaLoadBalance();
    }
  });

  // Проверяем, был ли DOM загружен
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tapalkaInit);
  } else {
    tapalkaInit();
  }

  // Логика для переключения вкладок и скрытия других элементов
  const tabs = document.querySelectorAll('.menu-item');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = tab.getAttribute('data-target');
      const sections = document.querySelectorAll('.section');
      sections.forEach(section => {
        if (section.id === targetId) {
          section.style.display = 'block';
        } else {
          section.style.display = 'none';
        }
      });
    });
  });
}
