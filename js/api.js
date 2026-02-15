// 연구소 업무 관리 대시보드 - API 통신 모듈

/**
 * API 호출
 * @param {string} action - API 액션
 * @param {Object} params - 파라미터
 * @returns {Promise<Object>} API 응답
 */
async function callAPI(action, params = {}) {
    const session = getSession();
    
    if (!session) {
        throw new Error('세션이 없습니다');
    }
    
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({
                action: action,
                sessionToken: session.token,
                ...params
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // 세션 만료 처리
        if (result.requireLogin) {
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
            logout();
            return null;
        }
        
        return result;
        
    } catch (error) {
        console.error('API 호출 오류:', error);
        throw error;
    }
}

// ==========================================
// 대시보드 API
// ==========================================

async function getDashboardStats() {
    return await callAPI('getDashboardStats');
}

// ==========================================
// 프로젝트 API
// ==========================================

async function getProjects() {
    return await callAPI('getProjects');
}

async function addProject(projectData) {
    return await callAPI('addProject', projectData);
}

async function updateTaskProgress(taskData) {
    return await callAPI('updateTaskProgress', taskData);
}

// ==========================================
// 인터럽트 API
// ==========================================

async function getInterrupts() {
    return await callAPI('getInterrupts');
}

async function addInterrupt(interruptData) {
    return await callAPI('addInterrupt', interruptData);
}

// ==========================================
// 베이스라인 API
// ==========================================

async function getBaselines() {
    return await callAPI('getBaselines');
}

async function createBaseline(baselineData) {
    return await callAPI('createBaseline', baselineData);
}

// ==========================================
// VOC API
// ==========================================

async function getVOCList() {
    return await callAPI('getVOCList');
}

async function addVOC(vocData) {
    return await callAPI('addVOC', vocData);
}

async function updateVOCStatus(vocId, updates) {
    return await callAPI('updateVOCStatus', {
        vocId: vocId,
        ...updates
    });
}

// ==========================================
// 설정 API
// ==========================================

async function getPermissions() {
    return await callAPI('getPermissions');
}

async function updatePermission(email, updates) {
    return await callAPI('updatePermission', {
        email: email,
        ...updates
    });
}

// ==========================================
// 팀원 API
// ==========================================

async function getTeamMembers() {
    return await callAPI('getTeamMembers');
}
