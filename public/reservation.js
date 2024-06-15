document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const laundryNameElement = document.getElementById('laundryName');
    const reservationStatusElement = document.getElementById('reservationStatus');
    const machineContainer = document.getElementById('machineContainer');

    laundryNameElement.textContent = name;

    // 예약 가능한 지점 리스트
    const reservableStores = ["크린토피아 코인워시365 노원인덕대점"];

    if (reservableStores.includes(name)) {
        reservationStatusElement.textContent = "안녕하세요 LRS입니다.";
        loadMachines();
    } else {
        reservationStatusElement.textContent = "예약이 불가능합니다.";
    }

    function loadMachines() {
        const defaultMachines = [
            { type: '대형 세탁기', count: 3 },
            { type: '특대형 세탁기', count: 2 },
            { type: '대형 건조기', count: 3 },
            { type: '특대형 건조기', count: 2 }
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
        const modalButton = document.getElementById('modalButton');

        modalText.innerHTML = `${number}번 ${type}<br>`;

        if (status === 'available') {
            modalText.innerHTML += "예약 가능합니다.";
            modalButton.style.display = 'block';
            modalButton.onclick = function () {
                reserveMachine(type, number);
            };
        } else {
            modalText.innerHTML += status === 'reserved' ? "대기중입니다." : status === 'in-use' ? "사용중입니다." : "고장입니다.";
            modalButton.style.display = 'none';
        }

        modal.style.display = 'block';
    }

    function reserveMachine(type, number) {
        const machine = document.getElementById(`${type}-${number}`);
        machine.className = 'machine reserved';
        machine.innerHTML = `${number}번<br>${type}<br>대기중`;

        // 상태 업데이트 및 저장
        updateMachineStatus(type, number, 'reserved', 10000);

        // 모달 창 업데이트
        machine.onclick = function() {
            openModal(type, 'reserved', number);
        };

        setTimeout(() => {
            updateStatusAfterDelay(type, number, 'in-use', '사용중', 10000);
            setTimeout(() => {
                updateStatusAfterDelay(type, number, 'available', '예약 가능', 10000);
            }, 10000);
        }, 10000);

        document.getElementById('machineModal').style.display = 'none';
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

    document.getElementById('closeModal').addEventListener('click', function () {
        document.getElementById('machineModal').style.display = 'none';
    });
});
