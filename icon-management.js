// Функция для обновления иконок вкладок в зависимости от их состояния (активная/неактивная)
function updateTabIcons(activeTab) {
    // Определяем, какие иконки активны, а какие нет
    const icons = {
      1: {
        active: 'https://files.salebot.pro/uploads/file_item/file/44501/1ежкоин.png', // Белая иконка для активной вкладки
        inactive: 'https://files.salebot.pro/uploads/file_item/file/44501/1ежкоин.png' // Обычная иконка для неактивной
      },
      2: {
        active: '/dorwey/image/icon/wfriends_result.webp',
        inactive: '/dorwey/image/icon/friends_result.webp'
      },
      3: {
        active: '/dorwey/image/icon/wzadanie_result.webp',
        inactive: '/dorwey/image/icon/zadanie_result.webp'
      },
      4: {
        active: '/dorwey/image/icon/wrocket_result.webp',
        inactive: '/dorwey/image/icon/rocket_result.webp'
      },
      5: {
        active: '/dorwey/image/icon/wpolza_result.webp',
        inactive: '/dorwey/image/icon/polza_result.webp'
      }
    };
  
    // Проходим по каждой вкладке и обновляем её иконку
    document.querySelectorAll('.tab').forEach(tab => {
      const tabId = tab.getAttribute('data-tab');
      const imgElement = tab.querySelector('img');
  
      if (parseInt(tabId, 10) === activeTab) {
        // Активная вкладка - устанавливаем белую иконку
        imgElement.src = icons[tabId].active;
      } else {
        // Неактивная вкладка - обычная иконка
        imgElement.src = icons[tabId].inactive;
      }
    });
  }
  