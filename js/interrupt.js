// 인터럽트 탭 관리 - 완전판

let teamMembers = [
    { id: 'M001', name: '김하드', role: 'HW' },
    { id: 'M002', name: '이펌웨', role: 'FW' },
    { id: 'M003', name: '박펌웨', role: 'FW' },
    { id: 'M004', name: '최기구', role: '기구' },
    { id: 'M005', name: '정큐에', role: 'QA' },
    { id: 'M006', name: '신소프', role: 'SW' }
];

async function initInterruptTab(container) {
    const canAdd = SESSION.permission !== 'GUEST';
    
    container.innerHTML = `
        <style>
            .interrupt-tabs {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                border-bottom: 2px solid #dee2e6;
            }
            
            .interrupt-tab {
                padding: 12px 24px;
                background: none;
                border: none;
                border-bottom: 3px solid transparent;
                cursor: pointer;
                font-size: 18px;
                font-weight: bold;
                color: #666;
                transition: all 0.3s;
            }
            
            .interrupt-tab:hover {
                color: var(--primary);
            }
            
            .interrupt-tab.active {
                color: var(--primary);
                border-bottom-color: var(--primary);
            }
            
            .tab-panel {
                display: none;
            }
            
            .tab-panel.active {
                display: block;
            }
            
            .stats-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 25px;
            }
            
            .stat-card-large {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 25px;
                border-radius: 12px;
                text-align: center;
            }
            
            .stat-card-large.warning {
                background: linear-gradient(135deg, #f093fb, #f5576c);
            }
            
            .stat-card-large.success {
                background: linear-gradient(135deg, #4facfe, #00f2fe);
            }
            
            .interrupt-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }
            
            .interrupt-table th {
                background: var(--primary);
                color: white;
                padding: 12px;
                text-align: left;
                font-size: 14px;
                position: sticky;
                top: 0;
            }
            
            .interrupt-table td {
                padding: 12px;
                border-bottom: 1px solid #dee2e6;
                font-size: 14px;
            }
            
            .interrupt-table tr:hover {
                background: #f8f9fa;
            }
            
            .status-select {
                padding: 6px 12px;
                border-radius: 6px;
                border: 1px solid #dee2e6;
                font-size: 13px;
            }
            
            .date-range {
                display: flex;
                gap: 10px;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .date-input {
                padding: 10px;
                border: 2px solid #dee2e6;
                border-radius: 6px;
                font-size: 14px;
            }
        </style>
        
        <div class="card">
            <div class="card-title">⚡ 인터럽트 관리</div>
            
            <div class="interrupt-tabs">
                <button class="interrupt-tab active" onclick="switchInterruptTab('register')">
                    📝 등록
                </button>
                <button class="interrupt-tab" onclick="switchInterruptTab('list')">
                    📋 목록
                </button>
                <button class="interrupt-tab" onclick="switchInterruptTab('stats')">
                    📊 통계
                </button>
            </div>
            
            <!-- 등록 탭 -->
            <div id="interrupt-tab-register" class="tab-panel active">
                ${canAdd ? `
                <div id="interrupt-alert"></div>
                
                <form id="interrupt-form" onsubmit="handleInterruptSubmit(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">담당자 *</label>
                            <select class="form-select" id="interrupt-member" required>
                                <option value="">선택하세요</option>
                                ${generateMemberOptions()}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">요청 부서 *</label>
                            <input type="text" class="form-input" id="interrupt-dept" required 
                                   placeholder="예: 생산팀" list="dept-list">
                            <datalist id="dept-list">
                                <option value="생산팀">
                                <option value="품질팀">
                                <option value="영업팀">
                                <option value="구매팀">
                                <option value="경영지원팀">
                            </datalist>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">요청자</label>
                            <input type="text" class="form-input" id="interrupt-requester" 
                                   placeholder="예: 박생산">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">예상 소요시간 (시간) *</label>
                            <input type="number" class="form-input" id="interrupt-hours" 
                                   min="0.5" step="0.5" required placeholder="예: 2.5">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">중요도 *</label>
                            <select class="form-select" id="interrupt-importance" required>
                                <option value="높음">높음</option>
                                <option value="보통" selected>보통</option>
                                <option value="낮음">낮음</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">긴급도 *</label>
                            <select class="form-select" id="interrupt-urgency" required>
                                <option value="높음">높음</option>
                                <option value="보통" selected>보통</option>
                                <option value="낮음">낮음</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">업무 상세 내용 *</label>
                        <textarea class="form-textarea" id="interrupt-content" required 
                                  placeholder="예: 생산팀 긴급 회로 수정 요청 - PCB 레이아웃 변경"></textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-primary" id="interrupt-submit-btn" style="width: 100%;">
                        📝 인터럽트 등록
                    </button>
                </form>
                ` : `
                <div class="alert alert-danger">
                    게스트 권한으로는 인터럽트를 등록할 수 없습니다.
                </div>
                `}
            </div>
            
            <!-- 목록 탭 -->
            <div id="interrupt-tab-list" class="tab-panel">
                <div class="date-range">
                    <span>기간:</span>
                    <input type="date" class="date-input" id="start-date">
                    <span>~</span>
                    <input type="date" class="date-input" id="end-date">
                    <button class="btn btn-primary" onclick="loadInterruptList()" style="padding: 10px 20px;">
                        🔍 조회
                    </button>
                </div>
                
                <div id="interrupt-list-container" class="loading">
                    인터럽트 목록 로딩 중...
                </div>
            </div>
            
            <!-- 통계 탭 -->
            <div id="interrupt-tab-stats" class="tab-panel">
                <div id="interrupt-stats-container" class="loading">
                    통계 데이터 계산 중...
                </div>
            </div>
        </div>
    `;
    
    // 기본 날짜 설정 (최근 30일)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const endDateInput = document.getElementById('end-date');
    const startDateInput = document.getElementById('start-date');
    
    if (endDateInput) endDateInput.valueAsDate = today;
    if (startDateInput) startDateInput.valueAsDate = thirtyDaysAgo;
    
    // 폼 이벤트
    const form = document.getElementById('interrupt-form');
    if (form) {
        form.addEventListener('submit', handleInterruptSubmit);
    }
}

