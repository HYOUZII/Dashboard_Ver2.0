// 인터럽트 탭 관리

let teamMembers = [];

async function initInterruptTab(container) {
    showPermissionInfo(container, SESSION.permission);
    
    // GUEST는 인터럽트 등록 불가
    if (SESSION.permission === 'GUEST') {
        container.innerHTML += `
            <div class="card">
                <div class="card-title">⚡ 인터럽트 관리</div>
                <div class="alert alert-danger">
                    게스트 권한으로는 인터럽트를 등록할 수 없습니다.
                </div>
            </div>
        `;
        loadInterruptList(container);
        return;
    }
    
    // 팀원 목록 로드
    await loadTeamMembers();
    
    // 인터럽트 등록 폼
    container.innerHTML += `
        <div class="card">
            <div class="card-title">⚡ 인터럽트 등록</div>
            <p style="color: #666; margin-bottom: 20px;">
                갑작스럽게 발생한 긴급 업무를 즉시 기록하여 업무 부하를 가시화합니다.
            </p>
            
            <div id="interrupt-alert"></div>
            
            <form id="interrupt-form">
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
                               placeholder="예: 생산팀">
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
        </div>
    `;
    
    // 인터럽트 목록
    loadInterruptList(container);
    
    // 통계
    loadInterruptStats(container);
    
    // 폼 이벤트 리스너
    document.getElementById('interrupt-form').addEventListener('submit', handleInterruptSubmit);
}

async function loadTeamMembers() {
    try {
        const stats = await getDashboardStats();
        
        // 실제로는 별도의 getTeamMembers API가 필요하지만
        // 임시로 하드코딩
        teamMembers = [
            { id: 'M001', name: '김하드', role: 'HW' },
            { id: 'M002', name: '이펌웨', role: 'FW' },
            { id: 'M003', name: '박펌웨', role: 'FW' },
            { id: 'M004', name: '최기구', role: '기구' },
            { id: 'M005', name: '정큐에', role: 'QA' },
            { id: 'M006', name: '신소프', role: 'SW' }
        ];
    } catch (error) {
        console.error('팀원 로딩 오류:', error);
    }
}

