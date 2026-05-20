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
const enrollSection = document.getElementById('enrollSection');
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

// Модальное окно выбора группы
const groupModal = document.getElementById('groupModal');
const groupList = document.getElementById('groupList');
const modalCourseName = document.getElementById('modalCourseName');
const confirmEnrollBtn = document.getElementById('confirmEnrollBtn');
const cancelGroupBtn = document.getElementById('cancelGroupBtn');
const closeGroupModalBtn = document.querySelector('#groupModal .close-modal');

// Текущий курс и пользователь
let currentCourse = null;
let currentUser = null;
let currentUserRole = null;
let currentUserId = null;
let currentCourseId = null;
let currentCourseName = null;
let availableGroups = [];
let selectedGroupId = null;

// Получить ID курса из URL
function getCourseId() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log('ID курса из URL:', id);
    currentCourseId = id;
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
            currentUserRole = getUserRole(userData);
            currentUserId = userData.userId || userData.code || userData.id;
            console.log('Текущий пользователь:', currentUser);
            console.log('Роль:', currentUserRole);
            console.log('ID пользователя:', currentUserId);
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
            
            updateNavigationByRole(currentUserRole);
            
            // Показываем кнопку записи только для студентов
            if (enrollSection) {
                if (currentUserRole === 'Студент' || currentUserRole === 'STUDENT' || currentUserRole === 'ROLE_STUDENT') {
                    enrollSection.style.display = 'block';
                } else {
                    enrollSection.style.display = 'none';
                }
            }
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'none';
            updateNavigationByRole(null);
            
            // Неавторизованный - показываем кнопку записи
            if (enrollSection) {
                enrollSection.style.display = 'block';
            }
        }
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userInfo) userInfo.style.display = 'none';
        updateNavigationByRole(null);
        
        // Неавторизованный - показываем кнопку записи
        if (enrollSection) {
            enrollSection.style.display = 'block';
        }
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
        currentCourseName = course.name || course.title;
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

// Загрузка групп для текущего курса через эндпоинт /group/course/{id}
async function loadCourseGroups() {
    const courseId = currentCourseId;
    
    if (!courseId) {
        console.error('ID курса не указан');
        showTemporaryMessage('Ошибка: ID курса не указан', 'error');
        renderEmptyGroupList();
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
            const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            headers['Authorization'] = authHeader;
        }
        
        console.log(`Загрузка групп для курса ID: ${courseId}`);
        
        // Используем эндпоинт /group/course/{id}
        const response = await fetch(`${API_URL}/group/course/${courseId}`, {
            headers: headers
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Ответ сервера (группы курса):', data);
            
            // Обрабатываем ответ в разных форматах
            let groups = [];
            if (data.groups && Array.isArray(data.groups)) {
                groups = data.groups;
            } else if (data.courseGroups && Array.isArray(data.courseGroups)) {
                groups = data.courseGroups;
            } else if (data.responseGroups && Array.isArray(data.responseGroups)) {
                groups = data.responseGroups;
            } else if (Array.isArray(data)) {
                groups = data;
            }
            
            // Если groups пустой, возможно данные в другом поле
            if (groups.length === 0 && data.groupList) {
                groups = data.groupList;
            }
            
            availableGroups = groups;
            console.log('Группы для курса:', availableGroups);
            
            renderGroupList();
        } else {
            console.error('Ошибка загрузки групп, статус:', response.status);
            const errorText = await response.text();
            console.error('Текст ошибки:', errorText);
            showTemporaryMessage('Ошибка загрузки списка групп', 'error');
            renderEmptyGroupList();
        }
    } catch (error) {
        console.error('Error loading groups:', error);
        showTemporaryMessage('Ошибка загрузки списка групп', 'error');
        renderEmptyGroupList();
    }
}