function generateMemberOptions() {
    return teamMembers.map(m => 
        `<option value="${m.id}">${m.name} (${m.role})</option>`
    ).join('');
}

function switchInterruptTab(tabName) {
    // 탭 버튼 전환
    document.querySelectorAll('.interrupt-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 패널 전환
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`interrupt-tab-${tabName}`).classList.add('active');
    
    // 데이터 로드
    if (tabName === 'list') {
        loadInterruptList();
    } else if (tabName === 'stats') {
        loadInterruptStats();
    }
}

async function handleInterruptSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('interrupt-submit-btn');
    const alertDiv = document.getElementById('interrupt-alert');
    
    submitBtn.disabled = true;
    submitBtn.textContent = '등록 중...';
    
    try {
        const interruptData = {
            memberId: document.getElementById('interrupt-member').value,
            requestDept: document.getElementById('interrupt-dept').value,
            requester: document.getElementById('interrupt-requester').value,
            estimatedHours: document.getElementById('interrupt-hours').value,
            importance: document.getElementById('interrupt-importance').value,
            urgency: document.getElementById('interrupt-urgency').value,
            content: document.getElementById('interrupt-content').value
        };
        
        const result = await addInterrupt(interruptData);
        
        if (result && result.success) {
            alertDiv.innerHTML = `
                <div class="alert alert-success">
                    ✅ ${result.message}
                </div>
            `;
            document.getElementById('interrupt-form').reset();
            
            setTimeout(() => {
                alertDiv.innerHTML = '';
            }, 5000);
        } else {
            alertDiv.innerHTML = `
                <div class="alert alert-danger">
                    ❌ ${result?.error || '인터럽트 등록에 실패했습니다.'}
                </div>
            `;
        }
    } catch (error) {
        console.error('인터럽트 제출 오류:', error);
        alertDiv.innerHTML = `
            <div class="alert alert-danger">
                ❌ 서버 연결에 실패했습니다.
            </div>
        `;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '📝 인터럽트 등록';
    }
}

