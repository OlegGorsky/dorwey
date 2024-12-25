// Изменение цвета хедера через WebApp API
const headerColor = '#28161d'; // Цвет хедера
if (Telegram?.WebApp?.setHeaderColor) {
  Telegram.WebApp.setHeaderColor(headerColor);
}

document.addEventListener('DOMContentLoaded', () => {
  if (Telegram?.WebApp?.setHeaderColor) {
    Telegram.WebApp.setHeaderColor(headerColor);
  }
  activateTab(1); // Первая вкладка активна по умолчанию
});

// Функция для очистки контента вкладки
function clearContent() {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = ''; // Очищаем контент
}

// Функция для выполнения скриптов, найденных в HTML-контенте
function executeScripts(container) {
  const scripts = container.querySelectorAll('script');
  scripts.forEach((script) => {
    const newScript = document.createElement('script');
    if (script.src) {
      newScript.src = script.src;
      newScript.async = true; // Асинхронная загрузка внешних скриптов
    } else {
      newScript.textContent = script.textContent;
    }
    container.appendChild(newScript); // Выполняем скрипт
  });
}

// Функция для загрузки HTML для вкладки и выполнения встроенных скриптов
function loadTabContent(url) {
  const cacheBuster = `?v=${new Date().getTime()}`;
  return fetch(url + cacheBuster)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ошибка: ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      const contentDiv = document.getElementById('content');
      contentDiv.innerHTML = data;
      executeScripts(contentDiv);
    })
    .catch(error => {
      console.error('Ошибка загрузки контента:', error);
      const contentDiv = document.getElementById('content');
      contentDiv.innerHTML = `<p class="error">Ошибка загрузки контента. Попробуйте снова позже.</p>`;
    });
}

// Функция для активации вкладки и загрузки контента
function activateTab(tabNumber) {
  clearContent();
  updateTabIcons(tabNumber);

  switch (tabNumber) {
    case 1:
      loadTabContent('/dorwey/tabs/tab1.html');
      break;
    case 2:
      loadTabContent('/dorwey/tabs/tab2.html');
      break;
    case 3:
      loadTabContent('/dorwey/tabs/tab3.html');
      break;
    case 4:
      loadTabContent('/dorwey/tabs/tab4.html');
      break;
    case 5:
      loadTabContent('/dorwey/tabs/tab5.html');
      break;
    default:
      console.error('Неизвестная вкладка:', tabNumber);
      const contentDiv = document.getElementById('content');
      contentDiv.innerHTML = '<p class="error">Контент для этой вкладки не найден.</p>';
  }
}


