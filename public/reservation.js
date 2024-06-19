document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const laundryNameElement = document.getElementById('laundryName');
    const reservationStatusElement = document.getElementById('reservationStatus');
    const machineContainer = document.getElementById('machineContainer');
    const manageLaundryButton = document.getElementById('manageLaundryButton');
    const adminModal = document.getElementById('adminModal');
    const closeAdminModal = document.getElementById('closeAdminModal');
    const laundryForm = document.getElementById('laundryForm');

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.uid === 'admin') {
        manageLaundryButton.style.display = 'block';
    }

    laundryNameElement.textContent = name;

    // 세탁소 정보를 불러와서 표시
    fetch(`/api/laundry?name=${name}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const laundry = data.data[0];
                reservationStatusElement.textContent = "안녕하세요 LRS입니다.";
                displayMachines(laundry.washer_count, laundry.dryer_count);
            } else {
                reservationStatusElement.textContent = "예약이 불가능합니다.";
            }
        })
        .catch(error => {
            console.error('Error fetching laundry data:', error);
            reservationStatusElement.textContent = "예약이 불가능합니다.";
        });

    function displayMachines(washerCount, dryerCount) {
        const defaultMachines = [
            { type: '세탁기', count: washerCount },
            { type: '건조기', count: dryerCount }
        ];

        defaultMachines.forEach(machine => {
            const row = document.createElement('div');
            row.className = 'machine-row';
            for (let i = 0; i < machine.count; i++) {
                const number = i + 1;
                const savedStatus = localStorage.getItem(`${machine.type}-${number}-status`) || 'available';
                const savedTimestamp = localStorage.getItem(`${machine.type}-${number}-timestamp`);

                const div = document.createElement('div');
                div.className = `machine ${savedStatus}`;
                div.id = `${machine.type}-${number}`;
                div.innerHTML = `${number}번<br>${machine.type}<br>${getStatusText(savedStatus)}`;
                div.addEventListener('click', function () {
                    openModal(machine.type, savedStatus, number);
                });
                row.appendChild(div);

                handleSavedStatus(machine.type, number, savedStatus, savedTimestamp);
            }
            machineContainer.appendChild(row);
        });
    }

    function handleSavedStatus(type, number, status, timestamp) {
        if (timestamp) {
            const elapsedTime = Date.now() - parseInt(timestamp, 10);
            if (status === 'reserved' && elapsedTime < 10000) {
                setTimeout(() => updateStatusAfterDelay(type, number, 'in-use', '사용중', 10000 - elapsedTime), 10000 - elapsedTime);
            } else if (status === 'reserved') {
                updateStatusAfterDelay(type, number, 'in-use', '사용중', 0);
            } else if (status === 'in-use' && elapsedTime < 20000) {
                setTimeout(() => updateStatusAfterDelay(type, number, 'available', '예약 가능', 20000 - elapsedTime), 20000 - elapsedTime);
            } else if (status === 'in-use') {
                updateStatusAfterDelay(type, number, 'available', '예약 가능', 0);
            }
        }
    }

    function openModal(type, status, number) {
        const modal = document.getElementById('machineModal');
        const modalText = document.getElementById('modalText');
        const modalTitle = document.getElementById('modalTitle');
        const modalButton = document.getElementById('modalButton');

        modalTitle.textContent = `${number}번 ${type}`;
        modalText.innerHTML = '';

        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

        if (status === 'available') {
            if (isLoggedIn) {
                modalText.innerHTML += "예약 가능합니다.";
                modalButton.style.display = 'block';
                modalButton.onclick = function () {
                    reserveMachine(type, number);
                };
            } else {
                modalText.innerHTML += "로그인 후 이용 바랍니다.";
                modalButton.style.display = 'none';
            }
        } else {
            modalText.innerHTML += status === 'reserved' ? "대기중입니다." : status === 'in-use' ? "사용중입니다." : "고장입니다.";
            modalButton.style.display = 'none';
        }

        modal.style.display = 'block';
    }

    function reserveMachine(type, number) {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

        if (!isLoggedIn) {
            alert("로그인 후 이용 바랍니다.");
            return;
        }

        const username = sessionStorage.getItem('username'); // 세션에 저장된 사용자 이름을 가져옵니다.

        fetch(`/api/user?username=${username}`)
            .then(response => response.json())
            .then(userData => {
                if (userData.success && userData.user) {
                    const userId = userData.user.id;

                    fetch(`/api/laundry?name=${name}`)
                        .then(response => response.json())
                        .then(laundryData => {
                            if (laundryData.success && laundryData.data.length > 0) {
                                const laundryId = laundryData.data[0].id;

                                fetch('/api/order', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    credentials: 'include', // 세션 정보를 포함하여 요청 보냄
                                    body: JSON.stringify({ laundry_id: laundryId })
                                })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        alert('예약이 완료되었습니다.');
                                        updateMachineStatus(type, number, 'reserved', 10000);

                                        setTimeout(() => {
                                            updateStatusAfterDelay(type, number, 'in-use', '사용중', 10000);
                                            setTimeout(() => {
                                                updateStatusAfterDelay(type, number, 'available', '예약 가능', 10000);
                                            }, 10000);
                                        }, 10000);

                                        document.getElementById('machineModal').style.display = 'none';
                                    } else {
                                        alert('예약에 실패했습니다.');
                                    }
                                })
                                .catch(error => {
                                    console.error('Error:', error);
                                    alert('예약에 실패했습니다.');
                                });
                            } else {
                                alert('세탁소를 찾을 수 없습니다.');
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('세탁소 정보를 가져오는 데 실패했습니다.');
                        });
                } else {
                    alert('사용자 정보를 가져오는 데 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('사용자 정보를 가져오는 데 실패했습니다.');
            });
    }

    function updateStatusAfterDelay(type, number, newStatus, newStatusText, delay = 0) {
        setTimeout(function () {
            const machine = document.getElementById(`${type}-${number}`);
            if (machine) {
                machine.className = `machine ${newStatus}`;
                machine.innerHTML = `${number}번<br>${type}<br>${newStatusText}`;

                // 상태 업데이트 및 저장
                updateMachineStatus(type, number, newStatus, newStatus === 'reserved' ? 10000 : newStatus === 'in-use' ? 20000 : 0);

                // 모달 창 업데이트
                machine.onclick = function() {
                    openModal(type, newStatus, number);
                };
            }
        }, delay);
    }

    function updateMachineStatus(type, number, status, nextChangeDelay) {
        // 개별 기계 상태를 로컬 스토리지에 저장
        localStorage.setItem(`${type}-${number}-status`, status);
        if (nextChangeDelay > 0) {
            localStorage.setItem(`${type}-${number}-timestamp`, Date.now());
        } else {
            localStorage.removeItem(`${type}-${number}-timestamp`);
        }
    }

    function getStatusText(status) {
        switch (status) {
            case 'available':
                return '예약 가능';
            case 'reserved':
                return '대기중';
            case 'in-use':
                return '사용중';
            case 'broken':
                return '고장';
            default:
                return '';
        }
    }

    // 세탁소 관리 버튼을 클릭했을 때 관리자 모달 열기
    manageLaundryButton.addEventListener('click', function () {
        adminModal.style.display = 'block';
    });

    // 모달 닫기 버튼 이벤트
    closeAdminModal.addEventListener('click', function () {
        adminModal.style.display = 'none';
    });

    // 세탁소 관리 폼 제출 이벤트
    laundryForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const washerCount = document.getElementById('washerCount').value;
        const dryerCount = document.getElementById('dryerCount').value;

        fetch('/api/updateLaundry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, washer_count: washerCount, dryer_count: dryerCount })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('세탁소 정보가 업데이트되었습니다.');
                adminModal.style.display = 'none';
                machineContainer.innerHTML = '';
                displayMachines(washerCount, dryerCount);
            } else {
                alert('업데이트 중 오류가 발생했습니다.');
            }
        })
        .catch(error => {
            console.error('Error updating laundry:', error);
            alert('업데이트 중 오류가 발생했습니다.');
        });
    });

    document.getElementById('closeModal').addEventListener('click', function () {
        document.getElementById('machineModal').style.display = 'none';
    });
});
