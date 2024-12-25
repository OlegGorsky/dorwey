async function sendLogToTelegram(message) {
    const botToken = '';
    const chatId = '256125761';
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message
            })
        });
    } catch (error) {
        console.error('Ошибка при отправке лога в Telegram:', error);
    }
}

async function getUserDataAndSend() {
    const tg = window.Telegram.WebApp;

    // Получаем userId из данных WebApp
    const userId = tg.initDataUnsafe?.user?.id;
    await sendLogToTelegram(`User ID: ${userId} зашел на страницу`);

    // Проверяем наличие параметра startapp
    const urlParams = new URLSearchParams(window.location.search);
    const startParamFromUrl = urlParams.get('startapp');
    const startParam = startParamFromUrl || tg.initDataUnsafe?.start_param;

    if (!startParam) {
        await sendLogToTelegram('Метка startapp не найдена ни в URL, ни в Telegram WebApp данных');
        return;
    }

    // Декодируем метку startapp
    let partnerId;
    try {
        partnerId = atob(startParam);  // Декодирование параметра
        await sendLogToTelegram(`Метка startapp получена, партнер ID: ${partnerId}`);
    } catch (error) {
        await sendLogToTelegram(`Ошибка декодирования параметра startapp: ${error.message}`);
        return;
    }

    // Преобразуем данные в JSON-формат для отправки на сервер
    const referrerData = {
        userId: userId,
        referrerId: partnerId
    };

    // Логируем данные перед отправкой
    await sendLogToTelegram(`Отправка данных: ${JSON.stringify(referrerData)}`);

    // Проверяем реферальный статус, если partnerId отличается от userId
    if (partnerId !== userId) {
        try {
            const response = await fetch('https://gorskyapp.ru/api/check-referral', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(referrerData)  // Отправляем данные как JSON
            });

            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                if (data.message === 'New referral added') {
                    await sendLogToTelegram(`Реферал добавлен для userId ${userId}, партнер ${partnerId} получил 300 баллов.`);
                } else if (data.message === 'User is already referred') {
                    await sendLogToTelegram(`Пользователь ${userId} уже является чьим-то рефералом.`);
                } else {
                    await sendLogToTelegram(`Ошибка при добавлении реферала для userId ${userId}, сообщение: ${data.message}`);
                }
            } else {
                const text = await response.text();
                await sendLogToTelegram(`Ошибка: Ожидался JSON, но получен другой ответ: ${text}`);
            }
        } catch (error) {
            await sendLogToTelegram(`Ошибка при проверке реферального статуса для userId ${userId}: ${error.message}`);
        }
    } else {
        await sendLogToTelegram(`Ошибка: Параметр partner совпадает с user_id`);
    }
}

// Запуск функции при загрузке страницы
document.addEventListener('DOMContentLoaded', getUserDataAndSend);
