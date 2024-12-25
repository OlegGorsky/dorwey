function initUserStats() {
    let updateInterval = 5000; // Интервал обновления данных (5 секунд)

    // Функция для получения данных о пользователе через API
    async function fetchUserData(userId) {
        try {
            const response = await fetch(`https://gorskyapp.ru/api/balance?userId=${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка сети');
            }

            const data = await response.json();
            const referralCount = data.referral_count || 0;
            const earnedPoints = referralCount * 300; // Рассчитываем баллы только за приглашенных

            document.getElementById('user-friends-count').textContent = referralCount;
            document.getElementById('user-earnings').textContent = earnedPoints;

        } catch (error) {
            console.error('Ошибка получения данных:', error);
        }
    }

    // Инициализация Telegram API и обновление данных через интервал
    function onTelegramReady() {
        let userId = "defaultUserId"; // Значение по умолчанию
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe.user) {
            userId = window.Telegram.WebApp.initDataUnsafe.user.id;
        }

        // Запрашиваем данные через API при запуске
        fetchUserData(userId);

        // Устанавливаем периодическое обновление данных через API
        setInterval(() => {
            fetchUserData(userId);
        }, updateInterval);
    }

    // Проверка наличия Telegram WebApp API и инициализация
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        onTelegramReady();
    } else {
        console.error('Telegram WebApp API is not available');
    }
}

// Инициализация при загрузке страницы
initUserStats();
