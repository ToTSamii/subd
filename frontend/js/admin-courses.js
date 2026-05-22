// admin-courses.js - управление курсами для администратора

// API_URL уже объявлен в main.js

// DOM элементы
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const coursesContainer = document.getElementById('coursesContainer');
const coursesTableBody = document.getElementById('coursesTableBody');
const addCourseBtn = document.getElementById('addCourseBtn');
const courseModal = document.getElementById('courseModal');
const courseForm = document.getElementById('courseForm');
const modalTitle = document.getElementById('modalTitle');
const courseIdInput = document.getElementById('courseId');
const courseNameInput = document.getElementById('courseName');
const courseDescriptionInput = document.getElementById('courseDescription');
const courseDurationInput = document.getElementById('courseDuration');
const courseCostInput = document.getElementById('courseCost');
const cancelBtn = document.getElementById('cancelBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

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

// Форматирование длительности
function formatDuration(hours) {
    if (!hours || hours <= 0) return '—';
    if (hours >= 40) {
        const weeks = Math.round(hours / 40);
        const weeksText = getWeeksText(weeks);
        return `${weeks} ${weeksText} (${hours} ч)`;
    }
    return `${hours} часов`;
}

function getWeeksText(weeks) {
    if (weeks === 1) return 'неделя';
    if (weeks >= 2 && weeks <= 4) return 'недели';
    return 'недель';
}

// Форматирование стоимости
function formatCost(cost) {
    if (!cost && cost !== 0) return '—';
    if (cost === 0) return 'Бесплатно';
    return `${cost.toLocaleString()} ₽`;
}

// Загрузка всех курсов
async function loadAllCourses() {
    console.log('Loading all courses...');
    
    if (loadingState) loadingState.style.display = 'block';
    if (errorState) errorState.style.display = 'none';
    if (coursesContainer) coursesContainer.style.display = 'none';
    
    try {
        const token = getAuthToken();
        if (!token) {
            showError('Необходимо авторизоваться');
            return;
        }
        
        const response = await fetch(`${API_URL}/courses/`, {
            method: 'GET',
            headers: { 'Authorization': token }
        });
        
        console.log('Courses response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 401) {
                showError('Сессия истекла, войдите снова');
                return;
            }
            throw new Error(`Ошибка: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Courses data:', data);
        
        let courses = [];
        if (data.courses && Array.isArray(data.courses)) {
            courses = data.courses;
        } else if (Array.isArray(data)) {
            courses = data;
        } else if (data.content && Array.isArray(data.content)) {
            courses = data.content;
        }
        
        renderCourses(courses);
        
    } catch (error) {
        console.error('Error loading courses:', error);
        showError(error.message);
    }
}

// Рендер курсов в таблицу
function renderCourses(courses) {
    if (loadingState) loadingState.style.display = 'none';
    
    if (!courses || courses.length === 0) {
        if (coursesContainer) coursesContainer.style.display = 'block';
        if (coursesTableBody) {
            coursesTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-graduation-cap"></i>
                        <p>Курсы не найдены</p>
                    </td>
                </tr>
            `;
        }
        return;
    }
    
    if (coursesContainer) coursesContainer.style.display = 'block';
    
    if (coursesTableBody) {
        coursesTableBody.innerHTML = courses.map(course => {
            const courseId = course.code || course.id;
            const name = course.name || course.title || 'Без названия';
            const description = course.description || '—';
            const duration = course.durationHours;
            const cost = course.cost;
            
            // Обрезаем длинное описание
            let shortDescription = description;
            if (description.length > 60) {
                shortDescription = description.substring(0, 60) + '...';
            }
            
            return `
                <tr>
                    <td>${courseId}</td>
                    <td><strong>${escapeHtml(name)}</strong></td>
                    <td><span title="${escapeHtml(description)}">${escapeHtml(shortDescription)}</span></td>
                    <td>${formatDuration(duration)}</td>
                    <td>${formatCost(cost)}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" onclick="editCourse(${courseId})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteCourse(${courseId})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Добавление курса
async function addCourse(courseData) {
    const token = getAuthToken();
    if (!token) return false;
    
    try {
        const response = await fetch(`${API_URL}/admin/course`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseData)
        });
        
        if (response.ok) {
            showTemporaryMessage('Курс успешно добавлен', 'success');
            return true;
        } else {
            const error = await response.json();
            showTemporaryMessage(error.message || 'Ошибка добавления курса', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error adding course:', error);
        showTemporaryMessage('Ошибка соединения с сервером', 'error');
        return false;
    }
}

// Обновление курса
async function updateCourse(id, courseData) {
    const token = getAuthToken();
    if (!token) return false;
    
    try {
        const response = await fetch(`${API_URL}/admin/course/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseData)
        });
        
        if (response.ok) {
            showTemporaryMessage('Курс успешно обновлён', 'success');
            return true;
        } else {
            const error = await response.json();
            showTemporaryMessage(error.message || 'Ошибка обновления курса', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error updating course:', error);
        showTemporaryMessage('Ошибка соединения с сервером', 'error');
        return false;
    }
}

// Удаление курса
window.deleteCourse = async function(id) {
    if (!confirm('Вы уверены, что хотите удалить этот курс? Это также удалит связанные группы и расписания.')) return;
    
    const token = getAuthToken();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/course/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });
        
        if (response.ok) {
            showTemporaryMessage('Курс успешно удалён', 'success');
            loadAllCourses();
        } else {
            const error = await response.json();
            showTemporaryMessage(error.message || 'Ошибка удаления курса', 'error');
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        showTemporaryMessage('Ошибка соединения с сервером', 'error');
    }
};

