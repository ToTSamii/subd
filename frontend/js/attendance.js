

// Элементы для учителя/админа
const teacherPanel = document.getElementById('teacherPanel');
const studentSelect = document.getElementById('studentSelect');
const gradeInput = document.getElementById('gradeInput');
const addMarkBtn = document.getElementById('addMarkBtn');
const groupSelect = document.getElementById('groupSelect');

// Модальное окно для редактирования
const editModal = document.getElementById('editModal');
const editAttendanceId = document.getElementById('editAttendanceId');
const editGrade = document.getElementById('editGrade');
const editCourseName = document.getElementById('editCourseName');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const closeModalBtn = document.getElementById('closeEditModal');

let userRole = null;
let userId = null;
let currentCourseId = null;
let currentAttendanceId = null;
let currentStudentId = null;


if (logoLink) {
    logoLink.onclick = () => window.location.href = 'index.html';
}

function showMessage(message, type) {
    const msgDiv = document.createElement('div');
    msgDiv.textContent = message;
    msgDiv.style.position = 'fixed';
    msgDiv.style.bottom = '20px';
    msgDiv.style.right = '20px';
    msgDiv.style.zIndex = '2000';
    msgDiv.style.padding = '12px 20px';
    msgDiv.style.borderRadius = '8px';
    msgDiv.style.background = type === 'error' ? '#fee2e2' : '#dcfce7';
    msgDiv.style.color = type === 'error' ? '#991b1b' : '#166534';
    document.body.appendChild(msgDiv);
    setTimeout(() => msgDiv.remove(), 3000);
}

function getGradeClass(grade) {
    if (grade >= 4) return 'grade-good';
    if (grade === 3) return 'grade-normal';
    return 'grade-bad';
}

function getToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        return null;
    }
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

async function loadUserData() {
    const token = getToken();
    if (!token) {
        window.location.href = 'index.html';
        return null;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': token }
        });
        
        if (!response.ok) {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
            return null;
        }
        
        const userData = await response.json();
        userRole = userData.roleName || userData.role?.name;
        userId = userData.userId || userData.id;
        
        userNameSpan.textContent = userData.firstName || userData.login;
        if (userData.photo && userData.photo !== 'null') {
            userAvatar.innerHTML = `<img src="${userData.photo}" style="width:100%;height:100%;object-fit:cover;">`;
        }
        
        let roleIcon = '';
        if (userRole === 'Администратор') roleIcon = '<i class="fas fa-shield-alt"></i> ';
        else if (userRole === 'Преподаватель') roleIcon = '<i class="fas fa-chalkboard-user"></i> ';
        else if (userRole === 'Студент') roleIcon = '<i class="fas fa-graduation-cap"></i> ';
        roleBadge.innerHTML = `${roleIcon}${userRole}`;
        
        return userData;
    } catch (error) {
        return null;
    }
}

// Для студента
async function loadStudentMarks() {
    const token = getToken();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/student/attendance/${userId}`, {
            headers: { 'Authorization': token }
        });
        
        if (response.status === 404) {
            emptyState.style.display = 'block';
            marksTableBody.innerHTML = '';
            return;
        }
        
        if (!response.ok) throw new Error();
        
        const marks = await response.json();
        
        if (marks.length === 0) {
            emptyState.style.display = 'block';
            marksTableBody.innerHTML = '';
        } else {
            emptyState.style.display = 'none';
            marksTableBody.innerHTML = marks.map(mark => {
                const formattedDate = mark.date ? new Date(mark.date).toLocaleDateString() : '-';
                const grade = mark.grade || '-';
                let courseName = '-';
                if (mark.course) {
                    courseName = mark.course.name || mark.course.Название || '-';
                }
                if (courseName === '-' && mark.courseNameDenorm) {
                    courseName = mark.courseNameDenorm;
                }
                
                return `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${courseName}</td>
                    <td class="${getGradeClass(grade)}"><span class="grade-value">${grade}</span></td>
                </tr>
            `}).join('');
        }
    } catch (error) {
        emptyState.style.display = 'block';
        marksTableBody.innerHTML = '';
    }
}

// Загрузка групп для преподавателя (только свои группы)
async function loadTeacherGroups() {
    const token = getToken();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/teacher/groups/${userId}`, {
            headers: { 'Authorization': token }
        });
        
        if (!response.ok) {
            return;
        }
        
        const data = await response.json();
        let groups = [];
        if (data.groups && Array.isArray(data.groups)) {
            groups = data.groups;
        } else if (Array.isArray(data)) {
            groups = data;
        }
        
        groupSelect.innerHTML = '<option value="">Выберите группу</option>';
        groups.forEach(group => {
            const id = group.id || group.groupId;
            const name = group.name || group.groupName;
            if (id) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = name;
                groupSelect.appendChild(option);
            }
        });
        
        groupSelect.onchange = async (e) => {
            const groupId = e.target.value;
            if (groupId) {
                await loadGroupData(groupId);
            } else {
                studentSelect.innerHTML = '<option value="">Выберите группу сначала</option>';
                marksTableBody.innerHTML = '<tr><td colspan="4" class="empty-message">Выберите группу</td>';
                currentCourseId = null;
            }
        };
        
    } catch (error) {
        showMessage('Ошибка загрузки групп', 'error');
    }
}

