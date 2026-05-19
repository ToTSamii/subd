// API URL
const API_URL = 'http://localhost:8080/api';

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
const enrollBtn = document.getElementById('enrollBtn');
const logoLink = document.getElementById('logoLink');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authButtons = document.getElementById('authButtons');
const userInfo = document.getElementById('userInfo');
const userNameSpan = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const userProfileClick = document.getElementById('userProfileClick');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');

// Текущий курс и пользователь
let currentCourse = null;
let currentUser = null;

// Получить ID курса из URL
function getCourseId() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log('ID курса из URL:', id);
    return id;
}

// Обновление навигации по роли
function updateNavigationByRole(roleName) {
    const scheduleLink = document.getElementById('scheduleLink');
    const progressLink = document.getElementById('progressLink');
    const groupLink = document.getElementById('groupLink');
    const myCoursesLink = document.getElementById('myCoursesLink');
    const usersLink = document.getElementById('usersLink');
    const coursesLink = document.getElementById('coursesLink');
    
    if (scheduleLink) scheduleLink.style.display = 'none';
    if (progressLink) progressLink.style.display = 'none';
    if (groupLink) groupLink.style.display = 'none';
    if (myCoursesLink) myCoursesLink.style.display = 'none';
    if (usersLink) usersLink.style.display = 'none';
    if (coursesLink) coursesLink.style.display = 'none';
    
    if (roleName === 'Администратор' || roleName === 'ADMIN' || roleName === 'ROLE_ADMIN') {
        if (scheduleLink) { scheduleLink.style.display = 'inline-block'; scheduleLink.textContent = 'Расписание'; }
        if (progressLink) { progressLink.style.display = 'inline-block'; progressLink.textContent = 'Успеваемость'; }
        if (groupLink) { groupLink.style.display = 'inline-block'; groupLink.textContent = 'Группы'; }
        if (usersLink) { usersLink.style.display = 'inline-block'; usersLink.textContent = 'Пользователи'; }
        if (coursesLink) { coursesLink.style.display = 'inline-block'; coursesLink.textContent = 'Курсы'; }
    } 
    else if (roleName === 'Преподаватель' || roleName === 'TEACHER' || roleName === 'ROLE_TEACHER') {
        if (scheduleLink) { scheduleLink.style.display = 'inline-block'; scheduleLink.textContent = 'Расписание'; }
        if (progressLink) { progressLink.style.display = 'inline-block'; progressLink.textContent = 'Успеваемость'; }
        if (groupLink) { groupLink.style.display = 'inline-block'; groupLink.textContent = 'Группы'; }
    }
    else if (roleName === 'Студент' || roleName === 'STUDENT' || roleName === 'ROLE_STUDENT') {
        if (scheduleLink) { scheduleLink.style.display = 'inline-block'; scheduleLink.textContent = 'Расписание'; }
        if (progressLink) { progressLink.style.display = 'inline-block'; progressLink.textContent = 'Успеваемость'; }
        if (groupLink) { groupLink.style.display = 'inline-block'; groupLink.textContent = 'Группа'; }
        if (myCoursesLink) { myCoursesLink.style.display = 'inline-block'; myCoursesLink.textContent = 'Мои курсы'; }
    }
    else {
        if (scheduleLink) { scheduleLink.style.display = 'inline-block'; scheduleLink.textContent = 'Расписание'; }
        if (progressLink) { progressLink.style.display = 'inline-block'; progressLink.textContent = 'Успеваемость'; }
        if (groupLink) { groupLink.style.display = 'inline-block'; groupLink.textContent = 'Группа'; }
        if (myCoursesLink) { myCoursesLink.style.display = 'inline-block'; myCoursesLink.textContent = 'Мои курсы'; }
    }
}

// Получение роли из данных
function getUserRole(userData) {
    if (!userData) return null;
    if (userData.roleName) return userData.roleName;
    if (userData.role && userData.role.name) return userData.role.name;
    if (userData.role && typeof userData.role === 'string') return userData.role;
    if (userData.authorities && userData.authorities.length > 0) {
        let role = userData.authorities[0];
        if (role.startsWith('ROLE_')) role = role.substring(5);
        return role;
    }
    return null;
}

