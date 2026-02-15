// 대시보드 탭 - 최종 완성판

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
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .refresh-btn {
                background: var(--primary);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .refresh-btn:hover {
                background: #1e4070;
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
            .gantt-bar.delayed { 
                background: #dc3545; 
                animation: pulse 2s infinite;
            }
            
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
            
            .stats-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }
            
            .stat-box {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
            }
            
            .stat-label {
                font-size: 14px;
                opacity: 0.9;
            }
            
            .stat-value {
                font-size: 32px;
                font-weight: bold;
                margin: 10px 0;
            }
            
            .stat-unit {
                font-size: 14px;
                opacity: 0.9;
            }
            
            .interrupt-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-top: 20px;
            }
            
            .bar-chart {
                margin-top: 15px;
            }
            
            .bar-item {
                margin-bottom: 15px;
            }
            
            .bar-label {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                font-weight: bold;
            }
            
            .bar-track {
                height: 30px;
                background: #e9ecef;
                border-radius: 15px;
                overflow: hidden;
            }
            
            .bar-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--primary), var(--secondary));
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 13px;
                font-weight: bold;
                transition: width 0.5s ease;
            }
            
            .help-btn {
                background: #17a2b8;
                color: white;
                border: none;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .help-btn:hover {
                background: #138496;
            }
            
            @media (max-width: 768px) {
                .interrupt-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
        
        <div class="dashboard-grid">
            <div class="chart-card">
                <div class="chart-title">
                    <span>📊 프로젝트 간트 차트 & 단계별 분포</span>
                    <button class="refresh-btn" onclick="refreshDashboardTab()">🔄 새로고침</button>
                </div>
                <div id="gantt-chart-container" class="loading">데이터 로딩 중...</div>
            </div>
            
            <div class="chart-card">
                <div class="chart-title">
                    <span>⚡ 인터럽트 분석 (업무 방해 현황)</span>
                </div>
                <div id="interrupt-analysis" class="loading">데이터 로딩 중...</div>
            </div>
            
            <div class="chart-card">
                <div class="chart-title">
                    <span>🎯 팀 생산성 지표</span>
                </div>
                <div id="productivity-dashboard" class="loading">데이터 로딩 중...</div>
            </div>
        </div>
    `;
    
    loadGanttChart(container);
    loadInterruptAnalysis(container);
    loadProductivityDashboard(container);
}

// 1. 프로젝트 간트 차트
async function loadGanttChart(container) {
    const chartContainer = container.querySelector('#gantt-chart-container');
    
    try {
        const projects = await getProjects();
        
        if (!projects || projects.length === 0) {
            chartContainer.innerHTML = '<p>진행중인 프로젝트가 없습니다.</p>';
            return;
        }
        
        let html = '<div class="gantt-chart">';
        
        const stageCounts = {
            '기획': 0,
            '설계': 0,
            '개발': 0,
            '테스트': 0,
            '양산': 0
        };
        
        projects.forEach(project => {
            const startDate = new Date(project['착수일'] || Date.now());
            const endDate = new Date(project['예상완료일'] || Date.now());
            const today = new Date();
            
            const totalDays = Math.max((endDate - startDate) / (1000 * 60 * 60 * 24), 1);
            const elapsedDays = (today - startDate) / (1000 * 60 * 60 * 24);
            const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
            
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
        
        html += `
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <h4 style="margin-bottom: 15px;">📈 단계별 프로젝트 분포</h4>
                <div class="stats-row">
                    <div class="stat-box" style="background: linear-gradient(135deg, #ffc107, #ff9800);">
                        <div class="stat-label">기획</div>
                        <div class="stat-value">${stageCounts['기획']}</div>
                        <div class="stat-unit">개</div>
                    </div>
                    <div class="stat-box" style="background: linear-gradient(135deg, #17a2b8, #138496);">
                        <div class="stat-label">설계</div>
                        <div class="stat-value">${stageCounts['설계']}</div>
                        <div class="stat-unit">개</div>
                    </div>
                    <div class="stat-box" style="background: linear-gradient(135deg, #28a745, #218838);">
                        <div class="stat-label">개발</div>
                        <div class="stat-value">${stageCounts['개발']}</div>
                        <div class="stat-unit">개</div>
                    </div>
                    <div class="stat-box" style="background: linear-gradient(135deg, #fd7e14, #e8590c);">
                        <div class="stat-label">테스트</div>
                        <div class="stat-value">${stageCounts['테스트']}</div>
                        <div class="stat-unit">개</div>
                    </div>
                    <div class="stat-box" style="background: linear-gradient(135deg, #6c757d, #5a6268);">
                        <div class="stat-label">양산</div>
                        <div class="stat-value">${stageCounts['양산']}</div>
                        <div class="stat-unit">개</div>
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

// 2. 인터럽트 분석
async function loadInterruptAnalysis(container) {
    const chartContainer = container.querySelector('#interrupt-analysis');
    
    try {
        const [interrupts, members] = await Promise.all([
            getInterrupts(),
            getTeamMembers()
        ]);
        
        if (!interrupts || interrupts.length === 0) {
            chartContainer.innerHTML = '<p>인터럽트 데이터가 없습니다.</p>';
            return;
        }
        
        // 재직 중인 팀원 수 계산
        const teamSize = members ? members.filter(m => m['상태'] === '재직').length : 5;
        const threshold = teamSize * 10; // 1인당 10시간 기준
        
        const deptStats = {};
        let totalHours = 0;
        
        interrupts.forEach(item => {
            const dept = item['요청부서'] || '기타';
            const hours = parseFloat(item['예상소요시간']) || 0;
            
            deptStats[dept] = (deptStats[dept] || 0) + hours;
            totalHours += hours;
        });
        
        const topDepts = Object.entries(deptStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        const isHigh = totalHours > threshold;
        
        let html = `
            <div class="interrupt-grid">
                <div>
                    <h4 style="margin-bottom: 15px;">부서별 인터럽트 시간</h4>
                    <div class="bar-chart">
        `;
        
        topDepts.forEach(([dept, hours]) => {
            const percent = (hours / totalHours * 100).toFixed(0);
            html += `
                <div class="bar-item">
                    <div class="bar-label">
                        <span>${dept}</span>
                        <span>${hours.toFixed(1)}시간</span>
                    </div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: ${percent}%;">
                            ${percent}%
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
                
                <div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 15px;">
                        <h4 style="margin: 0;">업무 방해 지수</h4>
                        <button class="help-btn" onclick="showDisruptionHelp()">?</button>
                    </div>
                    
                    <div style="background: ${isHigh ? 'linear-gradient(135deg, #f093fb, #f5576c)' : 'linear-gradient(135deg, #4facfe, #00f2fe)'}; 
                                padding: 40px 20px; 
                                border-radius: 12px; 
                                text-align: center;
                                color: white;">
                        <div style="font-size: 18px; opacity: 0.9; margin-bottom: 15px;">현재 상태</div>
                        <div style="font-size: 64px; font-weight: bold; margin: 20px 0;">
                            ${isHigh ? '높음' : '양호'}
                        </div>
                        <div style="font-size: 16px; opacity: 0.9;">
                            ${isHigh ? '⚠️ 인터럽트가 많습니다' : '✅ 안정적입니다'}
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; display: grid; gap: 10px;">
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 13px; color: #666; margin-bottom: 5px;">총 인터럽트</div>
                            <div style="font-size: 24px; font-weight: bold; color: #dc3545;">${interrupts.length}건</div>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 13px; color: #666; margin-bottom: 5px;">총 손실 시간</div>
                            <div style="font-size: 24px; font-weight: bold; color: #ffc107;">${totalHours.toFixed(1)}시간</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        chartContainer.innerHTML = html;
        
    } catch (error) {
        console.error('인터럽트 분석 오류:', error);
        chartContainer.innerHTML = '<div class="alert alert-danger">데이터 로딩 실패</div>';
    }
}

// 도움말 함수 (동적)
async function showDisruptionHelp() {
    try {
        const members = await getTeamMembers();
        const teamSize = members ? members.filter(m => m['상태'] === '재직').length : 5;
        const threshold = teamSize * 10; // 1인당 10시간 기준
        
        alert(`📊 업무 방해 지수 계산 방식

✅ 양호 (${threshold}시간 이하)
• 월간 인터럽트 총 시간 ≤ ${threshold}시간
• 팀원 1인당 평균 10시간 이하
• 연구 업무에 집중 가능한 상태

⚠️ 높음 (${threshold}시간 초과)
• 월간 인터럽트 총 시간 > ${threshold}시간
• 팀원 1인당 평균 10시간 초과
• 정기 회의 시간 조정 권장

💡 기준
${teamSize}명 팀 기준 월 ${teamSize * 160}시간 중
${threshold}시간 = 약 30% (업무 집중도 임계점)`);
    } catch (error) {
        alert('도움말을 불러올 수 없습니다.');
    }
}

// 3. 팀 생산성 대시보드
async function loadProductivityDashboard(container) {
    const chartContainer = container.querySelector('#productivity-dashboard');
    
    try {
        const [projects, interrupts] = await Promise.all([
            getProjects(),
            getInterrupts()
        ]);
        
        const totalProjects = projects.length;
        const completedProjects = projects.filter(p => p['상태'] === '완료').length;
        const completionRate = totalProjects > 0 ? (completedProjects / totalProjects * 100).toFixed(0) : 0;
        
        const totalInterruptHours = interrupts.reduce((sum, item) => 
            sum + (parseFloat(item['예상소요시간']) || 0), 0);
        const avgInterruptTime = interrupts.length > 0 ? 
            (totalInterruptHours / interrupts.length).toFixed(1) : 0;
        
        const projectScore = completionRate * 0.6;
        const interruptPenalty = Math.min(totalInterruptHours / 10, 40);
        const productivityScore = Math.max(projectScore - interruptPenalty, 0).toFixed(0);
        
        let grade, gradeColor;
        if (productivityScore >= 80) {
            grade = 'S (우수)';
            gradeColor = '#28a745';
        } else if (productivityScore >= 60) {
            grade = 'A (양호)';
            gradeColor = '#17a2b8';
        } else if (productivityScore >= 40) {
            grade = 'B (보통)';
            gradeColor = '#ffc107';
        } else {
            grade = 'C (개선필요)';
            gradeColor = '#dc3545';
        }
        
        let html = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="background: linear-gradient(135deg, ${gradeColor}, #764ba2); 
                            color: white; 
                            padding: 30px; 
                            border-radius: 12px; 
                            text-align: center;">
                    <div style="font-size: 18px; opacity: 0.9;">팀 생산성 점수</div>
                    <div style="font-size: 64px; font-weight: bold; margin: 20px 0;">${productivityScore}</div>
                    <div style="font-size: 24px; opacity: 0.9;">${grade}</div>
                </div>
                
                <div style="display: grid; gap: 15px;">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <div style="font-size: 14px; color: #666; margin-bottom: 5px;">프로젝트 완료율</div>
                        <div style="font-size: 28px; font-weight: bold; color: var(--primary);">
                            ${completionRate}%
                        </div>
                        <div style="font-size: 13px; color: #666; margin-top: 5px;">
                            ${completedProjects}개 / ${totalProjects}개 완료
                        </div>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <div style="font-size: 14px; color: #666; margin-bottom: 5px;">평균 인터럽트 시간</div>
                        <div style="font-size: 28px; font-weight: bold; color: #ffc107;">
                            ${avgInterruptTime}h
                        </div>
                        <div style="font-size: 13px; color: #666; margin-top: 5px;">
                            건당 평균 소요 시간
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 25px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <h4 style="margin-bottom: 10px;">💡 생산성 향상 제안</h4>
                <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                    ${totalInterruptHours > 50 ? 
                        '<li>인터럽트가 많습니다. 정기적인 회의 시간을 정해 일괄 처리를 고려하세요.</li>' : ''}
                    ${completionRate < 50 ? 
                        '<li>프로젝트 완료율이 낮습니다. 리소스 재배치를 검토하세요.</li>' : ''}
                    ${productivityScore >= 80 ? 
                        '<li>✅ 현재 생산성이 우수합니다. 이 수준을 유지하세요!</li>' : ''}
                </ul>
            </div>
        `;
        
        chartContainer.innerHTML = html;
        
    } catch (error) {
        console.error('생산성 대시보드 오류:', error);
        chartContainer.innerHTML = '<div class="alert alert-danger">데이터 로딩 실패</div>';
    }
}

function refreshDashboardTab() {
    const container = document.getElementById('tab-dashboard');
    container.innerHTML = '';
    container.dataset.loaded = 'false';
    initDashboardTab(container);
}
