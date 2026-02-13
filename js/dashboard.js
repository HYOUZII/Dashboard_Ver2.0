// 대시보드 탭 관리 - 경영진용 완전판

async function initDashboardTab(container) {
    container.innerHTML = `
        <style>
            .dashboard-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 25px;
            }
            
            .chart-card {
                background: white;
                border-radius: 12px;
                padding: 25px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .chart-title {
                font-size: 22px;
                font-weight: bold;
                color: var(--primary);
                margin-bottom: 20px;
                border-bottom: 2px solid #dee2e6;
                padding-bottom: 12px;
            }
            
            .gantt-chart {
                overflow-x: auto;
            }
            
            .gantt-row {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
                min-height: 50px;
            }
            
            .gantt-label {
                width: 200px;
                font-weight: bold;
                padding-right: 15px;
            }
            
            .gantt-timeline {
                flex: 1;
                height: 40px;
                background: #f8f9fa;
                border-radius: 8px;
                position: relative;
                display: flex;
                align-items: center;
            }
            
            .gantt-bar {
                height: 30px;
                border-radius: 6px;
                position: absolute;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 13px;
                font-weight: bold;
                transition: all 0.3s;
            }
            
            .gantt-bar:hover {
                transform: scale(1.02);
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            
            .gantt-bar.planning { background: #ffc107; }
            .gantt-bar.design { background: #17a2b8; }
            .gantt-bar.development { background: #28a745; }
            .gantt-bar.testing { background: #fd7e14; }
            .gantt-bar.production { background: #6c757d; }
            .gantt-bar.delayed { background: #dc3545; animation: pulse 2s infinite; }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            .risk-indicator {
                position: absolute;
                top: -5px;
                right: -5px;
                width: 20px;
                height: 20px;
                background: #dc3545;
                border-radius: 50%;
                color: white;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                animation: pulse 2s infinite;
            }
            
            .pie-chart-container {
                display: flex;
                align-items: center;
                gap: 40px;
            }
            
            .pie-chart {
                width: 300px;
                height: 300px;
                position: relative;
            }
            
            .pie-legend {
                flex: 1;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
                padding: 10px;
                border-radius: 6px;
                transition: all 0.3s;
            }
            
            .legend-item:hover {
                background: #f8f9fa;
                transform: translateX(5px);
            }
            
            .legend-color {
                width: 30px;
                height: 30px;
                border-radius: 6px;
                margin-right: 15px;
            }
            
            .legend-text {
                flex: 1;
            }
            
            .legend-value {
                font-size: 24px;
                font-weight: bold;
                color: var(--primary);
            }
            
            .kpi-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
            }
            
            .kpi-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 12px;
                position: relative;
                overflow: hidden;
            }
            
            .kpi-name {
                font-size: 16px;
                margin-bottom: 10px;
                opacity: 0.9;
            }
            
            .kpi-progress-bar {
                width: 100%;
                height: 30px;
                background: rgba(255,255,255,0.2);
                border-radius: 15px;
                overflow: hidden;
                margin: 10px 0;
            }
            
            .kpi-progress-fill {
                height: 100%;
                background: white;
                border-radius: 15px;
                transition: width 1s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
                color: var(--primary);
            }
            
            .kpi-target {
                font-size: 13px;
                opacity: 0.8;
            }
            
            .budget-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }
            
            .budget-table th {
                background: var(--primary);
                color: white;
                padding: 12px;
                text-align: left;
                font-size: 15px;
            }
            
            .budget-table td {
                padding: 12px;
                border-bottom: 1px solid #dee2e6;
            }
            
            .budget-bar {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .budget-bar-fill {
                flex: 1;
                height: 20px;
                background: #e9ecef;
                border-radius: 10px;
                overflow: hidden;
            }
            
            .budget-bar-progress {
                height: 100%;
                background: linear-gradient(90deg, #28a745, #20c997);
                transition: width 0.5s ease;
            }
            
            .budget-bar-progress.warning {
                background: linear-gradient(90deg, #ffc107, #fd7e14);
            }
            
            .budget-bar-progress.danger {
                background: linear-gradient(90deg, #dc3545, #c82333);
            }
            
            .budget-percentage {
                min-width: 50px;
                text-align: right;
                font-weight: bold;
            }
        </style>
        
        <div class="dashboard-grid">
            <!-- 1. 프로젝트 간트 차트 -->
            <div class="chart-card">
                <div class="chart-title">📊 프로젝트 간트 차트 & 단계별 분포</div>
                <div id="gantt-chart-container" class="loading">데이터 로딩 중...</div>
            </div>
            
            <!-- 2. 연구 몰입도 차트 -->
            <div class="chart-card">
                <div class="chart-title">⚡ 연구 몰입도 분석</div>
                <div id="research-focus-chart" class="loading">데이터 로딩 중...</div>
            </div>
            
            <!-- 3. 개인별 KPI 달성률 -->
            <div class="chart-card">
                <div class="chart-title">🎯 개인별 KPI 달성률</div>
                <div id="kpi-dashboard" class="loading">데이터 로딩 중...</div>
            </div>
            
            <!-- 4. 예산 및 비용 관리 -->
            <div class="chart-card">
                <div class="chart-title">💰 예산 및 비용 관리</div>
                <div id="budget-management" class="loading">데이터 로딩 중...</div>
            </div>
        </div>
    `;
    
    // 데이터 로드
    loadGanttChart(container);
    loadResearchFocusChart(container);
    loadKPIDashboard(container);
    loadBudgetManagement(container);
}

