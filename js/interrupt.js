// 인터럽트 탭 - 중복 등록 방지 + 날짜 형식 통일

const teamMembers = [
    { id: 'M001', name: '김하드', role: 'HW' },
    { id: 'M002', name: '이펌웨', role: 'FW' },
    { id: 'M003', name: '박펌웨', role: 'FW' },
    { id: 'M004', name: '최기구', role: '기구' },
    { id: 'M005', name: '정큐에', role: 'QA' },
    { id: 'M006', name: '신소프', role: 'SW' }
];

function getMemberName(memberId) {
    const member = teamMembers.find(m => m.id === memberId);
    return member ? `${member.name} (${member.role})` : memberId;
}

// 날짜 포맷 함수
function formatDateTime(dateStr, timeStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const year = date.getFullYear().toString().slice(2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    if (timeStr) {
        return `${year}-${month}-${day} ${timeStr}`;
    }
    return `${month}/${day}`;
}

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
                    📋 목록 & 이력
                </button>
            </div>
            
            <!-- 등록 탭 -->
            <div id="interrupt-tab-register" class="tab-panel active">
                ${canAdd ? `
                <div id="interrupt-alert"></div>
                
                <form id="interrupt-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">담당자 *</label>
                            <select class="form-select" id="interrupt-member" required>
                                <option value="">선택하세요</option>
                                ${teamMembers.map(m => `<option value="${m.id}">${m.name} (${m.role})</option>`).join('')}
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
        </div>
    `;
    
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const endDateInput = document.getElementById('end-date');
    const startDateInput = document.getElementById('start-date');
    
    if (endDateInput) endDateInput.valueAsDate = today;
    if (startDateInput) startDateInput.valueAsDate = thirtyDaysAgo;
    
    // 폼 이벤트 - 중복 방지
    const form = document.getElementById('interrupt-form');
    if (form) {
        form.onsubmit = handleInterruptSubmit; // ✅ onsubmit으로 직접 할당 (중복 방지)
    }
}

function switchInterruptTab(tabName) {
    document.querySelectorAll('.interrupt-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`interrupt-tab-${tabName}`).classList.add('active');
    
    if (tabName === 'list') {
        loadInterruptList();
    }
}

async function handleInterruptSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('interrupt-submit-btn');
    const alertDiv = document.getElementById('interrupt-alert');
    
    // 중복 제출 방지
    if (submitBtn.disabled) return;
    
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
                            <th>날짜/시간</th>
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
                    <td>${formatDateTime(item['날짜'], item['시간'])}</td>
                    <td><strong>${getMemberName(item['담당자ID'])}</strong></td>
                    <td>${item['요청부서'] || '-'}</td>
                    <td>${item['요청자'] || '-'}</td>
                    <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${item['업무내용'] || '-'}
                    </td>
                    <td><span class="badge ${getPriorityClass(item['중요도'])}">${item['중요도'] || '-'}</span></td>
                    <td><span class="badge ${getPriorityClass(item['긴급도'])}">${item['긴급도'] || '-'}</span></td>
                    <td>${item['예상소요시간'] || 0}h</td>
                    <td>
                        <select class="status-select" onchange="updateInterruptStatus(this, '${item['InterruptID']}')">
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
            loadInterruptList();
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
