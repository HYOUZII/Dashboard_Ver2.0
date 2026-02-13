// 프로젝트 탭 관리 - 완전판

async function initProjectsTab(container) {
    // 권한별 UI 분기
    const canCreate = SESSION.permission === 'ADMIN';
    const canEdit = SESSION.permission === 'RESEARCHER' || SESSION.permission === 'ADMIN';
    
    container.innerHTML = `
        <style>
            .projects-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .search-box {
                flex: 1;
                min-width: 300px;
            }
            
            .search-input {
                width: 100%;
                padding: 12px 15px;
                font-size: 16px;
                border: 2px solid #dee2e6;
                border-radius: 8px;
            }
            
            .filter-buttons {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            .filter-btn {
                padding: 10px 20px;
                border: 2px solid var(--primary);
                background: white;
                color: var(--primary);
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s;
            }
            
            .filter-btn:hover {
                background: var(--primary);
                color: white;
            }
            
            .filter-btn.active {
                background: var(--primary);
                color: white;
            }
            
            .project-card {
                background: white;
                border: 2px solid #dee2e6;
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 20px;
                transition: all 0.3s;
            }
            
            .project-card:hover {
                border-color: var(--primary);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .project-header {
                display: flex;
                justify-content: space-between;
                align-items: start;
                margin-bottom: 15px;
            }
            
            .project-title {
                font-size: 22px;
                font-weight: bold;
                color: var(--primary);
                margin-bottom: 5px;
            }
            
            .project-customer {
                font-size: 16px;
                color: #666;
            }
            
            .project-actions {
                display: flex;
                gap: 8px;
            }
            
            .action-btn {
                padding: 6px 12px;
                font-size: 13px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .action-btn.edit {
                background: var(--warning);
                color: white;
            }
            
            .action-btn.delete {
                background: var(--danger);
                color: white;
            }
            
            .action-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            
            .project-info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .info-item {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .info-label {
                font-weight: bold;
                color: #666;
            }
            
            .progress-section {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #dee2e6;
            }
            
            .progress-bar-container {
                background: #e9ecef;
                height: 25px;
                border-radius: 12px;
                overflow: hidden;
                margin-top: 10px;
            }
            
            .progress-bar-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--primary), var(--secondary));
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 13px;
                transition: width 0.5s ease;
            }
            
            .modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 1000;
                justify-content: center;
                align-items: center;
                overflow-y: auto;
            }
            
            .modal.active {
                display: flex;
            }
            
            .modal-content {
                background: white;
                padding: 30px;
                border-radius: 12px;
                max-width: 700px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                margin: 20px;
            }
            
            .modal-title {
                font-size: 24px;
                font-weight: bold;
                color: var(--primary);
                margin-bottom: 20px;
            }
        </style>
        
        <div class="card">
            <div class="card-title">📋 프로젝트 관리</div>
            
            <div class="projects-header">
                <div class="search-box">
                    <input type="text" class="search-input" id="project-search" 
                           placeholder="🔍 프로젝트명, 고객사, PM으로 검색...">
                </div>
                
                ${canCreate ? `
                <button class="btn btn-primary" onclick="showProjectModal()">
                    ➕ 새 프로젝트
                </button>
                ` : ''}
            </div>
            
            <div class="filter-buttons">
                <button class="filter-btn active" onclick="filterProjects('all')">
                    전체
                </button>
                <button class="filter-btn" onclick="filterProjects('진행중')">
                    🔵 진행중
                </button>
                <button class="filter-btn" onclick="filterProjects('완료')">
                    🟢 완료
                </button>
                <button class="filter-btn" onclick="filterProjects('지연')">
                    🔴 지연
                </button>
                <button class="filter-btn" onclick="filterProjects('보류')">
                    🟡 보류
                </button>
            </div>
            
            <div id="projects-list" class="loading" style="margin-top: 20px;">
                프로젝트 데이터 로딩 중...
            </div>
        </div>
        
        <!-- 프로젝트 추가/수정 모달 -->
        <div class="modal" id="project-modal" onclick="closeProjectModal(event)">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-title" id="modal-title">➕ 새 프로젝트</div>
                
                <form id="project-form" onsubmit="handleProjectSubmit(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">프로젝트명 *</label>
                            <input type="text" class="form-input" id="project-name" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">고객사 *</label>
                            <input type="text" class="form-input" id="project-customer" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">PM</label>
                            <select class="form-select" id="project-pm">
                                <option value="">선택하세요</option>
                                <option value="M001">김하드</option>
                                <option value="M002">이펌웨</option>
                                <option value="M003">박펌웨</option>
                                <option value="M005">정큐에</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">개발범위 *</label>
                            <input type="text" class="form-input" id="project-scope" required 
                                   placeholder="예: Full 개발, APP만">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">착수일 *</label>
                            <input type="date" class="form-input" id="project-start" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">예상완료일 *</label>
                            <input type="date" class="form-input" id="project-end" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">상태 *</label>
                            <select class="form-select" id="project-status" required>
                                <option value="진행중">진행중</option>
                                <option value="완료">완료</option>
                                <option value="지연">지연</option>
                                <option value="보류">보류</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">진행률 (%)</label>
                            <input type="number" class="form-input" id="project-progress" 
                                   min="0" max="100" value="0">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Git 링크</label>
                        <input type="url" class="form-input" id="project-git" 
                               placeholder="https://github.com/...">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">비고</label>
                        <textarea class="form-textarea" id="project-note" 
                                  placeholder="프로젝트 관련 메모"></textarea>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" class="btn btn-primary" style="flex: 1;">
                            💾 저장
                        </button>
                        <button type="button" class="btn btn-danger" onclick="closeProjectModal()" 
                                style="flex: 0 0 100px;">
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    loadProjectsList(container);
    
    // 검색 기능
    document.getElementById('project-search').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.project-card');
        
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    });
}

let currentFilter = 'all';
let allProjects = [];
let editingProjectId = null;

async function loadProjectsList(container) {
    const listContainer = container.querySelector('#projects-list');
    
    try {
        const projects = await getProjects();
        allProjects = projects || [];
        
        if (allProjects.length === 0) {
            listContainer.innerHTML = `
                <p style="text-align: center; padding: 40px; color: #666;">
                    등록된 프로젝트가 없습니다.
                </p>
            `;
            return;
        }
        
        renderProjects(allProjects, listContainer);
        
    } catch (error) {
        console.error('프로젝트 목록 로딩 오류:', error);
        listContainer.innerHTML = `
            <div class="alert alert-danger">
                데이터를 불러오는데 실패했습니다.
            </div>
        `;
    }
}

function renderProjects(projects, container) {
    const canEdit = SESSION.permission === 'RESEARCHER' || SESSION.permission === 'ADMIN';
    const canDelete = SESSION.permission === 'ADMIN';
    
    let html = '';
    
    projects.forEach(project => {
        const statusBadge = getStatusBadge(project['상태']);
        const progress = calculateProgress(project);
        
        html += `
            <div class="project-card" data-status="${project['상태']}">
                <div class="project-header">
                    <div>
                        <div class="project-title">${project['프로젝트명']}</div>
                        <div class="project-customer">📌 ${project['고객사'] || '-'}</div>
                    </div>
                    <div style="display: flex; align-items: start; gap: 10px;">
                        ${statusBadge}
                        ${canEdit || canDelete ? `
                        <div class="project-actions">
                            ${canEdit ? `
                            <button class="action-btn edit" onclick="editProject('${project['프로젝트ID']}')">
                                ✏️ 수정
                            </button>
                            ` : ''}
                            ${canDelete ? `
                            <button class="action-btn delete" onclick="deleteProject('${project['프로젝트ID']}')">
                                🗑️ 삭제
                            </button>
                            ` : ''}
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="project-info-grid">
                    <div class="info-item">
                        <span class="info-label">PM:</span>
                        <span>${project['PM_ID'] || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">범위:</span>
                        <span>${project['개발범위'] || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">착수일:</span>
                        <span>${project['착수일'] || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">완료일:</span>
                        <span>${project['예상완료일'] || '-'}</span>
                    </div>
                </div>
                
                ${project['Git링크'] ? `
                <div style="margin-top: 10px;">
                    <a href="${project['Git링크']}" target="_blank" 
                       style="color: var(--primary); text-decoration: none;">
                        🔗 Git 저장소
                    </a>
                </div>
                ` : ''}
                
                <div class="progress-section">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong>진행률</strong>
                        <span>${progress}%</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${progress}%;">
                            ${progress}%
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function calculateProgress(project) {
    const startDate = new Date(project['착수일'] || Date.now());
    const endDate = new Date(project['예상완료일'] || Date.now());
    const today = new Date();
    
    const totalDays = Math.max((endDate - startDate) / (1000 * 60 * 60 * 24), 1);
    const elapsedDays = (today - startDate) / (1000 * 60 * 60 * 24);
    const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
    
    return Math.round(progress);
}

function getStatusBadge(status) {
    const badges = {
        '진행중': '<span class="badge badge-primary">🔵 진행중</span>',
        '완료': '<span class="badge badge-success">🟢 완료</span>',
        '지연': '<span class="badge badge-danger">🔴 지연</span>',
        '보류': '<span class="badge badge-warning">🟡 보류</span>'
    };
    return badges[status] || `<span class="badge badge-primary">${status}</span>`;
}

function filterProjects(status) {
    currentFilter = status;
    
    // 버튼 활성화
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 프로젝트 필터링
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        if (status === 'all' || card.dataset.status === status) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function showProjectModal(projectId = null) {
    editingProjectId = projectId;
    const modal = document.getElementById('project-modal');
    const form = document.getElementById('project-form');
    
    if (projectId) {
        // 수정 모드
        document.getElementById('modal-title').textContent = '✏️ 프로젝트 수정';
        const project = allProjects.find(p => p['프로젝트ID'] === projectId);
        
        if (project) {
            document.getElementById('project-name').value = project['프로젝트명'] || '';
            document.getElementById('project-customer').value = project['고객사'] || '';
            document.getElementById('project-pm').value = project['PM_ID'] || '';
            document.getElementById('project-scope').value = project['개발범위'] || '';
            document.getElementById('project-start').value = project['착수일'] || '';
            document.getElementById('project-end').value = project['예상완료일'] || '';
            document.getElementById('project-status').value = project['상태'] || '진행중';
            document.getElementById('project-progress').value = calculateProgress(project);
            document.getElementById('project-git').value = project['Git링크'] || '';
            document.getElementById('project-note').value = project['비고'] || '';
        }
    } else {
        // 생성 모드
        document.getElementById('modal-title').textContent = '➕ 새 프로젝트';
        form.reset();
        document.getElementById('project-start').valueAsDate = new Date();
    }
    
    modal.classList.add('active');
}

function closeProjectModal(event) {
    if (!event || event.target.id === 'project-modal') {
        document.getElementById('project-modal').classList.remove('active');
        editingProjectId = null;
    }
}

async function handleProjectSubmit(event) {
    event.preventDefault();
    
    const projectData = {
        projectName: document.getElementById('project-name').value,
        customer: document.getElementById('project-customer').value,
        pmId: document.getElementById('project-pm').value,
        scope: document.getElementById('project-scope').value,
        startDate: document.getElementById('project-start').value,
        expectedEndDate: document.getElementById('project-end').value,
        status: document.getElementById('project-status').value,
        progress: document.getElementById('project-progress').value,
        gitLink: document.getElementById('project-git').value,
        note: document.getElementById('project-note').value
    };
    
    try {
        let result;
        if (editingProjectId) {
            // 수정
            result = await callAPI('updateProject', {
                projectId: editingProjectId,
                ...projectData
            });
        } else {
            // 생성
            result = await addProject(projectData);
        }
        
        if (result && result.success) {
            alert(result.message);
            closeProjectModal();
            refreshProjectsTab();
        } else {
            alert(result?.error || '저장에 실패했습니다.');
        }
    } catch (error) {
        console.error('프로젝트 저장 오류:', error);
        alert('서버 연결에 실패했습니다.');
    }
}

function editProject(projectId) {
    showProjectModal(projectId);
}

async function deleteProject(projectId) {
    if (!confirm('정말 이 프로젝트를 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const result = await callAPI('deleteProject', { projectId });
        
        if (result && result.success) {
            alert('프로젝트가 삭제되었습니다.');
            refreshProjectsTab();
        } else {
            alert(result?.error || '삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('프로젝트 삭제 오류:', error);
        alert('서버 연결에 실패했습니다.');
    }
}

function refreshProjectsTab() {
    const container = document.getElementById('tab-projects');
    container.innerHTML = '';
    container.dataset.loaded = 'false';
    initProjectsTab(container);
}
