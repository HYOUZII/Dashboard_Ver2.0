// 대시보드 탭 관리

async function initDashboardTab(container) {
    showPermissionInfo(container, SESSION.permission);
    
    container.innerHTML += `
        <div class="card">
            <div class="card-title">환영합니다!</div>
            <p id="welcome-message" style="font-size: 20px; color: #666;">
                로딩 중...
            </p>
        </div>
    `;
    
    // 통계 카드
    loadDashboardStats(container);
    
    // 프로젝트 현황
    loadProjectOverview(container);
    
    // 인터럽트 요약
    loadInterruptSummary(container);
}

async function loadDashboardStats(container) {
    const statsContainer = document.createElement('div');
    statsContainer.id = 'dashboard-stats';
    statsContainer.className = 'stats-grid';
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-label">진행중인 프로젝트</div>
            <div class="stat-value">-</div>
            <div class="stat-unit">개</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">이번 주 인터럽트</div>
            <div class="stat-value">-</div>
            <div class="stat-unit">건</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">팀원 수</div>
            <div class="stat-value">-</div>
            <div class="stat-unit">명</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">완료된 프로젝트</div>
            <div class="stat-value">-</div>
            <div class="stat-unit">개</div>
        </div>
    `;
    
    container.appendChild(statsContainer);
    
    try {
        const stats = await getDashboardStats();
        
        if (!stats || stats.error) {
            return;
        }
        
        // 통계 업데이트
        const statCards = statsContainer.querySelectorAll('.stat-value');
        statCards[0].textContent = stats.projects.active;
        statCards[1].textContent = stats.interrupts.thisWeek;
        statCards[2].textContent = stats.members.total;
        statCards[3].textContent = stats.projects.completed;
        
        // 환영 메시지 업데이트
        document.getElementById('welcome-message').textContent = 
            `${SESSION.name}님, 환영합니다! 현재 ${stats.projects.active}개의 프로젝트가 진행 중입니다.`;
        
    } catch (error) {
        console.error('통계 로딩 오류:', error);
    }
}

async function loadProjectOverview(container) {
    const overviewCard = document.createElement('div');
    overviewCard.className = 'card';
    overviewCard.id = 'project-overview-card';
    overviewCard.innerHTML = `
        <div class="card-title">📋 프로젝트 현황</div>
        <div class="loading">프로젝트 데이터 로딩 중...</div>
    `;
    
    container.appendChild(overviewCard);
    
    try {
        const projects = await getProjects();
        
        if (!projects || projects.error) {
            overviewCard.innerHTML = `
                <div class="card-title">📋 프로젝트 현황</div>
                <div class="alert alert-danger">
                    데이터를 불러오는데 실패했습니다.
                </div>
            `;
            return;
        }
        
        if (projects.length === 0) {
            overviewCard.innerHTML = `
                <div class="card-title">📋 프로젝트 현황</div>
                <p style="text-align: center; padding: 40px; color: #666;">
                    진행중인 프로젝트가 없습니다.
                </p>
            `;
            return;
        }
        
        // 상태별 분류
        const active = projects.filter(p => p['상태'] === '진행중');
        const completed = projects.filter(p => p['상태'] === '완료');
        const delayed = projects.filter(p => p['상태'] === '지연');
        
        let html = `
            <div class="card-title">📋 프로젝트 현황</div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">진행중</div>
                    <div class="stat-value" style="color: var(--primary);">${active.length}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">완료</div>
                    <div class="stat-value" style="color: var(--success);">${completed.length}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">지연</div>
                    <div class="stat-value" style="color: var(--danger);">${delayed.length}</div>
                </div>
            </div>
            
            <h4 style="margin: 20px 0 10px 0;">진행중인 프로젝트</h4>
        `;
        
        if (active.length === 0) {
            html += `<p style="color: #666;">진행중인 프로젝트가 없습니다.</p>`;
        } else {
            active.forEach(project => {
                html += `
                    <div style="border: 2px solid #dee2e6; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                        <h3 style="margin-bottom: 10px;">
                            ${project['프로젝트명']}
                            <span class="badge badge-primary">${project['상태']}</span>
                        </h3>
                        <p style="color: #666; margin-bottom: 5px;">
                            <strong>고객사:</strong> ${project['고객사'] || '-'} | 
                            <strong>PM:</strong> ${project['PM_ID'] || '-'}
                        </p>
                        <p style="color: #666; margin-bottom: 5px;">
                            <strong>기간:</strong> ${project['착수일'] || '-'} ~ ${project['예상완료일'] || '-'}
                        </p>
                        <p style="color: #666;">
                            <strong>범위:</strong> ${project['개발범위'] || '-'}
                        </p>
                    </div>
                `;
            });
        }
        
        overviewCard.innerHTML = html;
        
    } catch (error) {
        console.error('프로젝트 현황 로딩 오류:', error);
        overviewCard.innerHTML = `
            <div class="card-title">📋 프로젝트 현황</div>
            <div class="alert alert-danger">
                데이터를 불러오는데 실패했습니다.
            </div>
        `;
    }
}

async function loadInterruptSummary(container) {
    const summaryCard = document.createElement('div');
    summaryCard.className = 'card';
    summaryCard.id = 'interrupt-summary-card';
    summaryCard.innerHTML = `
        <div class="card-title">⚡ 인터럽트 요약 (최근 7일)</div>
        <div class="loading">인터럽트 데이터 분석 중...</div>
    `;
    
    container.appendChild(summaryCard);
    
    try {
        const interrupts = await getInterrupts();
        
        if (!interrupts || interrupts.error || interrupts.length === 0) {
            summaryCard.innerHTML = `
                <div class="card-title">⚡ 인터럽트 요약</div>
                <p style="text-align: center; padding: 40px; color: #666;">
                    인터럽트 데이터가 없습니다.
                </p>
            `;
            return;
        }
        
        // 최근 7일 필터링
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentInterrupts = interrupts.filter(item => {
            if (!item['날짜']) return false;
            const itemDate = new Date(item['날짜']);
            return itemDate >= sevenDaysAgo;
        });
        
        // 총 시간
        const totalHours = recentInterrupts.reduce((sum, item) => {
            return sum + (parseFloat(item['예상소요시간']) || 0);
        }, 0);
        
        // 부서별 집계
        const deptCounts = {};
        recentInterrupts.forEach(item => {
            const dept = item['요청부서'] || '기타';
            deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });
        
        const topDept = Object.entries(deptCounts)
            .sort((a, b) => b[1] - a[1])[0];
        
        let html = `
            <div class="card-title">⚡ 인터럽트 요약 (최근 7일)</div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">총 건수</div>
                    <div class="stat-value" style="color: var(--danger);">${recentInterrupts.length}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">총 시간</div>
                    <div class="stat-value" style="color: var(--warning);">${totalHours.toFixed(1)}</div>
                    <div class="stat-unit">시간</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">최다 요청 부서</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--primary); margin: 12px 0;">
                        ${topDept ? topDept[0] : '-'}
                    </div>
                    <div class="stat-unit">${topDept ? topDept[1] + '건' : ''}</div>
                </div>
            </div>
        `;
        
        if (recentInterrupts.length > 0) {
            html += `
                <h4 style="margin: 20px 0 10px 0;">부서별 분포</h4>
                <table>
                    <tr>
                        <th>부서</th>
                        <th>건수</th>
                        <th>비율</th>
                    </tr>
            `;
            
            Object.entries(deptCounts)
                .sort((a, b) => b[1] - a[1])
                .forEach(([dept, count]) => {
                    const percentage = ((count / recentInterrupts.length) * 100).toFixed(1);
                    html += `
                        <tr>
                            <td><strong>${dept}</strong></td>
                            <td>${count}건</td>
                            <td>${percentage}%</td>
                        </tr>
                    `;
                });
            
            html += `
                </table>
            `;
        }
        
        summaryCard.innerHTML = html;
        
    } catch (error) {
        console.error('인터럽트 요약 로딩 오류:', error);
        summaryCard.innerHTML = `
            <div class="card-title">⚡ 인터럽트 요약</div>
            <div class="alert alert-danger">
                데이터를 불러오는데 실패했습니다.
            </div>
        `;
    }
}

function refreshDashboardTab() {
    const container = document.getElementById('tab-dashboard');
    
    // 통계 새로고침
    const statsContainer = document.getElementById('dashboard-stats');
    if (statsContainer) {
        statsContainer.remove();
        loadDashboardStats(container);
    }
    
    // 프로젝트 현황 새로고침
    const overviewCard = document.getElementById('project-overview-card');
    if (overviewCard) {
        overviewCard.remove();
        loadProjectOverview(container);
    }
    
    // 인터럽트 요약 새로고침
    const summaryCard = document.getElementById('interrupt-summary-card');
    if (summaryCard) {
        summaryCard.remove();
        loadInterruptSummary(container);
    }
}
