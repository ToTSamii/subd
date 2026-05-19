// API URL
const API_URL = 'http://localhost:8080/api';

// DOM элементы
const coursesGrid = document.getElementById('coursesGrid');
const loading = document.getElementById('loading');
const errorMsg = document.getElementById('errorMsg');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authButtons = document.getElementById('authButtons');
const userInfo = document.getElementById('userInfo');
const userNameSpan = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const userNav = document.getElementById('userNav');
const logoLink = document.getElementById('logoLink');
const userProfileClick = document.getElementById('userProfileClick');

// Модальные окна
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');

// Навигационные ссылки
const scheduleLink = document.getElementById('scheduleLink');
const progressLink = document.getElementById('progressLink');
const groupLink = document.getElementById('groupLink');
const myCoursesLink = document.getElementById('myCoursesLink');
const usersLink = document.getElementById('usersLink');
const coursesLink = document.getElementById('coursesLink');

if (logoLink) {
    logoLink.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============ КУРСЫ ============
async function loadCourses() {
    if (!coursesGrid) return;
    
    if (loading) loading.style.display = 'block';
    if (errorMsg) errorMsg.style.display = 'none';
    coursesGrid.innerHTML = '';
    
    try {
        const response = await fetch(`${API_URL}/courses/`);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        let courses = [];
        if (data.courses && Array.isArray(data.courses)) {
            courses = data.courses;
        } else if (Array.isArray(data)) {
            courses = data;
        } else if (data.content && Array.isArray(data.content)) {
            courses = data.content;
        }
        
        if (!courses || courses.length === 0) {
            coursesGrid.innerHTML = '<div class="error">Курсы не найдены</div>';
        } else {
            renderCourses(courses);
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        if (errorMsg) {
            errorMsg.style.display = 'block';
            errorMsg.textContent = `Ошибка загрузки курсов: ${error.message}`;
        }
        coursesGrid.innerHTML = '';
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

function renderCourses(courses) {
    if (!coursesGrid) return;
    
    coursesGrid.innerHTML = courses.map(course => {
        const id = course.code || course.id;
        const title = course.name || course.title || 'Без названия';
        const description = course.description || 'Описание отсутствует';
        const duration = course.durationHours;
        const cost = course.cost;
        
        let durationText = 'Не указана';
        if (duration && duration > 0) {
            if (duration >= 40) {
                const weeks = Math.round(duration / 40);
                durationText = `${weeks} ${getWeeksText(weeks)} (${duration} ч)`;
            } else {
                durationText = `${duration} часов`;
            }
        }
        
        let priceText = 'Бесплатно';
        if (cost && cost > 0) {
            priceText = `${cost.toLocaleString()} ₽`;
        } else if (cost === 0) {
            priceText = 'Бесплатно';
        } else if (cost === null || cost === undefined) {
            priceText = 'Уточняется';
        }
        
        return `
            <div class="course-card" onclick="showCourseInfo(${id})">
                <h3>${escapeHtml(title)}</h3>
                <p>${escapeHtml(description)}</p>
                <div class="course-meta">
                    <span class="price">${priceText}</span>
                    <span class="duration"><i class="far fa-clock"></i> ${durationText}</span>
                </div>
            </div>
        `;
    }).join('');
}

function getWeeksText(weeks) {
    if (weeks === 1) return 'неделя';
    if (weeks >= 2 && weeks <= 4) return 'недели';
    return 'недель';
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

window.showCourseInfo = function(courseId) {
    window.location.href = `course-detail.html?id=${courseId}`;
};

// ============ ЗАГРУЗКА ДАННЫХ ПОЛЬЗОВАТЕЛЯ ============
let currentUser = null;

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
            console.log('Получены данные пользователя:', userData);
            currentUser = userData;
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        } else {
            console.error('Ошибка загрузки пользователя:', response.status);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return null;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        return null;
    }
}

// Функция получения роли из данных пользователя
function getUserRole(userData) {
    if (!userData) return null;
    
    if (userData.roleName) {
        return userData.roleName;
    }
    if (userData.role && userData.role.name) {
        return userData.role.name;
    }
    if (userData.role && typeof userData.role === 'string') {
        return userData.role;
    }
    if (userData.authorities && userData.authorities.length > 0) {
        let role = userData.authorities[0];
        if (role.startsWith('ROLE_')) role = role.substring(5);
        return role;
    }
    
    return null;
}

// Глобальная функция обновления навигации по роли
window.updateNavigationByRole = function(roleName) {
    console.log('=== ОБНОВЛЕНИЕ НАВИГАЦИИ ===');
    console.log('Роль:', roleName);
    
    const scheduleLink = document.getElementById('scheduleLink');
    const progressLink = document.getElementById('progressLink');
    const groupLink = document.getElementById('groupLink');
    const myCoursesLink = document.getElementById('myCoursesLink');
    const usersLink = document.getElementById('usersLink');
    const coursesLink = document.getElementById('coursesLink');
    
    // Скрываем все
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
        console.log('✅ Администратор: Расписание, Успеваемость, Группы, Пользователи, Курсы');
    } 
    else if (roleName === 'Преподаватель' || roleName === 'TEACHER' || roleName === 'ROLE_TEACHER') {
        // Преподаватель: Расписание, Успеваемость, Группы
        if (scheduleLink) { scheduleLink.style.display = 'inline-block'; scheduleLink.textContent = 'Расписание'; }
        if (progressLink) { progressLink.style.display = 'inline-block'; progressLink.textContent = 'Успеваемость'; }
        if (groupLink) { groupLink.style.display = 'inline-block'; groupLink.textContent = 'Группы'; }
        console.log('✅ Преподаватель: Расписание, Успеваемость, Группы');
    }
    else if (roleName === 'Студент' || roleName === 'STUDENT' || roleName === 'ROLE_STUDENT') {
        if (scheduleLink) { scheduleLink.style.display = 'inline-block'; scheduleLink.textContent = 'Расписание'; }
        if (progressLink) { progressLink.style.display = 'inline-block'; progressLink.textContent = 'Успеваемость'; }
        if (groupLink) { groupLink.style.display = 'inline-block'; groupLink.textContent = 'Группа'; }
        if (myCoursesLink) { myCoursesLink.style.display = 'inline-block'; myCoursesLink.textContent = 'Мои курсы'; }
        console.log('✅ Студент: Расписание, Успеваемость, Группа, Мои курсы');
    }
    else {
        // Неавторизованный
        if (scheduleLink) { scheduleLink.style.display = 'inline-block'; scheduleLink.textContent = 'Расписание'; }
        if (progressLink) { progressLink.style.display = 'inline-block'; progressLink.textContent = 'Успеваемость'; }
        if (groupLink) { groupLink.style.display = 'inline-block'; groupLink.textContent = 'Группа'; }
        if (myCoursesLink) { myCoursesLink.style.display = 'inline-block'; myCoursesLink.textContent = 'Мои курсы'; }
        console.log('✅ Неавторизованный: стандартное меню');
    }
};

// ============ АВТОРИЗАЦИЯ ============
async function checkAuth() {
    const token = localStorage.getItem('token');
    
    if (token) {
        const userData = await loadUserData();
        
        if (userData) {
            if (authButtons) authButtons.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';
            if (userNav) userNav.style.display = 'flex';
            
            const displayName = userData.firstName || userData.login || userData.email || 'Пользователь';
            if (userNameSpan) userNameSpan.textContent = displayName;
            
            if (userAvatar) {
                if (userData.photo && userData.photo !== 'null' && userData.photo.trim() !== '') {
                    userAvatar.innerHTML = `<img src="${userData.photo}" alt="avatar" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'">`;
                } else {
                    userAvatar.innerHTML = '<i class="fas fa-user"></i>';
                }
            }
            
            const role = getUserRole(userData);
            window.updateNavigationByRole(role);
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'none';
            if (userNav) userNav.style.display = 'none';
            window.updateNavigationByRole(null);
        }
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userInfo) userInfo.style.display = 'none';
        if (userNav) userNav.style.display = 'none';
        window.updateNavigationByRole(null);
    }
}

// ============ ВХОД ============
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
                
                if (data.message) {
                    errorMessage = data.message;
                } else if (data.error) {
                    errorMessage = data.error;
                }
                
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

// ============ РЕГИСТРАЦИЯ ============
const registerForm = document.getElementById('registerForm');
const registerMessage = document.getElementById('registerMessage');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const login = document.getElementById('regLogin');
        const email = document.getElementById('regEmail');
        const password = document.getElementById('regPassword');
        const passwordConfirm = document.getElementById('regPasswordConfirm');
        const firstName = document.getElementById('regFirstName');
        const lastName = document.getElementById('regLastName');
        const middleName = document.getElementById('regMiddleName');
        const birthDate = document.getElementById('regBirthDate');
        const photo = document.getElementById('regPhoto');
        
        const loginValue = login ? login.value.trim() : '';
        const emailValue = email ? email.value.trim() : '';
        const passwordValue = password ? password.value : '';
        const passwordConfirmValue = passwordConfirm ? passwordConfirm.value : '';
        const firstNameValue = firstName ? firstName.value.trim() : '';
        const lastNameValue = lastName ? lastName.value.trim() : '';
        const middleNameValue = middleName ? middleName.value.trim() : '';
        const birthDateValue = birthDate ? birthDate.value : '';
        const photoValue = photo ? photo.value.trim() : '';
        
        if (registerMessage) {
            registerMessage.style.display = 'none';
        }
        
        if (passwordValue !== passwordConfirmValue) {
            if (registerMessage) {
                registerMessage.textContent = 'Пароли не совпадают';
                registerMessage.className = 'form-message error';
                registerMessage.style.display = 'block';
            }
            return;
        }
        
        if (passwordValue.length < 6) {
            if (registerMessage) {
                registerMessage.textContent = 'Пароль должен содержать минимум 6 символов';
                registerMessage.className = 'form-message error';
                registerMessage.style.display = 'block';
            }
            return;
        }
        
        const registerData = {
            login: loginValue,
            password: passwordValue,
            email: emailValue,
            photo: photoValue || null,
            firstName: firstNameValue,
            lastName: lastNameValue || null,
            middleName: middleNameValue || null,
            birthDate: birthDateValue ? new Date(birthDateValue).toISOString() : null
        };
        
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData)
            });
            
            let data = {};
            try {
                data = await response.json();
            } catch (e) {}
            
            if (response.ok) {
                if (registerModal) registerModal.style.display = 'none';
                if (registerForm) registerForm.reset();
                showTemporaryMessage('Регистрация успешна! Теперь войдите.', 'success');
            } else {
                if (registerMessage) {
                    registerMessage.textContent = data.message || 'Ошибка регистрации';
                    registerMessage.className = 'form-message error';
                    registerMessage.style.display = 'block';
                }
            }
        } catch (error) {
            if (registerMessage) {
                registerMessage.textContent = 'Ошибка соединения с сервером';
                registerMessage.className = 'form-message error';
                registerMessage.style.display = 'block';
            }
        }
    });
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
    document.body.appendChild(msgDiv);
    
    setTimeout(() => {
        msgDiv.remove();
    }, 3000);
}

