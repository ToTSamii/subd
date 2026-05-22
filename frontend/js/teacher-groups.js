// teacher-groups.js - страница групп преподавателя

// API_URL уже объявлен в main.js

// DOM элементы
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const groupsContainer = document.getElementById('groupsContainer');
const groupsGrid = document.getElementById('groupsGrid');

// Получение токена
function getAuthToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
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

// Загрузка групп преподавателя по userId (используем эндпоинт /api/teacher/groups/{id})
async function loadTeacherGroups(teacherUserId) {
    console.log('Loading groups for teacher userId:', teacherUserId);
    
    if (!teacherUserId) {
        return { success: false, error: 'ID пользователя не определён' };
    }
    
    try {
        const token = getAuthToken();
        if (!token) {
            return { success: false, error: 'Необходимо авторизоваться' };
        }
        
        // Только один запрос - получение групп преподавателя
        const response = await fetch(`${API_URL}/teacher/groups/${teacherUserId}`, {
            method: 'GET',
            headers: { 
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Groups response status:', response.status);
        
        if (response.status === 404) {
            return { success: true, groups: [] };
        }
        
        if (response.status === 401) {
            return { success: false, error: 'Сессия истекла, войдите снова' };
        }
        
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Groups data:', data);
        
        let groups = [];
        if (data.groups && Array.isArray(data.groups)) {
            groups = data.groups;
        } else if (data.responseGroups && Array.isArray(data.responseGroups)) {
            groups = data.responseGroups;
        } else if (Array.isArray(data)) {
            groups = data;
        }
        
        return { success: true, groups: groups };
        
    } catch (error) {
        console.error('Error loading groups:', error);
        return { success: false, error: error.message };
    }
}

// Рендер групп
function renderGroups(groups) {
    if (!groupsGrid) return;
    
    if (groups.length === 0) {
        groupsGrid.innerHTML = `
            <div class="no-groups">
                <i class="fas fa-chalkboard"></i>
                <p>У вас пока нет групп</p>
                <p style="font-size: 0.9rem; margin-top: 8px;">Вам не назначены группы для преподавания</p>
            </div>
        `;
        return;
    }
    
    groupsGrid.innerHTML = groups.map(group => {
        const groupName = group.name || group.groupName || 'Без названия';
        const courseName = group.course?.name || group.courseName || 'Курс не указан';
        const startDate = group.startDate;
        const endDate = group.endDate;
        
        return `
            <div class="group-card">
                <div class="group-card-header">
                    <h3>${escapeHtml(groupName)}</h3>
                    <div class="course-name">
                        <i class="fas fa-graduation-cap"></i> ${escapeHtml(courseName)}
                    </div>
                </div>
                <div class="group-card-body">
                    <div class="group-info">
                        <div class="info-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Начало: ${formatDate(startDate)}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-calendar-check"></i>
                            <span>Окончание: ${formatDate(endDate)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showError(message) {
    if (errorState) {
        errorState.style.display = 'block';
        errorState.textContent = message;
    }
    if (loadingState) loadingState.style.display = 'none';
    if (groupsContainer) groupsContainer.style.display = 'none';
}

function showLoading() {
    if (loadingState) loadingState.style.display = 'block';
    if (errorState) errorState.style.display = 'none';
    if (groupsContainer) groupsContainer.style.display = 'none';
}

function hideLoading() {
    if (loadingState) loadingState.style.display = 'none';
}

// Основная функция
async function initTeacherGroups() {
    console.log('Initializing teacher groups page...');
    
    showLoading();
    
    const currentUser = getCurrentUser();
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
        showError('Необходимо авторизоваться');
        return;
    }
    
    // Проверяем роль
    const role = currentUser.role?.name || currentUser.roleName;
    console.log('User role:', role);
    
    if (role !== 'Преподаватель' && role !== 'TEACHER' && role !== 'ROLE_TEACHER' &&
        role !== 'Администратор' && role !== 'ADMIN' && role !== 'ROLE_ADMIN') {
        showError('Эта страница доступна только преподавателям и администраторам');
        return;
    }
    
    // Получаем userId
    const userId = currentUser.userId || currentUser.id;
    console.log('User ID:', userId);
    
    if (!userId) {
        showError('Не удалось определить ID пользователя');
        return;
    }
    
    // Загружаем группы преподавателя (только один запрос!)
    const result = await loadTeacherGroups(userId);
    
    if (!result.success) {
        showError(result.error || 'Ошибка загрузки групп');
        return;
    }
    
    hideLoading();
    
    if (groupsContainer) groupsContainer.style.display = 'block';
    
    renderGroups(result.groups);
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', initTeacherGroups);