async function loadInterruptList() {
    const container = document.getElementById('interrupt-list-container');
    container.innerHTML = '<div class="loading">데이터 로딩 중...</div>';
    
    try {
        const interrupts = await getInterrupts();
        
        if (!interrupts || interrupts.length === 0) {
            container.innerHTML = '<p>등록된 인터럽트가 없습니다.</p>';
            return;
        }
        
        // 날짜 필터링
        const startDate = new Date(document.getElementById('start-date').value);
        const endDate = new Date(document.getElementById('end-date').value);
        
        const filtered = interrupts.filter(item => {
            if (!item['날짜']) return true;
            const itemDate = new Date(item['날짜']);
            return itemDate >= startDate && itemDate <= endDate;
        });
        
        let html = `
            <div style="margin-bottom: 15px;">
                <strong>총 ${filtered.length}건</strong> (전체 ${interrupts.length}건 중)
            </div>
            
            <div style="overflow-x: auto;">
                <table class="interrupt-table">
                    <thead>
                        <tr>
                            <th>날짜</th>
                            <th>시간</th>
                            <th>담당자</th>
                            <th>요청부서</th>
                            <th>요청자</th>
                            <th>업무내용</th>
                            <th>중요도</th>
                            <th>긴급도</th>
                            <th>예상시간</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        filtered.forEach(item => {
            html += `
                <tr>
                    <td>${item['날짜'] || '-'}</td>
                    <td>${item['시간'] || '-'}</td>
                    <td>${item['담당자ID'] || '-'}</td>
                    <td>${item['요청부서'] || '-'}</td>
                    <td>${item['요청자'] || '-'}</td>
                    <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${item['업무내용'] || '-'}
                    </td>
                    <td><span class="badge ${getPriorityClass(item['중요도'])}">${item['중요도'] || '-'}</span></td>
                    <td><span class="badge ${getPriorityClass(item['긴급도'])}">${item['긴급도'] || '-'}</span></td>
                    <td>${item['예상소요시간'] || 0}h</td>
                    <td>
                        <select class="status-select" onchange="updateInterruptStatus(this, '${item['인터럽트ID']}')">
                            <option value="진행중" ${item['상태'] === '진행중' ? 'selected' : ''}>진행중</option>
                            <option value="완료" ${item['상태'] === '완료' ? 'selected' : ''}>완료</option>
                            <option value="보류" ${item['상태'] === '보류' ? 'selected' : ''}>보류</option>
                        </select>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('목록 로딩 오류:', error);
        container.innerHTML = '<div class="alert alert-danger">데이터 로딩 실패</div>';
    }
}