// Выход
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        currentUser = null;
        showTemporaryMessage('Вы вышли из системы', 'success');
        window.location.reload();
    });
}

// Переход на страницу профиля
if (userProfileClick) {
    userProfileClick.addEventListener('click', (e) => {
        if (e.target.id !== 'logoutBtn') {
            window.location.href = 'profile.html';
        }
    });
}

// Обработчики кликов по навигации
if (scheduleLink) {
    scheduleLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'schedule.html';
    });
}

if (progressLink) {
    progressLink.addEventListener('click', (e) => {
        e.preventDefault();
        showTemporaryMessage('Успеваемость будет доступна в следующей версии', 'success');
    });
}

if (groupLink) {
    groupLink.addEventListener('click', (e) => {
        e.preventDefault();
        showTemporaryMessage('Информация о группах будет доступна в следующей версии', 'success');
    });
}

if (myCoursesLink) {
    myCoursesLink.addEventListener('click', (e) => {
        e.preventDefault();
        showTemporaryMessage('Мои курсы будут доступны в следующей версии', 'success');
    });
}

if (usersLink) {
    usersLink.addEventListener('click', (e) => {
        e.preventDefault();
        showTemporaryMessage('Управление пользователями будет доступно в следующей версии', 'success');
    });
}

if (coursesLink) {
    coursesLink.addEventListener('click', (e) => {
        e.preventDefault();
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

const exploreBtn = document.getElementById('exploreBtn');
if (exploreBtn) {
    exploreBtn.onclick = () => {
        const coursesSection = document.getElementById('coursesSection');
        if (coursesSection) {
            coursesSection.scrollIntoView({ behavior: 'smooth' });
        }
    };
}

// Загрузка при старте
loadCourses();
checkAuth();