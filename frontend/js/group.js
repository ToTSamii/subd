// group.js - логика страницы "Моя группа"

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

// Получение полного имени
function getFullName(person) {
    const parts = [];
    if (person.lastName) parts.push(person.lastName);
    if (person.firstName) parts.push(person.firstName);
    if (person.middleName) parts.push(person.middleName);
    
    if (parts.length > 0) return parts.join(' ');
    return person.login || person.email || 'Без имени';
}

// Получение данных студента по userId
async function getStudentByUserId(userId) {
    try {
        const token = getAuthToken();
        if (!token) return null;
        
        // Пробуем получить студента через эндпоинт (если есть)
        const response = await fetch(`${API_URL}/student/user/${userId}`, {
            method: 'GET',
            headers: { 'Authorization': token }
        });
        
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Error getting student:', error);
        return null;
    }
}

// Загрузка группы студента по userId
async function loadStudentGroup(userId) {
    console.log('Loading group for userId:', userId);
    
    if (!userId) {
        return { hasGroup: false, error: 'ID пользователя не определён' };
    }
    
    try {
        const token = getAuthToken();
        if (!token) {
            return { hasGroup: false, error: 'Необходимо авторизоваться' };
        }
        
        // Получаем информацию о группе студента по userId
        const groupResponse = await fetch(`${API_URL}/student/group/${userId}`, {
            method: 'GET',
            headers: { 
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Group response status:', groupResponse.status);
        
        if (!groupResponse.ok) {
            if (groupResponse.status === 404) {
                return { hasGroup: false };
            }
            if (groupResponse.status === 401) {
                return { hasGroup: false, error: 'Сессия истекла, войдите снова' };
            }
            throw new Error(`Ошибка: ${groupResponse.status}`);
        }
        
        const groupData = await groupResponse.json();
        console.log('Group data received:', groupData);
        
        // Извлекаем данные группы (адаптируем под структуру бэкенда)
        const groupId = groupData.id || groupData.groupId || groupData.code;
        const groupName = groupData.name || groupData.groupName;
        const courseName = groupData.course?.name || groupData.courseName;
        const startDate = groupData.startDate;
        const endDate = groupData.endDate;
        const teacher = groupData.teacher;
        
        console.log('Parsed group:', { groupId, groupName, courseName });
        
        // Получаем список студентов группы
        let students = [];
        
        if (groupId) {
            const studentsResponse = await fetch(`${API_URL}/student/group/students/${groupId}`, {
                method: 'GET',
                headers: { 'Authorization': token }
            });
            
            console.log('Students response status:', studentsResponse.status);
            
            if (studentsResponse.ok) {
                let studentsData = await studentsResponse.json();
                console.log('Students data received:', studentsData);
                
                // Обрабатываем разные форматы ответа
                if (Array.isArray(studentsData)) {
                    students = studentsData;
                } else if (studentsData.students && Array.isArray(studentsData.students)) {
                    students = studentsData.students;
                } else if (studentsData.content && Array.isArray(studentsData.content)) {
                    students = studentsData.content;
                } else {
                    // Если пришёл объект, пробуем преобразовать
                    students = Object.values(studentsData).filter(v => v && typeof v === 'object' && (v.firstName || v.lastName));
                }
                
                // Обогащаем данные студентов фотографиями из User
                for (let student of students) {
                    if (student.user) {
                        student.photo = student.user.photo;
                        student.login = student.user.login;
                        student.email = student.user.email;
                    }
                }
                
                console.log('Processed students:', students);
            }
        }
        
        return {
            hasGroup: true,
            group: {
                id: groupId,
                name: groupName || 'Группа',
                courseName: courseName,
                startDate: startDate,
                endDate: endDate,
                teacher: teacher
            },
            students: students || []
        };
        
    } catch (error) {
        console.error('Error loading group:', error);
        return { hasGroup: false, error: error.message };
    }
}

// Рендер страницы группы
function renderGroupPage(data, currentUser) {
    const container = document.getElementById('groupContent');
    
    if (!container) return;
    
    console.log('Rendering group page with data:', data);
    
    if (data.error) {
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle fa-3x" style="color: #dc2626;"></i>
                <p>Ошибка: ${data.error}</p>
                <button class="btn-primary" onclick="location.reload()">Повторить</button>
            </div>
        `;
        return;
    }
    
    if (!data.hasGroup) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>Вы ещё не зачислены в группу</p>
                <p style="font-size: 0.9rem; margin-top: 8px;">Обратитесь к администратору для зачисления</p>
                <button class="btn-primary" style="margin-top: 20px;" onclick="window.location.href='index.html'">
                    На главную
                </button>
            </div>
        `;
        return;
    }
    
    const group = data.group;
    const students = data.students;
    
    // Сортируем студентов по фамилии
    const sortedStudents = [...students].sort((a, b) => {
        const nameA = (a.lastName || '') + (a.firstName || '');
        const nameB = (b.lastName || '') + (b.firstName || '');
        return nameA.localeCompare(nameB);
    });
    
    // Находим текущего студента по userId
    const currentUserId = currentUser?.userId || currentUser?.id;
    const currentStudent = sortedStudents.find(s => {
        return s.user?.userId === currentUserId || s.userId === currentUserId;
    });
    
    // Формируем список: сначала текущий студент, потом остальные
    let orderedStudents = sortedStudents;
    if (currentStudent) {
        orderedStudents = [currentStudent, ...sortedStudents.filter(s => s !== currentStudent)];
    }
    
    // HTML для списка студентов
    let studentsHtml = '';
    if (orderedStudents.length === 0) {
        studentsHtml = '<p style="text-align: center; color: #64748b; padding: 40px;">В группе пока нет студентов</p>';
    } else {
        studentsHtml = orderedStudents.map(student => {
            const isCurrent = student === currentStudent;
            const fullName = getFullName(student);
            const login = student.user?.login || student.login || 'Логин не указан';
            const photoUrl = student.user?.photo || student.photo;
            const validPhoto = photoUrl && photoUrl !== 'null' && photoUrl.trim() !== '';
            
            return `
                <div class="student-item" style="${isCurrent ? 'background: #eef2ff; border-left: 4px solid #2563eb;' : 'background: #f8fafc;'} margin-bottom: 8px; border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 16px;">
                    <div class="student-avatar" style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; overflow: hidden;">
                        ${validPhoto ? 
                            `<img src="${photoUrl}" alt="avatar" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'">` : 
                            `<i class="fas fa-user"></i>`
                        }
                    </div>
                    <div class="student-info" style="flex: 1;">
                        <div class="student-name" style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">
                            ${escapeHtml(fullName)}
                            ${isCurrent ? '<span style="font-size: 0.75rem; color: #2563eb; margin-left: 8px;">(Вы)</span>' : ''}
                        </div>
                        <div class="student-login" style="font-size: 0.85rem; color: #64748b;">
                            <i class="fas fa-sign-in-alt" style="font-size: 0.7rem;"></i> ${escapeHtml(login)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Информация о преподавателе
    let teacherHtml = '';
    if (group.teacher) {
        const teacherName = getFullName(group.teacher);
        teacherHtml = `
            <div class="info-card" style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h3 style="font-size: 1.2rem; margin-bottom: 20px; color: #1e293b; display: flex; align-items: center; gap: 10px; border-bottom: 2px solid #eef2f8; padding-bottom: 12px;">
                    <i class="fas fa-chalkboard-user" style="color: #2563eb;"></i> Преподаватель
                </h3>
                <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: #f8fafc; border-radius: 12px;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #ef4444); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 4px 0;">${escapeHtml(teacherName)}</h4>
                        <p style="margin: 0; color: #64748b;">${escapeHtml(group.teacher.qualification || 'Преподаватель')}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = `
        <div class="group-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 24px; padding: 40px; color: white; margin-bottom: 32px;">
            <h1 style="font-size: 2rem; margin-bottom: 8px;">${escapeHtml(group.name)}</h1>
            ${group.courseName ? `<div class="course-name" style="font-size: 1.2rem; opacity: 0.9; margin-bottom: 16px;"><i class="fas fa-graduation-cap"></i> ${escapeHtml(group.courseName)}</div>` : ''}
            <div class="group-dates" style="display: flex; gap: 24px; flex-wrap: wrap; margin-top: 20px;">
                ${group.startDate ? `<div class="date-item" style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 40px; font-size: 0.9rem;"><i class="far fa-calendar-alt"></i> Начало: ${formatDate(group.startDate)}</div>` : ''}
                ${group.endDate ? `<div class="date-item" style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 40px; font-size: 0.9rem;"><i class="far fa-calendar-check"></i> Окончание: ${formatDate(group.endDate)}</div>` : ''}
            </div>
        </div>
        
        ${teacherHtml}
        
        <div class="info-card" style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h3 style="font-size: 1.2rem; margin-bottom: 20px; color: #1e293b; display: flex; align-items: center; gap: 10px; border-bottom: 2px solid #eef2f8; padding-bottom: 12px;">
                <i class="fas fa-users" style="color: #2563eb;"></i> Студенты группы (${orderedStudents.length})
            </h3>
            <div class="students-list" style="max-height: 500px; overflow-y: auto;">
                ${studentsHtml}
            </div>
        </div>
    `;
}

// Функция экранирования HTML
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Основная функция
async function initGroupPage() {
    console.log('Initializing group page...');
    
    // Получаем текущего пользователя
    const currentUser = getCurrentUser();
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
        const container = document.getElementById('groupContent');
        if (container) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-lock" style="font-size: 4rem; color: #94a3b8;"></i>
                    <p style="color: #64748b; font-size: 1.1rem;">Необходимо авторизоваться</p>
                    <button class="btn-primary" style="margin-top: 20px;" onclick="window.location.href='index.html'">На главную</button>
                </div>
            `;
        }
        return;
    }
    
    // Проверяем роль
    const role = currentUser.role?.name || currentUser.roleName;
    console.log('User role:', role);
    
    // Используем userId
    const userId = currentUser.userId || currentUser.id;
    console.log('User ID:', userId);
    
    if (!userId) {
        const container = document.getElementById('groupContent');
        if (container) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #f59e0b;"></i>
                    <p style="color: #64748b; font-size: 1.1rem;">Не удалось определить ID пользователя</p>
                    <button class="btn-primary" style="margin-top: 20px;" onclick="window.location.href='index.html'">На главную</button>
                </div>
            `;
        }
        return;
    }
    
    // Загружаем данные группы по userId
    const groupData = await loadStudentGroup(userId);
    renderGroupPage(groupData, currentUser);
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', initGroupPage);