// Загрузка всех групп для администратора
async function loadAllGroups() {
    const token = getToken();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/group/all`, {
            headers: { 'Authorization': token }
        });
        
        if (!response.ok) {
            return;
        }
        
        const data = await response.json();
        let groups = [];
        if (data.groups && Array.isArray(data.groups)) {
            groups = data.groups;
        } else if (Array.isArray(data)) {
            groups = data;
        }
        
        groupSelect.innerHTML = '<option value="">Выберите группу</option>';
        groups.forEach(group => {
            const id = group.id || group.groupId;
            const name = group.name || group.groupName;
            if (id) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = name;
                groupSelect.appendChild(option);
            }
        });
        
        groupSelect.onchange = async (e) => {
            const groupId = e.target.value;
            if (groupId) {
                await loadGroupData(groupId);
            } else {
                studentSelect.innerHTML = '<option value="">Выберите группу сначала</option>';
                marksTableBody.innerHTML = '<tr><td colspan="4" class="empty-message">Выберите группу</td>';
                currentCourseId = null;
            }
        };
        
    } catch (error) {
        showMessage('Ошибка загрузки групп', 'error');
    }
}

async function loadGroupData(groupId) {
    studentSelect.innerHTML = '<option value="">Загрузка студентов...</option>';
    studentSelect.disabled = true;
    
    await loadCourseByGroup(groupId);
    await loadStudentsByGroup(groupId);
    
    studentSelect.disabled = false;
}

async function loadCourseByGroup(groupId) {
    const token = getToken();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/group/course/${groupId}`, {
            headers: { 'Authorization': token }
        });
        
        if (response.ok) {
            const data = await response.json();
            let courses = [];
            if (data.groups && Array.isArray(data.groups)) {
                courses = data.groups;
            } else if (Array.isArray(data)) {
                courses = data;
            }
            
            if (courses.length > 0) {
                currentCourseId = courses[0].id || courses[0].courseId;
            }
        }
    } catch (error) {
        // Ошибка загрузки курса
    }
}