async function loadInterruptStats() {
    const container = document.getElementById('interrupt-stats-container');
    container.innerHTML = '<div class="loading">통계 계산 중...</div>';
    
    try {
        const interrupts = await getInterrupts();
        
        if (!interrupts || interrupts.length === 0) {
            container.innerHTML = '<p>통계 데이터가 없습니다.</p>';
            return;
        }
        
        // 통계 계산
        const totalHours = interrupts.reduce((sum, item) => 
            sum + (parseFloat(item['예상소요시간']) || 0), 0);
        const avgHours = (totalHours / interrupts.length).toFixed(1);
        
        // 부서별 집계
        const deptStats = {};
        interrupts.forEach(item => {
            const dept = item['요청부서'] || '기타';
            if (!deptStats[dept]) {
                deptStats[dept] = { count: 0, hours: 0 };
            }
            deptStats[dept].count++;
            deptStats[dept].hours += parseFloat(item['예상소요시간']) || 0;
        });
        
        // 담당자별 집계
        const memberStats = {};
        interrupts.forEach(item => {
            const member = item['담당자ID'] || '미정';
            if (!memberStats[member]) {
                memberStats[member] = { count: 0, hours: 0 };
            }
            memberStats[member].count++;
            memberStats[member].hours += parseFloat(item['예상소요시간']) || 0;
        });
        
        let html = `
            <div class="stats-cards">
                <div class="stat-card-large">
                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">총 인터럽트</div>
                    <div style="font-size: 48px; font-weight: bold;">${interrupts.length}</div>
                    <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">건</div>
                </div>
                
                <div class="stat-card-large warning">
                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">총 손실 시간</div>
                    <div style="font-size: 48px; font-weight: bold;">${totalHours.toFixed(1)}</div>
                    <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">시간</div>
                </div>
                
                <div class="stat-card-large success">
                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">평균 소요 시간</div>
                    <div style="font-size: 48px; font-weight: bold;">${avgHours}</div>
                    <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">시간/건</div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-top: 25px;">
                <div class="card" style="box-shadow: none; border: 2px solid #dee2e6;">
                    <h4 style="margin-bottom: 15px;">부서별 인터럽트</h4>
                    <table style="width: 100%;">
                        <tr style="background: #f8f9fa; font-weight: bold;">
                            <td style="padding: 10px;">부서</td>
                            <td style="padding: 10px; text-align: right;">건수</td>
                            <td style="padding: 10px; text-align: right;">시간</td>
                        </tr>
        `;
        
        Object.entries(deptStats)
            .sort((a, b) => b[1].count - a[1].count)
            .forEach(([dept, stat]) => {
                html += `
                    <tr>
                        <td style="padding: 10px;"><strong>${dept}</strong></td>
                        <td style="padding: 10px; text-align: right;">${stat.count}건</td>
                        <td style="padding: 10px; text-align: right;">${stat.hours.toFixed(1)}h</td>
                    </tr>
                `;
            });
        
        html += `
                    </table>
                </div>
                
                <div class="card" style="box-shadow: none; border: 2px solid #dee2e6;">
                    <h4 style="margin-bottom: 15px;">담당자별 인터럽트</h4>
                    <table style="width: 100%;">
                        <tr style="background: #f8f9fa; font-weight: bold;">
                            <td style="padding: 10px;">담당자</td>
                            <td style="padding: 10px; text-align: right;">건수</td>
                            <td style="padding: 10px; text-align: right;">시간</td>
                        </tr>
        `;
        
        Object.entries(memberStats)
            .sort((a, b) => b[1].count - a[1].count)
            .forEach(([member, stat]) => {
                html += `
                    <tr>
                        <td style="padding: 10px;"><strong>${member}</strong></td>
                        <td style="padding: 10px; text-align: right;">${stat.count}건</td>
                        <td style="padding: 10px; text-align: right;">${stat.hours.toFixed(1)}h</td>
                    </tr>
                `;
            });
        
        html += `
                    </table>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('통계 로딩 오류:', error);
        container.innerHTML = '<div class="alert alert-danger">통계 계산 실패</div>';
    }
}

function getPriorityClass(priority) {
    const map = {
        '높음': 'badge-danger',
        '보통': 'badge-warning',
        '낮음': 'badge-info'
    };
    return map[priority] || 'badge-warning';
}

async function updateInterruptStatus(selectElement, interruptId) {
    const newStatus = selectElement.value;
    
    try {
        const result = await callAPI('updateInterruptStatus', {
            interruptId: interruptId,
            status: newStatus
        });
        
        if (result && result.success) {
            console.log('상태 업데이트 성공');
        } else {
            alert('상태 업데이트에 실패했습니다.');
            loadInterruptList(); // 재로드
        }
    } catch (error) {
        console.error('상태 업데이트 오류:', error);
        alert('서버 연결 실패');
    }
}

function refreshInterruptTab() {
    const container = document.getElementById('tab-interrupt');
    container.innerHTML = '';
    container.dataset.loaded = 'false';
    initInterruptTab(container);
}