// Редактирование курса
window.editCourse = async function(id) {
    currentEditId = id;
    modalTitle.textContent = 'Редактировать курс';
    
    const token = getAuthToken();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/courses/${id}`, {
            method: 'GET',
            headers: { 'Authorization': token }
        });
        
        if (response.ok) {
            const course = await response.json();
            console.log('Course data for edit:', course);
            
            // Извлекаем данные курса
            const courseData = course.course || course;
            
            courseIdInput.value = courseData.code || courseData.id;
            courseNameInput.value = courseData.name || courseData.title || '';
            courseDescriptionInput.value = courseData.description || '';
            courseDurationInput.value = courseData.durationHours || '';
            courseCostInput.value = courseData.cost || '';
            
            openModal();
        } else {
            showTemporaryMessage('Ошибка загрузки данных курса', 'error');
        }
    } catch (error) {
        console.error('Error loading course for edit:', error);
        showTemporaryMessage('Ошибка соединения с сервером', 'error');
    }
};

function openModal() {
    if (courseModal) courseModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (courseModal) courseModal.style.display = 'none';
    document.body.style.overflow = '';
    courseForm.reset();
    currentEditId = null;
    courseIdInput.value = '';
    modalTitle.textContent = 'Добавить курс';
}

function showError(message) {
    if (errorState) {
        errorState.style.display = 'block';
        errorState.textContent = message;
    }
    if (loadingState) loadingState.style.display = 'none';
    if (coursesContainer) coursesContainer.style.display = 'none';
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
if (addCourseBtn) {
    addCourseBtn.onclick = () => {
        currentEditId = null;
        modalTitle.textContent = 'Добавить курс';
        courseForm.reset();
        openModal();
    };
}

if (cancelBtn) {
    cancelBtn.onclick = closeModal;
}

if (closeModalBtn) {
    closeModalBtn.onclick = closeModal;
}

if (courseForm) {
    courseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const courseData = {
            name: courseNameInput.value.trim(),
            description: courseDescriptionInput.value.trim() || null,
            durationHours: courseDurationInput.value ? parseInt(courseDurationInput.value) : null,
            cost: courseCostInput.value ? parseFloat(courseCostInput.value) : null
        };
        
        if (!courseData.name) {
            showTemporaryMessage('Введите название курса', 'error');
            return;
        }
        
        let success;
        if (currentEditId) {
            success = await updateCourse(currentEditId, courseData);
        } else {
            success = await addCourse(courseData);
        }
        
        if (success) {
            closeModal();
            loadAllCourses();
        }
    });
}

// Закрытие модального окна по клику вне его
window.onclick = (e) => {
    if (e.target === courseModal) {
        closeModal();
    }
};

// Основная функция инициализации
async function initAdminCourses() {
    console.log('Initializing admin courses page...');
    
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
    
    await loadAllCourses();
}

// Запуск
initAdminCourses();