async function loadStudentsByGroup(groupId) {
    if (!groupId) {
        studentSelect.innerHTML = '<option value="">Ошибка: ID группы не указан</option>';
        return;
    }
    
    const token = getToken();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/student/group/students/${groupId}`, {
            headers: { 'Authorization': token }
        });
        
        if (!response.ok) {
            studentSelect.innerHTML = '<option value="">Ошибка загрузки студентов</option>';
            return;
        }
        
        const students = await response.json();
        
        if (students.length === 0) {
            studentSelect.innerHTML = '<option value="">Нет студентов в группе</option>';
            marksTableBody.innerHTML = '<tr><td colspan="4" class="empty-message">Нет студентов в группе</td>';
            return;
        }
        
        studentSelect.innerHTML = '<option value="">Выберите студента</option>';
        
        students.forEach((student, index) => {
            let studentId = null;
            if (student.user && student.user.userId) {
                studentId = student.user.userId;
            } else if (student.user && student.user.id) {
                studentId = student.user.id;
            } else if (student.id) {
                studentId = student.id;
            } else if (student.userId) {
                studentId = student.userId;
            }
            
            const firstName = student.firstName || student.user?.firstName || '';
            const lastName = student.lastName || student.user?.lastName || '';
            const middleName = student.middleName || student.user?.middleName || '';
            const login = student.user?.login || student.login || '';
            
            let fullName = '';
            if (lastName) fullName += lastName + ' ';
            if (firstName) fullName += firstName + ' ';
            if (middleName) fullName += middleName;
            fullName = fullName.trim();
            
            const name = fullName || login || `Студент ${index + 1}`;
            
            if (studentId) {
                const option = document.createElement('option');
                option.value = studentId;
                option.textContent = name;
                studentSelect.appendChild(option);
            }
        });
        
        studentSelect.onchange = async (e) => {
            const studentId = e.target.value;
            if (studentId && studentId !== '') {
                currentStudentId = parseInt(studentId);
                await loadStudentMarksById(studentId);
            } else {
                marksTableBody.innerHTML = '<tr><td colspan="4" class="empty-message">Выберите студента</td>';
            }
        };
        
        if (studentSelect.options.length > 1) {
            const firstValue = studentSelect.options[1].value;
            studentSelect.value = firstValue;
            currentStudentId = parseInt(firstValue);
            await loadStudentMarksById(firstValue);
        }
        
    } catch (error) {
        studentSelect.innerHTML = '<option value="">Ошибка загрузки студентов</option>';
        showMessage('Ошибка загрузки студентов', 'error');
    }
}

async function loadStudentMarksById(studentId) {
    const token = getToken();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/student/attendance/${studentId}`, {
            headers: { 'Authorization': token }
        });
        
        if (response.status === 404) {
            emptyState.style.display = 'block';
            marksTableBody.innerHTML = '';
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const marks = await response.json();
        
        if (marks.length === 0) {
            emptyState.style.display = 'block';
            marksTableBody.innerHTML = '';
        } else {
            emptyState.style.display = 'none';
            
            const isEditable = (userRole === 'Преподаватель' || userRole === 'Администратор');
            
            const actionsColumn = document.getElementById('actionsColumn');
            if (actionsColumn) {
                actionsColumn.style.display = isEditable ? 'table-cell' : 'none';
            }
            
            marksTableBody.innerHTML = marks.map(mark => {
                const attendanceId = mark.id;
                const formattedDate = mark.date ? new Date(mark.date).toLocaleDateString() : '-';
                const grade = mark.grade || '-';
                let courseName = '-';
                if (mark.course) {
                    courseName = mark.course.name || mark.course.Название || '-';
                }
                if (courseName === '-' && mark.courseNameDenorm) {
                    courseName = mark.courseNameDenorm;
                }
                
                const safeCourseName = courseName.replace(/'/g, "\\'");
                
                return `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${courseName}</td>
                    <td class="${getGradeClass(grade)}"><span class="grade-value">${grade}</span></td>
                    ${isEditable && attendanceId ? `
                    <td class="action-buttons">
                        <button class="btn-edit" onclick="openEditModal(${attendanceId}, ${grade}, '${safeCourseName}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteAttendance(${attendanceId})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                    ` : (isEditable ? '<td class="action-buttons">—</td>' : '')}
                </tr>
            `}).join('');
        }
    } catch (error) {
        console.error('Ошибка загрузки оценок:', error);
        emptyState.style.display = 'block';
        marksTableBody.innerHTML = '';
    }
}

// ============ ДОБАВЛЕНИЕ ОЦЕНКИ ============
async function addMark() {
    const studentId = studentSelect.value;
    const grade = gradeInput.value;
    
    if (!studentId || studentId === '') {
        showMessage('Выберите студента из списка', 'error');
        return;
    }
    
    if (!currentCourseId) {
        showMessage('Не удалось определить курс для этой группы', 'error');
        return;
    }
    
    if (!grade || grade < 2 || grade > 5) {
        showMessage('Оценка должна быть от 2 до 5', 'error');
        return;
    }
    
    const token = getToken();
    if (!token) return;
    
    const finalStudentId = parseInt(studentId);
    const finalCourseId = parseInt(currentCourseId);
    const finalGrade = parseInt(grade);
    
    const requestData = {
        studentId: finalStudentId,
        courseId: finalCourseId,
        grade: finalGrade,
        date: new Date().toISOString()
    };
    
    addMarkBtn.disabled = true;
    addMarkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
    
    try {
        const response = await fetch(`${API_URL}/attendance/`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (response.ok) {
            showMessage('Оценка успешно добавлена', 'success');
            gradeInput.value = '';
            if (currentStudentId) {
                await loadStudentMarksById(currentStudentId);
            }
        } else {
            const error = await response.json();
            showMessage(error.message || 'Ошибка добавления оценки', 'error');
        }
    } catch (error) {
        showMessage('Ошибка соединения с сервером', 'error');
    } finally {
        addMarkBtn.disabled = false;
        addMarkBtn.innerHTML = '<i class="fas fa-save"></i> Поставить оценку';
    }
}

// ============ РЕДАКТИРОВАНИЕ ОЦЕНКИ ============
window.openEditModal = function(attendanceId, currentGrade, courseName) {
    if (!attendanceId || attendanceId === 'undefined' || isNaN(attendanceId)) {
        showMessage('Ошибка: ID оценки не найден', 'error');
        return;
    }
    
    currentAttendanceId = attendanceId;
    if (editAttendanceId) editAttendanceId.value = attendanceId;
    if (editGrade) editGrade.value = currentGrade;
    if (editCourseName) editCourseName.textContent = courseName || 'Неизвестный курс';
    if (editModal) editModal.style.display = 'block';
}

async function updateAttendance() {
    const attendanceId = currentAttendanceId;
    const newGrade = editGrade ? editGrade.value : null;
    
    if (!attendanceId || attendanceId === 'undefined' || isNaN(attendanceId)) {
        showMessage('Ошибка: ID оценки не найден', 'error');
        closeEditModalWindow();
        return;
    }
    
    if (!newGrade || newGrade < 2 || newGrade > 5) {
        showMessage('Оценка должна быть от 2 до 5', 'error');
        return;
    }
    
    const token = getToken();
    if (!token) return;
    
    const requestData = {
        studentId: currentStudentId ? parseInt(currentStudentId) : null,
        courseId: currentCourseId ? parseInt(currentCourseId) : null,
        grade: parseInt(newGrade),
        date: new Date().toISOString()
    };
    
    if (saveEditBtn) {
        saveEditBtn.disabled = true;
        saveEditBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
    }
    
    try {
        const response = await fetch(`${API_URL}/attendance/${attendanceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (response.ok) {
            showMessage('Оценка успешно обновлена', 'success');
            closeEditModalWindow();
            if (currentStudentId) {
                await loadStudentMarksById(currentStudentId);
            }
        } else {
            const error = await response.json();
            showMessage(error.message || 'Ошибка обновления оценки', 'error');
        }
    } catch (error) {
        showMessage('Ошибка соединения с сервером', 'error');
    } finally {
        if (saveEditBtn) {
            saveEditBtn.disabled = false;
            saveEditBtn.innerHTML = 'Сохранить';
        }
    }
}

// ============ УДАЛЕНИЕ ОЦЕНКИ ============
window.deleteAttendance = async function(attendanceId) {
    if (!attendanceId || attendanceId === 'undefined' || isNaN(attendanceId)) {
        showMessage('Ошибка: ID оценки не найден', 'error');
        return;
    }
    
    if (!confirm('Вы уверены, что хотите удалить эту оценку?')) return;
    
    const token = getToken();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/attendance/${attendanceId}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });
        
        if (response.ok) {
            showMessage('Оценка успешно удалена', 'success');
            if (currentStudentId) {
                await loadStudentMarksById(currentStudentId);
            }
        } else {
            const error = await response.json();
            showMessage(error.message || 'Ошибка удаления оценки', 'error');
        }
    } catch (error) {
        showMessage('Ошибка соединения с сервером', 'error');
    }
}

function closeEditModalWindow() {
    if (editModal) editModal.style.display = 'none';
    currentAttendanceId = null;
    if (editGrade) editGrade.value = '';
}

async function loadAttendance() {
    loadingState.style.display = 'block';
    
    try {
        if (userRole === 'Студент') {
            teacherPanel.style.display = 'none';
            await loadStudentMarks();
        } else if (userRole === 'Преподаватель') {
            teacherPanel.style.display = 'block';
            addMarkBtn.onclick = addMark;
            await loadTeacherGroups();
        } else if (userRole === 'Администратор') {
            teacherPanel.style.display = 'block';
            addMarkBtn.onclick = addMark;
            await loadAllGroups();
        } else {
            teacherPanel.style.display = 'none';
            marksTableBody.innerHTML = '<td><td colspan="4">Неизвестная роль пользователя</td>';
        }
        
        attendanceContent.style.display = 'block';
    } catch (error) {
        errorState.style.display = 'block';
        errorState.textContent = 'Ошибка загрузки страницы';
    } finally {
        loadingState.style.display = 'none';
    }
}

// Закрытие модального окна
if (cancelEditBtn) {
    cancelEditBtn.onclick = closeEditModalWindow;
}
if (closeModalBtn) {
    closeModalBtn.onclick = closeEditModalWindow;
}
if (saveEditBtn) {
    saveEditBtn.onclick = updateAttendance;
}

window.onclick = (e) => {
    if (e.target === editModal) {
        closeEditModalWindow();
    }
};

// Выход
if (logoutBtn) {
    logoutBtn.onclick = () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    };
}

if (userProfileClick) {
    userProfileClick.onclick = (e) => {
        if (e.target.id !== 'logoutBtn') {
            window.location.href = 'profile.html';
        }
    };
}

if (scheduleLink) {
    scheduleLink.onclick = (e) => {
        e.preventDefault();
        window.location.href = 'schedule.html';
    };
}

if (progressLink) {
    progressLink.onclick = (e) => {
        window.location.href = 'attendance.html';
    };
}

// Запуск
async function init() {
    const userData = await loadUserData();
    if (userData) {
        await loadAttendance();
    }
}

init();