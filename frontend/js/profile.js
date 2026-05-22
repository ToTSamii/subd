// API URL
const API_URL = 'http://localhost:8080/api';

// DOM элементы
const loadingProfile = document.getElementById('loadingProfile');
const profileError = document.getElementById('profileError');
const profileContent = document.getElementById('profileContent');
const logoLink = document.getElementById('logoLink');
const logoutBtn = document.getElementById('logoutBtn');
const userNameSpan = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const userProfileClick = document.getElementById('userProfileClick');

// Поля профиля (общие)
const profilePhoto = document.getElementById('profilePhoto');
const avatarPlaceholder = document.getElementById('avatarPlaceholder');
const profileFullName = document.getElementById('profileFullName');
const profileRole = document.getElementById('profileRole');
const profileLogin = document.getElementById('profileLogin');
const profileEmail = document.getElementById('profileEmail');

// Студенческие поля
const studentInfoCard = document.getElementById('studentInfoCard');
const profileFirstName = document.getElementById('profileFirstName');
const profileLastName = document.getElementById('profileLastName');
const profileMiddleName = document.getElementById('profileMiddleName');
const profileBirthDate = document.getElementById('profileBirthDate');
const profileCourse = document.getElementById('profileCourse');
const profileGroup = document.getElementById('profileGroup');

// Преподавательские поля
const teacherInfoCard = document.getElementById('teacherInfoCard');
const profileQualification = document.getElementById('profileQualification');
const profileHireDate = document.getElementById('profileHireDate');
const profilePhone = document.getElementById('profilePhone');

// Админские поля
const adminInfoCard = document.getElementById('adminInfoCard');

// Скрываем все карточки по умолчанию
if (studentInfoCard) studentInfoCard.style.display = 'none';
if (teacherInfoCard) teacherInfoCard.style.display = 'none';
if (adminInfoCard) adminInfoCard.style.display = 'none';

logoLink.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Функция обновления навигации
function updateNavigationByRole(roleName) {
    console.log('=== ОБНОВЛЕНИЕ НАВИГАЦИИ (profile) ===');
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
        if (scheduleLink) { scheduleLink.style.display = 'inline-block'; scheduleLink.textContent = 'Расписание'; scheduleLink.href = 'schedule.html'; }
        if (progressLink) { progressLink.style.display = 'inline-block'; progressLink.textContent = 'Успеваемость'; progressLink.href = 'attendance.html'; }
        if (groupLink) { groupLink.style.display = 'inline-block'; groupLink.textContent = 'Группы'; groupLink.href = 'admin-groups.html'; }
        if (usersLink) { usersLink.style.display = 'inline-block'; usersLink.textContent = 'Пользователи'; usersLink.href = 'admin-users.html'; }
        if (coursesLink) { coursesLink.style.display = 'inline-block'; coursesLink.textContent = 'Курсы'; coursesLink.href = 'admin-courses.html'; }
        console.log('✅ Администратор: Расписание, Успеваемость, Группы, Пользователи, Курсы');
    }
    else if (roleName === 'Преподаватель' || roleName === 'TEACHER' || roleName === 'ROLE_TEACHER') {
        if (scheduleLink) { scheduleLink.style.display = 'inline-block'; scheduleLink.textContent = 'Расписание'; scheduleLink.href = 'schedule.html'; }
        if (progressLink) { progressLink.style.display = 'inline-block'; progressLink.textContent = 'Успеваемость'; progressLink.href = 'attendance.html'; }
        if (groupLink) { groupLink.style.display = 'inline-block'; groupLink.textContent = 'Группы'; groupLink.href = 'teacher-groups.html'; }
        console.log('✅ Преподаватель: Расписание, Успеваемость, Группы');
    }
    else if (roleName === 'Студент' || roleName === 'STUDENT' || roleName === 'ROLE_STUDENT') {
        if (scheduleLink) { scheduleLink.style.display = 'inline-block'; scheduleLink.textContent = 'Расписание'; scheduleLink.href = 'schedule.html'; }
        if (progressLink) { progressLink.style.display = 'inline-block'; progressLink.textContent = 'Успеваемость'; progressLink.href = 'attendance.html'; }
        if (groupLink) { groupLink.style.display = 'inline-block'; groupLink.textContent = 'Моя группа'; groupLink.href = 'group.html'; }
        if (myCoursesLink) { myCoursesLink.style.display = 'inline-block'; myCoursesLink.textContent = 'Мой курс'; myCoursesLink.href = 'my-course.html'; }
        console.log('✅ Студент: Расписание, Успеваемость, Моя группа, Мой курс');
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

// ============ ЗАГРУЗКА ДАННЫХ ПРОФИЛЯ ============
async function loadProfile() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    loadingProfile.style.display = 'block';
    profileContent.style.display = 'none';
    profileError.style.display = 'none';
    
    try {
        const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        
        const response = await fetch(`${API_URL}/profile/`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки профиля');
        }
        
        const userData = await response.json();
        console.log('Данные профиля:', userData);
        
        renderProfile(userData);
        updateHeader(userData);
        
        // Обновляем навигацию
        const role = getUserRole(userData);
        updateNavigationByRole(role);
        
    } catch (error) {
        console.error('Error loading profile:', error);
        profileError.style.display = 'block';
        profileError.textContent = 'Ошибка загрузки профиля. Попробуйте позже.';
    } finally {
        loadingProfile.style.display = 'none';
        profileContent.style.display = 'block';
    }
}