// Загрузка данных пользователя
async function loadUserData() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        
        const response = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            currentUser = userData;
            return userData;
        } else {
            localStorage.removeItem('token');
            return null;
        }
    } catch (error) {
        console.error('Error loading user:', error);
        return null;
    }
}

// Проверка авторизации и обновление UI
async function checkAuth() {
    const token = localStorage.getItem('token');
    
    if (token) {
        const userData = await loadUserData();
        
        if (userData) {
            if (authButtons) authButtons.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';
            
            const displayName = userData.firstName || userData.login || userData.email;
            if (userNameSpan) userNameSpan.textContent = displayName;
            
            if (userAvatar) {
                if (userData.photo && userData.photo !== 'null' && userData.photo.trim() !== '') {
                    userAvatar.innerHTML = `<img src="${userData.photo}" alt="avatar" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'">`;
                } else {
                    userAvatar.innerHTML = '<i class="fas fa-user"></i>';
                }
            }
            
            const role = getUserRole(userData);
            updateNavigationByRole(role);
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'none';
            updateNavigationByRole(null);
        }
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userInfo) userInfo.style.display = 'none';
        updateNavigationByRole(null);
    }
}

// Загрузка деталей курса
async function loadCourseDetail() {
    const courseId = getCourseId();
    
    if (!courseId) {
        showError('ID курса не указан');
        return;
    }
    
    loadingDetail.style.display = 'block';
    errorDetail.style.display = 'none';
    courseContainer.style.display = 'none';
    
    try {
        const response = await fetch(`${API_URL}/courses/${courseId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Курс не найден');
            }
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Данные курса:', data);
        
        // Обработка разных форматов ответа
        let course = null;
        if (data.course) {
            course = data.course;
        } else if (data.name || data.description) {
            course = data;
        } else {
            course = data;
        }
        
        if (!course || (!course.name && !course.title)) {
            throw new Error('Данные курса не найдены');
        }
        
        currentCourse = course;
        renderCourseDetail(course);
        
    } catch (error) {
        console.error('Error loading course:', error);
        showError(error.message);
    } finally {
        loadingDetail.style.display = 'none';
    }
}

function renderCourseDetail(course) {
    const title = course.name || course.title || 'Без названия';
    const description = course.description || 'Описание отсутствует';
    const duration = course.durationHours;
    const cost = course.cost;
    
    courseName.textContent = title;
    courseDescription.textContent = description;
    
    // Длительность
    let durationText = 'Не указана';
    if (duration && duration > 0) {
        if (duration >= 40) {
            const weeks = Math.round(duration / 40);
            durationText = `${weeks} ${getWeeksText(weeks)} (${duration} часов)`;
        } else {
            durationText = `${duration} часов`;
        }
    }
    courseDuration.textContent = durationText;
    durationDetail.textContent = durationText;
    
    // Стоимость
    let priceText = 'Бесплатно';
    let priceValue = '0 ₽';
    if (cost && cost > 0) {
        priceText = `${cost.toLocaleString()} ₽`;
        priceValue = `${cost.toLocaleString()} ₽`;
    } else if (cost === 0) {
        priceText = 'Бесплатно';
        priceValue = '0 ₽';
    } else if (cost === null || cost === undefined) {
        priceText = 'Уточняется';
        priceValue = 'Уточняется';
    }
    coursePrice.textContent = priceText;
    priceDetail.textContent = priceValue;
    
    courseContainer.style.display = 'block';
}

function getWeeksText(weeks) {
    if (weeks === 1) return 'неделя';
    if (weeks >= 2 && weeks <= 4) return 'недели';
    return 'недель';
}

function showError(message) {
    errorDetail.style.display = 'block';
    errorDetail.textContent = `Ошибка: ${message}`;
    loadingDetail.style.display = 'none';
    courseContainer.style.display = 'none';
}

function showTemporaryMessage(message, type) {
    const msgDiv = document.createElement('div');
    msgDiv.textContent = message;
    msgDiv.className = `form-message ${type}`;
    msgDiv.style.position = 'fixed';
    msgDiv.style.bottom = '20px';
    msgDiv.style.right = '20px';
    msgDiv.style.zIndex = '2000';
    msgDiv.style.maxWidth = '300px';
    msgDiv.style.padding = '12px 20px';
    msgDiv.style.borderRadius = '8px';
    msgDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    
    if (type === 'success') {
        msgDiv.style.background = '#dcfce7';
        msgDiv.style.color = '#166534';
        msgDiv.style.border = '1px solid #86efac';
    } else {
        msgDiv.style.background = '#fee2e2';
        msgDiv.style.color = '#991b1b';
        msgDiv.style.border = '1px solid #fecaca';
    }
    
    document.body.appendChild(msgDiv);
    
    setTimeout(() => {
        msgDiv.remove();
    }, 3000);
}

// Запись на курс
async function enrollInCourse() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        showTemporaryMessage('Необходимо войти в систему', 'error');
        openModal(loginModal);
        return;
    }
    
    if (!currentCourse) {
        showTemporaryMessage('Ошибка: курс не загружен', 'error');
        return;
    }
    
    const courseId = getCourseId();
    showTemporaryMessage('Функция записи на курс будет доступна в следующей версии', 'success');
}

// Навигация
function goBack() {
    window.location.href = 'index.html';
}

if (logoLink) {
    logoLink.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

if (userProfileClick) {
    userProfileClick.addEventListener('click', (e) => {
        if (e.target.id !== 'logoutBtn') {
            window.location.href = 'profile.html';
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
}

// Модальные окна
function openModal(modal) {
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

if (loginBtn) {
    loginBtn.onclick = () => openModal(loginModal);
}

if (registerBtn) {
    registerBtn.onclick = () => openModal(registerModal);
}

document.querySelectorAll('.close').forEach(close => {
    close.onclick = () => {
        closeModal(loginModal);
        closeModal(registerModal);
    };
});

window.onclick = (e) => {
    if (e.target === loginModal) closeModal(loginModal);
    if (e.target === registerModal) closeModal(registerModal);
};

// Форма входа
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const loginInput = document.getElementById('loginUsername');
        const passwordInput = document.getElementById('loginPassword');
        
        const login = loginInput ? loginInput.value : '';
        const password = passwordInput ? passwordInput.value : '';
        
        if (loginMessage) {
            loginMessage.style.display = 'none';
            loginMessage.className = 'form-message';
        }
        
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password })
            });
            
            let data = {};
            try {
                data = await response.json();
            } catch (e) {}
            
            if (response.ok && data.accessToken) {
                localStorage.setItem('token', data.accessToken);
                
                if (loginModal) loginModal.style.display = 'none';
                if (loginForm) loginForm.reset();
                
                showTemporaryMessage('Вход выполнен успешно!', 'success');
                
                setTimeout(() => {
                    window.location.reload();
                }, 500);
                
            } else {
                let errorMessage = 'Неверный логин или пароль';
                if (data.message) errorMessage = data.message;
                else if (data.error) errorMessage = data.error;
                
                if (loginMessage) {
                    loginMessage.textContent = errorMessage;
                    loginMessage.className = 'form-message error';
                    loginMessage.style.display = 'block';
                }
            }
            
        } catch (error) {
            if (loginMessage) {
                loginMessage.textContent = 'Ошибка соединения с сервером';
                loginMessage.className = 'form-message error';
                loginMessage.style.display = 'block';
            }
        }
    });
}

// Кнопка записи
if (enrollBtn) {
    enrollBtn.addEventListener('click', enrollInCourse);
}

// Инициализация
async function init() {
    await checkAuth();
    await loadCourseDetail();
}

init();