// 설정 탭 관리 (ADMIN 전용)

async function initSettingsTab(container) {
    showPermissionInfo(container, SESSION.permission);
    
    if (SESSION.permission !== 'ADMIN') {
        container.innerHTML += `
            <div class="card">
                <div class="card-title">⚙️ 시스템 설정</div>
                <div class="alert alert-danger">
                    관리자 권한이 필요합니다.
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML += `
        <div class="card">
            <div class="card-title">⚙️ 시스템 설정</div>
            <p style="color: #666; margin-bottom: 20px;">
                사용자 권한 관리, 시스템 설정 변경
            </p>
            
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button class="btn btn-primary" onclick="showSettingsSection('permissions')">
                    👥 권한 관리
                </button>
                <button class="btn btn-primary" onclick="showSettingsSection('system')">
                    ⚙️ 시스템 설정
                </button>
                <button class="btn btn-primary" onclick="showSettingsSection('stats')">
                    📊 사용 통계
                </button>
            </div>
            
            <div id="settings-content"></div>
        </div>
    `;
    
    // 기본으로 권한 관리 표시
    showSettingsSection('permissions');
}

async function showSettingsSection(section) {
    const content = document.getElementById('settings-content');
    
    if (section === 'permissions') {
        loadPermissionsManagement(content);
    } else if (section === 'system') {
        loadSystemSettings(content);
    } else if (section === 'stats') {
        loadUsageStats(content);
    }
}

async function loadPermissionsManagement(container) {
    container.innerHTML = '<div class="loading">권한 데이터 로딩 중...</div>';
    
    try {
        const permissions = await getPermissions();
        
        if (!permissions || permissions.error) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    권한 데이터를 불러오는데 실패했습니다.
                </div>
            `;
            return;
        }
        
        let html = `
            <h3 style="margin: 20px 0 15px 0;">👥 권한 관리</h3>
            
            <div class="stats-grid" style="margin-bottom: 20px;">
                <div class="stat-card">
                    <div class="stat-label">전체 사용자</div>
                    <div class="stat-value">${permissions.length}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">활성 사용자</div>
                    <div class="stat-value">${permissions.filter(p => p['상태'] === '활성').length}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">ADMIN</div>
                    <div class="stat-value">${permissions.filter(p => p['권한레벨'] === 'ADMIN').length}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">RESEARCHER</div>
                    <div class="stat-value">${permissions.filter(p => p['권한레벨'] === 'RESEARCHER').length}</div>
                </div>
            </div>
            
            <div style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>이메일</th>
                            <th>이름</th>
                            <th>부서</th>
                            <th>권한레벨</th>
                            <th>상태</th>
                            <th>최종접속일</th>
                            <th>비고</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        permissions.forEach(perm => {
            const permissionClass = getPermissionBadgeClass(perm['권한레벨']);
            const statusClass = perm['상태'] === '활성' ? 'badge-success' : 'badge-danger';
            
            html += `
                <tr>
                    <td>${perm['이메일'] || '-'}</td>
                    <td><strong>${perm['이름'] || '-'}</strong></td>
                    <td>${perm['부서'] || '-'}</td>
                    <td><span class="badge ${permissionClass}">${perm['권한레벨'] || '-'}</span></td>
                    <td><span class="badge ${statusClass}">${perm['상태'] || '-'}</span></td>
                    <td>${formatDate(perm['최종접속일']) || '-'}</td>
                    <td style="font-size: 14px; color: #666;">${perm['비고'] || '-'}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
            
            <div class="alert alert-info" style="margin-top: 20px;">
                <strong>💡 권한 변경 방법:</strong><br>
                Google Sheets > Permissions 시트에서 직접 수정하세요.<br>
                변경 후 사용자가 다시 로그인하면 새 권한이 적용됩니다.
            </div>
        `;
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('권한 관리 로딩 오류:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                권한 데이터를 불러오는데 실패했습니다.
            </div>
        `;
    }
}

function getPermissionBadgeClass(permission) {
    const map = {
        'ADMIN': 'badge-danger',
        'RESEARCHER': 'badge-primary',
        'EXTERNAL': 'badge-warning',
        'GUEST': 'badge-info'
    };
    return map[permission] || 'badge-primary';
}

