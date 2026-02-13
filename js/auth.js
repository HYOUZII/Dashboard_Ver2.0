// 연구소 업무 관리 대시보드 - 인증 관리 모듈

// ⚠️ 여기에 본인의 Apps Script URL을 입력하세요
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby3Fw1OvC1nSyQAJiQuRgdkGe01ca-c-JL64y_s6f4l0QWxMfgOa5WRqSi5-9FSZH8/exec';

// 세션 유효 시간 (시간)
const SESSION_DURATION_HOURS = 8;

/**
 * 사용자 인증
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @returns {Promise<Object>} 인증 결과
 */
async function authenticateUser(email, password) {
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({
                action: 'authenticateUser',
                email: email,
                password: password
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('인증 오류:', error);
        throw error;
    }
}

/**
 * 세션 확인
 * @returns {Object|null} 세션 데이터 또는 null
 */
function getSession() {
    const sessionStr = localStorage.getItem('lab_session');
    
    if (!sessionStr) {
        return null;
    }
    
    try {
        const session = JSON.parse(sessionStr);
        
        // 세션 만료 확인
        const loginTime = session.loginTime;
        const now = new Date().getTime();
        const hoursPassed = (now - loginTime) / (1000 * 60 * 60);
        
        if (hoursPassed > SESSION_DURATION_HOURS) {
            // 세션 만료
            localStorage.removeItem('lab_session');
            return null;
        }
        
        return session;
        
    } catch (error) {
        console.error('세션 파싱 오류:', error);
        localStorage.removeItem('lab_session');
        return null;
    }
}

/**
 * 세션 저장
 * @param {Object} sessionData - 세션 데이터
 */
function saveSession(sessionData) {
    const session = {
        ...sessionData,
        loginTime: new Date().getTime()
    };
    
    localStorage.setItem('lab_session', JSON.stringify(session));
}

/**
 * 로그아웃
 */
function logout() {
    localStorage.removeItem('lab_session');
    window.location.href = 'login.html';
}

/**
 * 로그인 페이지로 리다이렉트
 */
function redirectToLogin() {
    window.location.href = 'login.html';
}

/**
 * 대시보드 페이지로 리다이렉트
 */
function redirectToDashboard() {
    window.location.href = 'dashboard.html';
}

/**
 * 세션 필요 페이지 보호
 * 대시보드 페이지에서 호출
 */
function requireSession() {
    const session = getSession();
    
    if (!session) {
        redirectToLogin();
        return null;
    }
    
    return session;
}

/**
 * 권한 확인
 * @param {string} requiredPermission - 필요한 권한
 * @returns {boolean} 권한 여부
 */
function hasPermission(requiredPermission) {
    const session = getSession();
    
    if (!session) {
        return false;
    }
    
    const permissionLevels = ['GUEST', 'EXTERNAL', 'RESEARCHER', 'ADMIN'];
    const userLevel = permissionLevels.indexOf(session.permission);
    const requiredLevel = permissionLevels.indexOf(requiredPermission);
    
    return userLevel >= requiredLevel;
}
