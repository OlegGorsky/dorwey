let userId = null;
let balance = 0;
let socket = null;

// Функция для получения userId из Telegram WebApp API
function getUserId() {
    console.log('Проверка наличия Telegram WebApp API...');

    // Проверка на существование Telegram WebApp API
    if (window.Telegram && window.Telegram.WebApp) {
        console.log('Telegram WebApp API доступен');

        const user = window.Telegram.WebApp.initDataUnsafe?.user;

        // Проверяем, доступен ли объект пользователя
        if (user && user.id) {
            userId = user.id;
            console.log('User ID успешно получен из Telegram WebApp:', userId);
            return Promise.resolve(userId);  // Возвращаем успешный результат
        } else {
            console.error('Ошибка: Telegram WebApp API не содержит данных пользователя или отсутствует ID. Данные:', window.Telegram.WebApp.initDataUnsafe);
            return Promise.reject('User ID не получен');
        }
    } else {
        console.error('Ошибка: Telegram WebApp API не доступен');
        return Promise.reject('Telegram WebApp API не доступен');
    }
}

// Функция для получения баланса пользователя
function fetchBalance() {
    if (!userId) {
        console.error('Ошибка: User ID не получен, запрос баланса невозможен');
        return;
    }

    console.log('Запрос баланса для userId:', userId);

    fetch(`https://gorskyapp.ru/api/balance?userId=${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка получения данных');
            }
            return response.json();
        })
        .then(data => {
            if (data.points !== undefined) {
                balance = data.points;
                document.getElementById('balance').innerText = balance;
                console.log('Баланс обновлен:', balance);
            } else {
                console.log('Пользователь не найден, создаем запись...');
                return fetch('https://gorskyapp.ru/api/update-points', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: userId, points: 0 })
                });
            }
        })
        .catch(error => {
            console.error('Ошибка получения баланса:', error);
        });
}

// Функция для подключения к WebSocket
function connectWebSocket() {
    if (!userId) {
        console.error('WebSocket не подключен: userId не получен');
        return;
    }

    if (!socket) {
        console.log('Подключение к WebSocket...');

        socket = io('https://gorskyapp.ru'); // Подключаемся через WSS

        socket.on('updateBalance', (data) => {
            if (data.userId === userId && data.points !== undefined) {
                balance = data.points;
                document.getElementById('balance').innerText = balance;
                console.log('Баланс обновлен через WebSocket:', balance);
            }
        });

        socket.on('connect', () => {
            console.log('WebSocket успешно подключен');
        });

        socket.on('disconnect', () => {
            console.log('WebSocket соединение закрыто');
        });

        socket.on('connect_error', (error) => {
            console.error('Ошибка WebSocket подключения:', error);
        });
    }
}

// Функция для обновления баланса при нажатии
function updateBalance() {
    console.log('Нажатие на изображение, попытка обновления баланса...');

    if (!userId) {
        console.error('Ошибка: userId не получен, операция отменена');
        return;
    }

    if (socket && socket.connected) {
        fetch('https://gorskyapp.ru/api/update-points', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId, points: 3 })
        }).then(() => {
            console.log('Запрос обновления баланса отправлен, +3 очка');
            const tapEffect = document.getElementById('tapEffect');
            tapEffect.style.display = 'block';
            setTimeout(() => {
                tapEffect.style.display = 'none';
            }, 1000);
        }).catch((error) => {
            console.error('Ошибка при обновлении баланса:', error);
        });

        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            console.log('Вибрация выполнена через Telegram WebApp');
        }
    } else {
        console.error('WebSocket не подключен');
    }
}

// Обработка нажатия на изображение
document.getElementById('tapImage').addEventListener('click', updateBalance);

// Выполняем после загрузки страницы
window.addEventListener('DOMContentLoaded', () => {
    console.log('Загрузка страницы завершена');

    getUserId()
        .then(() => {
            if (userId) {
                fetchBalance(); // Получаем баланс
                connectWebSocket(); // Подключаем WebSocket
            } else {
                console.error('User ID не получен');
            }
        })
        .catch(error => {
            console.error('Ошибка при получении userId:', error);
            // Повторная попытка через 3 секунды
            setTimeout(() => {
                getUserId().then(() => {
                    if (userId) {
                        fetchBalance(); // Получаем баланс
                        connectWebSocket(); // Подключаем WebSocket
                    } else {
                        console.error('User ID не получен при повторной попытке');
                    }
                }).catch(retryError => {
                    console.error('Повторная ошибка получения userId:', retryError);
                });
            }, 3000);
        });
});
