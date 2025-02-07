class UserManagement {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.registrationRequests = JSON.parse(localStorage.getItem('registrationRequests')) || [];
        this.currentUser = null;
        
        // Crear usuario admin con nueva contraseña
        if (!this.users.some(user => user.username === 'admin')) {
            this.registerUser('admin', 'Jonpollon69', true);
        }

        // Remove all non-admin users
        this.removeNonAdminUsers();

        this.initEventListeners();
    }

    removeNonAdminUsers() {
        // Filter out non-admin users
        this.users = this.users.filter(user => user.isAdmin);
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    initEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const registerUserForm = document.getElementById('registerUserForm');
        const userRegistrationForm = document.getElementById('userRegistrationForm');
        const logoutBtn = document.getElementById('logoutBtn');
        const registerBtn = document.getElementById('registerBtn');
        const showUsersBtn = document.getElementById('showUsersBtn');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        userRegistrationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitRegistrationRequest();
        });

        logoutBtn.addEventListener('click', () => this.logout());

        registerBtn.addEventListener('click', () => this.showRegistrationForm());
        showUsersBtn.addEventListener('click', () => this.displayRegisteredUsers());

        // Add event listeners for grid item links
        const gridLinks = [
            'nomina-link', 'calendario-link', 'excesos-link', 'documentos-link', 
            'venta-link', 'comedor-link', 'sede-link', 'noticias-link'
        ];

        gridLinks.forEach(linkId => {
            const link = document.getElementById(linkId);
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    alert(`Próximamente: ${link.textContent}`);
                });
            }
        });

        // Add back button functionality to registration form
        const backToLoginBtn = document.getElementById('backToLoginBtn');
        if (backToLoginBtn) {
            backToLoginBtn.addEventListener('click', () => {
                document.getElementById('registrationContainer').style.display = 'none';
                document.getElementById('loginContainer').style.display = 'block';
            });
        }
    }

    showRegistrationForm() {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('registrationContainer').style.display = 'block';
    }

    submitRegistrationRequest() {
        const newRegUsername = document.getElementById('newRegUsername');
        const newRegApellidos = document.getElementById('newRegApellidos');
        const newRegEmail = document.getElementById('newRegEmail');
        const newRegPassword = document.getElementById('newRegPassword');

        // Verificar si el usuario ya existe
        if (this.users.some(user => user.username === newRegUsername.value)) {
            alert('El nombre de usuario ya existe');
            return;
        }

        // Agregar solicitud de registro
        const request = {
            username: newRegUsername.value,
            apellidos: newRegApellidos.value,
            email: newRegEmail.value,
            password: newRegPassword.value
        };

        this.registrationRequests.push(request);
        localStorage.setItem('registrationRequests', JSON.stringify(this.registrationRequests));

        alert('Solicitud de registro enviada. Un administrador debe aprobarla.');
        
        // Limpiar campos y volver a la pantalla de login
        newRegUsername.value = '';
        newRegApellidos.value = '';
        newRegEmail.value = '';
        newRegPassword.value = '';
        document.getElementById('registrationContainer').style.display = 'none';
        document.getElementById('loginContainer').style.display = 'block';
    }

    registerUser(username, password, isAdmin = false, apellidos = '', email = '') {
        const existingUser = this.users.find(user => user.username === username);
        if (existingUser) return false;

        this.users.push({ username, password, isAdmin, apellidos, email });
        localStorage.setItem('users', JSON.stringify(this.users));
        return true;
    }

    login() {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('errorMessage');

        const user = this.users.find(
            u => u.username === usernameInput.value && u.password === passwordInput.value
        );

        if (user) {
            this.currentUser = user;
            this.showDashboard(user);
        } else {
            errorMessage.textContent = 'Credenciales incorrectas';
        }
    }

    showDashboard(user) {
        const loginContainer = document.getElementById('loginContainer');
        const registrationContainer = document.getElementById('registrationContainer');
        const dashboardContainer = document.getElementById('dashboardContainer');
        const adminPanel = document.getElementById('adminPanel');

        loginContainer.style.display = 'none';
        registrationContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';

        // Mostrar panel de admin solo para admin
        if (user.isAdmin) {
            adminPanel.style.display = 'block';
            this.updateRegistrationRequestsList();
            this.displayRegisteredUsers(); // Show users when admin logs in
        } else {
            adminPanel.style.display = 'none';
        }
    }

    updateRegistrationRequestsList() {
        const requestsContainer = document.getElementById('registrationRequests');
        requestsContainer.innerHTML = '';

        this.registrationRequests.forEach((request, index) => {
            const requestEl = document.createElement('div');
            requestEl.classList.add('registration-request');
            
            const requestText = document.createElement('span');
            requestText.textContent = `Usuario: ${request.username}`;
            
            const buttonsContainer = document.createElement('div');
            buttonsContainer.classList.add('registration-request-buttons');
            
            const approveBtn = document.createElement('button');
            approveBtn.textContent = 'Aprobar';
            approveBtn.classList.add('approve-btn');
            approveBtn.addEventListener('click', () => this.approveRegistrationRequest(index));
            
            const rejectBtn = document.createElement('button');
            rejectBtn.textContent = 'Rechazar';
            rejectBtn.classList.add('reject-btn');
            rejectBtn.addEventListener('click', () => this.rejectRegistrationRequest(index));
            
            buttonsContainer.appendChild(approveBtn);
            buttonsContainer.appendChild(rejectBtn);
            
            requestEl.appendChild(requestText);
            requestEl.appendChild(buttonsContainer);
            
            requestsContainer.appendChild(requestEl);
        });
    }

    approveRegistrationRequest(index) {
        if (!this.currentUser || !this.currentUser.isAdmin) {
            alert('No tienes permisos para aprobar usuarios');
            return;
        }

        const request = this.registrationRequests[index];
        const success = this.registerUser(
            request.username, 
            request.password, 
            false, 
            request.apellidos, 
            request.email
        );

        if (success) {
            // Eliminar solicitud de registro
            this.registrationRequests.splice(index, 1);
            localStorage.setItem('registrationRequests', JSON.stringify(this.registrationRequests));
            
            alert('Usuario registrado exitosamente');
            this.updateRegistrationRequestsList();
            this.displayRegisteredUsers();
        }
    }

    rejectRegistrationRequest(index) {
        if (!this.currentUser || !this.currentUser.isAdmin) {
            alert('No tienes permisos para rechazar usuarios');
            return;
        }

        // Eliminar solicitud de registro
        this.registrationRequests.splice(index, 1);
        localStorage.setItem('registrationRequests', JSON.stringify(this.registrationRequests));
        
        alert('Solicitud de registro rechazada');
        this.updateRegistrationRequestsList();
    }

    displayRegisteredUsers() {
        const userDatabaseList = document.getElementById('userDatabaseList');
        userDatabaseList.innerHTML = ''; // Clear previous list

        // Sort users, putting admin first
        const sortedUsers = this.users.sort((a, b) => {
            if (a.username === 'admin') return -1;
            if (b.username === 'admin') return 1;
            return a.username.localeCompare(b.username);
        });

        sortedUsers.forEach(user => {
            if (user.username !== 'admin') {
                const userEl = document.createElement('div');
                userEl.innerHTML = `
                    <strong>Usuario:</strong> ${user.username} 
                    ${user.apellidos ? `<br><strong>Apellidos:</strong> ${user.apellidos}` : ''}
                    ${user.email ? `<br><strong>Email:</strong> ${user.email}` : ''}
                `;
                userDatabaseList.appendChild(userEl);
            }
        });
    }

    logout() {
        const loginContainer = document.getElementById('loginContainer');
        const dashboardContainer = document.getElementById('dashboardContainer');

        this.currentUser = null;
        loginContainer.style.display = 'block';
        dashboardContainer.style.display = 'none';
    }
}

// Inicializar la gestión de usuarios
document.addEventListener('DOMContentLoaded', () => {
    new UserManagement();
});