// admin-users.js - управление пользователями для администратора

// API_URL уже объявлен в main.js

// DOM элементы
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const usersContainer = document.getElementById('usersContainer');
const usersTableBody = document.getElementById('usersTableBody');
const addUserBtn = document.getElementById('addUserBtn');
const userModal = document.getElementById('userModal');
const userForm = document.getElementById('userForm');
const modalTitle = document.getElementById('modalTitle');
const userIdInput = document.getElementById('userId');
const userLoginInput = document.getElementById('userLogin');
const userPasswordInput = document.getElementById('userPassword');
const userEmailInput = document.getElementById('userEmail');
const userPhotoInput = document.getElementById('userPhoto');
const cancelBtn = document.getElementById('cancelBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const passwordRequired = document.getElementById('passwordRequired');
const passwordHint = document.getElementById('passwordHint');

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

// Получение класса для роли
function getRoleClass(role) {
    if (role === 'Администратор' || role === 'ADMIN') return 'role-admin';
    if (role === 'Преподаватель' || role === 'TEACHER') return 'role-teacher';
    return 'role-student';
}

// Получение отображаемого имени роли
function getRoleDisplay(role) {
    if (role === 'ADMIN' || role === 'ROLE_ADMIN') return 'Администратор';
    if (role === 'TEACHER' || role === 'ROLE_TEACHER') return 'Преподаватель';
    if (role === 'STUDENT' || role === 'ROLE_STUDENT') return 'Студент';
    return role || '—';
}

// Загрузка всех пользователей
async function loadAllUsers() {
    console.log('Loading all users...');
    
    if (loadingState) loadingState.style.display = 'block';
    if (errorState) errorState.style.display = 'none';
    if (usersContainer) usersContainer.style.display = 'none';
    
    try {
        const token = getAuthToken();
        if (!token) {
            showError('Необходимо авторизоваться');
            return;
        }
        
        const response = await fetch(`${API_URL}/admin/`, {
            method: 'GET',
            headers: { 'Authorization': token }
        });
        
        console.log('Users response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 401) {
                showError('Сессия истекла, войдите снова');
                return;
            }
            throw new Error(`Ошибка: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Users data:', data);
        
        let users = [];
        if (data.users && Array.isArray(data.users)) {
            users = data.users;
        } else if (data.responseUsers && Array.isArray(data.responseUsers)) {
            users = data.responseUsers;
        } else if (Array.isArray(data)) {
            users = data;
        }
        
        renderUsers(users);
        
    } catch (error) {
        console.error('Error loading users:', error);
        showError(error.message);
    }
}

// Рендер пользователей в таблицу
function renderUsers(users) {
    if (loadingState) loadingState.style.display = 'none';
    
    if (!users || users.length === 0) {
        if (usersContainer) usersContainer.style.display = 'block';
        if (usersTableBody) {
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-users"></i>
                        <p>Пользователи не найдены</p>
                    </td>
                </tr>
            `;
        }
        return;
    }
    
    if (usersContainer) usersContainer.style.display = 'block';
    
    if (usersTableBody) {
        usersTableBody.innerHTML = users.map(user => {
            const userId = user.userId || user.id || user.code;
            const login = user.login || '—';
            const email = user.email || '—';
            const role = getRoleDisplay(user.roleName || user.role?.name);
            const roleClass = getRoleClass(role);
            const registrationDate = user.registrationDate;
            const photo = user.photo;
            const hasPhoto = photo && photo !== 'null' && photo.trim() !== '';
            
            return `
                <tr>
                    <td>${userId}</td>
                    <td>
                        <div class="user-avatar-cell">
                            ${hasPhoto ? 
                                `<img src="${photo}" alt="avatar" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'">` : 
                                `<i class="fas fa-user"></i>`
                            }
                        </div>
                    </td>
                    <td><strong>${escapeHtml(login)}</strong></td>
                    <td>${escapeHtml(email)}</td>
                    <td><span class="role-badge ${roleClass}">${escapeHtml(role)}</span></td>
                    <td>${formatDate(registrationDate)}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" onclick="editUser(${userId})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteUser(${userId})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Добавление пользователя (дата регистрации = now)
async function addUser(userData) {
    const token = getAuthToken();
    if (!token) return false;
    
    // Автоматически устанавливаем дату регистрации на текущий момент
    userData.registrationDate = new Date().toISOString();
    
    try {
        const response = await fetch(`${API_URL}/admin/`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            showTemporaryMessage('Пользователь успешно добавлен', 'success');
            return true;
        } else {
            const error = await response.json();
            showTemporaryMessage(error.message || 'Ошибка добавления пользователя', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error adding user:', error);
        showTemporaryMessage('Ошибка соединения с сервером', 'error');
        return false;
    }
}

// Обновление пользователя (дата регистрации не меняется)
async function updateUser(id, userData) {
    const token = getAuthToken();
    if (!token) return false;
    
    // Не отправляем registrationDate при обновлении
    delete userData.registrationDate;
    
    try {
        const response = await fetch(`${API_URL}/admin/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            showTemporaryMessage('Пользователь успешно обновлён', 'success');
            return true;
        } else {
            const error = await response.json();
            showTemporaryMessage(error.message || 'Ошибка обновления пользователя', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showTemporaryMessage('Ошибка соединения с сервером', 'error');
        return false;
    }
}

// Удаление пользователя
window.deleteUser = async function(id) {
    const currentUser = getCurrentUser();
    if (currentUser && (currentUser.userId === id || currentUser.id === id)) {
        showTemporaryMessage('Нельзя удалить самого себя', 'error');
        return;
    }
    
    if (!confirm('Вы уверены, что хотите удалить этого пользователя? Это действие необратимо.')) return;
    
    const token = getAuthToken();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });
        
        if (response.ok) {
            showTemporaryMessage('Пользователь успешно удалён', 'success');
            loadAllUsers();
        } else {
            const error = await response.json();
            showTemporaryMessage(error.message || 'Ошибка удаления пользователя', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showTemporaryMessage('Ошибка соединения с сервером', 'error');
    }
};

// Редактирование пользователя (только логин, email, фото)
window.editUser = async function(id) {
    currentEditId = id;
    modalTitle.textContent = 'Редактировать пользователя';
    
    if (passwordRequired) passwordRequired.textContent = '';
    if (passwordHint) passwordHint.textContent = 'Оставьте пустым, чтобы не менять пароль';
    userPasswordInput.required = false;
    userPasswordInput.placeholder = 'Оставьте пустым для сохранения текущего пароля';
    
    const token = getAuthToken();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/`, {
            method: 'GET',
            headers: { 'Authorization': token }
        });
        
        if (response.ok) {
            const data = await response.json();
            let users = [];
            if (data.users && Array.isArray(data.users)) {
                users = data.users;
            } else if (Array.isArray(data)) {
                users = data;
            }
            
            const user = users.find(u => (u.userId || u.id) === id);
            
            if (user) {
                console.log('User data for edit:', user);
                
                userIdInput.value = user.userId || user.id;
                userLoginInput.value = user.login || '';
                userEmailInput.value = user.email || '';
                userPhotoInput.value = user.photo || '';
                userPasswordInput.value = '';
                
                openModal();
            } else {
                showTemporaryMessage('Пользователь не найден', 'error');
            }
        } else {
            showTemporaryMessage('Ошибка загрузки данных пользователя', 'error');
        }
    } catch (error) {
        console.error('Error loading user for edit:', error);
        showTemporaryMessage('Ошибка соединения с сервером', 'error');
    }
};

function openModal() {
    if (userModal) userModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (userModal) userModal.style.display = 'none';
    document.body.style.overflow = '';
    userForm.reset();
    currentEditId = null;
    userIdInput.value = '';
    modalTitle.textContent = 'Добавить пользователя';
    
    if (passwordRequired) passwordRequired.textContent = '*';
    if (passwordHint) passwordHint.textContent = 'Минимум 6 символов (оставьте пустым, чтобы не менять)';
    userPasswordInput.required = true;
    userPasswordInput.placeholder = 'Введите пароль';
}

function showError(message) {
    if (errorState) {
        errorState.style.display = 'block';
        errorState.textContent = message;
    }
    if (loadingState) loadingState.style.display = 'none';
    if (usersContainer) usersContainer.style.display = 'none';
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
if (addUserBtn) {
    addUserBtn.onclick = () => {
        currentEditId = null;
        modalTitle.textContent = 'Добавить пользователя';
        userForm.reset();
        userPasswordInput.required = true;
        userPasswordInput.placeholder = 'Введите пароль';
        if (passwordRequired) passwordRequired.textContent = '*';
        if (passwordHint) passwordHint.textContent = 'Минимум 6 символов';
        openModal();
    };
}

if (cancelBtn) {
    cancelBtn.onclick = closeModal;
}

if (closeModalBtn) {
    closeModalBtn.onclick = closeModal;
}

if (userForm) {
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userData = {
            login: userLoginInput.value.trim(),
            email: userEmailInput.value.trim(),
            photo: userPhotoInput.value.trim() || null
        };
        
        if (!userData.login) {
            showTemporaryMessage('Введите логин', 'error');
            return;
        }
        
        if (!userData.email) {
            showTemporaryMessage('Введите email', 'error');
            return;
        }
        
        const password = userPasswordInput.value;
        if (!currentEditId && !password) {
            showTemporaryMessage('Введите пароль', 'error');
            return;
        }
        
        if (password) {
            if (password.length < 6) {
                showTemporaryMessage('Пароль должен содержать минимум 6 символов', 'error');
                return;
            }
            userData.password = password;
        }
        
        let success;
        if (currentEditId) {
            success = await updateUser(currentEditId, userData);
        } else {
            success = await addUser(userData);
        }
        
        if (success) {
            closeModal();
            loadAllUsers();
        }
    });
}

window.onclick = (e) => {
    if (e.target === userModal) {
        closeModal();
    }
};

async function initAdminUsers() {
    console.log('Initializing admin users page...');
    
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
    
    await loadAllUsers();
}

initAdminUsers();