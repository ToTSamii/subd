// admin-groups.js - управление группами для администратора

// API_URL уже объявлен в main.js

// DOM элементы
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const groupsContainer = document.getElementById('groupsContainer');
const groupsTableBody = document.getElementById('groupsTableBody');
const addGroupBtn = document.getElementById('addGroupBtn');
const groupModal = document.getElementById('groupModal');
const groupForm = document.getElementById('groupForm');
const modalTitle = document.getElementById('modalTitle');
const groupIdInput = document.getElementById('groupId');
const groupNameInput = document.getElementById('groupName');
const courseSelect = document.getElementById('courseSelect');
const teacherSelect = document.getElementById('teacherSelect');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const cancelBtn = document.getElementById('cancelBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

let allCourses = [];
let allTeachers = [];
let currentEditId = null;

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
    if (!dateString) return '—';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

// Загрузка всех курсов для выпадающего списка
async function loadCourses() {
    try {
        const token = getAuthToken();
        if (!token) return;
        
        const response = await fetch(`${API_URL}/courses/`, {
            headers: { 'Authorization': token }
        });
        
        if (response.ok) {
            const data = await response.json();
            let courses = [];
            if (data.courses && Array.isArray(data.courses)) {
                courses = data.courses;
            } else if (Array.isArray(data)) {
                courses = data;
            }
            allCourses = courses;
            
            courseSelect.innerHTML = '<option value="">Выберите курс</option>';
            allCourses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.code || course.id;
                option.textContent = course.name || course.title || 'Без названия';
                courseSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

// Загрузка всех преподавателей через эндпоинт /api/teacher/all
async function loadTeachers() {
    try {
        const token = getAuthToken();
        if (!token) return;
        
        console.log('Loading teachers from /api/teacher/all');
        
        const response = await fetch(`${API_URL}/teacher/all`, {
            method: 'GET',
            headers: { 'Authorization': token }
        });
        
        console.log('Teachers response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Teachers data:', data);
            
            let teachers = [];
            if (data.teachers && Array.isArray(data.teachers)) {
                teachers = data.teachers;
            } else if (data.responseTeachers && Array.isArray(data.responseTeachers)) {
                teachers = data.responseTeachers;
            } else if (Array.isArray(data)) {
                teachers = data;
            }
            
            allTeachers = teachers;
            
            teacherSelect.innerHTML = '<option value="">Выберите преподавателя</option>';
            allTeachers.forEach(teacher => {
                const option = document.createElement('option');
                // teacherCode - это code из таблицы Преподаватель
                const teacherCode = teacher.code || teacher.teacherCode;
                option.value = teacherCode;
                
                // Формируем ФИО преподавателя
                const parts = [];
                if (teacher.lastName) parts.push(teacher.lastName);
                if (teacher.firstName) parts.push(teacher.firstName);
                if (teacher.middleName) parts.push(teacher.middleName);
                const fullName = parts.length > 0 ? parts.join(' ') : `Преподаватель ${teacherCode}`;
                
                option.textContent = fullName;
                teacherSelect.appendChild(option);
            });
            
            console.log(`Loaded ${allTeachers.length} teachers`);
        } else {
            console.error('Failed to load teachers:', response.status);
            teacherSelect.innerHTML = '<option value="">Ошибка загрузки преподавателей</option>';
        }
    } catch (error) {
        console.error('Error loading teachers:', error);
        teacherSelect.innerHTML = '<option value="">Ошибка загрузки преподавателей</option>';
    }
}

// Загрузка всех групп
async function loadAllGroups() {
    console.log('Loading all groups...');
    
    if (loadingState) loadingState.style.display = 'block';
    if (errorState) errorState.style.display = 'none';
    if (groupsContainer) groupsContainer.style.display = 'none';
    
    try {
        const token = getAuthToken();
        if (!token) {
            showError('Необходимо авторизоваться');
            return;
        }
        
        const response = await fetch(`${API_URL}/group/all`, {
            method: 'GET',
            headers: { 'Authorization': token }
        });
        
        console.log('Groups response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 401) {
                showError('Сессия истекла, войдите снова');
                return;
            }
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
        
        renderGroups(groups);
        
    } catch (error) {
        console.error('Error loading groups:', error);
        showError(error.message);
    }
}

// Рендер групп в таблицу
function renderGroups(groups) {
    if (loadingState) loadingState.style.display = 'none';
    
    if (!groups || groups.length === 0) {
        if (groupsContainer) groupsContainer.style.display = 'block';
        if (groupsTableBody) {
            groupsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-users"></i>
                        <p>Группы не найдены</p>
                    </td>
                </tr>
            `;
        }
        return;
    }
    
    if (groupsContainer) groupsContainer.style.display = 'block';
    
    if (groupsTableBody) {
        groupsTableBody.innerHTML = groups.map(group => {
            const groupId = group.id || group.groupId || group.code;
            const groupName = group.name || group.groupName || 'Без названия';
            const courseName = group.course?.name || group.courseName || '—';
            // Получаем ФИО преподавателя из объекта teacher
            let teacherName = '—';
            if (group.teacher) {
                const parts = [];
                if (group.teacher.lastName) parts.push(group.teacher.lastName);
                if (group.teacher.firstName) parts.push(group.teacher.firstName);
                if (group.teacher.middleName) parts.push(group.teacher.middleName);
                teacherName = parts.join(' ') || '—';
            }
            const startDate = group.startDate;
            const endDate = group.endDate;
            
            return `
                <tr>
                    <td>${groupId}</td>
                    <td><strong>${escapeHtml(groupName)}</strong></td>
                    <td><span class="course-badge">${escapeHtml(courseName)}</span></td>
                    <td><span class="teacher-badge">${escapeHtml(teacherName)}</span></td>
                    <td>${formatDate(startDate)}</td>
                    <td>${formatDate(endDate)}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" onclick="editGroup(${groupId})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteGroup(${groupId})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Добавление группы
async function addGroup(groupData) {
    const token = getAuthToken();
    if (!token) return false;
    
    try {
        const response = await fetch(`${API_URL}/admin/group/`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(groupData)
        });
        
        if (response.ok) {
            showTemporaryMessage('Группа успешно добавлена', 'success');
            return true;
        } else {
            const error = await response.json();
            showTemporaryMessage(error.message || 'Ошибка добавления группы', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error adding group:', error);
        showTemporaryMessage('Ошибка соединения с сервером', 'error');
        return false;
    }
}

// Обновление группы
async function updateGroup(id, groupData) {
    const token = getAuthToken();
    if (!token) return false;
    
    try {
        const response = await fetch(`${API_URL}/admin/group/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(groupData)
        });
        
        if (response.ok) {
            showTemporaryMessage('Группа успешно обновлена', 'success');
            return true;
        } else {
            const error = await response.json();
            showTemporaryMessage(error.message || 'Ошибка обновления группы', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error updating group:', error);
        showTemporaryMessage('Ошибка соединения с сервером', 'error');
        return false;
    }
}

// Удаление группы
window.deleteGroup = async function(id) {
    if (!confirm('Вы уверены, что хотите удалить эту группу? Студенты будут отчислены.')) return;
    
    const token = getAuthToken();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/group/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });
        
        if (response.ok) {
            showTemporaryMessage('Группа успешно удалена', 'success');
            loadAllGroups();
        } else {
            const error = await response.json();
            showTemporaryMessage(error.message || 'Ошибка удаления группы', 'error');
        }
    } catch (error) {
        console.error('Error deleting group:', error);
        showTemporaryMessage('Ошибка соединения с сервером', 'error');
    }
};

// Редактирование группы
window.editGroup = async function(id) {
    currentEditId = id;
    modalTitle.textContent = 'Редактировать группу';
    
    const token = getAuthToken();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/group/${id}`, {
            method: 'GET',
            headers: { 'Authorization': token }
        });
        
        if (response.ok) {
            const group = await response.json();
            console.log('Group data for edit:', group);
            
            groupIdInput.value = group.id || group.groupId || group.code;
            groupNameInput.value = group.name || group.groupName || '';
            
            // Устанавливаем курс (courseCode)
            const courseId = group.course?.code || group.courseCode;
            if (courseId) {
                courseSelect.value = courseId;
            } else {
                courseSelect.value = '';
            }
            
            // Устанавливаем преподавателя (teacherCode - это код из таблицы Преподаватель)
            const teacherCode = group.teacher?.code || group.teacherCode;
            if (teacherCode) {
                teacherSelect.value = teacherCode;
            } else {
                teacherSelect.value = '';
            }
            
            // Устанавливаем даты
            if (group.startDate) {
                const date = new Date(group.startDate);
                startDateInput.value = date.toISOString().split('T')[0];
            } else {
                startDateInput.value = '';
            }
            
            if (group.endDate) {
                const date = new Date(group.endDate);
                endDateInput.value = date.toISOString().split('T')[0];
            } else {
                endDateInput.value = '';
            }
            
            openModal();
        } else {
            showTemporaryMessage('Ошибка загрузки данных группы', 'error');
        }
    } catch (error) {
        console.error('Error loading group for edit:', error);
        showTemporaryMessage('Ошибка соединения с сервером', 'error');
    }
};

function openModal() {
    if (groupModal) groupModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (groupModal) groupModal.style.display = 'none';
    document.body.style.overflow = '';
    groupForm.reset();
    currentEditId = null;
    groupIdInput.value = '';
    modalTitle.textContent = 'Добавить группу';
}

function showError(message) {
    if (errorState) {
        errorState.style.display = 'block';
        errorState.textContent = message;
    }
    if (loadingState) loadingState.style.display = 'none';
    if (groupsContainer) groupsContainer.style.display = 'none';
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
    setTimeout(() => msgDiv.remove(), 3000);
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

// Обработчики
if (addGroupBtn) {
    addGroupBtn.onclick = () => {
        currentEditId = null;
        modalTitle.textContent = 'Добавить группу';
        groupForm.reset();
        courseSelect.value = '';
        teacherSelect.value = '';
        startDateInput.value = '';
        endDateInput.value = '';
        openModal();
    };
}

if (cancelBtn) {
    cancelBtn.onclick = closeModal;
}

if (closeModalBtn) {
    closeModalBtn.onclick = closeModal;
}

if (groupForm) {
    groupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const groupData = {
            name: groupNameInput.value.trim(),
            courseCode: parseInt(courseSelect.value),
            teacherCode: teacherSelect.value ? parseInt(teacherSelect.value) : null,
            startDate: startDateInput.value ? new Date(startDateInput.value).toISOString() : null,
            endDate: endDateInput.value ? new Date(endDateInput.value).toISOString() : null
        };
        
        if (!groupData.name) {
            showTemporaryMessage('Введите название группы', 'error');
            return;
        }
        
        if (!groupData.courseCode) {
            showTemporaryMessage('Выберите курс', 'error');
            return;
        }
        
        let success;
        if (currentEditId) {
            success = await updateGroup(currentEditId, groupData);
        } else {
            success = await addGroup(groupData);
        }
        
        if (success) {
            closeModal();
            loadAllGroups();
        }
    });
}

// Закрытие модального окна по клику вне его
window.onclick = (e) => {
    if (e.target === groupModal) {
        closeModal();
    }
};

// Основная функция инициализации
async function initAdminGroups() {
    console.log('Initializing admin groups page...');
    
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        showError('Необходимо авторизоваться');
        return;
    }
    
    const role = currentUser.role?.name || currentUser.roleName;
    if (role !== 'Администратор' && role !== 'ADMIN' && role !== 'ROLE_ADMIN') {
        showError('Эта страница доступна только администраторам');
        return;
    }
    
    await loadCourses();
    await loadTeachers();
    await loadAllGroups();
}

// Запуск
initAdminGroups();