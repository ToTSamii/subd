// my-course.js - страница "Мой курс" для студента

// API_URL уже объявлен в main.js

// DOM элементы
const loadingDetail = document.getElementById('loadingDetail');
const errorDetail = document.getElementById('errorDetail');
const courseContainer = document.getElementById('courseContainer');
const courseName = document.getElementById('courseName');
const courseDuration = document.getElementById('courseDuration');
const coursePrice = document.getElementById('coursePrice');
const courseDescription = document.getElementById('courseDescription');
const durationDetail = document.getElementById('durationDetail');
const priceDetail = document.getElementById('priceDetail');
const groupInfoBlock = document.getElementById('groupInfoBlock');
const groupNameSpan = document.getElementById('groupName');
const groupDatesSpan = document.getElementById('groupDates');

// Используем currentUser из main.js, не объявляем новый

// Получение токена
function getAuthToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

// Форматирование даты
function formatDate(dateString) {
    if (!dateString) return 'Не указана';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

// Получение текста длительности
function getDurationText(duration) {
    if (!duration || duration <= 0) return 'Не указана';
    if (duration >= 40) {
        const weeks = Math.round(duration / 40);
        return `${weeks} ${getWeeksText(weeks)} (${duration} часов)`;
    }
    return `${duration} часов`;
}

function getWeeksText(weeks) {
    if (weeks === 1) return 'неделя';
    if (weeks >= 2 && weeks <= 4) return 'недели';
    return 'недель';
}

// Получение текста цены
function getPriceText(cost) {
    if (cost && cost > 0) {
        return `${cost.toLocaleString()} ₽`;
    }
    if (cost === 0) return 'Бесплатно';
    return 'Уточняется';
}

// Загрузка группы студента по userId
async function loadStudentGroup(userId) {
    console.log('Loading group for userId:', userId);
    
    if (!userId) return null;
    
    try {
        const token = getAuthToken();
        if (!token) return null;
        
        const response = await fetch(`${API_URL}/student/group/${userId}`, {
            method: 'GET',
            headers: { 
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Group response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Ошибка: ${response.status}`);
        }
        
        const groupData = await response.json();
        console.log('Group data:', groupData);
        
        return {
            id: groupData.id || groupData.groupId,
            name: groupData.name || groupData.groupName,
            courseId: groupData.course?.code || groupData.courseId,
            courseName: groupData.course?.name || groupData.courseName,
            startDate: groupData.startDate,
            endDate: groupData.endDate
        };
        
    } catch (error) {
        console.error('Error loading group:', error);
        return null;
    }
}

// Загрузка курса по ID
async function loadCourseById(courseId) {
    if (!courseId) return null;
    
    try {
        const response = await fetch(`${API_URL}/courses/${courseId}`);
        
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Course data:', data);
        
        let course = data.course || data;
        return course;
        
    } catch (error) {
        console.error('Error loading course:', error);
        return null;
    }
}

// Получение текущего пользователя из localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
}

// Рендер страницы курса
function renderCoursePage(course, group) {
    const title = course.name || course.title || 'Без названия';
    const description = course.description || 'Описание отсутствует';
    const duration = course.durationHours;
    const cost = course.cost;
    
    const durationText = getDurationText(duration);
    const priceText = getPriceText(cost);
    const priceValue = cost && cost > 0 ? `${cost.toLocaleString()} ₽` : (cost === 0 ? '0 ₽' : 'Уточняется');
    
    courseName.textContent = title;
    courseDescription.textContent = description;
    courseDuration.textContent = durationText;
    durationDetail.textContent = durationText;
    coursePrice.textContent = priceText;
    priceDetail.textContent = priceValue;
    
    // Показываем информацию о группе, если есть
    if (group && group.name) {
        groupNameSpan.textContent = group.name;
        
        let datesText = '';
        if (group.startDate && group.endDate) {
            datesText = `${formatDate(group.startDate)} - ${formatDate(group.endDate)}`;
        } else if (group.startDate) {
            datesText = `с ${formatDate(group.startDate)}`;
        } else if (group.endDate) {
            datesText = `по ${formatDate(group.endDate)}`;
        } else {
            datesText = 'Даты не указаны';
        }
        groupDatesSpan.textContent = datesText;
        groupInfoBlock.style.display = 'block';
    } else {
        groupInfoBlock.style.display = 'none';
    }
    
    courseContainer.style.display = 'block';
    loadingDetail.style.display = 'none';
}

function showError(message) {
    errorDetail.style.display = 'block';
    errorDetail.textContent = message;
    loadingDetail.style.display = 'none';
    courseContainer.style.display = 'none';
}

// Основная функция
async function initMyCourse() {
    console.log('Initializing my course page...');
    
    const currentUser = getCurrentUser();
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
        showError('Необходимо авторизоваться');
        return;
    }
    
    // Проверяем роль
    const role = currentUser.role?.name || currentUser.roleName;
    console.log('User role:', role);
    
    if (role !== 'Студент' && role !== 'STUDENT' && role !== 'ROLE_STUDENT') {
        showError('Эта страница доступна только студентам');
        return;
    }
    
    // Получаем userId
    const userId = currentUser.userId || currentUser.id;
    console.log('User ID:', userId);
    
    if (!userId) {
        showError('Не удалось определить ID пользователя');
        return;
    }
    
    // Загружаем группу студента
    const group = await loadStudentGroup(userId);
    console.log('Student group:', group);
    
    if (!group || !group.courseId) {
        // Нет группы или нет курса в группе
        courseContainer.style.display = 'block';
        loadingDetail.style.display = 'none';
        
        courseName.textContent = 'Курс не найден';
        courseDescription.textContent = 'Вы ещё не записаны ни на один курс. Перейдите на главную страницу, чтобы выбрать курс.';
        courseDuration.textContent = '—';
        durationDetail.textContent = '—';
        coursePrice.textContent = '—';
        priceDetail.textContent = '—';
        groupInfoBlock.style.display = 'none';
        
        const actionsDiv = document.querySelector('.course-actions');
        if (actionsDiv) {
            actionsDiv.innerHTML = `
                <button class="btn-primary btn-large" onclick="window.location.href='index.html'">
                    <i class="fas fa-search"></i> Выбрать курс
                </button>
                <button class="btn-outline btn-large" onclick="window.location.href='group.html'">
                    <i class="fas fa-users"></i> Моя группа
                </button>
            `;
        }
        return;
    }
    
    // Загружаем курс по ID из группы
    const course = await loadCourseById(group.courseId);
    console.log('Course:', course);
    
    if (!course) {
        showError('Курс не найден');
        return;
    }
    
    renderCoursePage(course, group);
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', initMyCourse);