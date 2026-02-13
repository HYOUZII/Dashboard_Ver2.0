// VOC 탭 관리

function initVocTab(container) {
    showPermissionInfo(container, SESSION.permission);
    
    // GUEST는 VOC 작성 불가
    if (SESSION.permission === 'GUEST') {
        container.innerHTML += `
            <div class="card">
                <div class="card-title">💬 VOC (고객의 소리)</div>
                <div class="alert alert-danger">
                    게스트 권한으로는 VOC를 작성할 수 없습니다.
                </div>
            </div>
        `;
        loadVOCList(container);
        return;
    }
    
    // VOC 등록 폼
    container.innerHTML += `
        <div class="card">
            <div class="card-title">💬 VOC 등록</div>
            <p style="color: #666; margin-bottom: 20px;">
                제품 불만, 개선 요청, 아이디어를 자유롭게 작성해주세요.
            </p>
            
            <div id="voc-alert"></div>
            
            <form id="voc-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">구분 *</label>
                        <select class="form-select" id="voc-type" required>
                            <option value="불만">불만 (제품/서비스 문제)</option>
                            <option value="요청">요청 (새로운 기능)</option>
                            <option value="개선제안">개선제안 (프로세스/문서)</option>
                            <option value="기타">기타</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">제품 모델 *</label>
                        <input type="text" class="form-input" id="voc-product" required 
                               placeholder="예: AC-7KW-V1">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">카테고리 *</label>
                        <select class="form-select" id="voc-category" required>
                            <option value="펌웨어">펌웨어</option>
                            <option value="APP">APP</option>
                            <option value="하드웨어">하드웨어</option>
                            <option value="기구">기구</option>
                            <option value="문서">문서</option>
                            <option value="서비스">서비스</option>
                            <option value="기타">기타</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">우선순위 *</label>
                        <select class="form-select" id="voc-priority" required>
                            <option value="높음">높음</option>
                            <option value="보통" selected>보통</option>
                            <option value="낮음">낮음</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">제목 *</label>
                    <input type="text" class="form-input" id="voc-title" required 
                           placeholder="예: 충전 중 재부팅 발생">
                </div>
                
                <div class="form-group">
                    <label class="form-label">내용 *</label>
                    <textarea class="form-textarea" id="voc-content" required 
                              placeholder="문제 상황이나 개선 아이디어를 자세히 작성해주세요"></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">첨부 파일 링크 (선택)</label>
                    <input type="text" class="form-input" id="voc-file" 
                           placeholder="Google Drive 링크 등">
                </div>
                
                <button type="submit" class="btn btn-success" id="voc-submit-btn" style="width: 100%;">
                    📤 VOC 제출
                </button>
            </form>
        </div>
    `;
    
    // VOC 목록
    loadVOCList(container);
    
    // 폼 이벤트 리스너
    document.getElementById('voc-form').addEventListener('submit', handleVOCSubmit);
}

async function handleVOCSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('voc-submit-btn');
    const alertDiv = document.getElementById('voc-alert');
    
    // 버튼 비활성화 (중복 제출 방지)
    submitBtn.disabled = true;
    submitBtn.textContent = '제출 중...';
    
    try {
        const vocData = {
            type: document.getElementById('voc-type').value,
            product: document.getElementById('voc-product').value,
            category: document.getElementById('voc-category').value,
            title: document.getElementById('voc-title').value,
            content: document.getElementById('voc-content').value,
            priority: document.getElementById('voc-priority').value,
            fileLink: document.getElementById('voc-file').value,
            authorDept: SESSION.dept
        };
        
        const result = await addVOC(vocData);
        
        if (result && result.success) {
            alertDiv.innerHTML = `
                <div class="alert alert-success">
                    ✅ ${result.message} (${result.id})
                </div>
            `;
            
            // 폼 초기화
            document.getElementById('voc-form').reset();
            
            // VOC 목록 새로고침
            const container = document.getElementById('tab-voc');
            loadVOCList(container);
            
            // 알림 5초 후 제거
            setTimeout(() => {
                alertDiv.innerHTML = '';
            }, 5000);
            
        } else {
            alertDiv.innerHTML = `
                <div class="alert alert-danger">
                    ❌ ${result?.error || 'VOC 등록에 실패했습니다.'}
                </div>
            `;
        }
        
    } catch (error) {
        console.error('VOC 제출 오류:', error);
        alertDiv.innerHTML = `
            <div class="alert alert-danger">
                ❌ 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.
            </div>
        `;
    } finally {
        // 버튼 재활성화
        submitBtn.disabled = false;
        submitBtn.textContent = '📤 VOC 제출';
    }
}

async function loadVOCList(container) {
    const listCard = document.createElement('div');
    listCard.className = 'card';
    listCard.id = 'voc-list-card';
    listCard.innerHTML = `
        <div class="card-title">VOC 목록</div>
        <div class="loading">VOC 데이터 로딩 중...</div>
    `;
    
    container.appendChild(listCard);
    
    try {
        const vocList = await getVOCList();
        
        if (!vocList || vocList.error) {
            listCard.innerHTML = `
                <div class="card-title">VOC 목록</div>
                <div class="alert alert-danger">
                    데이터를 불러오는데 실패했습니다.
                </div>
            `;
            return;
        }
        
        if (vocList.length === 0) {
            listCard.innerHTML = `
                <div class="card-title">VOC 목록</div>
                <p style="text-align: center; padding: 40px; color: #666;">
                    등록된 VOC가 없습니다.
                </p>
            `;
            return;
        }
        
        // 테이블 생성
        let html = `
            <div class="card-title">VOC 목록 (총 ${vocList.length}건)</div>
            <div style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>구분</th>
                            <th>제품</th>
                            <th>카테고리</th>
                            <th>우선순위</th>
                            <th>상태</th>
                            <th>작성일</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        vocList.forEach(voc => {
            const statusClass = getStatusBadgeClass(voc['상태']);
            const priorityClass = getPriorityBadgeClass(voc['우선순위']);
            
            html += `
                <tr>
                    <td>${voc.VOC_ID || '-'}</td>
                    <td><strong>${voc['제목'] || '-'}</strong></td>
                    <td>${voc['작성자'] || '-'}</td>
                    <td>${voc['구분'] || '-'}</td>
                    <td>${voc['제품모델'] || '-'}</td>
                    <td>${voc['카테고리'] || '-'}</td>
                    <td><span class="badge ${priorityClass}">${voc['우선순위'] || '-'}</span></td>
                    <td><span class="badge ${statusClass}">${voc['상태'] || '접수'}</span></td>
                    <td>${voc['작성일'] || '-'}</td>
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
        console.error('VOC 목록 로딩 오류:', error);
        listCard.innerHTML = `
            <div class="card-title">VOC 목록</div>
            <div class="alert alert-danger">
                데이터를 불러오는데 실패했습니다.
            </div>
        `;
    }
}

function getStatusBadgeClass(status) {
    const map = {
        '처리완료': 'badge-success',
        '처리중': 'badge-warning',
        '검토중': 'badge-info',
        '접수': 'badge-primary',
        '보류': 'badge-warning',
        '기각': 'badge-danger'
    };
    return map[status] || 'badge-primary';
}

function getPriorityBadgeClass(priority) {
    const map = {
        '높음': 'badge-danger',
        '보통': 'badge-warning',
        '낮음': 'badge-info'
    };
    return map[priority] || 'badge-warning';
}

function refreshVocTab() {
    const container = document.getElementById('tab-voc');
    const listCard = document.getElementById('voc-list-card');
    
    if (listCard) {
        listCard.remove();
        loadVOCList(container);
    }
}