// 1. 간트 차트 로드
async function loadGanttChart(container) {
    const chartContainer = container.querySelector('#gantt-chart-container');
    
    try {
        const projects = await getProjects();
        
        if (!projects || projects.length === 0) {
            chartContainer.innerHTML = '<p>진행중인 프로젝트가 없습니다.</p>';
            return;
        }
        
        // 간트 차트 생성
        let html = '<div class="gantt-chart">';
        
        // 단계별 카운트
        const stageCounts = {
            '기획': 0,
            '설계': 0,
            '개발': 0,
            '테스트': 0,
            '양산': 0
        };
        
        projects.forEach((project, index) => {
            const startDate = new Date(project['착수일'] || Date.now());
            const endDate = new Date(project['예상완료일'] || Date.now());
            const today = new Date();
            
            // 진행률 계산
            const totalDays = Math.max((endDate - startDate) / (1000 * 60 * 60 * 24), 1);
            const elapsedDays = (today - startDate) / (1000 * 60 * 60 * 24);
            const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
            
            // 단계 결정 (진행률 기반)
            let stage, stageClass;
            if (progress < 20) {
                stage = '기획';
                stageClass = 'planning';
                stageCounts['기획']++;
            } else if (progress < 40) {
                stage = '설계';
                stageClass = 'design';
                stageCounts['설계']++;
            } else if (progress < 70) {
                stage = '개발';
                stageClass = 'development';
                stageCounts['개발']++;
            } else if (progress < 90) {
                stage = '테스트';
                stageClass = 'testing';
                stageCounts['테스트']++;
            } else {
                stage = '양산';
                stageClass = 'production';
                stageCounts['양산']++;
            }
            
            // 지연 여부
            const isDelayed = today > endDate && project['상태'] !== '완료';
            if (isDelayed) {
                stageClass = 'delayed';
            }
            
            html += `
                <div class="gantt-row">
                    <div class="gantt-label">${project['프로젝트명']}</div>
                    <div class="gantt-timeline">
                        <div class="gantt-bar ${stageClass}" style="left: 0%; width: ${progress}%;">
                            ${stage} (${Math.round(progress)}%)
                            ${isDelayed ? '<div class="risk-indicator">!</div>' : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // 단계별 분포 통계
        html += `
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <h4 style="margin-bottom: 15px;">📈 단계별 프로젝트 분포</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: bold; color: #ffc107;">${stageCounts['기획']}</div>
                        <div>기획</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: bold; color: #17a2b8;">${stageCounts['설계']}</div>
                        <div>설계</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: bold; color: #28a745;">${stageCounts['개발']}</div>
                        <div>개발</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: bold; color: #fd7e14;">${stageCounts['테스트']}</div>
                        <div>테스트</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: bold; color: #6c757d;">${stageCounts['양산']}</div>
                        <div>양산</div>
                    </div>
                </div>
            </div>
        `;
        
        chartContainer.innerHTML = html;
        
    } catch (error) {
        console.error('간트 차트 로딩 오류:', error);
        chartContainer.innerHTML = '<div class="alert alert-danger">데이터 로딩 실패</div>';
    }
}

// 2. 연구 몰입도 차트 로드
async function loadResearchFocusChart(container) {
    const chartContainer = container.querySelector('#research-focus-chart');
    
    try {
        const interrupts = await getInterrupts();
        
        // 업무 유형별 시간 집계 (예시 데이터)
        const totalHours = 160; // 월 160시간
        const newDev = 80; // 신규개발
        const maintenance = 50; // 유지보수
        const admin = 30; // 행정업무
        
        // 인터럽트로 인한 유지보수 시간 계산
        const interruptHours = interrupts ? interrupts.reduce((sum, item) => 
            sum + (parseFloat(item['예상소요시간']) || 0), 0) : 0;
        
        const actualMaintenance = maintenance + (interruptHours * 0.7);
        const actualNewDev = newDev - (interruptHours * 0.5);
        const actualAdmin = admin + (interruptHours * 0.3);
        
        const total = actualNewDev + actualMaintenance + actualAdmin;
        const newDevPercent = (actualNewDev / total * 100).toFixed(1);
        const maintenancePercent = (actualMaintenance / total * 100).toFixed(1);
        const adminPercent = (actualAdmin / total * 100).toFixed(1);
        
        chartContainer.innerHTML = `
            <div class="pie-chart-container">
                <div class="pie-chart">
                    <svg viewBox="0 0 200 200" style="transform: rotate(-90deg);">
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#28a745" stroke-width="40"
                                stroke-dasharray="${newDevPercent * 5.02} 502" stroke-dashoffset="0" />
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#ffc107" stroke-width="40"
                                stroke-dasharray="${maintenancePercent * 5.02} 502" 
                                stroke-dashoffset="${-newDevPercent * 5.02}" />
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#dc3545" stroke-width="40"
                                stroke-dasharray="${adminPercent * 5.02} 502" 
                                stroke-dashoffset="${-(newDevPercent * 5.02 + maintenancePercent * 5.02)}" />
                    </svg>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                        <div style="font-size: 32px; font-weight: bold; color: var(--primary);">
                            ${newDevPercent}%
                        </div>
                        <div style="font-size: 14px; color: #666;">신규개발</div>
                    </div>
                </div>
                
                <div class="pie-legend">
                    <div class="legend-item">
                        <div class="legend-color" style="background: #28a745;"></div>
                        <div class="legend-text">
                            <div style="font-weight: bold;">신규개발</div>
                            <div style="color: #666;">R&D 핵심 업무</div>
                        </div>
                        <div class="legend-value" style="color: #28a745;">${newDevPercent}%</div>
                    </div>
                    
                    <div class="legend-item">
                        <div class="legend-color" style="background: #ffc107;"></div>
                        <div class="legend-text">
                            <div style="font-weight: bold;">유지보수</div>
                            <div style="color: #666;">기존 제품 개선</div>
                        </div>
                        <div class="legend-value" style="color: #ffc107;">${maintenancePercent}%</div>
                    </div>
                    
                    <div class="legend-item">
                        <div class="legend-color" style="background: #dc3545;"></div>
                        <div class="legend-text">
                            <div style="font-weight: bold;">행정업무</div>
                            <div style="color: #666;">문서, 회의 등</div>
                        </div>
                        <div class="legend-value" style="color: #dc3545;">${adminPercent}%</div>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: ${newDevPercent > 50 ? '#d4edda' : '#fff3cd'}; border-radius: 8px;">
                        <strong>몰입도 평가:</strong> 
                        ${newDevPercent > 50 ? '✅ 우수 (50% 이상)' : '⚠️ 개선 필요 (50% 미만)'}
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('연구 몰입도 차트 오류:', error);
        chartContainer.innerHTML = '<div class="alert alert-danger">데이터 로딩 실패</div>';
    }
}

// 3. KPI 대시보드 로드
async function loadKPIDashboard(container) {
    const chartContainer = container.querySelector('#kpi-dashboard');
    
    // 예시 KPI 데이터 (실제로는 API에서 가져와야 함)
    const kpiData = [
        { name: '김하드', target: 100, actual: 85, role: 'HW' },
        { name: '이펌웨', target: 100, actual: 92, role: 'FW' },
        { name: '박펌웨', target: 100, actual: 78, role: 'FW' },
        { name: '최기구', target: 100, actual: 88, role: '기구' },
        { name: '정큐에', target: 100, actual: 95, role: 'QA' },
        { name: '신소프', target: 100, actual: 82, role: 'SW' }
    ];
    
    let html = '<div class="kpi-grid">';
    
    kpiData.forEach(kpi => {
        const percent = (kpi.actual / kpi.target * 100).toFixed(0);
        const gradientColors = percent >= 90 ? ['#28a745', '#20c997'] :
                               percent >= 70 ? ['#ffc107', '#fd7e14'] :
                               ['#dc3545', '#c82333'];
        
        html += `
            <div class="kpi-card" style="background: linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]});">
                <div class="kpi-name">${kpi.name} (${kpi.role})</div>
                <div class="kpi-progress-bar">
                    <div class="kpi-progress-fill" style="width: ${percent}%;">
                        ${percent}%
                    </div>
                </div>
                <div class="kpi-target">목표: ${kpi.target}점 / 달성: ${kpi.actual}점</div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // 전체 평균
    const avgPercent = (kpiData.reduce((sum, kpi) => sum + (kpi.actual / kpi.target * 100), 0) / kpiData.length).toFixed(1);
    
    html += `
        <div style="margin-top: 25px; padding: 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 12px; text-align: center;">
            <div style="font-size: 18px; margin-bottom: 10px;">팀 전체 평균 달성률</div>
            <div style="font-size: 48px; font-weight: bold;">${avgPercent}%</div>
            <div style="font-size: 14px; opacity: 0.9; margin-top: 10px;">
                ${avgPercent >= 90 ? '🏆 목표 초과 달성!' : avgPercent >= 80 ? '✅ 우수' : '⚠️ 목표 미달'}
            </div>
        </div>
    `;
    
    chartContainer.innerHTML = html;
}

// 4. 예산 관리 로드
async function loadBudgetManagement(container) {
    const chartContainer = container.querySelector('#budget-management');
    
    // 예시 예산 데이터
    const budgetData = {
        operating: { budget: 50000000, used: 35000000, name: '운영비' },
        projects: [
            { name: 'A사 충전기', budget: 30000000, used: 25000000 },
            { name: 'B사 커스터마이징', budget: 20000000, used: 8000000 },
            { name: 'C사 신규 개발', budget: 40000000, used: 35000000 }
        ]
    };
    
    let html = '<table class="budget-table">';
    html += '<thead><tr><th>항목</th><th>예산</th><th>집행</th><th>집행률</th><th>상태</th></tr></thead><tbody>';
    
    // 운영비
    const opPercent = (budgetData.operating.used / budgetData.operating.budget * 100).toFixed(1);
    const opClass = opPercent > 90 ? 'danger' : opPercent > 70 ? 'warning' : '';
    
    html += `
        <tr>
            <td><strong>${budgetData.operating.name}</strong></td>
            <td>${(budgetData.operating.budget / 1000000).toFixed(0)}M원</td>
            <td>${(budgetData.operating.used / 1000000).toFixed(1)}M원</td>
            <td>
                <div class="budget-bar">
                    <div class="budget-bar-fill">
                        <div class="budget-bar-progress ${opClass}" style="width: ${opPercent}%;"></div>
                    </div>
                    <div class="budget-percentage">${opPercent}%</div>
                </div>
            </td>
            <td>${opPercent > 90 ? '🔴 주의' : opPercent > 70 ? '🟡 양호' : '🟢 안정'}</td>
        </tr>
    `;
    
    // 프로젝트별
    budgetData.projects.forEach(proj => {
        const percent = (proj.used / proj.budget * 100).toFixed(1);
        const className = percent > 90 ? 'danger' : percent > 70 ? 'warning' : '';
        
        html += `
            <tr>
                <td>${proj.name}</td>
                <td>${(proj.budget / 1000000).toFixed(0)}M원</td>
                <td>${(proj.used / 1000000).toFixed(1)}M원</td>
                <td>
                    <div class="budget-bar">
                        <div class="budget-bar-fill">
                            <div class="budget-bar-progress ${className}" style="width: ${percent}%;"></div>
                        </div>
                        <div class="budget-percentage">${percent}%</div>
                    </div>
                </td>
                <td>${percent > 90 ? '🔴 주의' : percent > 70 ? '🟡 양호' : '🟢 안정'}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    
    // 총계
    const totalBudget = budgetData.operating.budget + budgetData.projects.reduce((sum, p) => sum + p.budget, 0);
    const totalUsed = budgetData.operating.used + budgetData.projects.reduce((sum, p) => sum + p.used, 0);
    const totalPercent = (totalUsed / totalBudget * 100).toFixed(1);
    
    html += `
        <div style="margin-top: 25px; padding: 20px; background: #f8f9fa; border-radius: 8px; display: flex; justify-content: space-around; text-align: center;">
            <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 5px;">전체 예산</div>
                <div style="font-size: 28px; font-weight: bold; color: var(--primary);">
                    ${(totalBudget / 1000000).toFixed(0)}M원
                </div>
            </div>
            <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 5px;">집행 금액</div>
                <div style="font-size: 28px; font-weight: bold; color: #28a745;">
                    ${(totalUsed / 1000000).toFixed(1)}M원
                </div>
            </div>
            <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 5px;">집행률</div>
                <div style="font-size: 28px; font-weight: bold; color: ${totalPercent > 90 ? '#dc3545' : '#ffc107'};">
                    ${totalPercent}%
                </div>
            </div>
            <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 5px;">잔액</div>
                <div style="font-size: 28px; font-weight: bold; color: #17a2b8;">
                    ${((totalBudget - totalUsed) / 1000000).toFixed(1)}M원
                </div>
            </div>
        </div>
    `;
    
    chartContainer.innerHTML = html;
}

function refreshDashboardTab() {
    const container = document.getElementById('tab-dashboard');
    container.innerHTML = '';
    container.dataset.loaded = 'false';
    initDashboardTab(container);
}
