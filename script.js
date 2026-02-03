// Полный обновленный script.js
document.addEventListener('DOMContentLoaded', function() {
    // Конфигурация
    const CONFIG = {
        GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyGXtMmwQIFOvaixx0mfrhTM9u7Vu2woI1UF-tvvSEBhYExZ9eq731FUPgO6iZ7z1Eh/exec',
        CASE_NUMBER: '21-08/2016',
        WEDDING_DATE: '21.08.2026',
        WEDDING_COUPLE: 'Логачев Д.А. и Мелюханова В.Н.'
    };

    // Генерация номера регистрации
    function generateRegistrationNumber() {
        const date = new Date();
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${day}${month}${year}-${random}`;
    }

    // Основные элементы
    const officialForm = document.getElementById('officialForm');
    const modal = document.getElementById('confirmationModal');
    const closeModal = document.querySelector('.close-modal');
    const caseNumberElement = document.getElementById('caseNumber');
    const mapLinkFull = document.getElementById('mapLinkFull');
    
    // Элементы формы
    const fullNameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phone');

    // Показ состояния отправки
    function showLoading() {
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'ОТПРАВКА...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        
        return () => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        };
    }

    // Отправка данных в Google Sheets
    async function sendToGoogleSheets(formData) {
        try {
            console.log('Отправка данных в Google Sheets:', formData);
            
            // Используем метод POST с form-urlencoded
            const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(formData)
            });
            
            console.log('Запрос отправлен (no-cors режим)');
            return { success: true, message: 'Данные отправлены' };
            
        } catch (error) {
            console.error('Ошибка отправки в Google Sheets:', error);
            
            // Возвращаем успех даже при ошибке, чтобы пользователь видел подтверждение
            return { 
                success: false, 
                message: 'Не удалось отправить в таблицу, но данные сохранены локально',
                error: error.toString()
            };
        }
    }

    // Обработчик отправки формы
    officialForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Получение данных формы
        const fullName = fullNameInput.value.trim();
        const phone = phoneInput.value.trim();
        const attending = document.querySelector('input[name="attendance"]:checked');
        
        // Валидация
        if (!fullName) {
            alert('Укажите ФИО полностью');
            fullNameInput.focus();
            return;
        }
        
        // Упрощенная валидация телефона - просто проверяем наличие цифр
        if (!phone || !phone.match(/\d/)) {
            alert('Введите номер телефона');
            phoneInput.focus();
            return;
        }
        
        if (!attending) {
            alert('Отметьте возможность явки');
            return;
        }
        
        // Показ загрузки
        const hideLoading = showLoading();
        
        // Генерация номера
        const regNumber = generateRegistrationNumber();
        
        // Очистка телефона от лишних символов для отправки
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Подготовка данных для отправки
        const formData = {
            fullName: fullName,
            phone: cleanPhone,
            attendance: attending.value,
            registrationNumber: regNumber,
            caseNumber: CONFIG.CASE_NUMBER,
            timestamp: new Date().toISOString()
        };
        
        // 1. Сохранение в localStorage (основное)
        const responseData = {
            ...formData,
            submissionDate: new Date().toLocaleString('ru-RU'),
            weddingDate: CONFIG.WEDDING_DATE,
            weddingCouple: CONFIG.WEDDING_COUPLE,
            attendanceText: attending.value === 'yes' ? 
                'Обязуюсь своевременно явиться к назначенной дате и времени' : 
                'Не смогу явиться'
        };
        
        localStorage.setItem('weddingDocumentResponse', JSON.stringify(responseData));
        console.log('Данные сохранены в localStorage:', responseData);
        
        // 2. Отправка в Google Sheets
        if (CONFIG.GOOGLE_SCRIPT_URL && !CONFIG.GOOGLE_SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID')) {
            const googleResult = await sendToGoogleSheets(formData);
            console.log('Результат отправки в Google Sheets:', googleResult);
        } else {
            console.log('URL Google Script не настроен, пропускаем отправку');
        }
        
        // 3. Показ подтверждения
        caseNumberElement.textContent = regNumber;
        modal.style.display = 'flex';
        
        // 4. Анимация подтверждения
        setTimeout(() => {
            const stamp = document.querySelector('.modal-stamp');
            if (stamp) {
                stamp.style.transform = 'rotate(0deg) scale(1.1)';
                stamp.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    stamp.style.transform = 'rotate(-5deg) scale(1)';
                }, 500);
            }
        }, 100);
        
        // 5. Сброс формы
        setTimeout(() => {
            officialForm.reset();
            hideLoading();
            
            // Закрытие модального окна через 3 секунды
            setTimeout(() => {
                modal.style.display = 'none';
            }, 3000);
        }, 1000);
    });

    // Закрытие модального окна
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Обработчик ссылки на карту
    mapLinkFull.addEventListener('click', function(e) {
        e.preventDefault();
        
        const constructorId = "f19d47e766d69180529b6f8fb5b4776a389235eddde917117bfff6acd0fab186";
        const mapUrl = `https://yandex.ru/maps/?um=constructor%3A${constructorId}&source=constructorLink`;
        
        // Открываем карту в новом окне
        const mapWindow = window.open(mapUrl, '_blank');
        
        if (!mapWindow) {
            alert('Всплывающее окно заблокировано. Ссылка на карту: ' + mapUrl);
        }
    });

    // ПРОСТАЯ маска для телефона - только цифры, без автоматического форматирования
    phoneInput.addEventListener('input', function(e) {
        // Разрешаем только цифры, плюс, пробел, скобки, дефис
        let value = e.target.value;
        
        // Удаляем все символы, кроме цифр, +, (, ), -, пробела
        value = value.replace(/[^\d\+\s\(\)-]/g, '');
        
        e.target.value = value;
    });

    // Автозаполнение из localStorage если есть сохраненные данные
    function loadSavedData() {
        const savedResponse = localStorage.getItem('weddingDocumentResponse');
        if (savedResponse) {
            try {
                const response = JSON.parse(savedResponse);
                console.log('Найден предыдущий ответ:', response);
                
                showPreviousResponseNotification(response);
                
            } catch (e) {
                console.error('Ошибка чтения сохраненного ответа:', e);
            }
        }
    }

    // Показ уведомления о предыдущем ответе
    function showPreviousResponseNotification(response) {
        const notification = document.createElement('div');
        notification.className = 'previous-response-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">✓ Вы уже отправили расписку</div>
            <div style="font-size: 12pt;">${response.fullName}</div>
            <div style="font-size: 11pt; opacity: 0.9;">Номер: ${response.registrationNumber}</div>
            <button style="margin-top: 10px; background: rgba(255,255,255,0.2); border: none; color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                Закрыть
            </button>
        `;
        
        document.body.appendChild(notification);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        notification.querySelector('button').addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        });
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 10000);
    }

    // Настройка автосохранения
    function setupAutoSave() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
        } catch (e) {
            console.warn('localStorage не доступен:', e);
            return;
        }
        
        const saveTimeout = 1000;
        let timeoutId;
        
        function saveFormState() {
            const formState = {
                fullName: fullNameInput.value,
                phone: phoneInput.value,
                attendance: document.querySelector('input[name="attendance"]:checked')?.value
            };
            
            localStorage.setItem('weddingFormDraft', JSON.stringify(formState));
        }
        
        [fullNameInput, phoneInput].forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(saveFormState, saveTimeout);
            });
        });
        
        const draft = localStorage.getItem('weddingFormDraft');
        if (draft) {
            try {
                const formState = JSON.parse(draft);
                fullNameInput.value = formState.fullName || '';
                phoneInput.value = formState.phone || '';
                
                if (formState.attendance) {
                    const radio = document.querySelector(`input[name="attendance"][value="${formState.attendance}"]`);
                    if (radio) radio.checked = true;
                }
            } catch (e) {
                console.log('Не удалось восстановить черновик');
            }
        }
    }

    // Предотвращение автоматической прокрутки вниз
    function preventAutoScroll() {
        // Отменяем любую автоматическую прокрутку
        window.scrollTo(0, 0);
        
        // Запрещаем фокус на поле при загрузке
        setTimeout(() => {
            if (document.activeElement === fullNameInput || document.activeElement === phoneInput) {
                document.activeElement.blur();
            }
        }, 100);
    }

    // Инициализация
    function init() {
        console.log(`=== СВАДЕБНОЕ ИЗВЕЩЕНИЕ ===`);
        console.log(`Номер дела: ${CONFIG.CASE_NUMBER}`);
        console.log(`Дата свадьбы: ${CONFIG.WEDDING_DATE}`);
        console.log(`Пары: ${CONFIG.WEDDING_COUPLE}`);
        console.log(`Загружено: ${new Date().toLocaleString('ru-RU')}`);
        
        if (CONFIG.GOOGLE_SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID')) {
            console.warn('⚠️ URL Google Script не настроен!');
        }
        
        // Загружаем сохраненные данные
        loadSavedData();
        
        // Настраиваем автосохранение
        setupAutoSave();
        
        // Предотвращаем автоматическую прокрутку
        preventAutoScroll();
        
        // Добавляем стили для модального окна
        const modalStyles = document.createElement('style');
        modalStyles.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes scaleIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            
            .modal {
                animation: fadeIn 0.3s ease;
            }
            
            .modal-content {
                animation: scaleIn 0.3s ease;
            }
            
            .previous-response-notification {
                font-family: 'Times New Roman', serif;
            }
        `;
        document.head.appendChild(modalStyles);
    }

    // Запуск инициализации
    init();

    // Улучшения для мобильных
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // Предотвращаем зум при фокусе
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('focus', () => {
                setTimeout(() => {
                    window.scrollTo(0, 0);
                }, 100);
            });
        });
    }
    
    // Обработка нажатия Enter в форме
    officialForm.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.type !== 'radio' && e.target.type !== 'submit') {
            e.preventDefault();
            
            const formElements = Array.from(this.elements);
            const currentIndex = formElements.indexOf(e.target);
            const nextElement = formElements[currentIndex + 1];
            
            if (nextElement) {
                nextElement.focus();
                if (nextElement.type === 'radio') {
                    nextElement.checked = true;
                }
            }
        }
    });
});