function generateMemberOptions() {
    return teamMembers.map(m => 
        `<option value="${m.id}">${m.name} (${m.role})</option>`
    ).join('');
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
            
            const container = document.getElementById('tab-interrupt');
            refreshInterruptList(container);
            refreshInterruptStats(container);
            
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

async function loadInterruptList(container) {
    const listCard = document.createElement('div');
    listCard.className = 'card';
    listCard.id = 'interrupt-list-card';
    listCard.innerHTML = `
        <div class="card-title">최근 인터럽트 (최근 20건)</div>
        <div class="loading">인터럽트 데이터 로딩 중...</div>
    `;
    
    container.appendChild(listCard);
    
    try {
        const interrupts = await getInterrupts();
        
        if (!interrupts || interrupts.error) {
            listCard.innerHTML = `
                <div class="card-title">최근 인터럽트</div>
                <div class="alert alert-danger">
                    데이터를 불러오는데 실패했습니다.
                </div>
            `;
            return;
        }
        
        if (interrupts.length === 0) {
            listCard.innerHTML = `
                <div class="card-title">최근 인터럽트</div>
                <p style="text-align: center; padding: 40px; color: #666;">
                    등록된 인터럽트가 없습니다.
                </p>
            `;
            return;
        }
        
        // 최신순 정렬 및 20개만
        const recentInterrupts = interrupts.slice(0, 20);
        
        let html = `
            <div class="card-title">최근 인터럽트 (최근 20건)</div>
            <div style="overflow-x: auto;">
                <table>
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
        
        recentInterrupts.forEach(item => {
            const importanceClass = getPriorityBadgeClass(item['중요도']);
            const urgencyClass = getPriorityBadgeClass(item['긴급도']);
            const statusClass = item['상태'] === '완료' ? 'badge-success' : 'badge-warning';
            
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
                    <td><span class="badge ${importanceClass}">${item['중요도'] || '-'}</span></td>
                    <td><span class="badge ${urgencyClass}">${item['긴급도'] || '-'}</span></td>
                    <td>${item['예상소요시간'] || 0}시간</td>
                    <td><span class="badge ${statusClass}">${item['상태'] || '진행중'}</span></td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        listCard.innerHTML = html;
        
    } catch (error) {
        console.error('인터럽트 목록 로딩 오류:', error);
        listCard.innerHTML = `
            <div class="card-title">최근 인터럽트</div>
            <div class="alert alert-danger">
                데이터를 불러오는데 실패했습니다.
            </div>
        `;
    }
}

async function loadInterruptStats(container) {
    const statsCard = document.createElement('div');
    statsCard.className = 'card';
    statsCard.id = 'interrupt-stats-card';
    statsCard.innerHTML = `
        <div class="card-title">📊 인터럽트 통계</div>
        <div class="loading">통계 데이터 계산 중...</div>
    `;
    
    container.appendChild(statsCard);
    
    try {
        const interrupts = await getInterrupts();
        
        if (!interrupts || interrupts.error || interrupts.length === 0) {
            statsCard.innerHTML = `
                <div class="card-title">📊 인터럽트 통계</div>
                <p>통계를 표시할 데이터가 없습니다.</p>
            `;
            return;
        }
        
        // 부서별 통계
        const deptStats = {};
        interrupts.forEach(item => {
            const dept = item['요청부서'] || '기타';
            deptStats[dept] = (deptStats[dept] || 0) + 1;
        });
        
        // 총 시간
        const totalHours = interrupts.reduce((sum, item) => {
            return sum + (parseFloat(item['예상소요시간']) || 0);
        }, 0);
        
        let html = `
            <div class="card-title">📊 인터럽트 통계</div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">총 건수</div>
                    <div class="stat-value">${interrupts.length}</div>
                    <div class="stat-unit">건</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-label">총 예상 시간</div>
                    <div class="stat-value">${totalHours.toFixed(1)}</div>
                    <div class="stat-unit">시간</div>
                </div>
            </div>
            
            <h4 style="margin: 20px 0 10px 0;">부서별 인터럽트</h4>
            <table>
                <tr>
                    <th>요청 부서</th>
                    <th>건수</th>
                    <th>비율</th>
                </tr>
        `;
        
        Object.entries(deptStats)
            .sort((a, b) => b[1] - a[1])
            .forEach(([dept, count]) => {
                const percentage = ((count / interrupts.length) * 100).toFixed(1);
                html += `
                    <tr>
                        <td><strong>${dept}</strong></td>
                        <td>${count}건</td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="flex: 1; background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden;">
                                    <div style="width: ${percentage}%; height: 100%; background: var(--primary);"></div>
                                </div>
                                <span>${percentage}%</span>
                            </div>
                        </td>
                    </tr>
                `;
            });
        
        html += `
            </table>
        `;
        
        statsCard.innerHTML = html;
        
    } catch (error) {
        console.error('통계 로딩 오류:', error);
        statsCard.innerHTML = `
            <div class="card-title">📊 인터럽트 통계</div>
            <div class="alert alert-danger">
                통계 계산에 실패했습니다.
            </div>
        `;
    }
}

function refreshInterruptList(container) {
    const listCard = document.getElementById('interrupt-list-card');
    if (listCard) {
        listCard.remove();
        loadInterruptList(container);
    }
}

function refreshInterruptStats(container) {
    const statsCard = document.getElementById('interrupt-stats-card');
    if (statsCard) {
        statsCard.remove();
        loadInterruptStats(container);
    }
}

function refreshInterruptTab() {
    const container = document.getElementById('tab-interrupt');
    refreshInterruptList(container);
    refreshInterruptStats(container);
}