async function loadSystemSettings(container) {
    container.innerHTML = `
        <h3 style="margin: 20px 0 15px 0;">⚙️ 시스템 설정</h3>
        
        <div class="card" style="background: #f8f9fa; padding: 20px;">
            <h4>Apps Script URL</h4>
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
                현재 사용중인 Apps Script URL
            </p>
            <code style="display: block; padding: 10px; background: white; border-radius: 6px; word-break: break-all;">
                ${APPS_SCRIPT_URL}
            </code>
            
            <h4 style="margin-top: 20px;">세션 유효 시간</h4>
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
                로그인 유지 시간: <strong>${SESSION_DURATION_HOURS}시간</strong>
            </p>
            
            <h4 style="margin-top: 20px;">권한 레벨</h4>
            <table style="font-size: 14px; margin-top: 10px;">
                <tr>
                    <th>권한</th>
                    <th>설명</th>
                </tr>
                <tr>
                    <td><span class="badge badge-info">GUEST</span></td>
                    <td>조회만 가능</td>
                </tr>
                <tr>
                    <td><span class="badge badge-warning">EXTERNAL</span></td>
                    <td>VOC 작성, 인터럽트 등록, 파일 다운로드</td>
                </tr>
                <tr>
                    <td><span class="badge badge-primary">RESEARCHER</span></td>
                    <td>프로젝트 관리, 베이스라인 생성</td>
                </tr>
                <tr>
                    <td><span class="badge badge-danger">ADMIN</span></td>
                    <td>모든 기능 + 권한 관리</td>
                </tr>
            </table>
        </div>
        
        <div class="card" style="background: #fff3cd; padding: 20px; margin-top: 20px;">
            <h4 style="color: #856404;">⚠️ 주의사항</h4>
            <ul style="margin: 10px 0; padding-left: 20px; color: #856404;">
                <li>Apps Script URL은 재배포 시에만 변경됩니다</li>
                <li>권한 변경은 즉시 반영되지만, 사용자가 다시 로그인해야 적용됩니다</li>
                <li>비밀번호는 Google Sheets에 평문으로 저장됩니다 (보안 주의)</li>
            </ul>
        </div>
    `;
}

async function loadUsageStats(container) {
    container.innerHTML = '<div class="loading">사용 통계 계산 중...</div>';
    
    try {
        const [stats, interrupts, vocList] = await Promise.all([
            getDashboardStats(),
            getInterrupts(),
            getVOCList()
        ]);
        
        // 최근 7일 활동
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentInterrupts = interrupts.filter(item => {
            if (!item['날짜']) return false;
            const itemDate = new Date(item['날짜']);
            return itemDate >= sevenDaysAgo;
        });
        
        const recentVOCs = vocList.filter(item => {
            if (!item['작성일']) return false;
            const itemDate = new Date(item['작성일']);
            return itemDate >= sevenDaysAgo;
        });
        
        let html = `
            <h3 style="margin: 20px 0 15px 0;">📊 사용 통계</h3>
            
            <h4>전체 통계</h4>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">총 프로젝트</div>
                    <div class="stat-value">${stats.projects.total}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">총 인터럽트</div>
                    <div class="stat-value">${stats.interrupts.total}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">총 VOC</div>
                    <div class="stat-value">${vocList.length}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">팀원 수</div>
                    <div class="stat-value">${stats.members.total}</div>
                </div>
            </div>
            
            <h4 style="margin-top: 30px;">최근 7일 활동</h4>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">인터럽트</div>
                    <div class="stat-value" style="color: var(--danger);">${recentInterrupts.length}</div>
                    <div class="stat-unit">건</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">VOC</div>
                    <div class="stat-value" style="color: var(--warning);">${recentVOCs.length}</div>
                    <div class="stat-unit">건</div>
                </div>
            </div>
            
            <div class="alert alert-info" style="margin-top: 20px;">
                <strong>📈 데이터 현황:</strong><br>
                시스템이 정상적으로 운영되고 있습니다.
            </div>
        `;
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('통계 로딩 오류:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                통계 데이터를 불러오는데 실패했습니다.
            </div>
        `;
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return '오늘';
        } else if (diffDays === 1) {
            return '어제';
        } else if (diffDays < 7) {
            return `${diffDays}일 전`;
        } else {
            return date.toLocaleDateString('ko-KR');
        }
    } catch (e) {
        return dateStr;
    }
}

function refreshSettingsTab() {
    const container = document.getElementById('tab-settings');
    container.innerHTML = '';
    initSettingsTab(container);
}
