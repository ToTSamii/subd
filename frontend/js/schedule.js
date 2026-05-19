// API URL
const API_URL = 'http://localhost:8080/api';

// DOM элементы
const logoLink = document.getElementById('logoLink');
const logoutBtn = document.getElementById('logoutBtn');
const userNameSpan = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const userProfileClick = document.getElementById('userProfileClick');
const roleBadge = document.getElementById('roleBadge');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const scheduleContent = document.getElementById('scheduleContent');
const scheduleBody = document.getElementById('scheduleBody');
const emptyState = document.getElementById('emptyState');
const groupColumn = document.getElementById('groupColumn');
const teacherColumn = document.getElementById('teacherColumn');
const actionsColumn = document.getElementById('actionsColumn');
const addButtonContainer = document.getElementById('addButtonContainer');
const addScheduleBtn = document.getElementById('addScheduleBtn');
const scheduleModal = document.getElementById('scheduleModal');
const scheduleForm = document.getElementById('scheduleForm');
const modalTitle = document.getElementById('modalTitle');
const groupSelect = document.getElementById('groupId');

// Текущие данные
let currentUser = null;
let userRole = null;
let userId = null;
let currentEditId = null;
let groupsList = [];

if (logoLink) {
    logoLink.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

function showMessage(message, type = 'success') {
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

// Функция обновления навигации
function updateNavigationByRole(roleName) {
    console.log('=== ОБНОВЛЕНИЕ НАВИГАЦИИ (schedule) ===');
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
        console.log('✅ Админ: Расписание, Успеваемость, Группы, Пользователи, Курсы');
    } 
    else if (roleName === 'Преподаватель' || roleName === 'TEACHER' || roleName === 'ROLE_TEACHER') {
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
        if (scheduleLink) { scheduleLink.style.display = 'inline-block'; scheduleLink.textContent = 'Расписание'; }
        if (progressLink) { progressLink.style.display = 'inline-block'; progressLink.textContent = 'Успеваемость'; }
        if (groupLink) { groupLink.style.display = 'inline-block'; groupLink.textContent = 'Группа'; }
        if (myCoursesLink) { myCoursesLink.style.display = 'inline-block'; myCoursesLink.textContent = 'Мои курсы'; }
        console.log('✅ Неавторизованный: стандартное меню');
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

async function loadGroups() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        
        const response = await fetch(`${API_URL}/group/all`, {
            headers: { 'Authorization': authHeader }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.groups && Array.isArray(data.groups)) {
                groupsList = data.groups;
            } else if (Array.isArray(data)) {
                groupsList = data;
            }
            
            if (groupSelect) {
                groupSelect.innerHTML = '<option value="">Выберите группу</option>';
                groupsList.forEach(group => {
                    const option = document.createElement('option');
                    option.value = group.id || group.code;
                    option.textContent = group.name || 'Без названия';
                    groupSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

async function loadUserData() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'index.html';
        return null;
    }
    
    try {
        const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        
        const response = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = 'index.html';
                return null;
            }
            throw new Error('Ошибка загрузки данных пользователя');
        }
        
        const userData = await response.json();
        currentUser = userData;
        
        userRole = getUserRole(userData);
        userId = userData.userId || userData.code || userData.id;
        
        console.log('Роль в schedule.js:', userRole);
        
        return userData;
        
    } catch (error) {
        console.error('Error loading user:', error);
        return null;
    }
}

async function loadSchedule() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    if (loadingState) loadingState.style.display = 'block';
    if (errorState) errorState.style.display = 'none';
    if (scheduleContent) scheduleContent.style.display = 'none';
    
    try {
        const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        let response;
        
        if (userRole === 'Администратор' || userRole === 'ADMIN') {
            response = await fetch(`${API_URL}/admin/schedule/all`, {
                headers: { 'Authorization': authHeader }
            });
        } else if (userRole === 'Преподаватель' || userRole === 'TEACHER') {
            response = await fetch(`${API_URL}/teacher/schedule/${userId}`, {
                headers: { 'Authorization': authHeader }
            });
        } else if (userRole === 'Студент' || userRole === 'STUDENT') {
            response = await fetch(`${API_URL}/student/schedule/${userId}`, {
                headers: { 'Authorization': authHeader }
            });
        } else {
            throw new Error(`Неизвестная роль: ${userRole}`);
        }
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки расписания');
        }
        
        const data = await response.json();
        
        let schedules = [];
        if (data.schedules && Array.isArray(data.schedules)) {
            schedules = data.schedules;
        } else if (data.responseScheldues && Array.isArray(data.responseScheldues)) {
            schedules = data.responseScheldues;
        } else if (Array.isArray(data)) {
            schedules = data;
        }
        
        renderSchedule(schedules);
        
    } catch (error) {
        console.error('Error loading schedule:', error);
        if (errorState) {
            errorState.style.display = 'block';
            errorState.textContent = `Ошибка загрузки расписания: ${error.message}`;
        }
        if (loadingState) loadingState.style.display = 'none';
    }
}

function renderSchedule(schedules) {
    if (loadingState) loadingState.style.display = 'none';
    
    if (!schedules || schedules.length === 0) {
        if (scheduleContent) scheduleContent.style.display = 'block';
        if (emptyState) emptyState.style.display = 'block';
        if (scheduleBody) scheduleBody.innerHTML = '';
        return;
    }
    
    if (scheduleContent) scheduleContent.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    
    if (userRole === 'Студент' || userRole === 'STUDENT') {
        if (groupColumn) groupColumn.style.display = 'none';
        if (teacherColumn) teacherColumn.style.display = 'table-cell';
        if (actionsColumn) actionsColumn.style.display = 'none';
    } else if (userRole === 'Преподаватель' || userRole === 'TEACHER') {
        if (groupColumn) {
            groupColumn.style.display = 'table-cell';
            groupColumn.textContent = 'Группы';
        }
        if (teacherColumn) teacherColumn.style.display = 'none';
        if (actionsColumn) actionsColumn.style.display = 'none';
    } else if (userRole === 'Администратор' || userRole === 'ADMIN') {
        if (groupColumn) groupColumn.style.display = 'table-cell';
        if (teacherColumn) teacherColumn.style.display = 'table-cell';
        if (actionsColumn) actionsColumn.style.display = 'table-cell';
    }
    
    if (scheduleBody) {
        scheduleBody.innerHTML = schedules.map(item => {
            const scheduleId = item.id || item.scheduleId;
            const dateTime = item.dateTime ? new Date(item.dateTime) : null;
            const formattedDate = dateTime ? dateTime.toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : '-';
            
            const groupName = item.groupName || item.group?.name || '-';
            const teacherName = item.teacherFio || item.teacherFioDenorm || '-';
            
            let actionsHtml = '';
            if (userRole === 'Администратор' || userRole === 'ADMIN') {
                actionsHtml = `
                    <td class="action-buttons">
                        <button class="btn-edit" onclick="editSchedule(${scheduleId})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteSchedule(${scheduleId})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
            } else {
                actionsHtml = '</td>';
            }
            
            return `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${escapeHtml(item.topic || '-')}</td>
                    <td>${escapeHtml(groupName)}</td>
                    <td>${escapeHtml(teacherName)}</td>
                    ${actionsHtml}
                </tr>
            `;
        }).join('');
    }
}

async function addSchedule(data) {
    const token = localStorage.getItem('token');
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    try {
        const response = await fetch(`${API_URL}/schedule/`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showMessage('Занятие успешно добавлено', 'success');
            closeScheduleModal();
            loadSchedule();
        } else {
            const error = await response.json();
            showMessage(error.message || 'Не удалось добавить занятие', 'error');
        }
    } catch (error) {
        console.error('Error adding schedule:', error);
        showMessage('Ошибка соединения с сервером', 'error');
    }
}

async function updateSchedule(id, data) {
    const token = localStorage.getItem('token');
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    try {
        const response = await fetch(`${API_URL}/schedule/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showMessage('Занятие успешно обновлено', 'success');
            closeScheduleModal();
            loadSchedule();
        } else {
            const error = await response.json();
            showMessage(error.message || 'Не удалось обновить занятие', 'error');
        }
    } catch (error) {
        console.error('Error updating schedule:', error);
        showMessage('Ошибка соединения с сервером', 'error');
    }
}

window.deleteSchedule = async function(id) {
    if (!confirm('Вы уверены, что хотите удалить это занятие?')) return;
    
    const token = localStorage.getItem('token');
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    try {
        const response = await fetch(`${API_URL}/schedule/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            showMessage('Занятие успешно удалено', 'success');
            loadSchedule();
        } else {
            const error = await response.json();
            showMessage(error.message || 'Не удалось удалить занятие', 'error');
        }
    } catch (error) {
        console.error('Error deleting schedule:', error);
        showMessage('Ошибка соединения с сервером', 'error');
    }
};

window.editSchedule = async function(id) {
    currentEditId = id;
    modalTitle.textContent = 'Редактировать занятие';
    
    const token = localStorage.getItem('token');
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    try {
        let response;
        if (userRole === 'Администратор' || userRole === 'ADMIN') {
            response = await fetch(`${API_URL}/admin/schedule/all`, {
                headers: { 'Authorization': authHeader }
            });
        } else {
            response = await fetch(`${API_URL}/teacher/schedule/${userId}`, {
                headers: { 'Authorization': authHeader }
            });
        }
        
        const data = await response.json();
        
        let schedules = [];
        if (data.schedules && Array.isArray(data.schedules)) {
            schedules = data.schedules;
        } else if (data.responseScheldues && Array.isArray(data.responseScheldues)) {
            schedules = data.responseScheldues;
        } else if (Array.isArray(data)) {
            schedules = data;
        }
        
        const schedule = schedules.find(s => (s.id || s.scheduleId) === id);
        
        if (schedule) {
            document.getElementById('topic').value = schedule.topic || '';
            if (schedule.dateTime) {
                const date = new Date(schedule.dateTime);
                const formattedDate = date.toISOString().slice(0, 16);
                document.getElementById('dateTime').value = formattedDate;
            }
            const groupId = schedule.group?.id || schedule.groupId;
            if (groupId && groupSelect) {
                groupSelect.value = groupId;
            }
        }
        
        scheduleModal.style.display = 'block';
    } catch (error) {
        console.error('Error loading schedule for edit:', error);
        showMessage('Ошибка загрузки данных', 'error');
    }
};

function openAddModal() {
    currentEditId = null;
    modalTitle.textContent = 'Добавить занятие';
    if (scheduleForm) scheduleForm.reset();
    if (groupSelect) groupSelect.value = '';
    scheduleModal.style.display = 'block';
}

function closeScheduleModal() {
    scheduleModal.style.display = 'none';
    currentEditId = null;
    if (scheduleForm) scheduleForm.reset();
}

if (scheduleForm) {
    scheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const topic = document.getElementById('topic').value;
        const dateTime = document.getElementById('dateTime').value;
        const groupId = parseInt(document.getElementById('groupId').value);
        
        if (!topic || !dateTime || !groupId) {
            showMessage('Заполните все поля', 'error');
            return;
        }
        
        const scheduleData = {
            topic: topic,
            dateTime: new Date(dateTime).toISOString(),
            groupId: groupId
        };
        
        if (currentEditId) {
            await updateSchedule(currentEditId, scheduleData);
        } else {
            await addSchedule(scheduleData);
        }
    });
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

function updateHeader(userData) {
    const displayName = userData.firstName || userData.login || userData.email;
    if (userNameSpan) userNameSpan.textContent = displayName;
    
    if (userAvatar) {
        if (userData.photo && userData.photo !== 'null' && userData.photo.trim() !== '') {
            userAvatar.innerHTML = `<img src="${userData.photo}" alt="avatar" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'">`;
        } else {
            userAvatar.innerHTML = '<i class="fas fa-user"></i>';
        }
    }
    
    let roleIcon = '';
    if (userRole === 'Администратор' || userRole === 'ADMIN') roleIcon = '<i class="fas fa-shield-alt"></i> ';
    else if (userRole === 'Преподаватель' || userRole === 'TEACHER') roleIcon = '<i class="fas fa-chalkboard-user"></i> ';
    else if (userRole === 'Студент' || userRole === 'STUDENT') roleIcon = '<i class="fas fa-graduation-cap"></i> ';
    
    if (roleBadge) roleBadge.innerHTML = `${roleIcon}${userRole}`;
    
    if (addButtonContainer) {
        if (userRole === 'Администратор' || userRole === 'ADMIN') {
            addButtonContainer.style.display = 'block';
        } else {
            addButtonContainer.style.display = 'none';
        }
    }
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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

if (addScheduleBtn) {
    addScheduleBtn.onclick = openAddModal;
}

window.onclick = (e) => {
    if (e.target === scheduleModal) {
        closeScheduleModal();
    }
};

async function init() {
    const userData = await loadUserData();
    if (!userData) return;
    updateHeader(userData);
    updateNavigationByRole(userRole);
    await loadGroups();
    await loadSchedule();
}

init();