function renderGroupList() {
    groupList.innerHTML = '';
    
    if (!availableGroups || availableGroups.length === 0) {
        groupList.innerHTML = '<div class="no-groups"><i class="fas fa-info-circle"></i><p>Нет доступных групп для этого курса</p></div>';
        if (confirmEnrollBtn) confirmEnrollBtn.disabled = true;
        return;
    }
    
    if (confirmEnrollBtn) confirmEnrollBtn.disabled = false;
    
    availableGroups.forEach(group => {
        // Получаем ID группы (может быть в разных полях)
        const groupId = group.id || group.groupId || group.code;
        const groupName = group.name || 'Без названия';
        const startDate = group.startDate ? new Date(group.startDate).toLocaleDateString('ru-RU') : null;
        const endDate = group.endDate ? new Date(group.endDate).toLocaleDateString('ru-RU') : null;
        const courseNameGroup = group.courseName || '';
        
        let dateText = '';
        if (startDate && endDate) {
            dateText = `${startDate} - ${endDate}`;
        } else if (startDate) {
            dateText = `с ${startDate}`;
        } else if (endDate) {
            dateText = `по ${endDate}`;
        }
        
        const groupItem = document.createElement('div');
        groupItem.className = 'group-item';
        groupItem.setAttribute('data-group-id', groupId);
        groupItem.setAttribute('data-group-name', groupName);
        
        groupItem.innerHTML = `
            <div class="group-radio">
                <input type="radio" name="selectedGroup" value="${groupId}" id="group_${groupId}">
            </div>
            <div class="group-info">
                <div class="group-name">${escapeHtml(groupName)}</div>
                <div class="group-details">
                    ${courseNameGroup ? escapeHtml(courseNameGroup) : ''}
                    ${dateText ? ` | ${escapeHtml(dateText)}` : ''}
                </div>
            </div>
        `;
        
        const radio = groupItem.querySelector('input[type="radio"]');
        radio.addEventListener('change', () => {
            selectedGroupId = radio.value;
            document.querySelectorAll('.group-item').forEach(item => item.classList.remove('selected'));
            groupItem.classList.add('selected');
        });
        
        groupItem.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                radio.checked = true;
                selectedGroupId = radio.value;
                document.querySelectorAll('.group-item').forEach(item => item.classList.remove('selected'));
                groupItem.classList.add('selected');
            }
        });
        
        groupList.appendChild(groupItem);
    });
}

function renderEmptyGroupList() {
    groupList.innerHTML = '<div class="no-groups"><i class="fas fa-exclamation-triangle"></i><p>Ошибка загрузки списка групп</p></div>';
    if (confirmEnrollBtn) confirmEnrollBtn.disabled = true;
}

// Обновление группы студента
async function updateStudentGroup(groupId) {
    const token = localStorage.getItem('token');
    if (!token) {
        showTemporaryMessage('Необходимо войти в систему', 'error');
        openModal(loginModal);
        return;
    }
    
    if (!currentUserId) {
        showTemporaryMessage('Ошибка: ID пользователя не найден', 'error');
        return;
    }
    
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    try {
        console.log('Отправка запроса на обновление:', {
            userId: currentUserId,
            groupId: groupId
        });
        
        const response = await fetch(`${API_URL}/student/`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUserId,
                groupId: groupId
            })
        });
        
        if (response.ok) {
            showTemporaryMessage('Вы успешно записались на курс!', 'success');
            closeGroupModal();
        } else {
            let errorData;
            try {
                errorData = await response.json();
            } catch(e) {}
            console.error('Ошибка сервера:', errorData);
            showTemporaryMessage(errorData?.message || 'Ошибка при записи на курс', 'error');
        }
    } catch (error) {
        console.error('Error updating student group:', error);
        showTemporaryMessage('Ошибка соединения с сервером', 'error');
    }
}

// Обработчик нажатия на кнопку записи
function onEnrollClick() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        showTemporaryMessage('Необходимо войти в систему', 'error');
        openModal(loginModal);
        return;
    }
    
    if (currentUserRole !== 'Студент' && currentUserRole !== 'STUDENT' && currentUserRole !== 'ROLE_STUDENT') {
        showTemporaryMessage('Запись на курсы доступна только студентам', 'error');
        return;
    }
    
    if (currentCourse) {
        const courseTitle = currentCourse.name || currentCourse.title || 'Курс';
        if (modalCourseName) modalCourseName.textContent = courseTitle;
        loadCourseGroups();
        openModal(groupModal);
    } else {
        showTemporaryMessage('Ошибка: данные курса не загружены', 'error');
    }
}

// Функции модальных окон
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

function closeGroupModal() {
    closeModal(groupModal);
    selectedGroupId = null;
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

function goBack() {
    window.location.href = 'index.html';
}

// Обработчики событий
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

if (enrollBtn) {
    enrollBtn.addEventListener('click', onEnrollClick);
}

if (confirmEnrollBtn) {
    confirmEnrollBtn.addEventListener('click', () => {
        if (selectedGroupId) {
            updateStudentGroup(selectedGroupId);
        } else {
            showTemporaryMessage('Выберите группу', 'error');
        }
    });
}

if (cancelGroupBtn) {
    cancelGroupBtn.addEventListener('click', closeGroupModal);
}

if (closeGroupModalBtn) {
    closeGroupModalBtn.addEventListener('click', closeGroupModal);
}

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

// Форма регистрации
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
    if (e.target === groupModal) closeGroupModal();
};

// Инициализация
async function init() {
    await checkAuth();
    await loadCourseDetail();
}

init();