function renderProfile(userData) {
    const roleName = userData.roleName || 'Пользователь';
    
    profileRole.textContent = roleName;
    profileLogin.textContent = userData.login || '-';
    profileEmail.textContent = userData.email || '-';
    
    // Фото
    if (userData.photo && userData.photo !== 'null' && userData.photo.trim() !== '') {
        profilePhoto.src = userData.photo;
        profilePhoto.style.display = 'block';
        avatarPlaceholder.style.display = 'none';
    } else {
        profilePhoto.style.display = 'none';
        avatarPlaceholder.style.display = 'flex';
    }
    
    // Скрываем все карточки и строки
    if (studentInfoCard) studentInfoCard.style.display = 'none';
    if (teacherInfoCard) teacherInfoCard.style.display = 'none';
    if (adminInfoCard) adminInfoCard.style.display = 'none';
    
    const firstNameRow = document.getElementById('firstNameRow');
    const lastNameRow = document.getElementById('lastNameRow');
    const middleNameRow = document.getElementById('middleNameRow');
    const birthDateRow = document.getElementById('birthDateRow');
    
    if (firstNameRow) firstNameRow.style.display = 'none';
    if (lastNameRow) lastNameRow.style.display = 'none';
    if (middleNameRow) middleNameRow.style.display = 'none';
    if (birthDateRow) birthDateRow.style.display = 'none';
    
    if (roleName === 'Администратор') {
        profileFullName.textContent = userData.login || 'Администратор';
        if (adminInfoCard) adminInfoCard.style.display = 'block';
    }
    else if (roleName === 'Студент') {
        const fullName = [userData.lastName, userData.firstName, userData.middleName]
            .filter(n => n && n !== 'null')
            .join(' ');
        profileFullName.textContent = fullName || userData.login || 'Студент';
        
        if (firstNameRow) firstNameRow.style.display = 'flex';
        if (lastNameRow) lastNameRow.style.display = 'flex';
        if (middleNameRow) middleNameRow.style.display = 'flex';
        if (birthDateRow) birthDateRow.style.display = 'flex';
        
        profileFirstName.textContent = userData.firstName || '-';
        profileLastName.textContent = userData.lastName || '-';
        profileMiddleName.textContent = userData.middleName || '-';
        
        if (userData.birthDate) {
            const date = new Date(userData.birthDate);
            profileBirthDate.textContent = date.toLocaleDateString('ru-RU');
        } else {
            profileBirthDate.textContent = '-';
        }
        
        profileCourse.textContent = userData.courseName || 'Не назначен';
        profileGroup.textContent = userData.groupName || 'Не назначена';
        
        if (studentInfoCard) studentInfoCard.style.display = 'block';
    }
    else if (roleName === 'Преподаватель') {
        const fullName = [userData.lastName, userData.firstName, userData.middleName]
            .filter(n => n && n !== 'null')
            .join(' ');
        profileFullName.textContent = fullName || userData.login || 'Преподаватель';
        
        if (firstNameRow) firstNameRow.style.display = 'flex';
        if (lastNameRow) lastNameRow.style.display = 'flex';
        if (middleNameRow) middleNameRow.style.display = 'flex';
        
        profileFirstName.textContent = userData.firstName || '-';
        profileLastName.textContent = userData.lastName || '-';
        profileMiddleName.textContent = userData.middleName || '-';
        
        profileQualification.textContent = userData.qualification || '-';
        profilePhone.textContent = userData.phoneNumber || '-';
        
        if (userData.hireDate) {
            const date = new Date(userData.hireDate);
            profileHireDate.textContent = date.toLocaleDateString('ru-RU');
        } else {
            profileHireDate.textContent = '-';
        }
        
        if (teacherInfoCard) teacherInfoCard.style.display = 'block';
    }
    else {
        profileFullName.textContent = userData.login || 'Пользователь';
    }
}

function updateHeader(userData) {
    const displayName = userData.firstName || userData.login || userData.email;
    userNameSpan.textContent = displayName;
    
    if (userData.photo && userData.photo !== 'null' && userData.photo.trim() !== '') {
        userAvatar.innerHTML = `<img src="${userData.photo}" alt="avatar" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'">`;
    } else {
        userAvatar.innerHTML = '<i class="fas fa-user"></i>';
    }
}

// Выход
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
}

// Переход на главную
if (userProfileClick) {
    userProfileClick.addEventListener('click', (e) => {
        if (e.target.id !== 'logoutBtn') {
            window.location.href = 'index.html';
        }
    });
}

// Загрузка профиля
loadProfile();